import { DeclarationType } from './ast/declaration.js'
import { Delimiter } from './ast/delimiter.js'
import { ProductionNodeType } from './ast/production-node.js'
import { Source } from './ast/source.js'
import { Terminal } from './ast/terminal.js'
import { TerminalUsage } from './ast/terminal-usage.js'
import { Variable } from './ast/variable.js'
import { VariableUsage } from './ast/variable-usage.js'
import { Assignment } from './ic/assignment.js'
import { Atom } from './ic/atom.js'
import { BinaryOperation, Operator } from './ic/binary-operation.js'
import { Declaration } from './ic/declaration.js'
import { Function } from './ic/function.js'
import { FunctionCall } from './ic/function-call.js'
import { If } from './ic/if.js'
import { Return } from './ic/return.js'
import { Statement } from './ic/statement.js'
import { Statements } from './ic/statements.js'
import { VariableDeclaration, VariableDeclarationConstructorOptions, VariableType } from './ic/variable-declaration.js'
import { VariableReference } from './ic/variable-reference.js'
import { regex_to_ic } from './regex-to-ic.js'
import { Context } from './regex/context.js'
import { RegularExpression } from './regular-expression.js'

class ICGenerator {
    private readonly variables_map: Map<string, Variable>
    private readonly terminals_map: Map<string, Terminal&{id: number}>
    private readonly terminals_parsing_functions_map: Map<string, Function>
    private readonly delimiter: Delimiter|undefined
    private variable_cached_terminal_id: VariableDeclaration|undefined

    public constructor(
        private regex_context: Context,
        ast: Source
    ) {
        this.variables_map = new Map()
        this.terminals_map = new Map()
        this.terminals_parsing_functions_map = new Map()

        for (const declaration of ast.declarations) {
            switch (declaration.type) {
                case DeclarationType.DELIMITER: {
                    this.delimiter = declaration as Delimiter
                    break
                }

                case DeclarationType.TERMINAL: {
                    const id = this.terminals_map.size + 1
                    const terminal = Object.assign(declaration as Terminal, {id})           
                    terminal.regex.machine_id = id
                    this.terminals_map.set(declaration.name, terminal)
                    break
                }

                case DeclarationType.VARIABLE: {
                    this.variables_map.set(declaration.name, declaration as Variable)
                    break
                }
            }
        }
    }

    private get_cached_terminal_id_reference(): VariableReference {
        if (this.variable_cached_terminal_id === undefined) {
            this.variable_cached_terminal_id = new VariableDeclaration(VariableType.I32, 'cached_terminal_id', {
                mutable: true,
                initial_value: new Atom(-1),
                comment: 'Contains the id of the currently cached terminal,\nor -1 if there is nothing cached.'
            })
        }

        return this.variable_cached_terminal_id.get_reference()
    }

    private generate_function_for_parsing_terminals(terminals: Terminal[], options?: {epsilon?: boolean}): Function {
        const epsilon = options?.epsilon === true
        const terminals_names = terminals.map(x => x.name).sort() 
        const name = `parse${epsilon ? '_eps' : ''}_${terminals_names.map(x => `T${x}`).join('_')}`
        let f = this.terminals_parsing_functions_map.get(name)

        if (f === undefined) {
            const parsed_terminal_id_var = new VariableDeclaration(VariableType.I32, 'parsed_terminal_id', {
                mutable: true,
                initial_value: new Atom(-1),
                comment: 'Contains the id of the last parsed terminal,\nor -1 if there was no terminal successfully parsed.'
            })

            const parsed_terminal_id_ref = parsed_terminal_id_var.get_reference()
            const machine = RegularExpression.merge(this.regex_context, terminals.map(x => x.regex))
            
            const statements: Statement[] = [
                parsed_terminal_id_var.to_statement(),
                regex_to_ic(machine, {parsed_terminal_id_ref})
            ]

            if (!epsilon) {
                const error_message = (terminals.length === 1
                    ? `expected terminal \`${terminals[0].name}\`, `
                    : `expected one of terminals: ${terminals.map(x => `\`${x.name}\``).join(', ')}; `
                ) + `but found "{}"`

                const statement = new If(
                    new BinaryOperation(Operator.EQUAL, parsed_terminal_id_ref, new Atom(-1)),
                    (new FunctionCall('throw_error', {args: [
                        new Atom(error_message),
                        new FunctionCall('read')
                    ]})).to_statement()
                )

                statements.push(statement)
            }

            statements.push(new Return(parsed_terminal_id_ref))

            f = new Function(name, [], VariableType.I32, new Statements(statements), {
                comment: `Parses one of terminals: ${terminals_names.map(x => `\`${x}\``).join(', ')}.`
            })

            this.terminals_parsing_functions_map.set(name, f)
        }

        return f
    }

    private generate_function_consume_delimiter(delimiter: Delimiter): Function {
        return new Function('consume_delimiter', [], VariableType.VOID, new Statements([
            regex_to_ic(delimiter.regex),
            (new FunctionCall('reset')).to_statement()    
        ]))
    }

    private generate_function_for_parsing_variable(variable: Variable, considers_terminal_caching: boolean): Function {
        const all_possible_terminals = variable.terminals_maps.map(m => m.terminals).flat()
        const parsing_function = this.generate_function_for_parsing_terminals(all_possible_terminals, {epsilon: variable.epsilon})
        const variable_terminal_id_creation_options: VariableDeclarationConstructorOptions = {}

        if (considers_terminal_caching) {
            variable_terminal_id_creation_options.mutable = true
            variable_terminal_id_creation_options.initial_value = this.get_cached_terminal_id_reference()
            variable_terminal_id_creation_options.comment = 'The id of the currently parsed terminal,\n considering if there was any cached terminal.'
        } else {
            variable_terminal_id_creation_options.initial_value = new FunctionCall(parsing_function.name)
            variable_terminal_id_creation_options.comment = 'The id of the currently parsed terminal.'
        }

        const variable_terminal_id = new VariableDeclaration(VariableType.I32, 'terminal_id', variable_terminal_id_creation_options)

        let branches: Statement = !variable.epsilon
            ? (new FunctionCall('throw_error', {args: [
                new Atom('program reached invalid state: unexpected terminal (id: {}) parsed'),
                variable_terminal_id.get_reference()
            ]})).to_statement()
            : new Statements([])

        for (const terminals_map of variable.terminals_maps) {
            const statements: Statement[] = []
            const first_node = terminals_map.nodes[0]

            if (first_node.type === ProductionNodeType.TERMINAL_USAGE) {
                statements.push((new FunctionCall('reset')).to_statement())
            } else {
                statements.push(
                    new Assignment(this.get_cached_terminal_id_reference(), variable_terminal_id.get_reference()),
                    (new FunctionCall(`parse_V${first_node.name}`)).to_statement()
                )
            }

            for (const node of terminals_map.nodes.slice(1)) {
                if (node.name.charAt(0) == node.name.charAt(0).toLocaleLowerCase()) {
                    const terminal_parsing_function = this.generate_function_for_parsing_terminals([(node as TerminalUsage).reference])

                    if (this.delimiter !== undefined) {
                        statements.push((new FunctionCall('consume_delimiter')).to_statement())
                    }

                    statements.push(
                        (new FunctionCall(terminal_parsing_function.name)).to_statement(),
                        (new FunctionCall('reset')).to_statement()
                    )
                } else {
                    statements.push(
                        (new FunctionCall(`parse_V${node.name}`)).to_statement()
                    )
                }
            }

            const condition = terminals_map.terminals.map(x =>
                new BinaryOperation(
                    Operator.EQUAL,
                    variable_terminal_id.get_reference(),
                    new Atom(this.terminals_map.get(x.name)!.id)
                )
            ).reduce((left, right) =>
                new BinaryOperation(
                    Operator.OR,
                    left,
                    right
                )
            )

            branches = new If(
                condition,
                new Statements(statements),
                {
                    // ugly, but works
                    else_body: (branches instanceof Statements && branches.statements.length === 0)
                        ? undefined
                        : branches
                }
            )
        }

        const body = new Statements([])

        if (this.delimiter !== undefined) {
            body.statements.push((new FunctionCall('consume_delimiter')).to_statement())
        }

        body.statements.push(variable_terminal_id.to_statement())

        if (considers_terminal_caching) {
            const if_not_cached = new If(
                new BinaryOperation(
                    Operator.EQUAL,
                    variable_terminal_id.get_reference(),
                    new Atom(-1)
                ),
                new Assignment(variable_terminal_id.get_reference(), new FunctionCall(parsing_function.name))
            )

            body.statements.push(if_not_cached)
        }

        body.statements.push(branches)

        return new Function(`parse_V${variable.name}`, [], VariableType.VOID, body, {
            comment: `Function that parses the \`${variable.name}\` variable.`
        })
    }

    public generate_function_root(root_variable_parsing_function: Function): Function {
        const var_last_char = new VariableDeclaration(VariableType.I32, 'last_char', {
            initial_value: new FunctionCall('next')
        })

        return new Function('root', [], VariableType.VOID, new Statements([
            (new FunctionCall(root_variable_parsing_function.name)).to_statement(),
            (new FunctionCall('reset')).to_statement(),
            ...((() => {
                return this.delimiter !== undefined
                    ? [(new FunctionCall('consume_delimiter')).to_statement()]
                    : []
            }) ()),
            var_last_char.to_statement(),
            new If(
                new BinaryOperation(
                    Operator.NOT_EQUAL,
                    var_last_char.get_reference(),
                    new Atom(0)
                ),
                (new FunctionCall('throw_error', {
                    args: [
                        new Atom('EOF expected, but something else found')
                    ]
                })).to_statement()
            )
        ]))
    }

    public generate(): Declaration[] {
        const declarations: Declaration[] = []

        if (this.delimiter !== undefined) {
            declarations.push(this.generate_function_consume_delimiter(this.delimiter))
        }

        const variables_that_considers_terminal_caching = new Set<Variable>()

        for (const variable of this.variables_map.values()) {
            for (const terminals_map of variable.terminals_maps) {
                const first_node = terminals_map.nodes[0]

                if (first_node.type === ProductionNodeType.VARIABLE_USAGE) {
                    variables_that_considers_terminal_caching.add((first_node as VariableUsage).reference)
                }
            }
        }

        const variables_parsing_functions = Array.from(this.variables_map.values()).map(variable => {
            const considers_terminal_caching = variables_that_considers_terminal_caching.has(variable)
            return this.generate_function_for_parsing_variable(variable, considers_terminal_caching)
        })

        const function_root = this.generate_function_root(variables_parsing_functions[variables_parsing_functions.length - 1])

        if (this.variable_cached_terminal_id !== undefined) {
            declarations.push(this.variable_cached_terminal_id)
        }

        declarations.push(
            ...this.terminals_parsing_functions_map.values(),
            ...variables_parsing_functions,
            function_root
        )

        return declarations
    }
}

export function generate(regex_context: Context, ast: Source): Declaration[] {
    const generator = new ICGenerator(regex_context, ast)
    return generator.generate()
}
