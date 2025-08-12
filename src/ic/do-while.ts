import { Expression } from './expression.js'
import { Statement, StatementConstructorOptions } from './statement.js'

export class DoWhile extends Statement {
    public constructor(
        public readonly condition: Expression,
        public readonly body: Statement,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}