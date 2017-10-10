
import ww = require('wordwrap');
export interface FormatSpecifier {
    propertyKey: (key: string) => string;
    constructorTag: (ctor: string) => string;
    arrayPrefix: string
    indent: string;
    threwAlert : (error : any) => string;
    sparseArrayIndex : (index : number | string) => string;
    circular : string;
    multilineMargin : string;

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

export type YamprintTheme = {
    [K in keyof FormatSpecifier] ?: (s: string) => string;
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

    theme(theme : YamprintTheme) {
        let self = this as any;
        class ThemedYampritFormatter extends YamprintFormatter {
            constructor(colors : YamprintTheme) {
                super();
                Object.keys(colors).forEach(k => {
                    if (typeof this[k] == "function") {
                        this[k] = function (...args: any[]) {
                            return colors[k].call(colors, self[k].apply(this, args));
                        };
                    } else {
                        this[k] = colors[k].call(colors, this[k]);
                    }
                });
            }
        }

        return new ThemedYampritFormatter(theme) as YamprintFormatter;
    }

    constructorTag(instance: any) {
        let line = "";
        if (instance instanceof Error) {
            let regularName = instance.name;
            if (regularName === "Error" || !regularName) {
                regularName = instance.constructor && instance.constructor.name;
            }
            regularName = regularName || "Error";
            line += regularName;
            if (instance.message) {
                line += `("${instance.message}")`;
            }
        }
        else {
            let ctor = instance.constructor;
            if (ctor === Object || !ctor) {
                return "";
            }
            if (instance.constructor) {
                line = instance.constructor.name || "~anonymous~";
            }
        }
        return this._formatCtorTag(line);
    };

    sparseArrayIndex(ix : number | string) {
        return !Number.isNaN(+ix) ? `(${ix}) ` : `'${ix}' `;
    }

    function(f : Function){
        let line = "function";
        if (f.name) {
            line += " " + f.name;
        }
        return `|${line}|`;
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

            if (err.message) {
                line += `("${err.message}")`;
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

    multilineMargin = "| ";

    string(s : string) {
        if (!s.match(/[(\r|\n)]/)) {
            return `'${s}'`;
        } else {
            return s;
        }
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
        if ([String, Number, Boolean, Symbol, Function].some(ctor => value instanceof ctor)) {
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
            case "function":
                return this.function(value);
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
