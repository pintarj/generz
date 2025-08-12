import { Location } from '../source/location.js'
import { State } from '../regex/state.js'
import { Declaration, DeclarationType } from './declaration.js'

export class Delimiter extends Declaration {
    public constructor(
        location: Location,
        public readonly regex: State
    ) {
        super(location, DeclarationType.DELIMITER, 'delimiter')
    }
}
