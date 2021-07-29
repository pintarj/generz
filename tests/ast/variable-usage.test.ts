import { Point, Location } from '@dist/source/location';
import { VariableUsage } from '@dist/ast/variable-usage';
import { ProductionNodeType } from '@dist/ast/production-node'

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const node = new VariableUsage(location, 'X')
    expect(node.name).toEqual('X');
    expect(node.type).toEqual(ProductionNodeType.VARIABLE_USAGE)
    expect(node.location).toEqual(location)
});
