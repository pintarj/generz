import { Declaration } from './declaration'
import { Statement, StatementConstructorOptions } from './statement'

export class DeclarationStatement extends Statement {
    public constructor(
        public readonly declaration: Declaration,
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}
