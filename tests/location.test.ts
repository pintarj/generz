import {source} from '@dist/source/location';

test('location-point', () => {
    const point = new source.Point(4, 20);
    expect(point.line).toBe(4);
    expect(point.column).toBe(20);
});

test('location-point-locatable', () => {
    const point = new source.Point(4, 20);
    const location = point.get_location();
    expect(location.start.line).toBe(4);
    expect(location.start.column).toBe(20);
    expect(location.end.line).toBe(4);
    expect(location.end.column).toBe(20);
});

test('location-location', () => {
    const p0 = new source.Point(4, 20);
    const p1 = new source.Point(5, 40);
    const location = new source.Location(p0, p1);
    expect(location.start.line).toBe(4);
    expect(location.start.column).toBe(20);
    expect(location.end.line).toBe(5);
    expect(location.end.column).toBe(40);
});

test('location-location-locatable', () => {
    const p0 = new source.Point(4, 20);
    const p1 = new source.Point(5, 40);
    const locatable: source.Locatable = new source.Location(p0, p1);
    const location = locatable.get_location();
    expect(location.start.line).toBe(4);
    expect(location.start.column).toBe(20);
    expect(location.end.line).toBe(5);
    expect(location.end.column).toBe(40);
});
