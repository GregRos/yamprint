import {PostTransform} from "./yamprint";

export interface FormatSpecifier {
    propertyKey: (key: string) => string;
    constructorTag: (ctor: string) => string;
    arrayPrefix: string
    indent: string;
    threwAlert : (error : any) => string;
    sparseArrayIndex : (index : number | string) => string;


    number: (num: number) => string;
    string: (str: string) => string;
    symbol: (sym: Symbol) => string;
    boolean: (bool: boolean) => string;
    date: (date: Date) => string;
    regexp: (regexp: RegExp) => string;
    nul: string;
    undefined : string;
    fallback: (obj: object) => string | null;
    scalarObjectTag : (obj : any) => string;
}


export class YamprintFormatter implements FormatSpecifier {

    private _formatCtorTag(line : string) {
        return line && `|${line}|` || "";
    }

    scalarObjectTag(obj : any) {
        if (obj.constructor === Object) return "{}";
        if (!obj.constructor || !obj.constructor.name) return this._formatCtorTag("~anonymous~");
        return this.constructorTag(obj);
    }
    propertyKey(key: string) {
        key = /[^a-zA-Z0-9_$]/.test(key) ? `'${key}'` : key;
        return `${key} = `;
    }

    constructorTag(instance: any) {
        let line = "";
        if (instance instanceof Function) {
            line = "function";
            if (instance.name) {
                line += " " + instance.name;
            }
        }
        else if (instance instanceof Error) {
            line = instance.name || "Error";
            if (instance.message) {
                line += " - " + instance.message;
            }
        }
        else {
            let ctor = instance.constructor;
            if (ctor === Object || !ctor) return "";
            line = instance.constructor && instance.constructor.name;
        }
        return this._formatCtorTag(line);
    };

    sparseArrayIndex(ix : number | string) {
        return !Number.isNaN(+ix) ? `(${ix}) ` : `'${ix}' `;
    }


    threwAlert(err : any) {
        let line = "THREW";
        if (!(err instanceof Error)) {
            line += " " + (err  && err.toString || Object.prototype.toString).call(err);
        }
        else {
            if (err.name) {
                line += " " + err.name;
            } else if (err.constructor && err.constructor.name) {
                line += `${err.constructor.name}`;
            } else {
                line += " Error";
            }
        }
        return `‼ ${line} ‼`;
    }
    circular = "~Circular~";
    arrayPrefix = "► ";
    indent = "  ";

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
        let proto = Object.getPrototypeOf(o);
        if (Array.isArray(o) && Object.keys(o).length === 0) {
            return "[]";
        }
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
