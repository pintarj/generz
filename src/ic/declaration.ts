import { DeclarationStatement } from './declaration-statement.js'
import { ICNode, ICNodeConstructorOptions, ICNodeType } from './ic-node.js'
import { Statement } from './statement.js'

export interface DeclarationConstructorOptions extends ICNodeConstructorOptions {}

export abstract class Declaration extends ICNode<ICNodeType.DECLARATION> {
    public constructor(options?: DeclarationConstructorOptions) {
        super(ICNodeType.DECLARATION, options)
    }

    public to_statement(): Statement {
        return new DeclarationStatement(this)
    }
}
