import { parse } from '../src/syntax-analysis'
import { parse as lexical_parse } from '../src/lexical-analysis'
import { SourceReader } from '@dist/source/source-reader'
import { StringReader } from '@dist/reader'
import { Source } from '@dist/ast/source'
import { Location, Point } from '@dist/source/location'
import { Variable } from '@dist/ast/variable'
import { Production } from '@dist/ast/production'
import { TerminalUsage } from '@dist/ast/terminal-usage'
import { VariableUsage } from '@dist/ast/variable-usage'
import dedent from 'dedent'
import { Terminal } from '@dist/ast/terminal'
import { State } from '@dist/regex/state'
import { Transition } from '@dist/regex/transition'
import { SingleSymbol } from '@dist/regex/single-symbol'
import { Context } from '@dist/regex/context'
import { Delimiter } from '@dist/ast/delimiter'

function loc(start_line: number, start_column: number, end_line: number, end_column: number): Location {
    return new Location(
        new Point(start_line, start_column),
        new Point(end_line, end_column)
    )
}

function set_id_of_states_in_regex_to_0(regex: State): State {
    (regex as any).id = 0
    regex.get_transitively_reachable_states().forEach(state => (state as any).id = 0)
    return regex
}

function parse_from_source(source: string): Source {
    return parse(new Context(), 'fake.erz', lexical_parse(new SourceReader(new StringReader(source))))
}

test('empty', () => {
    const source = ``
    const ast = parse_from_source(source)
    expect(ast).toEqual(new Source(loc(1, 1, 1, 1), []))
})

test('invalid-end', () => {
    const source = `id`
    expect(() => parse_from_source(source)).toThrowError("expected token `EOF`, but found `IDENTIFIER`")
})

describe('delimiters', () => {
    test('single', () => {
        const source = `delimiter /a/`
        const ast = parse_from_source(source)

        expect(ast.location).toEqual(loc(1, 1, 1, 14))
        expect(ast.declarations).toHaveLength(1)
        expect(ast.declarations[0].location).toEqual(loc(1, 1, 1, 13))
        expect((ast.declarations[0] as Delimiter).regex.match('aa')).toEqual('a')
    })

    test('multi', () => {
        const source = `delimiter /a/ delimiter /bb/`
        const ast = parse_from_source(source)

        expect(ast.location).toEqual(loc(1, 1, 1, 29))
        expect(ast.declarations).toHaveLength(2)
        expect(ast.declarations[0].location).toEqual(loc(1, 1, 1, 13))
        expect((ast.declarations[0] as Delimiter).regex.match('aa')).toEqual('a')
        expect(ast.declarations[1].location).toEqual(loc(1, 15, 1, 28))
        expect((ast.declarations[1] as Delimiter).regex.match('bb')).toEqual('bb')
    })
})

describe('terminals', () => {
    describe('single', () => {
        test('empty', () => {
            const source = `terminal any //`
            const ast = parse_from_source(source)

            expect(ast).toEqual(new Source(loc(1, 1, 1, 16), [
                new Terminal(loc(1, 1, 1, 15), 'any', new State(0, {is_final: true}))
            ]))
        })

        test('no-regex', () => {
            const source = `terminal if`
            const ast = parse_from_source(source)
            const declarations = (ast as Source)?.declarations

            declarations
                .filter((x): x is Terminal => x.is_terminal())
                .forEach(x => set_id_of_states_in_regex_to_0(x.regex))

            expect(ast).toEqual(new Source(loc(1, 1, 1, 12), [
                new Terminal(loc(1, 1, 1, 11), 'if', Object.assign(new State(0), {
                    transitions: [
                        new Transition(new SingleSymbol('i'.codePointAt(0)!), Object.assign(new State(0), {
                            transitions: [
                                new Transition(new SingleSymbol('f'.codePointAt(0)!), new State(0, {is_final: true}))
                            ]
                        }))
                    ]
                }))
            ]))
        })

        test('symbol', () => {
            const source = `terminal var /x/`
            const ast = parse_from_source(source)
            const declarations = (ast as Source)?.declarations

            declarations
                .filter((x): x is Terminal => x.is_terminal())
                .forEach(x => set_id_of_states_in_regex_to_0(x.regex))

            expect(ast).toEqual(new Source(loc(1, 1, 1, 17), [
                new Terminal(loc(1, 1, 1, 16), 'var', Object.assign(new State(0), {
                    transitions: [
                        new Transition(new SingleSymbol('x'.codePointAt(0)!), new State(0, {is_final: true}))
                    ]
                }))
            ]))
        })
    })
})

test('complex', () => {
    const source = dedent`
        variable Statement {
            epsilon
            production minus Expression
            production not Expression
        }

        variable X {}

        terminal minus /m/
        terminal x
        delimiter /o/
    `
    const ast = parse_from_source(source)
    const declarations = (ast as Source)?.declarations

    declarations
        .filter((x): x is Terminal|Delimiter => x.is_terminal() || x.is_delimiter())
        .forEach(x => set_id_of_states_in_regex_to_0(x.regex))

    expect(ast).toEqual(new Source(loc(1, 1, 11, 14), [
        new Variable(loc(1, 1, 5, 1), "Statement", [
            Production.create_epsilon(loc(2, 5, 2, 11)),
            new Production(loc(3, 5, 3, 31), [
                new TerminalUsage(loc(3, 16, 3, 20), 'minus'),
                new VariableUsage(loc(3, 22, 3, 31), 'Expression')
            ]),
            new Production(loc(4, 5, 4, 29), [
                new TerminalUsage(loc(4, 16, 4, 18), 'not'),
                new VariableUsage(loc(4, 20, 4, 29), 'Expression')
            ])
        ]),
        new Variable(loc(7, 1, 7, 13), 'X', []),
        new Terminal(loc(9, 1, 9, 18), 'minus', Object.assign(new State(0), {
            transitions: [
                new Transition(new SingleSymbol('m'.codePointAt(0)!), new State(0, {is_final: true}))
            ]
        })),
        new Terminal(loc(10, 1, 10, 10), 'x', Object.assign(new State(0), {
            transitions: [
                new Transition(new SingleSymbol('x'.codePointAt(0)!), new State(0, {is_final: true}))
            ]
        })),
        new Delimiter(loc(11, 1, 11, 13), Object.assign(new State(0), {
            transitions: [
                new Transition(new SingleSymbol('o'.codePointAt(0)!), new State(0, {is_final: true}))
            ]
        }))
    ]))
})
