import { Context } from './regex/context';
import { SingleSymbol } from './regex/single-symbol';
import { State } from './regex/state';
import { CodeError } from './error';
import { MultiSymbol } from './regex/multi-symbol';
import { IntegerInterval } from './utils/integer-intervals-set';
import { AbstractSymbol } from './regex/abstract-symbol';
import { SourceReader } from './source/source-reader';
import { Reader } from './reader';

type ParsingResult = {
    initial_state: State,
    final_state: State
};

function code_point_to_printable(code_point: number): string {
    return Number.isNaN(code_point) ? 'EOF' : String.fromCodePoint(code_point);
}

const DIGITS_INTERVAL = Object.freeze(new IntegerInterval(0x30 /* 0 */, 0x39 /* 9 */ + 1));
const UPPERCASE_LETTERS_INTERVAL = Object.freeze(new IntegerInterval(0x41 /* A */, 0x5A /* Z */ + 1));
const LOWERCASE_LETTERS_INTERVAL = Object.freeze(new IntegerInterval(0x61 /* a */, 0x7A /* z */ + 1));
const META_DIGITS_SYMBOL = new MultiSymbol([DIGITS_INTERVAL]);
const META_ALPHANUMERIC_UNDERSCORE_SYMBOL = new MultiSymbol([
    DIGITS_INTERVAL,
    UPPERCASE_LETTERS_INTERVAL,
    LOWERCASE_LETTERS_INTERVAL,
    0x5F /* _ */
]);
const META_WHITESPACE_SYMBOL = new MultiSymbol([
    0x20, /* space */
    0x09, /* horizontal tab */
    0x0A, /* line feed */
    0x0B, /* vertical tab */
    0x0C, /* form feed */
    0x0D, /* carriage return */
]);
const META_HORIZONTAL_TAB = new SingleSymbol(0x09);
const META_LINE_FEED = new SingleSymbol(0x0A);
const META_VERTICAL_TAB = new SingleSymbol(0x0B);
const META_FORM_FEED = new SingleSymbol(0x0C);
const META_CARRIAGE_RETURN = new SingleSymbol(0x0D);

export class RegularExpression {
    private current_code_point: number;
    private readonly context: Context;
    private readonly reader: SourceReader;

    public constructor(reader: Reader|SourceReader, options?: {context?: Context}) {
        this.reader = reader instanceof SourceReader ? reader : new SourceReader(reader);
        this.current_code_point = this.reader.read().codePointAt(0) || NaN;
        this.context = options?.context || new Context();
    }

    private consume_current_code_point(): number {
        const code_point = this.current_code_point;
        this.current_code_point = this.reader.read().codePointAt(0) || NaN;
        return code_point;
    }

    private expect_current_code_point_then_consume(expected_code_point: number) {
        if (this.current_code_point !== expected_code_point) {
            const current = code_point_to_printable(this.current_code_point);
            const expected = code_point_to_printable(expected_code_point);
            throw new CodeError(this.reader.file, this.reader.get_point(), `Expected \`${expected}\` character, but \`${current}\` found.`);
        }

        this.consume_current_code_point();
    }

    private static is_valid_letter(code_point: number): boolean {
        return META_ALPHANUMERIC_UNDERSCORE_SYMBOL.contains(code_point);
    }

    private parse_symbol(): AbstractSymbol|undefined {
        if (this.current_code_point === 0x5C) { // \
            this.consume_current_code_point();
            const character = this.consume_current_code_point();

            switch (character) {
                case 0x5C: { // \
                    return new SingleSymbol(character);
                }

                case 0x64: { // d
                    return META_DIGITS_SYMBOL;
                }

                case 0x77: { // w
                    return META_ALPHANUMERIC_UNDERSCORE_SYMBOL;
                }

                case 0x73: { // s
                    return META_WHITESPACE_SYMBOL;
                }

                case 0x74: { // t
                    return META_HORIZONTAL_TAB;
                }

                case 0x6E: { // n
                    return META_LINE_FEED;
                }

                case 0x76: { // v
                    return META_VERTICAL_TAB;
                }

                case 0x66: { // f
                    return META_FORM_FEED;
                }

                case 0x72: { // r
                    return META_CARRIAGE_RETURN;
                }

                default:
                    throw new CodeError(this.reader.file, this.reader.get_point(), `Unknown meta-character: \\${code_point_to_printable(character)}`);
            }
        }
        
        if (RegularExpression.is_valid_letter(this.current_code_point)) {
            const start = this.consume_current_code_point();

            if (this.current_code_point === 0x2D) { // -
                this.consume_current_code_point();
                const end = this.consume_current_code_point();

                if (!RegularExpression.is_valid_letter(end)) {
                    this.reader.revoke();
                    const found = code_point_to_printable(end);
                    throw new CodeError(this.reader.file, this.reader.get_point(), `Expecting last character of interval, but \`${found}\` found.`);
                }

                return new MultiSymbol([new IntegerInterval(start, end + 1)]);
            } else {
                return new SingleSymbol(start);
            }
        }

        return undefined;
    }

    private parse_atom(): ParsingResult|undefined {
        const symbol = this.parse_symbol();
        
        if (symbol === undefined)
            return undefined;

        const initial_state = this.context.create_new_state();
        const final_state = this.context.create_new_state();
        initial_state.add_transition(symbol, final_state);
        return {initial_state, final_state};
    }

    private parse_brackets(): ParsingResult {
        let negated = false;

        if (this.current_code_point === 0x5E) { // ^
            this.consume_current_code_point();
            negated = true;
        }

        let symbol: AbstractSymbol = new MultiSymbol([]);

        while (true) {
            const s = this.parse_symbol();
            
            if (s === undefined)
                break;

            symbol = AbstractSymbol.merge(symbol, s);
        }

        if (negated)
            symbol = AbstractSymbol.negate(symbol);

        const initial_state = this.context.create_new_state();
        const final_state = this.context.create_new_state();
        initial_state.add_transition(symbol, final_state);
        return {initial_state, final_state};
    }

    private parse_block(): ParsingResult|undefined {
        if (this.current_code_point === 0x28) { // (
            this.consume_current_code_point();
            const sub_machine = this.parse_alternation();
            this.expect_current_code_point_then_consume(0x29);
            return sub_machine;
        }

        if (this.current_code_point === 0x5B) { // [
            this.consume_current_code_point();
            const sub_machine = this.parse_brackets();
            this.expect_current_code_point_then_consume(0x5D);
            return sub_machine;
        }

        return this.parse_atom();
    }

    private parse_quantifier(): ParsingResult|undefined {
        const block = this.parse_block();

        if (block === undefined)
            return undefined;

        if (this.current_code_point === 0x3F) { // ?
            this.consume_current_code_point();
            const initial_state = this.context.create_new_state();
            const final_state = this.context.create_new_state();

            initial_state.add_epsilon_transition(block.initial_state);
            block.final_state.add_epsilon_transition(final_state);
            initial_state.add_epsilon_transition(final_state);

            return {initial_state, final_state};
        }

        if (this.current_code_point === 0x2A) { // *
            this.consume_current_code_point();
            const initial_state = this.context.create_new_state();
            const final_state = this.context.create_new_state();

            initial_state.add_epsilon_transition(block.initial_state);
            block.final_state.add_epsilon_transition(initial_state);
            initial_state.add_epsilon_transition(final_state);

            return {initial_state, final_state};
        }

        if (this.current_code_point === 0x2B) { // +
            this.consume_current_code_point();
            const initial_state = this.context.create_new_state();
            const final_state = this.context.create_new_state();

            initial_state.add_epsilon_transition(block.initial_state);
            block.final_state.add_epsilon_transition(block.initial_state);
            block.final_state.add_epsilon_transition(final_state);

            return {initial_state, final_state};
        }

        return block;
    }

    private parse_concatenation(): ParsingResult {
        const initial_state = this.context.create_new_state();
        const final_state = this.context.create_new_state();
        let last_state = initial_state;

        while (true) {
            const quantifier = this.parse_quantifier();

            if (quantifier === undefined)
                break;

            last_state.add_epsilon_transition(quantifier.initial_state);
            last_state = quantifier.final_state;
        }

        last_state.add_epsilon_transition(final_state);
        return {initial_state, final_state};
    }

    private parse_alternation(): ParsingResult {
        const initial_state = this.context.create_new_state();
        const final_state = this.context.create_new_state();

        while (true) {
            const alternation = this.parse_concatenation();
            initial_state.add_epsilon_transition(alternation.initial_state);
            alternation.final_state.add_epsilon_transition(final_state);

            if (this.current_code_point !== 0x7C /* | */)
                break;

            this.consume_current_code_point();
        }

        return {initial_state, final_state};
    }

    public generate(): State {
        const machine = this.parse_alternation();
        machine.final_state.is_final = true;
        machine.initial_state.remove_non_determinism(this.context);
        return machine.initial_state;
    }

    public static merge(context: Context, state_machines: State[]): State {
        const initial_state = context.create_new_state();
        const final_states_order: number[] = [];
        const seen_states = new Set<Number>();

        state_machines.forEach((state: State, index: number) => {
            state.get_transitively_reachable_final_states().forEach((final_state: State) => {
                if (seen_states.has(final_state.id))
                    // TODO throw custom error
                    throw new Error(`Provided states have non-disjunctive final states.`);

                final_state.machine_id = index;
                final_states_order.push(final_state.id);
                seen_states.add(final_state.id);
            });

            initial_state.add_epsilon_transition(state);
        });

        initial_state.remove_non_determinism(context);
        return initial_state;
    } 
}
