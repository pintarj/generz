import { StringReader } from '@dist/reader'
import { SourceReader } from '@dist/source/source-reader'
import { parse as lexical_parse } from '@dist/lexical-analysis'
import { parse as syntax_parse } from '@dist/syntax-analysis'
import { analyze as semantic_analyze } from '@dist/semantic-analysis'
import dedent from 'dedent'
import { Context } from '@dist/regex/context'

function analyze(source: string): void {
    const file = 'fake.erz'
    semantic_analyze(file, syntax_parse(new Context(), file, lexical_parse(new SourceReader(new StringReader(source)))))
}

test('duplicate-delimiter', () => {
    const source = dedent`
        delimiter /a/
        delimiter /b/
    `

    expect(() => analyze(source)).toThrow('Duplicate delimiter declaration detected.')
})

test('upper-case-terminal', () => {
    const source = 'terminal X'
    expect(() => analyze(source)).toThrow('Declared terminal `X` have to start with a lower-case letter.')
})

test('duplicate-terminal-name', () => {
    const source = dedent`
        terminal hello
        terminal hello /moto/
    `

    expect(() => analyze(source)).toThrow('Duplicate terminal `hello` declaration detected.')
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

    expect(() => analyze(source)).toThrow('Duplicate variable `World` declaration detected.')
})

test('no-variables', () => {
    const source = ''

    expect(() => analyze(source)).toThrow('No variables declared. At least one required.')
})

describe('variable-with-no-productions', () => {
    test('simple', () => {
        const source = 'variable X {}'
        expect(() => analyze(source)).toThrow('Variable \`X\` has no productions. At least one required.')
    })

    test('but-epsilon', () => {
        const source = 'variable X {epsilon}'
        expect(() => analyze(source)).toThrow('Variable \`X\` has no productions. At least one required.')
    })
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

describe('ambiguous-variable', () => {
    test('simple', () => {
        const source = dedent`
            terminal a

            variable X {
                production a
                production a
            }
        `
        expect(() => analyze(source)).toThrow('Variable `X` is ambiguous, terminal `a` leads to multiple productions.')
    })

    describe('epsilon', () => {
        test('one', () => {
            const source = dedent`
                terminal a
                terminal b
                
                variable Y {
                    production b
                    epsilon
                }
                
                variable X {
                    production Y a
                    production a
                }
            `
            expect(() => analyze(source)).toThrow('Variable `X` is ambiguous, terminal `a` leads to multiple productions.')
        })
    
        test('two', () => {
            const source = dedent`
                terminal a
                terminal b
                terminal c
                
                variable Y {
                    production b
                    epsilon
                }
                
                variable Z {
                    production c
                    epsilon
                }
                
                variable X {
                    production Y Z a
                    production a
                }
            `
            expect(() => analyze(source)).toThrow('Variable `X` is ambiguous, terminal `a` leads to multiple productions.')
        })
    
        test('ambiguous', () => {
            const source = dedent`
                terminal a
                
                variable Y {
                    production a
                    epsilon
                }
                
                variable X {
                    production Y a
                }
            `
            expect(() => analyze(source)).toThrow('Variable `X` is ambiguous, terminal `a` leads to multiple productions.')
        })
    })

    describe('transitive', () => {
        test('terminal', () => {
            const source = dedent`
                terminal a
                
                variable Y {
                    production a
                }
                
                variable X {
                    production Y
                    production a
                }
            `
            expect(() => analyze(source)).toThrow('Variable `X` is ambiguous, terminal `a` leads to multiple productions.')
        })
    
        test('variable', () => {
            const source = dedent`
                terminal a
    
                variable Z {
                    production Y
                }
                
                variable Y {
                    production a
                    production a
                }
            `
            expect(() => analyze(source)).toThrow('Variable `Z` is ambiguous, terminal `a` leads to multiple productions.')
        })
    
        test('same-variable', () => {
            const source = dedent`
                terminal a
    
                variable Y {
                    production a
                }
                
                variable X {
                    production Y
                    production Y
                }
            `
            expect(() => analyze(source)).toThrow('Variable `X` is ambiguous, terminal `a` leads to multiple productions.')
        })
    })
})
