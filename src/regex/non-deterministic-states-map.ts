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

    /**
     * Given a set of states (identified by the ids of states) returns a
     * new non-deterministic state which transitions are the union of the
     * transitions of the specified states set.
     * 
     * If any of the specified states is final, then also the created non-deterministic
     * state will be final. In this case the `machine_id` of the created state will be
     * the minor id between the ones from specified final states.
     */
    public get_or_create(non_deterministic_states: State[]): State {
        const key   = [... new Set(non_deterministic_states.map(state => state.id))].sort().join(',');
        let   value = this.map.get(key);

        if (value !== undefined)
            return value;

        value = this.context.create_new_state();
        const machine_ids: number[] = [];

        for (let state of non_deterministic_states) {
            if (state.is_final) {
                if (state.machine_id !== undefined)
                    machine_ids.push(state.machine_id);

                value.is_final = true;
            }

            value.add_transitions(...state.transitions);
        }

        if (machine_ids.length !== 0) {
            value.machine_id = Math.min(...machine_ids);
        }

        this.map.set(key, value);
        return value;
    }
}
