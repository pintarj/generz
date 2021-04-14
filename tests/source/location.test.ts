import { Point, Location, Locatable } from '@dist/source/location';

describe('point', () => {
    test('simple', () => {
        const point = new Point(4, 20);
        expect(point.line).toBe(4);
        expect(point.column).toBe(20);
    });

    test('locatable', () => {
        const point = new Point(4, 20);
        const location = point.get_location();
        expect(location.start.line).toBe(4);
        expect(location.start.column).toBe(20);
        expect(location.end.line).toBe(4);
        expect(location.end.column).toBe(20);
    });

    test('toString', () => {
        const point = new Point(6, 77);
        expect(point.toString()).toBe('6:77');
        expect(point.get_location().toString()).toBe('6:77');
    });
});

describe('location', () => {
    test('simple', () => {
        const p0 = new Point(4, 20);
        const p1 = new Point(5, 40);
        const location = new Location(p0, p1);
        expect(location.start.line).toBe(4);
        expect(location.start.column).toBe(20);
        expect(location.end.line).toBe(5);
        expect(location.end.column).toBe(40);
    });
    
    test('locatable', () => {
        const p0 = new Point(4, 20);
        const p1 = new Point(5, 40);
        const locatable: Locatable = new Location(p0, p1);
        const location = locatable.get_location();
        expect(location.start.line).toBe(4);
        expect(location.start.column).toBe(20);
        expect(location.end.line).toBe(5);
        expect(location.end.column).toBe(40);
    });

    describe('toString', () => {
        test('point', () => {
            const location = new Location(new Point(2, 30), new Point(2, 30));
            expect(location.toString()).toBe('2:30');
            expect(location.get_location().toString()).toBe('2:30');
        });

        test('range', () => {
            const location = new Location(new Point(2, 30), new Point(4, 50));
            expect(location.toString()).toBe('2:30-4:50');
            expect(location.get_location().toString()).toBe('2:30-4:50');
        });
    });
});
