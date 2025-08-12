import {State} from './state.js'

export class Context {
    private states_count: number = 0

    public create_new_state(): State {
        const state = new State(this.states_count)
        this.states_count += 1
        return state
    }

    public get_states_count(): number {
        return this.states_count
    }
}