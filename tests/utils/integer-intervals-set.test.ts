import {IntegerInterval, IntegerIntervalsSet} from '@dist/utils/integer-intervals-set'

test('interval-ok', () => {
    const i = new IntegerInterval(3, 5)
    expect(i.start).toBe(3)
    expect(i.end).toBe(5)
    expect(i.length).toBe(2)
})

test('interval-full-negative-ok', () => {
    const i = new IntegerInterval(-10, -7)
    expect(i.start).toBe(-10)
    expect(i.end).toBe(-7)
    expect(i.length).toBe(3)
})

test('interval-full-negative-ok', () => {
    const i = new IntegerInterval(-10, 30)
    expect(i.start).toBe(-10)
    expect(i.end).toBe(30)
    expect(i.length).toBe(40)
})

test('interval-non-integer-params', () => {
    const c0 = () => new IntegerInterval(2.1, 4)
    const c1 = () => new IntegerInterval(2, 4.1)
    const c2 = () => new IntegerInterval(2.1, 4.1)
    expect(c0).toThrowError('Integer interval must have integer boundaries.')
    expect(c1).toThrowError('Integer interval must have integer boundaries.')
    expect(c2).toThrowError('Integer interval must have integer boundaries.')
})

test('interval-negative-length', () => {
    const callback = () => new IntegerInterval(10, 5)
    expect(callback).toThrowError('Integer interval must have non-negative length.')
})

test('interval-contains', () => {
    const i = new IntegerInterval(-100, 20)
    expect(i.contains(-1000)).toBe(false)
    expect(i.contains(-101)).toBe(false)
    expect(i.contains(-100)).toBe(true)
    expect(i.contains(-99)).toBe(true)
    expect(i.contains(-1)).toBe(true)
    expect(i.contains(0)).toBe(true)
    expect(i.contains(1)).toBe(true)
    expect(i.contains(19)).toBe(true)
    expect(i.contains(20)).toBe(false)
    expect(i.contains(100)).toBe(false)
})

test('size', () => {
    const set = new IntegerIntervalsSet()
    expect(set.size).toEqual(0)

    set.add(2)
    expect(set.size).toEqual(1)

    set.add(-4)
    expect(set.size).toEqual(2)

    set.add(32)
    expect(set.size).toEqual(3)

    set.add(32)
    expect(set.size).toEqual(3)

    set.add(-4)
    expect(set.size).toEqual(3)

    set.add(new IntegerInterval(-128, 128))
    expect(set.size).toEqual(256)
})

test('interval-set-capacity', () => {
    const set = new IntegerIntervalsSet()
    const intervals = set.get_intervals()
    
    expect(set.capacity).toEqual(0)
    expect(intervals).toHaveLength(0)

    set.add(2)
    expect(set.capacity).toEqual(1)
    expect(intervals).toHaveLength(1)

    set.add(-4)
    expect(set.capacity).toEqual(2)
    expect(intervals).toHaveLength(2)

    set.add(32)
    expect(set.capacity).toEqual(3)
    expect(intervals).toHaveLength(3)

    set.add(32)
    expect(set.capacity).toEqual(3)
    expect(intervals).toHaveLength(3)

    set.add(new IntegerInterval(-128, 128))
    expect(set.capacity).toEqual(1)
    expect(intervals).toHaveLength(1)
})

describe('interval-set-add', () => {
    let set = new IntegerIntervalsSet()
    let intervals = set.get_intervals()

    beforeEach(() => {
        expect(intervals).toHaveLength(0)
    })

    afterEach(() => {
        set = new IntegerIntervalsSet()
        intervals = set.get_intervals()
    })

    describe('same-insert-index', () => {
        beforeEach(() => {
            set.add(new IntegerInterval(20, 30))
            set.add(new IntegerInterval(60, 70))
        })

        test('exclusive-exclusive', () => {
            set.add(new IntegerInterval(40, 50))
            expect(intervals).toHaveLength(3)
            expect(intervals[0].start).toEqual(20)
            expect(intervals[0].end).toEqual(30)
            expect(intervals[1].start).toEqual(40)
            expect(intervals[1].end).toEqual(50)
            expect(intervals[2].start).toEqual(60)
            expect(intervals[2].end).toEqual(70)
        })

        test('exclusive-inclusive', () => {
            set.add(new IntegerInterval(40, 65))
            expect(intervals).toHaveLength(2)
            expect(intervals[0].start).toEqual(20)
            expect(intervals[0].end).toEqual(30)
            expect(intervals[1].start).toEqual(40)
            expect(intervals[1].end).toEqual(70)
        })

        test('inclusive-inclusive', () => {
            set.add(new IntegerInterval(24, 26))
            expect(intervals).toHaveLength(2)
            expect(intervals[0].start).toEqual(20)
            expect(intervals[0].end).toEqual(30)
            expect(intervals[1].start).toEqual(60)
            expect(intervals[1].end).toEqual(70)
        })
    })

    describe('different-insert-index', () => {
        beforeEach(() => {
            set.add(new IntegerInterval(10, 20))
            set.add(new IntegerInterval(30, 40))
            set.add(new IntegerInterval(50, 60))
        })

        test('exclusive-exclusive', () => {
            set.add(new IntegerInterval(5, 65))
            expect(intervals).toHaveLength(1)
            expect(intervals[0].start).toEqual(5)
            expect(intervals[0].end).toEqual(65)
        })

        test('exclusive-inclusive', () => {
            set.add(new IntegerInterval(5, 55))
            expect(intervals).toHaveLength(1)
            expect(intervals[0].start).toEqual(5)
            expect(intervals[0].end).toEqual(60)
        })

        test('inclusive-exclusive', () => {
            set.add(new IntegerInterval(15, 65))
            expect(intervals).toHaveLength(1)
            expect(intervals[0].start).toEqual(10)
            expect(intervals[0].end).toEqual(65)
        })

        test('inclusive-inclusive', () => {
            set.add(new IntegerInterval(15, 55))
            expect(intervals).toHaveLength(1)
            expect(intervals[0].start).toEqual(10)
            expect(intervals[0].end).toEqual(60)
        })
    })

    describe('edge-merging', () => {
        beforeEach(() => {
            set.add(new IntegerInterval(30, 40))
            set.add(new IntegerInterval(60, 70))
        })

        test('start-right-edge', () => {
            set.add(new IntegerInterval(20, 30))
            expect(intervals).toHaveLength(2)
            expect(intervals[0].start).toEqual(20)
            expect(intervals[0].end).toEqual(40)
            expect(intervals[1].start).toEqual(60)
            expect(intervals[1].end).toEqual(70)
        })

        test('middle-left-edge', () => {
            set.add(new IntegerInterval(40, 50))
            expect(intervals).toHaveLength(2)
            expect(intervals[0].start).toEqual(30)
            expect(intervals[0].end).toEqual(50)
            expect(intervals[1].start).toEqual(60)
            expect(intervals[1].end).toEqual(70)
        })

        test('middle-right-edge', () => {
            set.add(new IntegerInterval(50, 60))
            expect(intervals).toHaveLength(2)
            expect(intervals[0].start).toEqual(30)
            expect(intervals[0].end).toEqual(40)
            expect(intervals[1].start).toEqual(50)
            expect(intervals[1].end).toEqual(70)
        })

        test('middle-both-edges', () => {
            set.add(new IntegerInterval(40, 60))
            expect(intervals).toHaveLength(1)
            expect(intervals[0].start).toEqual(30)
            expect(intervals[0].end).toEqual(70)
        })

        test('end-left-edge', () => {
            set.add(new IntegerInterval(70, 80))
            expect(intervals).toHaveLength(2)
            expect(intervals[0].start).toEqual(30)
            expect(intervals[0].end).toEqual(40)
            expect(intervals[1].start).toEqual(60)
            expect(intervals[1].end).toEqual(80)
        })

        test('edge-miss-left', () => {
            set.add(new IntegerInterval(41, 50))
            expect(intervals).toHaveLength(3)
            expect(intervals[0].start).toEqual(30)
            expect(intervals[0].end).toEqual(40)
            expect(intervals[1].start).toEqual(41)
            expect(intervals[1].end).toEqual(50)
            expect(intervals[2].start).toEqual(60)
            expect(intervals[2].end).toEqual(70)
            expect(set.contains(39)).toBe(true)
            expect(set.contains(40)).toBe(false)
            expect(set.contains(41)).toBe(true)
        })

        test('edge-miss-right', () => {
            set.add(new IntegerInterval(50, 59))
            expect(intervals).toHaveLength(3)
            expect(intervals[0].start).toEqual(30)
            expect(intervals[0].end).toEqual(40)
            expect(intervals[1].start).toEqual(50)
            expect(intervals[1].end).toEqual(59)
            expect(intervals[2].start).toEqual(60)
            expect(intervals[2].end).toEqual(70)
            expect(set.contains(58)).toBe(true)
            expect(set.contains(59)).toBe(false)
            expect(set.contains(60)).toBe(true)
        })
    })
})

describe('interval-set-contains', () => {
    const set = new IntegerIntervalsSet()
    set.add(new IntegerInterval(40, 50))
    set.add(60)

    test('single-left-edge', () => {
        expect(set.contains(59)).toEqual(false)
    })

    test('single-right-edge', () => {
        expect(set.contains(61)).toEqual(false)
    })

    test('single-match', () => {
        expect(set.contains(60)).toEqual(true)
    })

    test('range-left-edge', () => {
        expect(set.contains(39)).toEqual(false)
    })

    test('range-left-edge-inclusive', () => {
        expect(set.contains(40)).toEqual(true)
    })

    test('range-right-edge', () => {
        expect(set.contains(50)).toEqual(false)
    })

    test('range-right-edge-inclusive', () => {
        expect(set.contains(49)).toEqual(true)
    })

    test('range-match', () => {
        expect(set.contains(45)).toEqual(true)
    })
})

describe('interval-set-calculate_differences_and_intersection', () => {
    let left = new IntegerIntervalsSet()
    let right = new IntegerIntervalsSet()
    
    beforeEach(() => {
        expect(left.capacity).toEqual(0)
        expect(right.capacity).toEqual(0)
    })

    afterEach(() => {
        left = new IntegerIntervalsSet()
        right = new IntegerIntervalsSet()
    })
    
    test('empty', () => {
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        expect(result.left_difference.capacity).toEqual(0)
        expect(result.right_difference.capacity).toEqual(0)
        expect(result.intersection.capacity).toEqual(0)
    })
    
    test('fast-consume-left', () => {
        left.add(10)
        left.add(20)
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        let left_intervals = result.left_difference.get_intervals()
        expect(result.left_difference.capacity).toEqual(2)
        expect(left_intervals).toHaveLength(2)
        expect(left_intervals[0].start).toEqual(10)
        expect(left_intervals[0].end).toEqual(11)
        expect(left_intervals[1].start).toEqual(20)
        expect(left_intervals[1].end).toEqual(21)
        expect(result.right_difference.capacity).toEqual(0)
        expect(result.intersection.capacity).toEqual(0)
    })
    
    test('fast-consume-right', () => {
        right.add(10)
        right.add(20)
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        let right_intervals = result.right_difference.get_intervals()
        expect(result.left_difference.capacity).toEqual(0)
        expect(result.right_difference.capacity).toEqual(2)
        expect(right_intervals).toHaveLength(2)
        expect(right_intervals[0].start).toEqual(10)
        expect(right_intervals[0].end).toEqual(11)
        expect(right_intervals[1].start).toEqual(20)
        expect(right_intervals[1].end).toEqual(21)
        expect(result.intersection.capacity).toEqual(0)
    })
    
    test('equal-start-different-end', () => {
        left.add(new IntegerInterval(10, 15))
        right.add(new IntegerInterval(10, 20))
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        expect(result.left_difference.capacity).toEqual(0)
        expect(result.right_difference.capacity).toEqual(1)
        expect(result.intersection.capacity).toEqual(1)
        const intersection_intervals = result.intersection.get_intervals()
        expect(intersection_intervals).toHaveLength(1)
        expect(intersection_intervals[0].start).toEqual(10)
        expect(intersection_intervals[0].end).toEqual(15)
        const right_intervals = result.right_difference.get_intervals()
        expect(right_intervals).toHaveLength(1)
        expect(right_intervals[0].start).toEqual(15)
        expect(right_intervals[0].end).toEqual(20)
    })
    
    test('equal-start-equal-end', () => {
        left.add(new IntegerInterval(10, 20))
        right.add(new IntegerInterval(10, 20))
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        expect(result.left_difference.capacity).toEqual(0)
        expect(result.right_difference.capacity).toEqual(0)
        expect(result.intersection.capacity).toEqual(1)
        const intervals = result.intersection.get_intervals()
        expect(intervals).toHaveLength(1)
        expect(intervals[0].start).toEqual(10)
        expect(intervals[0].end).toEqual(20)
    })

    test('different-start-equal-end', () => {
        left.add(new IntegerInterval(5, 20))
        right.add(new IntegerInterval(10, 20))
        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        expect(result.left_difference.capacity).toEqual(1)
        expect(result.right_difference.capacity).toEqual(0)
        expect(result.intersection.capacity).toEqual(1)
        const intersection_intervals = result.intersection.get_intervals()
        expect(intersection_intervals).toHaveLength(1)
        expect(intersection_intervals[0].start).toEqual(10)
        expect(intersection_intervals[0].end).toEqual(20)
        const left_intervals = result.left_difference.get_intervals()
        expect(left_intervals).toHaveLength(1)
        expect(left_intervals[0].start).toEqual(5)
        expect(left_intervals[0].end).toEqual(10)
    })

    test('complex-0', () => {
        left.add(new IntegerInterval(-5, 1))
        left.add(3)
        left.add(new IntegerInterval(6, 9))
        left.add(new IntegerInterval(11, 14))
        left.add(new IntegerInterval(15, 20))
        left.add(22)

        right.add(new IntegerInterval(-16, -14))
        right.add(new IntegerInterval(-10, -4))
        right.add(new IntegerInterval(1, 10))
        right.add(new IntegerInterval(11, 14))
        right.add(new IntegerInterval(16, 23))
        right.add(new IntegerInterval(25, 27))

        const result = IntegerIntervalsSet.calculate_differences_and_intersection(left, right)
        expect(result.left_difference.capacity).toEqual(2)
        expect(result.right_difference.capacity).toEqual(7)
        expect(result.intersection.capacity).toEqual(6)

        const left_intervals = result.left_difference.get_intervals()
        expect(left_intervals).toHaveLength(2)
        expect(left_intervals[0].start).toEqual(-4)
        expect(left_intervals[0].end).toEqual(1)
        expect(left_intervals[1].start).toEqual(15)
        expect(left_intervals[1].end).toEqual(16)

        const right_intervals = result.right_difference.get_intervals()
        expect(right_intervals).toHaveLength(7)
        expect(right_intervals[0].start).toEqual(-16)
        expect(right_intervals[0].end).toEqual(-14)
        expect(right_intervals[1].start).toEqual(-10)
        expect(right_intervals[1].end).toEqual(-5)
        expect(right_intervals[2].start).toEqual(1)
        expect(right_intervals[2].end).toEqual(3)
        expect(right_intervals[3].start).toEqual(4)
        expect(right_intervals[3].end).toEqual(6)
        expect(right_intervals[4].start).toEqual(9)
        expect(right_intervals[4].end).toEqual(10)
        expect(right_intervals[5].start).toEqual(20)
        expect(right_intervals[5].end).toEqual(22)
        expect(right_intervals[6].start).toEqual(25)
        expect(right_intervals[6].end).toEqual(27)

        const intersection_intervals = result.intersection.get_intervals()
        expect(intersection_intervals).toHaveLength(6)
        expect(intersection_intervals[0].start).toEqual(-5)
        expect(intersection_intervals[0].end).toEqual(-4)
        expect(intersection_intervals[1].start).toEqual(3)
        expect(intersection_intervals[1].end).toEqual(4)
        expect(intersection_intervals[2].start).toEqual(6)
        expect(intersection_intervals[2].end).toEqual(9)
        expect(intersection_intervals[3].start).toEqual(11)
        expect(intersection_intervals[3].end).toEqual(14)
        expect(intersection_intervals[4].start).toEqual(16)
        expect(intersection_intervals[4].end).toEqual(20)
        expect(intersection_intervals[5].start).toEqual(22)
        expect(intersection_intervals[5].end).toEqual(23)
    })
})

describe('to_array', () => {
    test('single-interval', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(10, 13))
        expect(set.to_array()).toEqual([10, 11, 12])
    })

    test('multiple-interval', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(4, 8))
        set.add(new IntegerInterval(15, 16))
        set.add(new IntegerInterval(34, 38))
        expect(set.to_array()).toEqual([4, 5, 6, 7, 15, 34, 35, 36, 37])
    })

    test('negative-intervals', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(-64, -62))
        set.add(new IntegerInterval(-2, 2))
        expect(set.to_array()).toEqual([-64, -63, -2, -1, 0, 1])
    })
})

describe('union', () => {
    test('simple', () => {
        const set_0 = new IntegerIntervalsSet()
        set_0.add(new IntegerInterval(10, 13))
        set_0.add(new IntegerInterval(15, 17))

        const set_1 = new IntegerIntervalsSet()
        set_1.add(new IntegerInterval(11, 15))
        set_1.add(new IntegerInterval(100, 101))

        const union_0 = IntegerIntervalsSet.calculate_union(set_0, set_1).to_array()
        const union_1 = IntegerIntervalsSet.calculate_union(set_1, set_0).to_array()

        expect(union_0).toEqual(union_1)
        expect(union_0).toEqual([10, 11, 12, 13, 14, 15, 16, 100])
    })

    test('same-set', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(10, 13))
        set.add(new IntegerInterval(15, 17))
        const union = IntegerIntervalsSet.calculate_union(set, set).to_array()
        expect(union).toEqual([10, 11, 12, 15, 16])
    })
})

describe('negation', () => {
    test('empty', () => {
        const set = new IntegerIntervalsSet()
        const negation = IntegerIntervalsSet.calculate_negation(set)
        
        expect(negation.get_intervals()).toMatchObject([
            {start: Number.MIN_SAFE_INTEGER, end: Number.MAX_SAFE_INTEGER}
        ])
    })

    test('full', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))
        const negation = IntegerIntervalsSet.calculate_negation(set)
        expect(negation.capacity).toEqual(0)
    })

    test('single-interval', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(2, 5))
        const negation = IntegerIntervalsSet.calculate_negation(set)
        expect(negation.get_intervals()).toMatchObject([
            {start: Number.MIN_SAFE_INTEGER, end: 2},
            {start: 5, end: Number.MAX_SAFE_INTEGER},
        ])
    })

    test('multiple-interval', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(-100, 0))
        set.add(new IntegerInterval(2, 5))
        set.add(new IntegerInterval(10, 15))
        const negation = IntegerIntervalsSet.calculate_negation(set)
        expect(negation.get_intervals()).toMatchObject([
            {start: Number.MIN_SAFE_INTEGER, end: -100},
            {start: 0, end: 2},
            {start: 5, end: 10},
            {start: 15, end: Number.MAX_SAFE_INTEGER},
        ])
    })

    test('double-operation', () => {
        const set = new IntegerIntervalsSet()
        set.add(new IntegerInterval(-100, 0))
        set.add(new IntegerInterval(2, 5))
        set.add(new IntegerInterval(10, 15))
        const negation = IntegerIntervalsSet.calculate_negation(IntegerIntervalsSet.calculate_negation(set))
        expect(negation.get_intervals()).toMatchObject([
            {start: -100, end: 0},
            {start: 2, end: 5},
            {start: 10, end: 15}
        ])
    })
})
