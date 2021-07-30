import * as fs from 'fs-extra'
import Args from './args'
import { SourceReader } from './source/source-reader'
import { StringReader } from './reader'
import { parse as lexical_analysis } from './lexical-analysis'
import { parse as syntax_analysis } from './syntax-analysis'
import { analyze as semantic_analysis } from './semantic-analysis'

export default class Pipeline {
    public constructor(readonly args: Args) {

    }

    public run() {
        const source = fs.readFileSync(this.args.file, 'utf8')
        const reader = new SourceReader(new StringReader(source), {file: this.args.file})
        const symbols = lexical_analysis(reader)
        const ast = syntax_analysis(this.args.file, symbols)
        semantic_analysis(this.args.file, ast)
    }
}

