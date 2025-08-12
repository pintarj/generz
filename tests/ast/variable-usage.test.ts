import { Point, Location } from '@dist/source/location.js'
import { VariableUsage } from '@dist/ast/variable-usage.js'
import { ProductionNodeType } from '@dist/ast/production-node.js'
import { Variable } from '@dist/ast/variable.js'

const location = new Location(new Point(2, 4), new Point(3, 3))

test('simple', () => {
    const node = new VariableUsage(location, 'X')
    expect(node.name).toEqual('X')
    expect(node.type).toEqual(ProductionNodeType.VARIABLE_USAGE)
    expect(node.location).toEqual(location)
})


describe('reference', () => {
    test('default-undefined', () => {
        const node = new VariableUsage(location, 'Exp')
        expect(() => node.reference).toThrow('Trying to get a reference to the variable `Exp` that was not set yet.')
    })

    test('set', () => {
        const node = new VariableUsage(location, 'Exp')
        const variable = new Variable(location, 'Exp', [])
        node.reference = variable
        expect(() => node.reference).not.toThrow()
        expect(node.reference).toEqual(variable)
    })
})

