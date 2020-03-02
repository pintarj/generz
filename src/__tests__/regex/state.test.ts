import {State} from '../../regex/state';
import {Symbol} from "../../regex/symbol";
import {Transition} from '../../regex/transition';
import {Context} from '../../regex/context';

test('state-empty', () => {
    const s = new State(0);
    expect(s.id).toBe(0);
    expect(s.is_final).toBe(false);
    expect(s.transitions.length).toBe(0);
    expect(s.get_reachable_transitions().length).toBe(0);
});

test('state-empty-define-final', () => {
    const state_0 = new State(0, {});
    const state_1 = new State(1, {is_final: false});
    const state_2 = new State(2, {is_final: true});
    expect(state_0.is_final).toBe(false);
    expect(state_1.is_final).toBe(false);
    expect(state_2.is_final).toBe(true);
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

test('state-deterministic-reach-loop', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    state_0.add_epsilon_transition(state_1);
    state_1.add_epsilon_transition(state_0);
    state_0.get_reachable_transitions();
    expect(true).toBe(true);
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
    expect(reachable.map(x => x.symbol.code_point).sort((a, b) => a - b)).toEqual([4, 8, 16]);
    expect(reachable.map(x => x.state.id).sort((a, b) => a - b)).toEqual([2, 3, 4]);
});

test('state-transitive-reachable-states-simple', () => {
    const symbol_1 = new Symbol(16);
    const symbol_2 = new Symbol(32);
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    state_0.add_transition(symbol_1, state_1);
    state_0.add_transition(symbol_2, state_2);
    const reachable = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id);
    expect(reachable.length).toBe(3);
    expect(reachable[0].id).toBe(0);
    expect(reachable[1].id).toBe(1);
    expect(reachable[2].id).toBe(2);
});

test('state-transitive-reachable-states-simple-epsilon', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    state_0.add_epsilon_transition(state_1);
    state_0.add_epsilon_transition(state_2);
    const reachable = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id);
    expect(reachable.length).toBe(3);
    expect(reachable[0].id).toBe(0);
    expect(reachable[1].id).toBe(1);
    expect(reachable[2].id).toBe(2);
});

test('state-transitive-reachable-states-complex', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    const state_3 = new State(3);
    const state_4 = new State(4);
    const state_5 = new State(5);
    const state_6 = new State(6);
    state_0.add_epsilon_transition(state_1);
    state_0.add_epsilon_transition(state_2);
    state_0.add_epsilon_transition(state_3);
    state_1.add_epsilon_transition(state_2);
    state_2.add_epsilon_transition(state_4);
    state_2.add_epsilon_transition(state_5);
    state_5.add_epsilon_transition(state_6);
    const reachable = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id);
    expect(reachable.length).toBe(7);
    expect(reachable[0].id).toBe(0);
    expect(reachable[1].id).toBe(1);
    expect(reachable[2].id).toBe(2);
    expect(reachable[3].id).toBe(3);
    expect(reachable[4].id).toBe(4);
    expect(reachable[5].id).toBe(5);
    expect(reachable[6].id).toBe(6);
});

test('state-transitive-reachable-states-loop', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    state_0.add_epsilon_transition(state_1);
    state_1.add_epsilon_transition(state_2);
    state_2.add_epsilon_transition(state_0);
    const reachable_0 = state_0.get_transitively_reachable_states().sort((a, b) => a.id - b.id);
    expect(reachable_0.length).toBe(3);
    expect(reachable_0[0].id).toBe(0);
    expect(reachable_0[1].id).toBe(1);
    expect(reachable_0[2].id).toBe(2);
    const reachable_1 = state_1.get_transitively_reachable_states().sort((a, b) => a.id - b.id);
    expect(reachable_1.length).toBe(3);
    expect(reachable_1[0].id).toBe(0);
    expect(reachable_1[1].id).toBe(1);
    expect(reachable_1[2].id).toBe(2);
});

test('state-multi-transition-add', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const symbol_0 = new Symbol(32);
    const symbol_1 = new Symbol(64);
    state_0.add_transitions(new Transition(symbol_0, state_1), new Transition(symbol_1, state_1));
    expect(state_0.transitions.length).toBe(2);
    expect(state_1.transitions.length).toBe(0);
    expect(state_0.transitions[0].symbol.code_point).toBe(32);
    expect(state_0.transitions[1].symbol.code_point).toBe(64);
    expect(state_0.transitions[0].state.id).toBe(1);
    expect(state_0.transitions[1].state.id).toBe(1);
});

test('state-transition-remove-all', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    state_0.add_epsilon_transition(state_1);
    state_0.add_epsilon_transition(state_1);
    expect(state_0.transitions.length).toBe(2);
    expect(state_1.transitions.length).toBe(0);
    state_0.remove_all_transitions();
    expect(state_0.transitions.length).toBe(0);
    expect(state_1.transitions.length).toBe(0);
});

test('state-expand-final-single-loop-keep-false', () => {
    const state_0 = new State(0);
    state_0.add_epsilon_transition(state_0);
    state_0.expand_final_through_epsilon_transitions();
    expect(state_0.is_final).toBe(false);
});

test('state-expand-final-double-loop-keep-false', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    state_0.add_epsilon_transition(state_1);
    state_1.add_epsilon_transition(state_0);
    state_0.expand_final_through_epsilon_transitions();
    expect(state_0.is_final).toBe(false);
    expect(state_1.is_final).toBe(false);
});

test('state-expand-final-single-loop-expand-true', () => {
    const state_0 = new State(0);
    state_0.is_final = true;
    state_0.add_epsilon_transition(state_0);
    state_0.expand_final_through_epsilon_transitions();
    expect(state_0.is_final).toBe(true);
});

test('state-expand-final-double-loop-expand-true', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    state_0.is_final = true;
    state_0.add_epsilon_transition(state_1);
    state_1.add_epsilon_transition(state_0);
    state_0.expand_final_through_epsilon_transitions();
    expect(state_0.is_final).toBe(true);
    expect(state_1.is_final).toBe(true);
});

test('state-expand-final-expand-true-transitive', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    const state_2 = new State(2);
    state_0.is_final = true;
    state_0.add_epsilon_transition(state_1);
    state_1.add_epsilon_transition(state_2);
    state_0.expand_final_through_epsilon_transitions();
    expect(state_0.is_final).toBe(true);
    expect(state_1.is_final).toBe(true);
    expect(state_2.is_final).toBe(true);
});

test('state-expand-final-expand-true-no-epsilon', () => {
    const state_0 = new State(0);
    const state_1 = new State(1);
    state_0.is_final = true;
    state_0.add_transition(new Symbol(32), state_1);
    state_0.expand_final_through_epsilon_transitions();
    expect(state_0.is_final).toBe(true);
    expect(state_1.is_final).toBe(false);
});

test('state-expand-final-complex', () => {
    const context = new Context();
    const states = [
        context.create_new_state(),
        context.create_new_state(),
        context.create_new_state(),
        context.create_new_state(),
        context.create_new_state(),
        context.create_new_state(),
    ];
    states[0].is_final = true;
    states[0].add_epsilon_transition(states[0]);
    states[0].add_epsilon_transition(states[1]);
    states[1].add_epsilon_transition(states[2]);
    states[2].add_epsilon_transition(states[0]);
    states[1].add_transition(new Symbol(1024), states[3]);
    states[0].add_transition(new Symbol(1024), states[4]);
    states[4].add_epsilon_transition(states[5]);
    states[0].expand_final_through_epsilon_transitions();
    expect(states[0].is_final).toBe(true);
    expect(states[1].is_final).toBe(true);
    expect(states[2].is_final).toBe(true);
    expect(states[3].is_final).toBe(false);
    expect(states[4].is_final).toBe(false);
    expect(states[5].is_final).toBe(false);
});
