import { ProductionNode, ProductionNodeType } from './production-node.js'
import { Location } from '../source/location.js'
import { Variable } from './variable.js'
import { InternalError } from '../error.js'

export class VariableUsage extends ProductionNode {
    private _reference: Variable|undefined
    
    public set reference(value: Variable) {
        this._reference = value
    }

    public get reference(): Variable {
        if (this._reference === undefined)
            throw new InternalError(`Trying to get a reference to the variable \`${this.name}\` that was not set yet.`)

        return this._reference
    }

    public constructor(
        location: Location,
        name: string
    ) {
        super(location, ProductionNodeType.VARIABLE_USAGE, name)
    }
}
