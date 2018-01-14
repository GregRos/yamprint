import {BinaryTypeInfo} from "./binary-type-identifier";
import {BinaryScalar, TextBlockScalar} from "./object-graph";

export interface FormatSpecifier {
    propertyKey: (key: string) => string;
    constructorTag: (ctor: string) => string;
    arrayPrefix: string
    indent: string;
    threwAlert: (error: any) => string;
    sparseArrayIndex: (index: number | string) => string;
    circularReference: string;
    multilineMargin: string;
    number: (num: number) => string;
    string: (str: string) => string;
    symbol: (sym: Symbol) => string;
    boolean: (bool: boolean) => string;
    date: (date: Date) => string;
    regexp: (regexp: RegExp) => string;
    nul: string;
    undefined: string;
    arrayDepthExceeded: string;
    sizeExceededToken: string;
    unreoslvedGetter: string;

    emptyObject(ctor: Function): any;

    binary({name, size}: BinaryScalar): string;

    objectDepthExceeded(obj: object): string;

    textBlock({lines}: TextBlockScalar): string[];
}

export type YamprintTheme = {
    [K in keyof FormatSpecifier] ?: (s: string) => string;
}

declare let Blob, ArrayBuffer, ArrayBufferView;


export class YamprintFormatter implements FormatSpecifier {
    private _formatCtorTag(line: string) {
        return line && `|${line}|` || "";
    }

    emptyObject(ctor: Function) {
        if (ctor === Object) return "{}";
        if (!ctor || !ctor.name) return this._formatCtorTag("~anonymous~");
        return this.constructorTag(ctor);
    }

    propertyKey(key: string) {
        key = /[^a-zA-Z0-9_$]/.test(key) ? `'${key}'` : key;
        return `${key} = `;
    }

    theme(theme: YamprintTheme) {
        let self = this as any;

        class ThemedYampritFormatter extends YamprintFormatter {
            constructor(colors: YamprintTheme) {
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

    constructorTag(ctor: any) {
        let line = "";
        if (ctor === Object || !ctor) {
            return "";
        }
        if (ctor.prototype instanceof Error) {
            let regularName = ctor.name;
            if (regularName === "Error" || !regularName) {
                regularName = ctor.name;
            }
            regularName = regularName || "Error";
            line += regularName;
            if (ctor.message) {
                line += `("${ctor.message}")`;
            }
        }
        else {
            line = ctor.name || "~anonymous~";

        }
        return this._formatCtorTag(line);
    };

    sparseArrayIndex(ix: number | string) {
        return !Number.isNaN(+ix) ? `(${ix}) ` : `'${ix}' `;
    }

    function (f: Function) {
        let line = "function";
        if (f.name) {
            line += " " + f.name;
        }
        return `|${line}|`;
    }

    binary({name, size}: BinaryScalar) {
        let line = `|${name} : size = ${size}|`;
        return line;
    }

    threwAlert(err: any) {
        let line = "THREW";
        if (!(err instanceof Error)) {
            line += " " + (err && err.toString || Object.prototype.toString).call(err);
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

    circularReference = "~Circular~";
    emptyArray = "[]";
    arrayDepthExceeded = "[...] (depth exceeded)";

    objectDepthExceeded(obj: Function) {
        return this.emptyObject(obj) + " (depth exceeded)";
    }

    sizeExceededToken = "... (size exceeded)";
    arrayPrefix = "► ";
    indent = "  ";
    unreoslvedGetter = "... (getter unresolved)";
    number(n) {
        return n.toString();
    };

    textBlock({lines}: TextBlockScalar) {
        for (let i = 0; i < lines.length; i++) {
            lines[i] = `${this.multilineMargin}${lines[i]}`;
        }
        return lines;
    }

    multilineMargin = "| ";

    string(s: string) {
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
}
