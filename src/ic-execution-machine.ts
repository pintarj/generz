import { Assignment } from './ic/assignment'
import { Atom } from './ic/atom'
import { BinaryOperation, Operator } from './ic/binary-operation'
import { DeclarationStatement } from './ic/declaration-statement'
import { Expression } from './ic/expression'
import { Statement } from './ic/statement'
import { VariableDeclaration, VariableType } from './ic/variable-declaration'
import { VariableReference } from './ic/variable-reference'

export class Scope {
    private readonly parent: Scope|undefined
    private readonly variables: Map<string, {type: VariableType, value: any}>

    public constructor(
        options?: {
            parent?: Scope
        }
    ) {
        this.parent = options?.parent
        this.variables = new Map()
    }

    public declare_variable(name: string, type: VariableType, value: any) {
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
    ): void {
        const scope = options?.scope || this.global_scope
        
        if (s instanceof Assignment) {
            const variable = scope.get_variable(s.variable_reference.target.name)
            variable.value = this.evaluate(s.expression, {scope})
        } else if (s instanceof DeclarationStatement) {
            const d = s.declaration

            if (d instanceof VariableDeclaration) {
                const initial_value = d.initial_value !== undefined
                    ? this.evaluate(d.initial_value, {scope})
                    : new Atom(0)

                scope.declare_variable(d.name, d.type, initial_value)
            } else {
                throw new Error('lack of implementation')
            }
        } else {
            throw new Error('lack of implementation')
        }
    }
}
