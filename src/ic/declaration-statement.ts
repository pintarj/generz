import { Declaration } from './declaration.js'
import { Statement, StatementConstructorOptions } from './statement.js'

export class DeclarationStatement extends Statement {
    public constructor(
        public readonly declaration: Declaration,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
