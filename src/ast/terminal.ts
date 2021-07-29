import { Location } from '../source/location'
import { State } from '@dist/regex/state'
import { Declaration } from './declaration'

export class Terminal extends Declaration {
    public constructor(
        location: Location,
        name: string,
        public readonly regex: State
    ) {
        super(location, name)
    }
}
