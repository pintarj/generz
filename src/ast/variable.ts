import { Production } from './production.js'
import { Location } from '../source/location.js'
import { Declaration, DeclarationType } from './declaration.js'
import { TerminalsMap } from '../semantic-analysis.js'

export class Variable extends Declaration {
    public readonly productions: Production[]
    public readonly epsilon: boolean
    private _terminals_maps: TerminalsMap[]|undefined

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

    public get terminals_maps(): TerminalsMap[] {
        if (this._terminals_maps === undefined) {
            this._terminals_maps = []

            for (const production of this.productions) {
                for (const terminals_map of production.terminals_maps) {
                    this._terminals_maps.push(terminals_map)
                }
            }
        }

        return this._terminals_maps
    }
}
