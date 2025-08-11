import { DeclarationType } from './ast/declaration'
import { Delimiter } from './ast/delimiter'
import { Source } from './ast/source'
import { Terminal } from './ast/terminal'
import { TerminalUsage } from './ast/terminal-usage'
import { Variable } from './ast/variable'
import { Atom } from './ic/atom'
import { BinaryOperation, Operator } from './ic/binary-operation'
import { Declaration } from './ic/declaration'
import { DeclarationStatement } from './ic/declaration-statement'
import { Function } from './ic/function'
import { FunctionCall } from './ic/function-call'
import { If } from './ic/if'
import { Return } from './ic/return'
import { Statement } from './ic/statement'
import { Statements } from './ic/statements'
import { VariableDeclaration, VariableType } from './ic/variable-declaration'
import { regex_to_ic } from './regex-to-ic'
import { Context } from './regex/context'
import { RegularExpression } from './regular-expression'

class ICGenerator {
    private readonly variables_map: Map<string, Variable>
    private readonly terminals_map: Map<string, Terminal&{id: number}>
    private readonly terminals_parsing_functions_map: Map<string, Function>
    private readonly delimiter: Delimiter|undefined

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

    private generate_function_for_parsing_variable(variable: Variable): Function {
        const all_possible_terminals = variable.terminals_maps.map(m => m.terminals).flat()
        const parsing_function = this.generate_function_for_parsing_terminals(all_possible_terminals, {epsilon: variable.epsilon})

        const variable_terminal_id = new VariableDeclaration(VariableType.I32, 'terminal_id', {
            initial_value: new FunctionCall(parsing_function.name)
        })

        let branches: Statement = !variable.epsilon
            ? (new FunctionCall('throw_error', {args: [
                new Atom('program reached invalid state: unexpected terminal (id: {}) parsed'),
                variable_terminal_id.get_reference()
            ]})).to_statement()
            : new Statements([])

        for (const terminals_map of variable.terminals_maps) {
            const statements: Statement[] = []

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

        body.statements.push(
            new DeclarationStatement(variable_terminal_id, {
                comment: 'The id of the currently parsed terminal.'
            }),
            (new FunctionCall('reset')).to_statement(),
            branches
        )

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

        const variables_parsing_functions = Array.from(this.variables_map.values()).map(x => this.generate_function_for_parsing_variable(x))
        
        declarations.push(
            ...this.terminals_parsing_functions_map.values(),
            ...variables_parsing_functions,
            this.generate_function_root(variables_parsing_functions[variables_parsing_functions.length - 1])
        )

        return declarations
    }
}

export function generate(regex_context: Context, ast: Source): Declaration[] {
    const generator = new ICGenerator(regex_context, ast)
    return generator.generate()
}
