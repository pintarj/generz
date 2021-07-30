import { parse } from '../src/syntax-analysis';
import { parse as lexical_parse } from '../src/lexical-analysis';
import { SourceReader } from '@dist/source/source-reader';
import { StringReader } from '@dist/reader';
import { Source } from '@dist/ast/source';
import { Location, Point } from '@dist/source/location';
import { Variable } from '@dist/ast/variable';
import { Production } from '@dist/ast/production';
import { TerminalUsage } from '@dist/ast/terminal-usage';
import { VariableUsage } from '@dist/ast/variable-usage';
import dedent from 'dedent';
import { Terminal } from '@dist/ast/terminal'
import { State } from '@dist/regex/state'
import { Transition } from '@dist/regex/transition'
import { SingleSymbol } from '@dist/regex/single-symbol'

function loc(start_line: number, start_column: number, end_line: number, end_column: number): Location {
    return new Location(
        new Point(start_line, start_column),
        new Point(end_line, end_column)
    );
}

function set_id_of_states_in_regex_to_0(regex: State): State {
    (regex as any).id = 0;
    regex.get_transitively_reachable_states().forEach(state => (state as any).id = 0);
    return regex
}

function parse_from_source(source: string): Source {
    return parse('fake.erz', lexical_parse(new SourceReader(new StringReader(source))));
}

test('empty', () => {
    const source = ``;
    const ast = parse_from_source(source);
    expect(ast).toEqual(new Source(loc(1, 1, 1, 1), []));
});

test('invalid-end', () => {
    const source = `id`;
    expect(() => parse_from_source(source)).toThrowError("expected token `EOF`, but found `IDENTIFIER`");
});

describe('variables', () => {
    describe('single', () => {
        test('empty', () => {
            const source = `variable X {}`;
            const ast = parse_from_source(source);
    
            expect(ast).toEqual(new Source(loc(1, 1, 1, 14), [
                new Variable(loc(1, 1, 1, 13), 'X', [])
            ]));
        });

        test('epsilon', () => {
            const source = `variable X {epsilon}`;
            const ast = parse_from_source(source);
    
            expect(ast).toEqual(new Source(loc(1, 1, 1, 21), [
                new Variable(loc(1, 1, 1, 20), 'X', [
                    Production.create_epsilon(loc(1, 1, 1, 1))
                ])
            ]));
        });
    });

    describe('multiple', () => {
        test('empty', () => {
            const source = `variable X {} variable X {}\nvariable Y {}`;
            const ast = parse_from_source(source);
    
            expect(ast).toEqual(new Source(loc(1, 1, 2, 14), [
                new Variable(loc(1, 1, 1, 13), 'X', []),
                new Variable(loc(1, 15, 1, 27), 'X', []),
                new Variable(loc(2, 1, 2, 13), 'Y', [])
            ]));
        });
    });

    describe('productions', () => {
        test('empty', () => {
            const source = `variable X { production }`
            expect(() => parse_from_source(source)).toThrow('Expected at least one `PRODUCTION_NODE`, but zero found.')
        })
    })
});

describe('terminals', () => {
    describe('single', () => {
        test('empty', () => {
            const source = `terminal any //`;
            const ast = parse_from_source(source);

            expect(ast).toEqual(new Source(loc(1, 1, 1, 16), [
                new Terminal(loc(1, 1, 1, 15), 'any', new State(0, {is_final: true}))
            ]));
        });

        test('no-regex', () => {
            const source = `terminal if`;
            const ast = parse_from_source(source);

            (ast as Source)?.declarations
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
            ]));
        });

        test('symbol', () => {
            const source = `terminal var /x/`;
            const ast = parse_from_source(source);

            (ast as Source)?.declarations
                .filter((x): x is Terminal => x.is_terminal())
                .forEach(x => set_id_of_states_in_regex_to_0(x.regex))

            expect(ast).toEqual(new Source(loc(1, 1, 1, 17), [
                new Terminal(loc(1, 1, 1, 16), 'var', Object.assign(new State(0), {
                    transitions: [
                        new Transition(new SingleSymbol('x'.codePointAt(0)!), new State(0, {is_final: true}))
                    ]
                }))
            ]));
        });
    });
});

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
    `;
    const ast = parse_from_source(source);

    (ast as Source)?.declarations
        .filter((x): x is Terminal => x.is_terminal())
        .forEach(x => set_id_of_states_in_regex_to_0(x.regex))

    expect(ast).toEqual(new Source(loc(1, 1, 10, 11), [
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
        }))
    ]));
});
