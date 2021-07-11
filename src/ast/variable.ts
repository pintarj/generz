import { Node } from './node';
import { Production } from './production';
import { Location } from '../source/location';

export class Variable extends Node {
    public readonly productions: Production[];
    public readonly epsilon: boolean;

    public constructor(
        location: Location,
        public readonly name: string,
        productions: Production[],
    ) {
        super(location);
        let epsilon = false;

        this.productions = productions.filter(production => {
            if (!production.is_epsilon())
                return true;

            epsilon = true;
            return false;
        });

        this.epsilon = epsilon;
    }
}
