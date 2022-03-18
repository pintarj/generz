import { Production } from '@dist/ast/production'
import { Terminal } from '@dist/ast/terminal'
import { TerminalUsage } from '@dist/ast/terminal-usage'
import { Variable } from '@dist/ast/variable'
import { VariableUsage } from '@dist/ast/variable-usage'
import { State } from '@dist/regex/state'
import { Location, Point } from '@dist/source/location'


const location = new Location(new Point(2, 4), new Point(3, 3))

test('empty', () => {
    const production = new Production(location, [])
    expect(production.location).toEqual(location)
    expect(production.is_epsilon()).toBe(true)
})

test('epsilon', () => {
    const production = Production.create_epsilon(location)
    expect(production.location).toEqual(location)
    expect(production.is_epsilon()).toBe(true)
})

test('simple', () => {
    const production = new Production(location, [
        new TerminalUsage(location, 'if'),
        new TerminalUsage(location, 'else')
    ])

    expect(production.nodes).toHaveLength(2)
    expect(production.nodes[0].location).toEqual(location)
    expect(production.nodes[0].name).toEqual('if')
    expect(production.nodes[1].location).toEqual(location)
    expect(production.nodes[1].name).toEqual('else')
    expect(production.location).toEqual(location)
    expect(production.is_epsilon()).toBe(false)
})

describe('terminals-maps', () => {
    const s = new State(0)
    const terminal_plus = new Terminal(location, 'plus', s)
    const usage_plus = new TerminalUsage(location, 'plus')
    usage_plus.reference = terminal_plus

    const terminal_number = new Terminal(location, 'number', s)
    const usage_number = new TerminalUsage(location, 'number')
    usage_number.reference = terminal_number

    const terminal_colon = new Terminal(location, 'colon', s)
    const usage_colon = new TerminalUsage(location, 'colon')
    usage_colon.reference = terminal_colon

    const variable_Expression = new Variable(location, 'Expression', [
        new Production(location, [
            usage_number
        ]),
        new Production(location, [
            usage_plus,
            usage_number
        ]),
    ])
    const usage_Expression = new VariableUsage(location, 'Expression')
    usage_Expression.reference = variable_Expression

    const variable_Colon = new Variable(location, 'Colon', [
        new Production(location, [
            usage_colon
        ]),
        Production.create_epsilon(location)
    ])
    const usage_Colon = new VariableUsage(location, 'Colon')
    usage_Colon.reference = variable_Colon

    test('terminal-only', () => {
        const production = new Production(location, [
            usage_plus
        ])

        expect(production.terminals_maps).toHaveLength(1)
        expect(production.terminals_maps[0].terminals).toHaveLength(1)
        expect(production.terminals_maps[0].terminals[0].name).toBe('plus')
        expect(production.terminals_maps[0].nodes).toEqual([usage_plus])
        
    })

    test('terminal-and-variable', () => {
        const production = new Production(location, [
            usage_plus, usage_Expression
        ])

        expect(production.terminals_maps).toHaveLength(1)
        expect(production.terminals_maps[0].terminals).toHaveLength(1)
        expect(production.terminals_maps[0].terminals[0].name).toBe('plus')
        expect(production.terminals_maps[0].nodes).toEqual([usage_plus, usage_Expression])
    })

    test('epsilon', () => {
        const production = new Production(location, [
            usage_Colon, usage_Expression
        ])

        expect(production.terminals_maps).toHaveLength(2)
        expect(production.terminals_maps[0].terminals.map(x => x.name).sort()).toEqual(['colon'])
        expect(production.terminals_maps[0].nodes.map(x => x.name)).toEqual(['Colon', 'Expression'])
        expect(production.terminals_maps[1].terminals.map(x => x.name).sort()).toEqual(['number', 'plus'])
        expect(production.terminals_maps[1].nodes.map(x => x.name)).toEqual(['Expression'])
    })

    test('ambiguous', () => {
        const production = new Production(location, [
            usage_Colon, usage_Colon
        ])

        expect(production.terminals_maps).toHaveLength(2)
        expect(production.terminals_maps[0].terminals.map(x => x.name).sort()).toEqual(['colon'])
        expect(production.terminals_maps[0].nodes.map(x => x.name)).toEqual(['Colon', 'Colon'])
        expect(production.terminals_maps[1].terminals.map(x => x.name).sort()).toEqual(['colon'])
        expect(production.terminals_maps[1].nodes.map(x => x.name)).toEqual(['Colon'])
    })
})