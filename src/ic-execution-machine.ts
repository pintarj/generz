import { Assignment } from './ic/assignment'
import { Atom } from './ic/atom'
import { BinaryOperation, Operator } from './ic/binary-operation'
import { Break } from './ic/break'
import { Continue } from './ic/continue'
import { DeclarationStatement } from './ic/declaration-statement'
import { Expression } from './ic/expression'
import { ExpressionStatement } from './ic/expression-statement'
import { Function } from './ic/function'
import { FunctionCall } from './ic/function-call'
import { If } from './ic/if'
import { Return } from './ic/return'
import { Statement } from './ic/statement'
import { Statements } from './ic/statements'
import { VariableDeclaration, VariableType } from './ic/variable-declaration'
import { VariableReference } from './ic/variable-reference'
import { While } from './ic/while'

export class Scope {
    private readonly parent: Scope|undefined
    private readonly variables: Map<string, {type: VariableType, value: any}>
    private readonly functions: Map<string, (...args: any[]) => any>

    public constructor(
        options?: {
            parent?: Scope
        }
    ) {
        this.parent = options?.parent
        this.variables = new Map()
        this.functions = new Map()
    }

    public create_child(): Scope {
        return new Scope({parent: this})
    }

    public declare_variable(name: string, type: VariableType, value: any): void {
        if (this.variables.has(name))
            throw new Error(`duplicate variable \`${name}\` declaration`)

        this.variables.set(name, {type, value})
    }

    public get_variable(name: string): {type: VariableType, value: any} {
        const variable = this.variables.get(name)

        if (variable === undefined) {
            if (this.parent === undefined) {
                throw new Error(`variable \`${name}\` is not declared`)
            } else {
                return this.parent.get_variable(name)
            }
        }

        return variable
    }

    public declare_function(name: string, f: (...args: any[]) => any): void {
        if (this.functions.has(name))
            throw new Error(`duplicate  function \`${name}\` declaration`)

        this.functions.set(name, f)
    }

    public get_function(name: string): ((...args: any[]) => any) {
        const f = this.functions.get(name)

        if (f === undefined) {
            if (this.parent === undefined) {
                throw new Error(`function \`${name}\` is not declared`)
            } else {
                return this.parent.get_function(name)
            }
        }

        return f
    }
}

type ExecutionResult = {
    type: 'return'
    value: any
} | {
    type: 'break'|'continue'
}

export class IcExecutionMachine {
    public readonly global_scope: Scope

    public constructor() {
        this.global_scope = new Scope()
    }

    public evaluate(
        e: Expression,
        options?: {
            scope?: Scope
        }
    ): any {
        const scope = options?.scope || this.global_scope

        if (e instanceof Atom) {
            return e.value
        } else if (e instanceof BinaryOperation) {
            const left  = this.evaluate(e.left_operand,  {scope})
            const right = this.evaluate(e.right_operand, {scope})

            switch (e.operator) {
                case Operator.PLUS:                  return left +   right
                case Operator.MINUS:                 return left -   right
                case Operator.MULTIPLY:              return left *   right
                case Operator.DIVIDE:                return Math.floor(left / right)
                case Operator.OR:                    return left ||  right
                case Operator.AND:                   return left &&  right
                case Operator.EQUAL:                 return left === right
                case Operator.NOT_EQUAL:             return left !== right
                case Operator.LESS_THAN:             return left <   right
                case Operator.LESS_THAN_OR_EQUAL:    return left <=  right
                case Operator.GREATER_THAN:          return left >   right
                case Operator.GREATER_THAN_OR_EQUAL: return left >=  right

                default:
                    throw new Error(`unknown operator: ${Operator[e.operator]}`)
            }
        } else if (e instanceof FunctionCall) {
            const f = scope.get_function(e.name)
            const args = e.args.map(x => this.evaluate(x, {scope}))
            return f(...args)
        } else if (e instanceof VariableReference) {
            return scope.get_variable(e.target.name).value
        } else {
            throw new Error('lack of implementation')
        }
    }

    public execute(
        s: Statement,
        options?: {
            scope?: Scope
        }
    ): ExecutionResult|undefined {
        const scope = options?.scope || this.global_scope
        
        if (s instanceof Assignment) {
            const variable = scope.get_variable(s.variable_reference.target.name)
            variable.value = this.evaluate(s.expression, {scope})
        } else if (s instanceof Break) {
            return {type: 'break'}
        } else if (s instanceof Continue) {
            return {type: 'continue'}
        } else if (s instanceof DeclarationStatement) {
            const d = s.declaration

            if (d instanceof Function) {
                scope.declare_function(d.name, (...args: any[]) => {
                    const function_scope = scope.create_child()
                    
                    for (let i = 0; i < d.params.length; ++i) {
                        const param = d.params[i]
                        function_scope.declare_variable(param.name, param.type, args[i])
                    }

                    const result = this.execute(d.body, {scope: function_scope})

                    if (result?.type !== 'return')
                        throw new Error(`executed function didn't returned any value`)

                    return result.value
                })
            } else if (d instanceof VariableDeclaration) {
                const initial_value = d.initial_value !== undefined
                    ? this.evaluate(d.initial_value, {scope})
                    : new Atom(0)

                scope.declare_variable(d.name, d.type, initial_value)
            } else {
                throw new Error('lack of implementation')
            }
        } else if (s instanceof If) {
            if (this.evaluate(s.condition, {scope})) {
                const body_scope = scope.create_child()
                return this.execute(s.body, {scope: body_scope})
            } else {
                if (s.else_body !== undefined) {
                    const else_body_scope = scope.create_child()
                    return this.execute(s.else_body, {scope: else_body_scope})
                }
            }
        } else if (s instanceof ExpressionStatement) {
            this.evaluate(s.expression, {scope})
        } else if (s instanceof Return) {
            return {
                type: 'return',
                value: this.evaluate(s.expression, {scope})
            }
        } else if (s instanceof Statements) {
            for (const statement of s.statements) {
                const value = this.execute(statement, {scope})

                if (value !== undefined)
                    return value
            }
        } else if (s instanceof While) {
            while (this.evaluate(s.condition, {scope})) {
                const while_scope = scope.create_child()
                const value = this.execute(s.body, {scope: while_scope})

                if (value !== undefined) {
                    if (value.type === 'continue')
                        continue

                    if (value.type === 'break')
                        break

                    return value
                }
            }
        } else {
            throw new Error('lack of implementation')
        }

        return undefined
    }
}
