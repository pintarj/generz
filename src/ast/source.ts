import { Node } from './node'
import { Location } from '../source/location'
import { Declaration } from './declaration'

export class Source extends Node {
    public constructor(
        location: Location,
        public readonly declarations: Declaration[]
    ) {
        super(location)
    }
}
