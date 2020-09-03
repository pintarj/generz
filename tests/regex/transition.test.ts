import {Symbol} from '@dist/regex/symbol';
import {State} from '@dist/regex/state';
import {Transition} from '@dist/regex/transition';

test('transition-constructor', () => {
    const symbol = new Symbol(32);
    const state = new State(16);
    const transition = new Transition(symbol, state);
    expect(transition.is_epsilon()).toBe(false);
    expect(transition.symbol?.code_point).toBe(32);
    expect(transition.state.id).toBe(16);
    expect(transition.state.transitions.length).toBe(0);
});

test('transition-epsilon', () => {
    const state = new State(16);
    const transition = new Transition(undefined, state);
    expect(transition.is_epsilon()).toBe(true);
    expect(transition.symbol).toBe(undefined);
    expect(transition.state.id).toBe(16);
    expect(transition.state.transitions.length).toBe(0);
});
