import { Point, Location } from '@dist/source/location';
import { Variable } from '@dist/ast/variable';
import { Production } from '@dist/ast/production';
import { Terminal } from '@dist/ast/terminal';

const location = new Location(new Point(2, 4), new Point(3, 3));

test('empty', () => {
    const variable = new Variable(location, 'X', []);
    expect(variable.location).toEqual(location);
    expect(variable.name).toEqual('X');
    expect(variable.productions).toHaveLength(0);
    expect(variable.epsilon).toEqual(false);
});

test('one-production', () => {
    const production = new Production(location, [new Terminal(location, 'nop')]);
    const variable = new Variable(location, 'X', [production]);
    expect(variable.location).toEqual(location);
    expect(variable.name).toEqual('X');
    expect(variable.productions).toHaveLength(1);
    expect(variable.productions[0]).toEqual(production);
    expect(variable.epsilon).toEqual(false);
});

describe('epsilon-production', () => {
    test('single', () => {
        const variable = new Variable(location, 'X', [Production.create_epsilon(location)]);
        expect(variable.location).toEqual(location);
        expect(variable.name).toEqual('X');
        expect(variable.productions).toHaveLength(0);
        expect(variable.epsilon).toEqual(true);
    });

    test('multi', () => {
        const variable = new Variable(location, 'X', [
            Production.create_epsilon(location),
            Production.create_epsilon(location),
            Production.create_epsilon(location)
        ]);
        expect(variable.location).toEqual(location);
        expect(variable.name).toEqual('X');
        expect(variable.productions).toHaveLength(0);
        expect(variable.epsilon).toEqual(true);
    });

    test('filtering', () => {
        const production_0 = new Production(location, [new Terminal(location, 'a')]);
        const production_1 = new Production(location, [new Terminal(location, 'b')]);
        const variable = new Variable(location, 'X', [
            Production.create_epsilon(location),
            production_0,
            Production.create_epsilon(location),
            production_1,
            Production.create_epsilon(location)
        ]);
        expect(variable.location).toEqual(location);
        expect(variable.name).toEqual('X');
        expect(variable.productions).toEqual([production_0, production_1]);
        expect(variable.epsilon).toEqual(true);
    });
});
