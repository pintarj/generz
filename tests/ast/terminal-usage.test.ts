import { Point, Location } from '@dist/source/location.js'
import { TerminalUsage } from '@dist/ast/terminal-usage.js'
import { ProductionNodeType } from '@dist/ast/production-node.js'
import { Terminal } from '@dist/ast/terminal.js'

const location = new Location(new Point(2, 4), new Point(3, 3))

test('simple', () => {
    const node = new TerminalUsage(location, 'element')
    expect(node.name).toEqual('element')
    expect(node.type).toEqual(ProductionNodeType.TERMINAL_USAGE)
    expect(node.location).toEqual(location)
})

describe('reference', () => {
    test('default-undefined', () => {
        const node = new TerminalUsage(location, 'element')
        expect(() => node.reference).toThrow('Trying to get a reference to the terminal `element` that was not set yet.')
    })

    test('set', () => {
        const node = new TerminalUsage(location, 'element')
        const terminal = new Terminal(location, 'element', null as any)
        node.reference = terminal
        expect(() => node.reference).not.toThrow()
        expect(node.reference).toEqual(terminal)
    })
})

