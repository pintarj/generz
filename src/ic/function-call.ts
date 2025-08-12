import { Expression, ExpressionConstructorOptions } from './expression.js'

export interface FunctionCallConstructorOptions extends ExpressionConstructorOptions {
    args?: Expression[]|undefined
}

export class FunctionCall extends Expression {
    public readonly args: Expression[]

    public constructor(
        public readonly name: string,
        options?: FunctionCallConstructorOptions
    ) {
        super(options)
        this.args = options?.args || []
    }
}