import {State} from './state';

export class StateMachine {
    constructor(public readonly initial_state: State, public readonly final_state: State) {
        // ...
    }
}