import { Expression, ExpressionConstructorOptions } from './expression.js'

export class Atom extends Expression {
    public constructor(
        public readonly value: any,
        options?: ExpressionConstructorOptions
    ) {
        super(options)
    }
}
