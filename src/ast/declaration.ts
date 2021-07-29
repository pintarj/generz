import { Node } from './node'
import { Location } from '../source/location'
import { Variable } from './variable'
import { Terminal } from './terminal'

export abstract class Declaration extends Node {
    protected constructor(
        location: Location,
        public readonly name: string
    ) {
        super(location)
    }

    public is_variable(): this is Variable {
        const first = this.name.charAt(0);
        return first === first.toUpperCase()
    }

    public is_terminal(): this is Terminal {
        return !this.is_variable()
    }
}
