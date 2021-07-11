import { Point, Location } from '@dist/source/location';
import { Terminal } from '@dist/ast/terminal';

const location = new Location(new Point(2, 4), new Point(3, 3));

test('simple', () => {
    const terminal = new Terminal(location, 'element')
    expect(terminal.name).toEqual('element');
    expect(terminal.location).toEqual(location);
});
