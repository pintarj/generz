import { Expression } from './expression'
import { Statement, StatementConstructorOptions } from './statement'

export interface IfConstructorOptions extends StatementConstructorOptions {
    else_body?: Statement|undefined
}

export class If extends Statement {
    public readonly else_body: Statement|undefined

    public constructor(
        public readonly condition: Expression,
        public readonly body: Statement,
        options?: IfConstructorOptions
    ) {
        super(options)
        this.else_body = options?.else_body
    }
}
