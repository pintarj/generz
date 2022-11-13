import { ExpressionStatement } from './expression-statement'
import { ICNode, ICNodeConstructorOptions, ICNodeType } from './ic-node'
import { Statement } from './statement'

export interface ExpressionConstructorOptions extends ICNodeConstructorOptions {}

export abstract class Expression extends ICNode<ICNodeType.EXPRESSION> {
    public constructor(options?: ExpressionConstructorOptions) {
        super(ICNodeType.EXPRESSION, options)
    }

    public to_statement(): Statement {
        return new ExpressionStatement(this)
    }
}
