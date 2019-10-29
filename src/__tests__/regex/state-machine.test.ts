import {State} from '../../regex/state';
import {StateMachine} from '../../regex/state-machine';

test('state-machine-constructor', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const machine = new StateMachine(state_0, state_1);
    expect(machine.initial_state.id).toBe(0);
    expect(machine.final_state.id).toBe(1);
});
