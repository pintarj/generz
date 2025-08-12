import { ExpressionStatement } from './expression-statement.js'
import { ICNode, ICNodeConstructorOptions, ICNodeType } from './ic-node.js'
import { Statement } from './statement.js'

export interface ExpressionConstructorOptions extends ICNodeConstructorOptions {}

export abstract class Expression extends ICNode<ICNodeType.EXPRESSION> {
    public constructor(options?: ExpressionConstructorOptions) {
        super(ICNodeType.EXPRESSION, options)
    }

    public to_statement(): Statement {
        return new ExpressionStatement(this)
    }
}
