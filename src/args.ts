import fs from 'fs'
import yargs from 'yargs'
import { ArgsError } from './error'

export default class Args {
    public readonly file: string
    
    public readonly output_path: string

    private constructor(args: any) {
        this.file = args.file
        this.output_path = args.o

        if (!fs.existsSync(this.file))
            throw new ArgsError(`source file \`${this.file}\` doesn't exists`)
    }

    public static parse() {
        const args = yargs
            .scriptName('generz')
            .command('$0 <file>', 'compiles an .erz source file')
            .option('o', {
                alias: 'output',
                demandOption: true,
                describe: 'the output file',
                type: 'string'
            })
            .parse()

        return new Args(args)
    } 
}

