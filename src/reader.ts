
export interface Reader {
    read(): string
}

export class StringReader implements Reader {
    private index: number

    constructor(private source: string) {
        this.index = 0
    }

    public read(): string {
        if (this.index == this.source.length)
            return ''

        var value = this.source[this.index]
        this.index += 1
        return value
    }
}

