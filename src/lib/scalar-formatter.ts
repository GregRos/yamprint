import {PostTransform} from "./yamprint";

export interface ScalarFormatSpecifier {
    number: (num: number) => string;
    string: (str: string) => string;
    symbol: (sym: Symbol) => string;
    boolean: (bool: boolean) => string;
    date: (date: Date) => string;
    regexp: (regexp: RegExp) => string;
    nul: string;
    undefined : string;
    fallback: (obj: object) => string | null;
}

export type ScalarFormatterPostTransforms = {
    [K in keyof ScalarFormatSpecifier] : PostTransform;
    }

export class ScalarFormatter implements ScalarFormatSpecifier {
    number(n) {
        return n.toString();
    };

    string(s) {
        return `'${s}'`;
    }

    symbol(s) {
        return s.toString()
    }

    boolean(b) {
        return b.toString();
    }

    undefined = "undefined";

    nul = "null";


    date(d) {
        return d.toString();
    }

    regexp(r) {
        return r.toString();
    }

    fallback(o) {
        return null;
    }

    formatScalar(value: any): string | null {
        if (value === null) {
            return this.nul;
        }
        if (value === undefined ){
            return this.undefined;
        }
        if ([String, Number, Boolean, Symbol].some(ctor => value instanceof ctor)) {
            value = value.valueOf();
        }
        switch (typeof value) {
            case "boolean":
                return this.boolean(value);
            case "string":
                return this.string(value);
            case "symbol":
                return this.symbol(value);
            case "number":
                return this.number(value);
        }
        if (value instanceof Date) {
            return this.date(value);
        } else if (value instanceof RegExp) {
            return this.regexp(value);
        } else {
            return this.fallback(value);
        }
    }
}
