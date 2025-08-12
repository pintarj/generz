import { Point, Location } from '@dist/source/location.js'
import { RegularExpression } from '@dist/regular-expression.js'
import { StringReader } from '@dist/reader.js'
import { Context } from '@dist/regex/context.js'
import { State } from '@dist/regex/state.js'
import { Delimiter } from '@dist/ast/delimiter.js'

function f(regex: string, options?: {context?: Context}): State {
    return (new RegularExpression(new StringReader(regex), options)).generate()
}

const location = new Location(new Point(2, 4), new Point(3, 3))

test('simple', () => {
    const node = new Delimiter(location, f('\\s+'))
    expect(node.name).toEqual('delimiter')
    expect(node.location).toEqual(location)
    expect(node.regex.match(' \n')).toBe(' \n')
})
