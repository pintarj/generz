import { Expression } from './expression'
import { Statement, StatementConstructorOptions } from './statement'
import { VariableReference } from './variable-reference'

export class Assignment extends Statement {
    public constructor(
        public readonly variable_reference: VariableReference,
        public readonly expression: Expression,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
