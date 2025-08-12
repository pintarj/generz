import { InternalError } from '../error.js'
import { Declaration } from '../ic/declaration.js'
import { OutputGeneratorInterface } from '../output-generation.js'

export class CPlusPlusOutputGenerator implements OutputGeneratorInterface {
    generate(_functions: readonly Declaration[]): string {
        throw new InternalError('the generation of C++ output it\'s not yet implemented')
    }
}
