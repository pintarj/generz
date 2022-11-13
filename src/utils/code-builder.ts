
export class CodeBuilder {
    private fragments: string[]
    private readonly single_indentation: string
    private indentation_level: number
    private should_print_indentation: boolean

    public constructor(
        options?: {
            indentation_count?: number
        }
    ) {
        this.fragments = []
        this.single_indentation = ' '.repeat(options?.indentation_count || 4)
        this.indentation_level = 0
        this.should_print_indentation = true
    }

    public indent(): CodeBuilder {
        this.indentation_level += 1
        return this
    }

    public unindent(): CodeBuilder {
        if (this.indentation_level === 0)
            throw new Error('can\'t decrease the indentation that is already 0')

        this.indentation_level -= 1
        return this
    }

    public wrap_indentation(callback: (builder: CodeBuilder) => void): CodeBuilder {
        try {
            this.indent()
            callback(this)
        } finally {
            this.unindent()
        }

        return this
    }

    public print(line: string): CodeBuilder {
        if (this.should_print_indentation) {
            this.fragments.push(this.single_indentation.repeat(this.indentation_level))
            this.should_print_indentation = false
        }

        this.fragments.push(line)

        return this
    }

    public println(line: string): CodeBuilder {
        return this.print(line).newline()
    }

    public newline(): CodeBuilder {
        this.fragments.push('\n')
        this.should_print_indentation = true
        return this
    }

    public ensure_empty_line(): CodeBuilder {
        const match = this.to_string().match(/\n*$/)?.[0] || ''
        const missing = Math.max(2 - match.length, 0)

        for (let i = 0; i < missing; i += 1)
            this.newline()

        return this
    }

    public to_string(): string {
        const reduced = this.fragments.join('')
        this.fragments = [reduced]
        return reduced
    }
}
