import { Declaration } from './ic/declaration'

export interface OutputGeneratorInterface {
    generate(functions: ReadonlyArray<Declaration>): string
}

export function generate(generator: OutputGeneratorInterface, declarations: ReadonlyArray<Declaration>): string {
    return generator.generate(declarations)
}
