import { Statement, StatementConstructorOptions } from './statement.js'

export class Statements extends Statement {
    public constructor(
        public readonly statements: Statement[],
        options?: StatementConstructorOptions
    ) {
        super(options)
    }
}