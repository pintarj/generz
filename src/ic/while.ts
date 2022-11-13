import { Expression } from './expression'
import { Statement, StatementConstructorOptions } from './statement'

export class While extends Statement {
    public constructor(
        public readonly condition: Expression,
        public readonly body: Statement,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}