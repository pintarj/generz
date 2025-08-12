import fs from 'fs'
import Args from './args.js'
import { SourceReader } from './source/source-reader.js'
import { StringReader } from './reader.js'
import { Context } from './regex/context.js'
import { parse as lexical_analysis } from './lexical-analysis.js'
import { parse as syntax_analysis } from './syntax-analysis.js'
import { analyze as semantic_analysis } from './semantic-analysis.js'
import { generate as generate_intermediate_code } from './intermediate-code-generation.js'
import { generate as generate_output, OutputGeneratorInterface } from './output-generation.js'
import { TypescriptOutputGenerator } from './output-generators/typescript-output-generator.js'
import { CPlusPlusOutputGenerator } from './output-generators/cplusplus-output-generator.js'

export default class Pipeline {
    public constructor(readonly args: Args) {

    }

    private prepare_output_generator(args: Args): OutputGeneratorInterface {
        const ext = args.output_path.split('.').pop()?.toLowerCase()

        switch (ext) {
            case 'ts':
            case 'mts':
                return new TypescriptOutputGenerator()
            
            case 'cpp':
            case 'cxx':
            case 'c++':
            case 'hpp':
            case 'hxx':
            case 'h++':
                return new CPlusPlusOutputGenerator()

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
