import { Expression, ExpressionConstructorOptions } from './expression'
import { VariableDeclaration } from './variable-declaration'

export class VariableReference extends Expression {
    public constructor(
        public readonly target: VariableDeclaration,
        options?: ExpressionConstructorOptions
    ) {
        super(options)
    }
}