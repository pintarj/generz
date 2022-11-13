import { InternalError } from '../error'
import { Declaration } from '../ic/declaration'
import { OutputGeneratorInterface } from '../output-generation'

export class TypescriptOutputGenerator implements OutputGeneratorInterface {
    generate(_functions: readonly Declaration[]): string {
        throw new InternalError('the generation of Typescript output it\'s not yet implemented')
    }
}
