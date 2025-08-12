import { Node } from '@dist/ast/node.js'
import { Location, Point } from '@dist/source/location.js'

class TestNode extends Node {
    public constructor() {
        super(new Location(new Point(2, 4), new Point(3, 3)))
    }
}

test('simple', () => {
    const node = new TestNode()
    expect(node.location.start.line).toBe(2)
    expect(node.location.start.column).toBe(4)
    expect(node.location.end.line).toBe(3)
    expect(node.location.end.column).toBe(3)
})
