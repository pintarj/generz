import { Location } from '../source/location.js'
import { State } from '../regex/state.js'
import { Declaration, DeclarationType } from './declaration.js'

export class Terminal extends Declaration {
    public constructor(
        location: Location,
        name: string,
        public readonly regex: State
    ) {
        super(location, DeclarationType.TERMINAL, name)
    }
}
