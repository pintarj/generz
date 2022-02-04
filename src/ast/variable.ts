import { Production } from './production'
import { Location } from '../source/location'
import { Declaration, DeclarationType } from './declaration'

export class Variable extends Declaration {
    public readonly productions: Production[]
    public readonly epsilon: boolean

    public constructor(
        location: Location,
        name: string,
        productions: Production[]
    ) {
        super(location, DeclarationType.VARIABLE, name)
        let epsilon = false

        this.productions = productions.filter(production => {
            if (!production.is_epsilon())
                return true

            epsilon = true
            return false
        })

        this.epsilon = epsilon
    }
}
