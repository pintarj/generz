import { Variable } from './variable';
import { Node } from './node';
import { Location } from '../source/location';

export class Source extends Node {
    public constructor(
        location: Location,
        public readonly variables: Variable[]
    ) {
        super(location);
    }
}
