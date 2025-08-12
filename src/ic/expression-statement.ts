import { Expression } from './expression.js'
import { Statement, StatementConstructorOptions } from './statement.js'

export class ExpressionStatement extends Statement {
    public constructor(
        public readonly expression: Expression,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
