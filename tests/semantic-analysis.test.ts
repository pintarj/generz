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

test('undeclared-terminal', () => {
    const source = dedent`
        variable X {
            production x
        }
    `

    expect(() => analyze(source)).toThrow('Using undeclared terminal `x`.')
})

test('undeclared-variable', () => {
    const source = dedent`
        variable X {
            production Y
        }
    `

    expect(() => analyze(source)).toThrow('Using undeclared variable `Y`.')
})

describe('left-recursion-loop', () => {
    test('self', () => {
        const source = dedent`
            variable X {
                production X
            }
        `
        expect(() => analyze(source)).toThrow('Left-recursion loop detected: X→X')
    })

    describe('transitive', () => {
        test('self', () => {
            const source = dedent`
                variable X {
                    production Y
                }
                variable Y {
                    production Y
                }
            `
            expect(() => analyze(source)).toThrow('Left-recursion loop detected: Y→Y')
        })

        test('two', () => {
            const source = dedent`
                variable X {
                    production Y
                }
                variable Y {
                    production X
                }
            `
            expect(() => analyze(source)).toThrow('Left-recursion loop detected: X→Y→X')
        })
    
        test('three', () => {
            const source = dedent`
                variable X {
                    production Y
                }
                variable Y {
                    production Z
                }
                variable Z {
                    production X
                }
            `
            expect(() => analyze(source)).toThrow('Left-recursion loop detected: X→Y→Z→X')
        })
    })

    describe('epsilon', () => {
        test('self-single', () => {
            const source = dedent`
                terminal a
                variable X {
                    production Y X
                }
                variable Y {
                    production a
                    epsilon
                }
            `
            expect(() => analyze(source)).toThrow('Left-recursion loop detected: X→X')
        })

        test('self-double', () => {
            const source = dedent`
                terminal a
                terminal b
                variable X {
                    production A B X
                }
                variable A {
                    production a
                    epsilon
                }
                variable B {
                    production b
                    epsilon
                }
            `
            expect(() => analyze(source)).toThrow('Left-recursion loop detected: X→X')
        })
    })

    describe('complex', () => {
        test('0', () => {
            const source = dedent`
                terminal a
                terminal b
                terminal c
                variable X {
                    production a X b
                    production Y X
                    epsilon
                }
                variable Y {
                    production b
                    production Z Y
                }
                variable Z {
                    production a b Z
                    production X b b Y
                }
            `
            expect(() => analyze(source)).toThrow('Left-recursion loop detected: X→Y→Z→X')
        })
    })
})