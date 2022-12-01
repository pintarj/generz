import { SymbolType, parse } from '@dist/lexical-analysis'
import { SourceReader } from '@dist/source/source-reader'
import { StringReader } from '@dist/reader'
import { Location, Point } from '@dist/source/location'

test('parse-empty', () => {
    const source = ``
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.EOF,
        location: new Point(1, 1),
        lexeme: ''
    }])
})

test('parse-newline', () => {
    const source = `\n`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.EOF,
        location: new Point(2, 1),
        lexeme: ''
    }])
})

describe('parse-identifier', () => {
    test('single-char', () => {
        const source = `x`
        const result = parse(new SourceReader(new StringReader(source)))
        expect(result).toStrictEqual([{
            type: SymbolType.IDENTIFIER,
            location: new Point(1, 1),
            lexeme: 'x'
        }, {
            type: SymbolType.EOF,
            location: new Point(1, 2),
            lexeme: ''
        }])
    })

    test('multi-char', () => {
        const source = `gamma`
        const result = parse(new SourceReader(new StringReader(source)))
        expect(result).toStrictEqual([{
            type: SymbolType.IDENTIFIER,
            location: new Location(new Point(1, 1), new Point(1, 5)),
            lexeme: 'gamma'
        }, {
            type: SymbolType.EOF,
            location: new Point(1, 6),
            lexeme: ''
        }])
    })
})

test('parse-regex', () => {
    const source = ` /hello+\\/yes/ `
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.REGEX,
        location: new Location(new Point(1, 2), new Point(1, 14)),
        lexeme: '/hello+\\/yes/'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 16),
        lexeme: ''
    }])
})

test('parse-delimiter', () => {
    const source = `delimiter`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.DELIMITER,
        location: new Location(new Point(1, 1), new Point(1, 9)),
        lexeme: 'delimiter'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 10),
        lexeme: ''
    }])
})

test('parse-terminal', () => {
    const source = `terminal`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.TERMINAL,
        location: new Location(new Point(1, 1), new Point(1, 8)),
        lexeme: 'terminal'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 9),
        lexeme: ''
    }])
})

test('parse-variable', () => {
    const source = `variable`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.VARIABLE,
        location: new Location(new Point(1, 1), new Point(1, 8)),
        lexeme: 'variable'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 9),
        lexeme: ''
    }])
})

test('parse-production', () => {
    const source = `production`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.PRODUCTION,
        location: new Location(new Point(1, 1), new Point(1, 10)),
        lexeme: 'production'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 11),
        lexeme: ''
    }])
})

test('parse-epsilon', () => {
    const source = `epsilon`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.EPSILON,
        location: new Location(new Point(1, 1), new Point(1, 7)),
        lexeme: 'epsilon'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 8),
        lexeme: ''
    }])
})

test('parse-brace-left', () => {
    const source = `{`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.BRACES_LEFT,
        location: new Point(1, 1),
        lexeme: '{'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 2),
        lexeme: ''
    }])
})

test('parse-brace-right', () => {
    const source = `}`
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.BRACES_RIGHT,
        location: new Point(1, 1),
        lexeme: '}'
    }, {
        type: SymbolType.EOF,
        location: new Point(1, 2),
        lexeme: ''
    }])
})

test('skip-whitespaces', () => {
    const source = ` { } \n } \n\n `
    const result = parse(new SourceReader(new StringReader(source)))
    expect(result).toStrictEqual([{
        type: SymbolType.BRACES_LEFT,
        location: new Point(1, 2),
        lexeme: '{'
    }, {
        type: SymbolType.BRACES_RIGHT,
        location: new Point(1, 4),
        lexeme: '}'
    }, {
        type: SymbolType.BRACES_RIGHT,
        location: new Point(2, 2),
        lexeme: '}'
    }, {
        type: SymbolType.EOF,
        location: new Point(4, 2),
        lexeme: ''
    }])
})
