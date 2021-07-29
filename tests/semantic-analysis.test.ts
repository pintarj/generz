import { StringReader } from '@dist/reader'
import { SourceReader } from '@dist/source/source-reader'
import { parse as lexical_parse } from '@dist/lexical-analysis'
import { parse as syntax_parse } from '@dist/syntax-analysis'
import { analyze as semantic_analyze } from '@dist/semantic-analysis'
import dedent from 'dedent'

function analyze(source: string): void {
    const file = 'fake.erz'
    semantic_analyze(file, syntax_parse(file, lexical_parse(new SourceReader(new StringReader(source)))))
}

test('upper-case-terminal', () => {
    const source = 'terminal X'
    expect(() => analyze(source)).toThrow('Declared terminal `X` have to start with a lower-case letter.')
})

test('duplicate-terminal-name', () => {
    const source = dedent`
        terminal hello
        terminal hello /moto/
    `

    expect(() => analyze(source)).toThrow('Duplicate terminal name `hello` detected. Firstly used at 1:1-1:14.')
})

test('lower-case-variable', () => {
    const source = 'variable x {}'
    expect(() => analyze(source)).toThrow('Declared variable `x` have to start with an upper-case letter.')
})

test('duplicate-variable-name', () => {
    const source = dedent`
        variable World {}
        variable World {epsilon}
    `

    expect(() => analyze(source)).toThrow('Duplicate variable name `World` detected. Firstly used at 1:1-1:17.')
})
