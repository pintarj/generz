import { Location } from '../source/location'
import { State } from '../regex/state'
import { Declaration, DeclarationType } from './declaration'

export class Terminal extends Declaration {
    public constructor(
        location: Location,
        name: string,
        public readonly regex: State
    ) {
        super(location, DeclarationType.TERMINAL, name)
    }
}
