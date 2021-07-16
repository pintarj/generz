import { SourceReader } from './source/source-reader';
import { Locatable, Location, Point } from './source/location';
import { CodeError } from './error';

export enum SymbolType {
    IDENTIFIER,
    TERMINAL,
    REGEX,
    VARIABLE,
    PRODUCTION,
    EPSILON,
    BRACES_LEFT,
    BRACES_RIGHT,
    EOF
}

export interface Symbol {
    type: SymbolType;
    location: Locatable;
    lexeme: string;
}

const REGEX_ID_START = /^\p{L}$/u;
const REGEX_ID_CONTINUE = /^[\p{L}\d_]$/u;

export function parse(reader: SourceReader): Symbol[] {
    const symbols: Symbol[] = [];

    while (true) {
        let lexeme = reader.read();
        let location: Locatable = reader.get_point();
        let type: SymbolType|undefined;

        if (lexeme === '')
            break;

        if (/^\s$/.test(lexeme)) {
            continue;
        } else if (lexeme === '{') {
            type = SymbolType.BRACES_LEFT;
        } else if (lexeme === '}') {
            type = SymbolType.BRACES_RIGHT;
        } else if (lexeme === '/') {
            type = SymbolType.REGEX;
            let escaping = false;

            while (true) {
                const c = reader.read();
                lexeme += c;

                if (escaping) {
                    escaping = false;
                } else {
                    if (c === '\\') {
                        escaping = true;
                    } else if (c === '/') {
                        location = new Location(location as Point, reader.get_point())
                        break;
                    }
                }
            }
        } else if (REGEX_ID_START.test(lexeme)) {
            let last_point: Point|undefined;

            while (true) {
                const c = reader.read();

                if (!REGEX_ID_CONTINUE.test(c)) {
                    reader.revoke();
                    break;
                } else {
                    lexeme += c;
                    last_point = reader.get_point();
                }
            }

            if (last_point !== undefined)
                location = new Location(location as Point, last_point);

            switch (lexeme) {
                case 'terminal': {
                    type = SymbolType.TERMINAL;
                    break;
                }
                case 'variable': {
                    type = SymbolType.VARIABLE;
                    break;
                }

                case 'production': {
                    type = SymbolType.PRODUCTION;
                    break;
                }

                case 'epsilon': {
                    type = SymbolType.EPSILON;
                    break;
                }

                default: {
                    type = SymbolType.IDENTIFIER;
                    break;
                }
            }
        } else {
            throw new CodeError(reader.file, location, `Unknown lexeme \`${lexeme}\``);
        }

        symbols.push({
            type,
            location,
            lexeme
        });
    }

    symbols.push({
        type: SymbolType.EOF,
        location: reader.get_point(),
        lexeme: ''
    });

    return symbols;
}
