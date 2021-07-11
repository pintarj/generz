import { Source } from '@dist/ast/source';
import { Variable } from '@dist/ast/variable';
import { Point, Location } from '@dist/source/location';

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const source = new Source(location, [
        new Variable(location, 'Expression', [])
    ]);

    expect(source.location).toEqual(location);
    expect(source.variables).toHaveLength(1);
    expect(source.variables[0].location).toEqual(location);
    expect(source.variables[0].name).toEqual('Expression');
    expect(source.variables[0].productions).toHaveLength(0);
    expect(source.variables[0].epsilon).toEqual(false);
});
