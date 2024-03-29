import { ICNode, ICNodeConstructorOptions, ICNodeType } from './ic-node'

export interface StatementConstructorOptions extends ICNodeConstructorOptions {}

export abstract class Statement extends ICNode<ICNodeType.STATEMENT> {
    public constructor(options?: StatementConstructorOptions) {
        super(ICNodeType.STATEMENT, options)
    }
}
