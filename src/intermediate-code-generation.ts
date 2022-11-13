import { Source } from './ast/source'
import { Declaration } from './ic/declaration'
import { Context } from './regex/context'

class ICGenerator {
    public constructor(
        _regex_context: Context,
        _ast: Source
    ) {
        
    }
    
    public generate(): Declaration[] {
        return []
    }
}

export function generate(regex_context: Context, ast: Source): Declaration[] {
    const generator = new ICGenerator(regex_context, ast)
    return generator.generate()
}
