import { Node } from './node.js'
import { Location } from '../source/location.js'
import { Declaration } from './declaration.js'

export class Source extends Node {
    public constructor(
        location: Location,
        public readonly declarations: Declaration[]
    ) {
        super(location)
    }
}
