import { Point, Location } from '@dist/source/location';
import { TerminalUsage } from '@dist/ast/terminal-usage';

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const node = new TerminalUsage(location, 'element')
    expect(node.name).toEqual('element');
    expect(node.location).toEqual(location);
});
