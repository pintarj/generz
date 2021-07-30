import { ProductionNode, ProductionNodeType } from './production-node';
import { Location } from '../source/location';
import { Variable } from './variable'
import { InternalError } from '../error'

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
