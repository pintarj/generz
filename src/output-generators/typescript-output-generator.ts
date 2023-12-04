import { Assignment } from '../ic/assignment'
import { Atom } from '../ic/atom'
import { BinaryOperation, Operator } from '../ic/binary-operation'
import { Break } from '../ic/break'
import { Continue } from '../ic/continue'
import { Declaration } from '../ic/declaration'
import { DeclarationStatement } from '../ic/declaration-statement'
import { DoWhile } from '../ic/do-while'
import { Expression } from '../ic/expression'
import { ExpressionStatement } from '../ic/expression-statement'
import { Function } from '../ic/function'
import { FunctionCall } from '../ic/function-call'
import { If } from '../ic/if'
import { Return } from '../ic/return'
import { Statement } from '../ic/statement'
import { Statements } from '../ic/statements'
import { VariableDeclaration, VariableType } from '../ic/variable-declaration'
import { VariableReference } from '../ic/variable-reference'
import { While } from '../ic/while'
import { OutputGeneratorInterface } from '../output-generation'
import { CodeBuilder } from '../utils/code-builder'

function operator_to_priority(operator: Operator) {
    switch(operator) {
        case Operator.OR:
            return 1

        case Operator.AND:
            return 2

        case Operator.EQUAL:
        case Operator.NOT_EQUAL:
            return 3

        case Operator.LESS_THAN:
        case Operator.LESS_THAN_OR_EQUAL:
        case Operator.GREATER_THAN:
        case Operator.GREATER_THAN_OR_EQUAL:
            return 4

        case Operator.PLUS:
        case Operator.MINUS:
            return 5

        case Operator.MULTIPLY:
        case Operator.DIVIDE: 
            return 6

        default:
            throw new Error('unknown operator')
    }
}

export class TypescriptOutputGenerator implements OutputGeneratorInterface {
    private value_to_literal(value: any): string {
        switch (typeof value) {
            case 'boolean':
                return Boolean(value).toString()
            
            case 'number':
                return Number(value).toString()

            case 'string':
                return JSON.stringify(value)

            default:
                throw new Error(`can't convert value \`${value}\` to literal`)
        }
    }

    private ic_type_to_ts(type: VariableType): string {
        switch (type) {
            case VariableType.VOID:
                return 'void'

            case VariableType.I32:
                return 'number'

            default:
                throw new Error(`unknown variable type \`${VariableType[type]}\``)
        }
    }

    private generate_documentation_comment(builder: CodeBuilder, comment: string|undefined): void {
        comment = comment?.trim()

        if (!!comment) {
            builder.println('/**')
            comment.split('\n').map(x => ` * ${x}`).forEach(x => builder.println(x))
            builder.println(' */')
        }
    }

    private generate_expression(
        e: Expression,
        options?: {
            parent_priority?: number
        }
    ): string {
        let s: string|undefined

        if (e instanceof Atom) {
            s = this.value_to_literal(e.value)
        } else if (e instanceof VariableReference) {
            s = e.target.name
        } else if (e instanceof BinaryOperation) {
            let operator: string|undefined

            switch (e.operator) {
                case Operator.PLUS:                  {operator = '+'; break}
                case Operator.MINUS:                 {operator = '-'; break}
                case Operator.MULTIPLY:              {operator = '*'; break}
                case Operator.DIVIDE:                {operator = '/'; break}
                case Operator.OR:                    {operator = '||'; break}
                case Operator.AND:                   {operator = '&&'; break}
                case Operator.EQUAL:                 {operator = '==='; break}
                case Operator.NOT_EQUAL:             {operator = '!=='; break}
                case Operator.LESS_THAN:             {operator = '<'; break}
                case Operator.LESS_THAN_OR_EQUAL:    {operator = '<='; break}
                case Operator.GREATER_THAN:          {operator = '>'; break}
                case Operator.GREATER_THAN_OR_EQUAL: {operator = '>='; break}

                default:
                    throw new Error(`unknown operator: ${Operator[e.operator]}`)
            }

            const priority = operator_to_priority(e.operator)
            const left = this.generate_expression(e.left_operand, {parent_priority: priority})
            const right = this.generate_expression(e.right_operand, {parent_priority: priority})
            s = `${left} ${operator} ${right}`

            if ((options?.parent_priority || -1) > priority) {
                s = `(${s})`
            }
        } else if (e instanceof FunctionCall) {
            const args_expressions = e.args.map(x => this.generate_expression(x))

            if (e.name === 'throw_error') {
                const params = args_expressions.slice(1)
                const format = args_expressions[0]

                if (typeof format !== 'string')
                    throw new Error('format string passed to the `throw_error` function is not a string')

                s = `throw new Error(${format.replace(/\{\}/g, () => `\" + ${params.shift()} + \"`)})`
            } else {
                s = `${e.name}(${args_expressions.join(', ')})`
            }
        } else {
            throw new Error('lack of implementation: don\'t know how to generate expression')
        }

        return (e.comment !== undefined)
            ? `${s} /* ${e.comment} */`
            : s
    }

    private generate_statement(builder: CodeBuilder, s: Statement): void {
        if (s.comment !== undefined) {
            builder.println(`// ${s.comment}`)
        }

        if (s instanceof Statements) {
            s.statements.forEach(x => this.generate_statement(builder, x))
        } else if (s instanceof If) {
            builder
                .println(`if (${this.generate_expression(s.condition)}) {`)
                .wrap_indentation(() => {
                    this.generate_statement(builder, s.body)
                })

            const else_body = s.else_body

            if (else_body === undefined) {
                builder.println('}')
            } else {
                if (else_body instanceof If) {
                    builder.print('} else ')
                    this.generate_statement(builder, else_body)
                } else {
                    builder
                        .println('} else {')
                        .wrap_indentation(() => {
                            this.generate_statement(builder, else_body)
                        })
                        .println('}')
                }
            }
        } else if (s instanceof While) {
            builder
                .println(`while (${this.generate_expression(s.condition)}) {`)
                .wrap_indentation(() => {
                    this.generate_statement(builder, s.body)
                })
                .println('}')
        } else if (s instanceof DoWhile) {
            builder
                .println('do {')
                .wrap_indentation(() => {
                    this.generate_statement(builder, s.body)
                })
                .println(`} while (${this.generate_expression(s.condition)})`)
        } else if (s instanceof Assignment) {
            builder.println(`${s.variable_reference.target.name} = ${this.generate_expression(s.expression)}`)
        } else if (s instanceof Return) {
            builder.println(`return ${this.generate_expression(s.expression)}`)
        } else if (s instanceof ExpressionStatement) {
            builder.println(this.generate_expression(s.expression))
        } else if (s instanceof DeclarationStatement) {
            this.generate_declaration(builder, s.declaration)
        } else if (s instanceof Break) {
            builder.println('break')
        } else if (s instanceof Continue) {
            builder.println('continue')
        }
    }

    private generate_declaration(builder: CodeBuilder, d: Declaration): void {
        if (d instanceof VariableDeclaration) {
            this.generate_documentation_comment(builder, d.comment)

            const initialization = d.initial_value !== undefined
                ? ` = ${this.generate_expression(d.initial_value)}`
                : ''
            
            builder.println(`${d.mutable ? 'let' : 'const'} ${d.name}: ${this.ic_type_to_ts(d.type)}${initialization}`)
        } else if (d instanceof Function) {
            this.generate_documentation_comment(builder, [
                d.comment || '',
                ...d.params.map(x => `@param ${x.name} ${x.comment}`)
            ].join('\n'))

            const params = d.params.map(x => `${x.name}: ${this.ic_type_to_ts(x.type)}`).join(', ')

            builder
                .println(`function ${d.name}(${params}): ${this.ic_type_to_ts(d.return_type)} {`)
                .wrap_indentation(() => {
                    this.generate_statement(builder, d.body)
                })
                .println('}')
        } else {
            throw new Error('lack of implementation')
        }
    }

    public generate(declarations: ReadonlyArray<Declaration>): string {
        const builder = new CodeBuilder()

        builder
            .println('export function parse(source: Iterable<number>): void {')
            .wrap_indentation(() => {
                builder
                    .println('const iterator = source[Symbol.iterator]()')
                    .println('let buffer: number[] = []')
                    .println('let cursor_index = -1')
                    .println('let marked_length = -1')
                    .newline()

                builder
                    .println('function current(): number {').wrap_indentation(() => {
                        builder
                            .println('if (cursor_index === -1)')
                            .wrap_indentation(() => {
                                builder.println(`throw new Error('trying to read from uninitialized parser')`)
                            })
                            .newline()
                            .println('if (buffer.length === cursor_index) {')
                            .wrap_indentation(() => {
                                builder
                                    .println('const result = iterator.next()')
                                    .println('buffer.push(result.done ? 0 : result.value)')
                            })
                            .println('}')
                            .newline()
                            .println('return buffer[cursor_index]')
                    })
                    .println('}')
                    .newline()

                builder
                    .println('function mark(offset?: number): void {').wrap_indentation(() => {
                        builder.println('marked_length = cursor_index + 1 + (offset || 0)')
                    })
                    .println('}')
                    .newline()
                
                builder
                    .println('function next(): number {').wrap_indentation(() => {
                        builder
                            .println('advance()')
                            .println('return current()')
                    })
                    .println('}')
                    .newline()
            
                builder
                    .println('function advance(): void {').wrap_indentation(() => {
                        builder
                            .println('cursor_index += 1')
                    })
                    .println('}')
                    .newline()
            
                builder
                    .println('function reset(): void {').wrap_indentation(() => {
                        builder
                            .println('buffer = buffer.slice(marked_length)')
                            .println('cursor_index = -1')
                            .println('marked_length = -1')
                    })
                    .println('}')
                    .newline()

                builder
                    .println('// @ts-ignore')
                    .println('function lexeme(): string {').wrap_indentation(() => {
                        builder.println('return buffer.slice(0, marked_length).map(x => String.fromCharCode(x)).join(\'\')')
                    })
                    .println('}')
                    .newline()

                builder
                    .println('// @ts-ignore')
                    .println('function read(): string {').wrap_indentation(() => {
                        builder.println('return buffer.slice(0, cursor_index + 1).map(x => String.fromCharCode(x)).join(\'\')')
                    })
                    .println('}')
                    .newline()

                for (const declaration of declarations) {
                    this.generate_declaration(builder, declaration)
                    builder.ensure_empty_line()
                }

                // TODO implement root variable parsing
                const root_function = declarations[declarations.length - 1] as Function
                builder.println(`return ${root_function.name}()`)
            })
            .println('}')

        return builder.to_string()
    }
}
