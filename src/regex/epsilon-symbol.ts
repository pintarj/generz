import {Symbol} from './symbol';

export class EpsilonSymbol extends Symbol {
    public static readonly INSTANCE: EpsilonSymbol = new EpsilonSymbol();

    public constructor() {
        super(-1);
    }

    public is_epsilon(): boolean {
        return true;
    }

    public to_string(): string {
        return 'ε';
    }
}
