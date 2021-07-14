import { ProductionNode } from './production-node';
import { Location } from '../source/location';

export class TerminalUsage extends ProductionNode {
    public constructor(
        location: Location,
        name: string
    ) {
        super(location, name);
    }
}
