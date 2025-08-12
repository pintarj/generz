import { Expression } from './expression.js'
import { Statement, StatementConstructorOptions } from './statement.js'
import { VariableReference } from './variable-reference.js'

export class Assignment extends Statement {
    public constructor(
        public readonly variable_reference: VariableReference,
        public readonly expression: Expression,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
