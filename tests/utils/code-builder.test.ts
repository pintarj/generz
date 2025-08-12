import { CodeBuilder } from '@dist/utils/code-builder.js'
import dedent from 'dedent'

test('empty', () => {
    const builder = new CodeBuilder()
    expect(builder.to_string()).toBe('')
})

test('print', () => {
    const builder = new CodeBuilder()
    builder.print('titan')
    expect(builder.to_string()).toBe('titan')
})

test('print2x', () => {
    const builder = new CodeBuilder()
    builder.print('lightning')
    builder.print(' bolt')
    expect(builder.to_string()).toBe('lightning bolt')
})

test('println', () => {
    const builder = new CodeBuilder()
    builder.println('wolf')
    expect(builder.to_string()).toBe('wolf\n')
})

test('newline', () => {
    const builder = new CodeBuilder()
    builder
        .print('1')
        .newline()
        .newline()
    expect(builder.to_string()).toBe('1\n\n')
})

describe('indentations', () => {
    describe('indent', () => {
        test('default-indentation', () => {
            const builder = new CodeBuilder()
            builder.indent().print('x')
            expect(builder.to_string()).toBe('    x')
        })

        test('single-line', () => {
            const builder = new CodeBuilder({indentation_count: 2})
            builder.indent().print('x')
            expect(builder.to_string()).toBe('  x')
        })

        test('multi-line', () => {
            const builder = new CodeBuilder({indentation_count: 4})
            builder
                .println('e')
                .indent()
                .println('d')
                .indent()
                .println('c')
                .unindent()
                .println('b')
                .unindent()
                .print('a')

            expect(builder.to_string()).toBe(dedent`
                e
                    d
                        c
                    b
                a
            `)
        })
    })

    describe('unindent', () => {
        test('back', () => {
            const builder = new CodeBuilder({indentation_count: 2})
            builder.indent().indent().unindent().print('x')
            expect(builder.to_string()).toBe('  x')
        })

        test('negative', () => {
            const builder = new CodeBuilder({indentation_count: 2})
            expect(() => builder.unindent()).toThrowError('can\'t decrease the indentation that is already 0')
        })
    })

    test('wrap', () => {
        const builder = new CodeBuilder({indentation_count: 4})
        builder
            .println('mega {')
            .wrap_indentation(builder => {
                builder
                    .println('poke {')
                    .wrap_indentation(() => {
                        builder.println('ball')
                    })
                    .println('}')
            })
            .print('}')
        expect(builder.to_string()).toBe(dedent`
            mega {
                poke {
                    ball
                }
            }
        `)
    })
})

describe('empty-lines', () => {
    describe('put', () => {
        test('zero', () => {
            const builder = new CodeBuilder()
            builder
                .println('a')
                .newline()
                .ensure_empty_line()
                .print('b')
                
            expect(builder.to_string()).toBe('a\n\nb')
        })

        test('one', () => {
            const builder = new CodeBuilder()
            builder
                .println('a')
                .ensure_empty_line()
                .print('b')
                
            expect(builder.to_string()).toBe('a\n\nb')
        })

        test('two', () => {
            const builder = new CodeBuilder()
            builder
                .print('a')
                .ensure_empty_line()
                .print('b')
                
            expect(builder.to_string()).toBe('a\n\nb')
        })

        test('negative', () => {
            const builder = new CodeBuilder()
            builder
                .println('a')
                .newline()
                .newline()
                .ensure_empty_line()
                .print('b')
                
            expect(builder.to_string()).toBe('a\n\n\nb')
        })
    })
})
