import { Expression } from './expression'
import { Statement, StatementConstructorOptions } from './statement'

export class Return extends Statement {
    public constructor(
        public readonly expression: Expression,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
