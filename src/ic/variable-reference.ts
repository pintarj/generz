import { Expression, ExpressionConstructorOptions } from './expression.js'
import { VariableDeclaration } from './variable-declaration.js'

export class VariableReference extends Expression {
    public constructor(
        public readonly target: VariableDeclaration,
        options?: ExpressionConstructorOptions
    ) {
        super(options)
    }
}