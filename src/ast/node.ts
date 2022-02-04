import { Location } from '../source/location'

/**
 * The base class for all AST nodes.
 */
export abstract class Node {
    protected constructor(
        public readonly location: Location
    ) {
        
    }
}
