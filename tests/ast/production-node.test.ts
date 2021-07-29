import { ProductionNode, ProductionNodeType } from '@dist/ast/production-node';
import { Location, Point } from '@dist/source/location';

class TestProductionNode extends ProductionNode {
    public constructor() {
        super(new Location(new Point(2, 4), new Point(3, 3)), ProductionNodeType.TERMINAL_USAGE, 'Satoshi');
    }
}

test('simple', () => {
    const node = new TestProductionNode();
    expect(node.location.start.line).toBe(2);
    expect(node.location.start.column).toBe(4);
    expect(node.location.end.line).toBe(3);
    expect(node.location.end.column).toBe(3);
    expect(node.type).toBe(ProductionNodeType.TERMINAL_USAGE);
    expect(node.name).toBe('Satoshi');
});
