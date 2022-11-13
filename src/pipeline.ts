import fs from 'fs'
import Args from './args'
import { SourceReader } from './source/source-reader'
import { StringReader } from './reader'
import { Context } from './regex/context'
import { parse as lexical_analysis } from './lexical-analysis'
import { parse as syntax_analysis } from './syntax-analysis'
import { analyze as semantic_analysis } from './semantic-analysis'
import { generate as generate_intermediate_code } from './intermediate-code-generation'
import { generate as generate_output, OutputGeneratorInterface } from './output-generation'

export default class Pipeline {
    public constructor(readonly args: Args) {

    }

    private prepare_output_generator(args: Args): OutputGeneratorInterface {
        const ext = args.output_path.split('.').pop()?.toLowerCase()

        switch (ext) {
            default:
                throw new Error(`don't know how to format a \`${ext}\` file`)
        }
    }

    public run() {
        const output_generator = this.prepare_output_generator(this.args)
        const source = fs.readFileSync(this.args.file, 'utf8')
        const reader = new SourceReader(new StringReader(source), {file: this.args.file})
        const symbols = lexical_analysis(reader)
        const regex_context = new Context()
        const ast = syntax_analysis(regex_context, this.args.file, symbols)
        semantic_analysis(this.args.file, ast)
        const declarations = generate_intermediate_code(regex_context, ast)
        const output = generate_output(output_generator, declarations)
        fs.writeFileSync(this.args.output_path, output, 'utf8')
    }
}
