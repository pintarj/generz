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

function loc(start_line: number, start_column: number, end_line: number, end_column: number): Location {
    return new Location(
        new Point(start_line, start_column),
        new Point(end_line, end_column)
    );
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
});

test('complex', () => {
    const source = dedent`
        variable Statement {
            epsilon
            production minus Expression
            production not Expression
        }

        variable X {}
    `;
    const ast = parse_from_source(source);
    expect(ast).toEqual(new Source(loc(1, 1, 7, 14), [
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
        new Variable(loc(7, 1, 7, 13), "X", [])
    ]));
});
