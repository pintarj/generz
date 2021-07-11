import { Production } from '@dist/ast/production';
import { Terminal } from '@dist/ast/terminal';
import { Location, Point } from '@dist/source/location';

const location = new Location(new Point(2, 4), new Point(3, 3));

test('empty', () => {
    const production = new Production(location, []);
    expect(production.location).toEqual(location);
    expect(production.is_epsilon()).toBe(true);
});

test('epsilon', () => {
    const production = Production.create_epsilon(location);
    expect(production.location).toEqual(location);
    expect(production.is_epsilon()).toBe(true);
});

test('simple', () => {
    const production = new Production(location, [
        new Terminal(location, 'if'),
        new Terminal(location, 'else')
    ]);

    expect(production.nodes).toHaveLength(2);
    expect(production.nodes[0].location).toEqual(location);
    expect(production.nodes[0].name).toEqual('if');
    expect(production.nodes[1].location).toEqual(location);
    expect(production.nodes[1].name).toEqual('else');
    expect(production.location).toEqual(location);
    expect(production.is_epsilon()).toBe(false);
});
