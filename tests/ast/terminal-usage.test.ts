import { Point, Location } from '@dist/source/location';
import { TerminalUsage } from '@dist/ast/terminal-usage';
import { ProductionNodeType } from '@dist/ast/production-node'

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const node = new TerminalUsage(location, 'element')
    expect(node.name).toEqual('element');
    expect(node.type).toEqual(ProductionNodeType.TERMINAL_USAGE)
    expect(node.location).toEqual(location);
});
