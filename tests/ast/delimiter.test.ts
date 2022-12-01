import { Point, Location } from '@dist/source/location'
import { RegularExpression } from '@dist/regular-expression'
import { StringReader } from '@dist/reader'
import { Context } from '@dist/regex/context'
import { State } from '@dist/regex/state'
import { Delimiter } from '@dist/ast/delimiter'

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
