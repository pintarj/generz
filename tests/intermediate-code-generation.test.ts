import { parse as lexical_analysis } from '@dist/lexical-analysis.js'
import { parse as syntax_analysis } from '@dist/syntax-analysis.js'
import { analyze as semantic_analysis } from '@dist/semantic-analysis.js'
import { SourceReader } from '@dist/source/source-reader.js'
import { StringReader } from '@dist/reader.js'
import { Context } from '@dist/regex/context.js'
import { generate as ic_generate} from '@dist/intermediate-code-generation.js'
import { Declaration } from '@dist/ic/declaration.js'
import dedent from 'dedent'
import { IcExecutionMachine } from '@dist/ic-execution-machine.js'
import { FunctionCall } from '@dist/ic/function-call.js'

class ParserState {
    private readonly iterator: Iterator<number>
    private buffer: number[]
    private cursor_index: number
    private marked_length: number

    public constructor(source: Iterable<number>) {
        this.iterator = source[Symbol.iterator]()
        this.buffer = []
        this.cursor_index = -1
        this.marked_length = -1
    }

    public current(): number {
        if (this.cursor_index === -1)
            throw new Error('trying to read from uninitialized parser')

        if (this.buffer.length === this.cursor_index) {
            const result = this.iterator.next()
            this.buffer.push(result.done ? 0 : result.value)
        }

        return this.buffer[this.cursor_index]
    }

    public mark(offset?: number): void {
        this.marked_length = this.cursor_index + 1 + (offset || 0)
    }

    public next(): number {
        this.advance()
        return this.current()
    }

    public advance(): void {
        this.cursor_index += 1
    }

    public reset(): void {
        if (this.marked_length !== -1)
            this.buffer = this.buffer.slice(this.marked_length)

        this.cursor_index = -1
        this.marked_length = -1
    }

    public read(): string {
        return this.buffer.slice(0, this.cursor_index + 1).map(x => String.fromCharCode(x)).join('')
    }
}

class VirtualParser {
    private readonly ic_machine: IcExecutionMachine
    private state: ParserState|undefined

    public constructor(declarations: Declaration[]) {
        this.state = undefined
        this.ic_machine = new IcExecutionMachine()

        for (const declaration of declarations) {
            this.ic_machine.execute(declaration.to_statement())
        }
    
        this.ic_machine.global_scope.declare_function('current', () => this.state?.current())
        this.ic_machine.global_scope.declare_function('mark', offset => this.state?.mark(offset))
        this.ic_machine.global_scope.declare_function('next', () => this.state?.next())
        this.ic_machine.global_scope.declare_function('advance', () => this.state?.advance())
        this.ic_machine.global_scope.declare_function('reset', () => this.state?.reset())
        this.ic_machine.global_scope.declare_function('read', () => this.state?.read())

        this.ic_machine.global_scope.declare_function('throw_error', (...args) => {
            let index = 1
            throw new Error((args[0] as string).replaceAll('{}', () => args[index++]))
        })
    }

    public parse(input: string): void {
        this.state = new ParserState(Array.from(input).map(x => x.charCodeAt(0)))
        this.ic_machine.execute((new FunctionCall('root')).to_statement())
        this.state = undefined
    }
}

function f(source: string): Declaration[] {
    const file = 'fake.erz'
    const context = new Context()
    const ast = syntax_analysis(context, file, lexical_analysis(new SourceReader(new StringReader(source), {file})))
    semantic_analysis(file, ast)
    return ic_generate(context, ast)
}

describe('a', () => {
    let parser: VirtualParser|undefined

    beforeAll(() => {
        parser = new VirtualParser(f(dedent`
            terminal a /a/
    
            variable A {
                production a
            }
        `))
    })

    test('empty', async () => {
        expect(() => parser!.parse('')).toThrowError(/expected.+terminal.+but found/)
    })

    test('a', async () => {
        expect(() => parser!.parse('a')).not.toThrow()
    })

    test('wrong', async () => {
        expect(() => parser!.parse('1111')).toThrowError(/expected.+terminal.+but found/)
    })
})

describe('ab', () => {
    let parser: VirtualParser|undefined

    beforeAll(() => {
        parser = new VirtualParser(f(dedent`
            terminal a /a/
            terminal b /b/
            
            variable X0 {
                production a b
                production b a
            }

            variable X {
                production X0
            }
        `))
    })

    test('empty', async () => {
        expect(() => parser!.parse('')).toThrow()
    })

    test('ab', async () => {
        expect(() => parser!.parse('ab')).not.toThrow()
    })

    test('ba', async () => {
        expect(() => parser!.parse('ba')).not.toThrow()
    })

    test('wrong', async () => {
        expect(() => parser!.parse('1111')).toThrow(/expected.+but.+found/)
    })
})

describe('binary', () => {
    let parser: VirtualParser|undefined

    beforeAll(() => {
        parser = new VirtualParser(f(dedent`
            delimiter /\s+/
            terminal zero /0/
            terminal one /1/
    
            variable XExt {
                production zero XExt
                production one XExt
                epsilon
            }
    
            variable X {
                production zero XExt
                production one XExt
            }
        `))
    })

    test('empty', async () => {
        expect(() => parser!.parse('')).toThrowError(/expected.+terminal.+but found/)
    })

    test('just-zeros', async () => {
        expect(() => parser!.parse('0000')).not.toThrow()
    })

    test('just-ones', async () => {
        expect(() => parser!.parse('1111')).not.toThrow()
    })

    test('mixed', async () => {
        expect(() => parser!.parse('0010101110101')).not.toThrow()
    })

    test('whitespaces', async () => {
        expect(() => parser!.parse('00101\n01\r110\t10 1')).not.toThrow()
    })

    test('wrong', async () => {
        expect(() => parser!.parse('2')).toThrowError(/expected.+terminal.+but found/)
    })
})

describe('numexp', () => {
    let parser: VirtualParser|undefined

    beforeAll(() => {
        parser = new VirtualParser(f(dedent`
            delimiter /\s+/
            terminal number /[0-9]+/
            terminal plus /\+/
            terminal minus /\-/

            variable XExt {
                production plus number XExt
                production minus number XExt
                epsilon
            }

            variable X {
                production number XExt
            }
        `))
    })

    const good_ones = [
        '4 + 2',
        '1-2',
        '11',
        '123 + 19 - 1',
        ' 1+2'
    ]

    for (const query of good_ones) {
        test(query.replaceAll(' ', ''), async () => {
            expect(() => parser!.parse(query)).not.toThrow()
        })
    }

    test('5+-1', async () => {
        expect(() => parser!.parse('5 + -1')).toThrowError(/expected.+terminal.+number.+but found.+\-/)
    })

    test('5+xyz', async () => {
        expect(() => parser!.parse('5 + xyz')).toThrowError(/expected.+terminal.+number.+but found.+x/)
    })
})
