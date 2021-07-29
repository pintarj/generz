import { Point, Location } from '@dist/source/location'
import { Declaration } from '@dist/ast/declaration'
import { Terminal } from '@dist/ast/terminal'
import { Variable } from '@dist/ast/variable'

const location = new Location(new Point(2, 4), new Point(3, 3))

class FakeDeclaration extends Declaration {
    public constructor(name: string) {
        super(location, name)
    }
}

test('custom', () => {
    const fake_terminal = new FakeDeclaration('x')
    expect(fake_terminal.is_terminal()).toBe(true)
    expect(fake_terminal.is_variable()).toBe(false)
    const fake_variable = new FakeDeclaration('X')
    expect(fake_variable.is_terminal()).toBe(false)
    expect(fake_variable.is_variable()).toBe(true)
})

test('terminal', () => {
    const terminal = new Terminal(location, 'element', undefined as any)
    expect(terminal.is_variable()).toBe(false)
    expect(terminal.is_terminal()).toBe(true)
})

test('variable', () => {
    const variable = new Variable(location, 'X', [])
    expect(variable.is_variable()).toBe(true)
    expect(variable.is_terminal()).toBe(false)
})
