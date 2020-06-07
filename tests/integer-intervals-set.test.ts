import {IntegerInterval, IntegerIntervalsSet} from '@dist/utils/integer-intervals-set';

test('interval-ok', () => {
    const i = new IntegerInterval(3, 5);
    expect(i.start).toBe(3);
    expect(i.end).toBe(5);
    expect(i.length).toBe(2);
});

test('interval-full-negative-ok', () => {
    const i = new IntegerInterval(-10, -7);
    expect(i.start).toBe(-10);
    expect(i.end).toBe(-7);
    expect(i.length).toBe(3);
});

test('interval-full-negative-ok', () => {
    const i = new IntegerInterval(-10, 30);
    expect(i.start).toBe(-10);
    expect(i.end).toBe(30);
    expect(i.length).toBe(40);
});

test('interval-non-integer-params', () => {
    const c0 = () => new IntegerInterval(2.1, 4);
    const c1 = () => new IntegerInterval(2, 4.1);
    const c2 = () => new IntegerInterval(2.1, 4.1);
    expect(c0).toThrowError('Integer interval must have integer boundaries.');
    expect(c1).toThrowError('Integer interval must have integer boundaries.');
    expect(c2).toThrowError('Integer interval must have integer boundaries.');
});

test('interval-negative-length', () => {
    const callback = () => new IntegerInterval(10, 5);
    expect(callback).toThrowError('Integer interval must have non-negative length.');
});

test('interval-contains', () => {
    const i = new IntegerInterval(-100, 20);
    expect(i.contains(-1000)).toBe(false);
    expect(i.contains(-101)).toBe(false);
    expect(i.contains(-100)).toBe(true);
    expect(i.contains(-99)).toBe(true);
    expect(i.contains(-1)).toBe(true);
    expect(i.contains(0)).toBe(true);
    expect(i.contains(1)).toBe(true);
    expect(i.contains(19)).toBe(true);
    expect(i.contains(20)).toBe(false);
    expect(i.contains(100)).toBe(false);
});

test('interval-set-capacity', () => {
    const set = new IntegerIntervalsSet();
    const intervals = (set as any).intervals as IntegerInterval[];
    
    expect(set.capacity).toEqual(0);
    expect(intervals).toHaveLength(0);

    set.add(2)
    expect(set.capacity).toEqual(1);
    expect(intervals).toHaveLength(1);

    set.add(-4)
    expect(set.capacity).toEqual(2);
    expect(intervals).toHaveLength(2);

    set.add(32)
    expect(set.capacity).toEqual(3);
    expect(intervals).toHaveLength(3);

    set.add(32)
    expect(set.capacity).toEqual(3);
    expect(intervals).toHaveLength(3);

    set.add(new IntegerInterval(-128, 128))
    expect(set.capacity).toEqual(1);
    expect(intervals).toHaveLength(1);
});

describe('interval-set-add', () => {
    let set = new IntegerIntervalsSet();
    let intervals = (set as any).intervals as IntegerInterval[];

    beforeEach(() => {
        expect(intervals).toHaveLength(0);
    });

    afterEach(() => {
        set = new IntegerIntervalsSet();
        intervals = (set as any).intervals as IntegerInterval[];
    });

    describe('same-insert-index', () => {
        beforeEach(() => {
            set.add(new IntegerInterval(20, 30));
            set.add(new IntegerInterval(60, 70));
        });

        test('exclusive-exclusive', () => {
            set.add(new IntegerInterval(40, 50));
            expect(intervals).toHaveLength(3);
            expect(intervals[0].start).toEqual(20);
            expect(intervals[0].end).toEqual(30);
            expect(intervals[1].start).toEqual(40);
            expect(intervals[1].end).toEqual(50);
            expect(intervals[2].start).toEqual(60);
            expect(intervals[2].end).toEqual(70);
        });

        test('exclusive-inclusive', () => {
            set.add(new IntegerInterval(40, 65));
            expect(intervals).toHaveLength(2);
            expect(intervals[0].start).toEqual(20);
            expect(intervals[0].end).toEqual(30);
            expect(intervals[1].start).toEqual(40);
            expect(intervals[1].end).toEqual(70);
        });

        test('inclusive-inclusive', () => {
            set.add(new IntegerInterval(24, 26));
            expect(intervals).toHaveLength(2);
            expect(intervals[0].start).toEqual(20);
            expect(intervals[0].end).toEqual(30);
            expect(intervals[1].start).toEqual(60);
            expect(intervals[1].end).toEqual(70);
        });
    });

    describe('different-insert-index', () => {
        beforeEach(() => {
            set.add(new IntegerInterval(10, 20));
            set.add(new IntegerInterval(30, 40));
            set.add(new IntegerInterval(50, 60));
        });

        test('exclusive-exclusive', () => {
            set.add(new IntegerInterval(5, 65));
            expect(intervals).toHaveLength(1);
            expect(intervals[0].start).toEqual(5);
            expect(intervals[0].end).toEqual(65);
        });

        test('exclusive-inclusive', () => {
            set.add(new IntegerInterval(5, 55));
            expect(intervals).toHaveLength(1);
            expect(intervals[0].start).toEqual(5);
            expect(intervals[0].end).toEqual(60);
        });

        test('inclusive-exclusive', () => {
            set.add(new IntegerInterval(15, 65));
            expect(intervals).toHaveLength(1);
            expect(intervals[0].start).toEqual(10);
            expect(intervals[0].end).toEqual(65);
        });

        test('inclusive-inclusive', () => {
            set.add(new IntegerInterval(15, 55));
            expect(intervals).toHaveLength(1);
            expect(intervals[0].start).toEqual(10);
            expect(intervals[0].end).toEqual(60);
        });
    });

    describe('edge-merging', () => {
        beforeEach(() => {
            set.add(new IntegerInterval(30, 40));
            set.add(new IntegerInterval(60, 70));
        });

        test('start-right-edge', () => {
            set.add(new IntegerInterval(20, 30));
            expect(intervals).toHaveLength(2);
            expect(intervals[0].start).toEqual(20);
            expect(intervals[0].end).toEqual(40);
            expect(intervals[1].start).toEqual(60);
            expect(intervals[1].end).toEqual(70);
        });

        test('middle-left-edge', () => {
            set.add(new IntegerInterval(40, 50));
            expect(intervals).toHaveLength(2);
            expect(intervals[0].start).toEqual(30);
            expect(intervals[0].end).toEqual(50);
            expect(intervals[1].start).toEqual(60);
            expect(intervals[1].end).toEqual(70);
        });

        test('middle-right-edge', () => {
            set.add(new IntegerInterval(50, 60));
            expect(intervals).toHaveLength(2);
            expect(intervals[0].start).toEqual(30);
            expect(intervals[0].end).toEqual(40);
            expect(intervals[1].start).toEqual(50);
            expect(intervals[1].end).toEqual(70);
        });

        test('middle-both-edges', () => {
            set.add(new IntegerInterval(40, 60));
            expect(intervals).toHaveLength(1);
            expect(intervals[0].start).toEqual(30);
            expect(intervals[0].end).toEqual(70);
        });

        test('end-left-edge', () => {
            set.add(new IntegerInterval(70, 80));
            expect(intervals).toHaveLength(2);
            expect(intervals[0].start).toEqual(30);
            expect(intervals[0].end).toEqual(40);
            expect(intervals[1].start).toEqual(60);
            expect(intervals[1].end).toEqual(80);
        });
    });
});
