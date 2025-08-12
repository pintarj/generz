import { Statement, StatementConstructorOptions } from './statement.js'

export class Break extends Statement {
    public constructor(
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
