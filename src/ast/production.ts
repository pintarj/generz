import { Node } from './node'
import { ProductionNode } from './production-node'
import { Location, Locatable } from '../source/location'

export class Production extends Node {
    public constructor(
        location: Location,
        public readonly nodes: ProductionNode[]
    ) {
        super(location)
    }

    public is_epsilon(): boolean {
        return this.nodes.length === 0
    }

    public static create_epsilon(locatable: Locatable): Production {
        return new Production(locatable.get_location(), [])
    }
}
