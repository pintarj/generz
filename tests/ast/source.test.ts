import { Source } from '@dist/ast/source';
import { Terminal } from '@dist/ast/terminal'
import { Variable } from '@dist/ast/variable';
import { StringReader } from '@dist/reader'
import { Context } from '@dist/regex/context'
import { State } from '@dist/regex/state'
import { RegularExpression } from '@dist/regular-expression'
import { Point, Location } from '@dist/source/location';

function f(regex: string, options?: {context?: Context}): State {
    return (new RegularExpression(new StringReader(regex), options)).generate()
}

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const source = new Source(location, [
        new Terminal(location, 'if', f('if')),
        new Variable(location, 'Expression', [])
    ]);

    expect(source.location).toEqual(location);
    expect(source.declarations).toHaveLength(2);
    expect(source.declarations[0].is_terminal()).toBe(true);
    const terminal = source.declarations[0] as Terminal;
    expect(terminal.location).toEqual(location);
    expect(terminal.name).toEqual('if');
    expect(terminal.regex.match('if')).toBe('if');
    expect(source.declarations[1].is_variable()).toBe(true);
    const variable = source.declarations[1] as Variable;
    expect(variable.location).toEqual(location);
    expect(variable.name).toEqual('Expression');
    expect(variable.productions).toHaveLength(0);
    expect(variable.epsilon).toEqual(false);
});
