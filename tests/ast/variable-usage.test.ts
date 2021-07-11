import { Point, Location } from '@dist/source/location';
import { VariableUsage } from '@dist/ast/variable-usage';

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const variable_usage = new VariableUsage(location, 'X')
    expect(variable_usage.name).toEqual('X');
    expect(variable_usage.location).toEqual(location);
});
