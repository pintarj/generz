import { Location } from '../source/location'
import { State } from '../regex/state'
import { Declaration, DeclarationType } from './declaration'

export class Delimiter extends Declaration {
    public constructor(
        location: Location,
        public readonly regex: State
    ) {
        super(location, DeclarationType.DELIMITER, 'delimiter')
    }
}
