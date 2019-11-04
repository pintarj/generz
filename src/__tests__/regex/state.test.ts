import {State} from '../../regex/state';
import {Symbol} from "../../regex/symbol";

test('state-empty', () => {
    const s = new State(0);
    expect(s.id).toBe(0);
    expect(s.transitions.length).toBe(0);
    expect(s.get_reachable_transitions().length).toBe(0);
});

test('state-deterministic-reach', () => {
    const symbol_0 = new Symbol(32);
    const symbol_1 = new Symbol(64);
    const symbol_u = new Symbol(128);
    const state_s = new State(5);
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_u = new State(2);
    state_s.add_transition(symbol_0, state_0);
    state_s.add_transition(symbol_1, state_1);
    state_1.add_transition(symbol_u, state_u);
    expect(state_s.transitions.length).toBe(2);
    expect(state_0.transitions.length).toBe(0);
    expect(state_1.transitions.length).toBe(1);
    expect(state_u.transitions.length).toBe(0);
    const reachable = state_s.get_reachable_transitions();
    expect(reachable.length).toBe(2);
    expect(reachable[0].symbol.code_point).toBe(32);
    expect(reachable[1].symbol.code_point).toBe(64);
    expect(reachable[0].state.id).toBe(0);
    expect(reachable[1].state.id).toBe(1);
});

test('state-non-deterministic-reach', () => {
    const symbol_2 = new Symbol(16);
    const symbol_3 = new Symbol(4);
    const symbol_4 = new Symbol(8);
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    const state_3 = new State(3);
    const state_4 = new State(4);
    const state_5 = new State(5);
    state_0.add_epsilon_transition(state_1);
    state_0.add_transition(symbol_2, state_2);
    state_1.add_transition(symbol_3, state_3);
    state_1.add_transition(symbol_4, state_4);
    state_2.add_epsilon_transition(state_5);
    const reachable = state_0.get_reachable_transitions();
    expect(reachable.length).toBe(3);
    expect(reachable[0].symbol.code_point).toBe(4);
    expect(reachable[1].symbol.code_point).toBe(8);
    expect(reachable[2].symbol.code_point).toBe(16);
    expect(reachable[0].state.id).toBe(3);
    expect(reachable[1].state.id).toBe(4);
    expect(reachable[2].state.id).toBe(2);
});