import { Point, Location } from '@dist/source/location'
import { Declaration, DeclarationType } from '@dist/ast/declaration'
import { Terminal } from '@dist/ast/terminal'
import { Variable } from '@dist/ast/variable'
import { Delimiter } from '@dist/ast/delimiter'

const location = new Location(new Point(2, 4), new Point(3, 3))

class FakeDeclaration extends Declaration {
    public constructor(name: string, type: DeclarationType) {
        super(location, type, name)
    }
}

test('fake-delimiter', () => {
    const fake = new FakeDeclaration('delimiter', DeclarationType.DELIMITER)
    expect(fake.is_delimiter()).toBe(true)
    expect(fake.is_terminal()).toBe(false)
    expect(fake.is_variable()).toBe(false)
})

test('fake-terminal', () => {
    const fake_terminal = new FakeDeclaration('X', DeclarationType.TERMINAL)
    expect(fake_terminal.is_delimiter()).toBe(false)
    expect(fake_terminal.is_terminal()).toBe(true)
    expect(fake_terminal.is_variable()).toBe(false)
})

test('fake-variable', () => {
    const fake_variable = new FakeDeclaration('x', DeclarationType.VARIABLE)
    expect(fake_variable.is_delimiter()).toBe(false)
    expect(fake_variable.is_terminal()).toBe(false)
    expect(fake_variable.is_variable()).toBe(true)
})

test('delimiter-class', () => {
    const obj = new Delimiter(location, undefined as any)
    expect(obj.is_delimiter()).toBe(true)
    expect(obj.is_variable()).toBe(false)
    expect(obj.is_terminal()).toBe(false)
})

test('terminal-class', () => {
    const obj = new Terminal(location, 'element', undefined as any)
    expect(obj.is_delimiter()).toBe(false)
    expect(obj.is_variable()).toBe(false)
    expect(obj.is_terminal()).toBe(true)
})

test('variable-class', () => {
    const obj = new Variable(location, 'X', [])
    expect(obj.is_delimiter()).toBe(false)
    expect(obj.is_variable()).toBe(true)
    expect(obj.is_terminal()).toBe(false)
})
