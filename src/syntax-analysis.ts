import { Symbol, SymbolType } from './lexical-analysis';
import { Source } from './ast/source';
import { Variable } from './ast/variable';
import { CodeError } from './error';
import { Locatable, Location, Point } from './source/location';
import { Production } from './ast/production';
import { ProductionNode } from './ast/production-node';
import { VariableUsage } from './ast/variable-usage';
import { TerminalUsage } from './ast/terminal-usage';
import { Node } from './ast/node';
import { Terminal } from './ast/terminal';
import { RegularExpression } from './regular-expression';
import { Context } from './regex/context';
import { StringReader } from './reader';
import { SourceReader } from './source/source-reader';

class SyntaxParser {
    private regex_context: Context;
    private index: number;

    public constructor(
        public readonly file: string,
        public readonly symbols: Symbol[]
    ) {
        this.regex_context = new Context();
        this.index = 0;
    }

    private get current_symbol(): Symbol {
        return this.symbols[this.index];
    }

    private consume(): Symbol {
        const symbol = this.current_symbol;
        this.index += 1;
        return symbol;
    }

    private require(expected: SymbolType): Symbol {
        const symbol = this.current_symbol;

        if (symbol.type !== expected) {
            const message = `expected token \`${SymbolType[expected]}\`, but found \`${SymbolType[symbol.type]}\``;
            throw new CodeError(this.file, symbol.location, message);
        }

        return this.consume();
    }

    private collect<T extends Node>(f: () => T|undefined, options?: {at_least_one?: {node_name: string}}): T[] {
        const collection: T[] = [];

        while (true) {
            const element = f.bind(this)();

            if (element === undefined) {
                if (options?.at_least_one !== undefined && collection.length === 0)
                    throw new CodeError(this.file, this.current_symbol.location, `Expected at least one \`${options.at_least_one.node_name}\`, but zero found.`)
                
                return collection;
            }


            collection.push(element);
        }
    }

    private parse_production_node(): ProductionNode|undefined {
        switch (this.current_symbol.type) {
            case SymbolType.IDENTIFIER: {
                const id = this.consume();
                const first = id.lexeme.charAt(0);

                return (first === first.toUpperCase())
                    ? new VariableUsage(id.location.get_location(), id.lexeme)
                    : new TerminalUsage(id.location.get_location(), id.lexeme);
            }

            default:
                return undefined;
        }
    }

    private parse_production(): Production|undefined {
        switch (this.current_symbol.type) {
            case SymbolType.PRODUCTION: {
                const start = this.consume().location.get_location().start;
                const nodes = this.collect(this.parse_production_node, {at_least_one: {node_name: 'PRODUCTION_NODE'}});
                const end = nodes[nodes.length - 1].location.get_location().end;
                return new Production(new Location(start, end), nodes);
            }

            case SymbolType.EPSILON: {
                const location = this.consume().location;
                return Production.create_epsilon(location);
            }

            default: {
                return undefined;
            }
        }
    }

    private parse_declarations(): Terminal|Variable|undefined {
        switch (this.current_symbol.type) {
            case SymbolType.TERMINAL: {
                const start = this.consume().location.get_location().start
                const name_symbol = this.require(SymbolType.IDENTIFIER)
                let regex_source = name_symbol.lexeme
                let end: Locatable = name_symbol.location

                if (this.current_symbol.type as any === SymbolType.REGEX) {
                    const regex_symbol = this.consume()
                    regex_source = regex_symbol.lexeme.slice(1, -1)
                    end = regex_symbol.location
                }

                const reader = new SourceReader(new StringReader(regex_source), {
                    file: this.file,
                    location_offset: start
                });

                const regex = (new RegularExpression(reader, {context: this.regex_context})).generate()   
                
                return new Terminal(
                    new Location(start, end.get_location().end),
                    name_symbol.lexeme,
                    regex
                );
            }

            case SymbolType.VARIABLE: {
                const start = this.consume().location.get_location().start;
                const name_symbol = this.require(SymbolType.IDENTIFIER);
                this.require(SymbolType.BRACES_LEFT);
                const productions = this.collect(this.parse_production);
                const end = this.require(SymbolType.BRACES_RIGHT).location.get_location().end;
                
                return new Variable(
                    new Location(start, end),
                    name_symbol.lexeme,
                    productions
                );
            }

            default: {
                return undefined;
            }
        }
    }

    public parse(): Source {
        const declarations = this.collect(this.parse_declarations)
        const eof_symbol = this.require(SymbolType.EOF)
        const location = new Location(new Point(1, 1), eof_symbol.location.get_location().end) 
        return new Source(location, declarations)
    }
}

export function parse(file: string, symbols: Symbol[]): Source {
    return (new SyntaxParser(file, symbols)).parse();
}
