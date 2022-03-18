import { Point, Location } from '@dist/source/location'
import { Variable } from '@dist/ast/variable'
import { Production } from '@dist/ast/production'
import { TerminalUsage } from '@dist/ast/terminal-usage'
import { State } from '@dist/regex/state'
import { Terminal } from '@dist/ast/terminal'

const location = new Location(new Point(2, 4), new Point(3, 3))

test('empty', () => {
    const variable = new Variable(location, 'X', [])
    expect(variable.location).toEqual(location)
    expect(variable.name).toEqual('X')
    expect(variable.productions).toHaveLength(0)
    expect(variable.epsilon).toEqual(false)
})

test('one-production', () => {
    const production = new Production(location, [new TerminalUsage(location, 'nop')])
    const variable = new Variable(location, 'X', [production])
    expect(variable.location).toEqual(location)
    expect(variable.name).toEqual('X')
    expect(variable.productions).toHaveLength(1)
    expect(variable.productions[0]).toEqual(production)
    expect(variable.epsilon).toEqual(false)
})

describe('epsilon-production', () => {
    test('single', () => {
        const variable = new Variable(location, 'X', [Production.create_epsilon(location)])
        expect(variable.location).toEqual(location)
        expect(variable.name).toEqual('X')
        expect(variable.productions).toHaveLength(0)
        expect(variable.epsilon).toEqual(true)
    })

    test('multi', () => {
        const variable = new Variable(location, 'X', [
            Production.create_epsilon(location),
            Production.create_epsilon(location),
            Production.create_epsilon(location)
        ])
        expect(variable.location).toEqual(location)
        expect(variable.name).toEqual('X')
        expect(variable.productions).toHaveLength(0)
        expect(variable.epsilon).toEqual(true)
    })

    test('filtering', () => {
        const production_0 = new Production(location, [new TerminalUsage(location, 'a')])
        const production_1 = new Production(location, [new TerminalUsage(location, 'b')])
        const variable = new Variable(location, 'X', [
            Production.create_epsilon(location),
            production_0,
            Production.create_epsilon(location),
            production_1,
            Production.create_epsilon(location)
        ])
        expect(variable.location).toEqual(location)
        expect(variable.name).toEqual('X')
        expect(variable.productions).toEqual([production_0, production_1])
        expect(variable.epsilon).toEqual(true)
    })
})

test('terminals-maps', () => {
    const s = new State(0)

    const terminal_plus = new Terminal(location, 'plus', s)
    const usage_plus = new TerminalUsage(location, 'plus')
    usage_plus.reference = terminal_plus

    const terminal_minus = new Terminal(location, 'minus', s)
    const usage_minus = new TerminalUsage(location, 'minus')
    usage_minus.reference = terminal_minus

    const variable_Sign = new Variable(location, 'Sign', [
        new Production(location, [
            usage_plus
        ]),
        new Production(location, [
            usage_minus
        ]),
    ])

    const terminals_maps = variable_Sign.terminals_maps

    expect(terminals_maps).toHaveLength(2)
    expect(terminals_maps[0].terminals.map(x => x.name)).toEqual(['plus'])
    expect(terminals_maps[0].nodes.map(x => x.name)).toEqual(['plus'])
    expect(terminals_maps[1].terminals.map(x => x.name)).toEqual(['minus'])
    expect(terminals_maps[1].nodes.map(x => x.name)).toEqual(['minus'])
})
