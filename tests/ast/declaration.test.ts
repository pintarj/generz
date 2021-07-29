import { Point, Location } from '@dist/source/location'
import { Declaration, DeclarationType } from '@dist/ast/declaration'
import { Terminal } from '@dist/ast/terminal'
import { Variable } from '@dist/ast/variable'

const location = new Location(new Point(2, 4), new Point(3, 3))

class FakeDeclaration extends Declaration {
    public constructor(name: string, type: DeclarationType) {
        super(location, type, name)
    }
}

test('fake-terminal', () => {
    const fake_terminal = new FakeDeclaration('X', DeclarationType.TERMINAL)
    expect(fake_terminal.is_terminal()).toBe(true)
    expect(fake_terminal.is_variable()).toBe(false)
})

test('fake-variable', () => {
    const fake_variable = new FakeDeclaration('x', DeclarationType.VARIABLE)
    expect(fake_variable.is_terminal()).toBe(false)
    expect(fake_variable.is_variable()).toBe(true)
})

test('terminal-class', () => {
    const terminal = new Terminal(location, 'element', undefined as any)
    expect(terminal.is_variable()).toBe(false)
    expect(terminal.is_terminal()).toBe(true)
})

test('variable-class', () => {
    const variable = new Variable(location, 'X', [])
    expect(variable.is_variable()).toBe(true)
    expect(variable.is_terminal()).toBe(false)
})
