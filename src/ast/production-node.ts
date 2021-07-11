import { Location } from '../source/location';
import { Node } from './node';

export abstract class ProductionNode extends Node {
    protected constructor(
        location: Location,
        public readonly name: string
    ) {
        super(location);
    }
}
