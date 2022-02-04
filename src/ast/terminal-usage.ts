import { ProductionNode, ProductionNodeType } from './production-node';
import { Location } from '../source/location';
import { Terminal } from './terminal'
import { InternalError } from '../error'

export class TerminalUsage extends ProductionNode {
    private _reference: Terminal|undefined
    
    public set reference(value: Terminal) {
        this._reference = value
    }

    public get reference(): Terminal {
        if (this._reference === undefined)
            throw new InternalError(`Trying to get a reference to the terminal \`${this.name}\` that was not set yet.`)

        return this._reference
    }

    public constructor(
        location: Location,
        name: string
    ) {
        super(location, ProductionNodeType.TERMINAL_USAGE, name)
    }
}
