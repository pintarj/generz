import { ProductionNode } from './production-node';
import { Location } from '../source/location';

export class VariableUsage extends ProductionNode {
    public constructor(
        location: Location,
        name: string
    ) {
        super(location, name);
    }
}
