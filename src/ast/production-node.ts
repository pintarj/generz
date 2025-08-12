import { Location } from '../source/location.js'
import { Node } from './node.js'

export enum ProductionNodeType {
    TERMINAL_USAGE = 'TERMINAL_USAGE',
    VARIABLE_USAGE = 'VARIABLE_USAGE'
}

export abstract class ProductionNode extends Node {
    protected constructor(
        location: Location,
        public readonly type: ProductionNodeType,
        public readonly name: string
    ) {
        super(location)
    }
}
