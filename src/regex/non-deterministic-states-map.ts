import {Context} from './context';
import {State} from './state';

export class NonDeterministicStatesMap {
    private map: Map<string, State>;

    public constructor(public readonly context: Context, initial_states?: State[]) {
        this.map = new Map();

        if (initial_states !== undefined) {
            for (let state of initial_states)
                this.map.set(state.id.toString(), state);
        }
    }

    public get_or_create(non_deterministic_states: State[]): State {
        const key   = [... new Set(non_deterministic_states.map(state => state.id))].sort().join(',');
        let   value = this.map.get(key);

        if (value !== undefined)
            return value;

        value = this.context.create_new_state();
        this.map.set(key, value);
        return value;
    }
}
