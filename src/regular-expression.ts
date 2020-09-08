import { Reader } from './reader';
import { Context } from './regex/context';
import { SingleSymbol } from './regex/single-symbol';
import { State } from './regex/state';
import { CodeGenerzError as CodeError } from './error';

type ParsingResult = {
    initial_state: State,
    final_state: State
};

export class RegularExpression {
    private current_code_point: number;
    private readonly context: Context;

    public constructor(private readonly reader: Reader) {
        this.current_code_point = this.reader.read().codePointAt(0) || NaN;
        this.context = new Context();
    }

    private consume_current_code_point(): number {
        const code_point = this.current_code_point;
        this.current_code_point = this.reader.read().codePointAt(0) || NaN;
        return code_point;
    }

    private expect_current_code_point_then_consume(expected_code_point: number) {
        if (this.current_code_point !== expected_code_point) {
            const current = Number.isNaN(this.current_code_point) ? 'EOF' : String.fromCodePoint(this.current_code_point);
            const expected = Number.isNaN(expected_code_point) ? 'EOF' : String.fromCodePoint(expected_code_point);
            // TODO insert the correct file name
            CodeError.throw('<unknown>', `Expected \`${expected}\` character, but \`${current}\` found.`);
        }

        this.consume_current_code_point();
    }

    private static is_valid_letter(code_point: number): boolean {
        return code_point >= 0x41 && code_point <= 0x5A // A-Z
            || code_point >= 0x61 && code_point <= 0x7A // a-z
            || code_point >= 0x30 && code_point <= 0x39 // 0-9
            || code_point == 0x5F;                      // _
    }

    private parse_atom(): ParsingResult|undefined {
        let symbol: SingleSymbol|undefined = undefined;

        if (RegularExpression.is_valid_letter(this.current_code_point))
            symbol = new SingleSymbol(this.consume_current_code_point());

        if (symbol === undefined)
            return undefined;

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
}
