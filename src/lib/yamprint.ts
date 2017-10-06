
export interface IndentOptions {
    indentCount: number;
    indentString: string;
}

class IndentedWriter {
    private _inner = "";
    private _depth = 0;
    private _needsIndent = false;

    write(str: string) {
        if (this._needsIndent) {
            str = "\n" + "  ".repeat(this._depth) + str;
            this._needsIndent = false;
        }
        this._inner += str;
    }

    writeLine(line ?: string) {
        let str = line || "";
        this.write(str);
        this._needsIndent = true;
    }

    indent(n: number) {
        this._depth += n;
    }

    output() {
        return this._inner;
    }

    clear() {
        this._inner = "";
        this._depth = 0;
        this._needsIndent = false;
    }
}

export interface ScalarFormatSpecifier {
    number: (num: number) => string;
    string: (str: string) => string;
    symbol: (sym: Symbol) => string;
    boolean: (bool: boolean) => string;
    date: (date: Date) => string;
    regexp: (regexp: RegExp) => string;
    empty: (special: null | undefined) => string;
    fallback: (obj: object) => string | null;
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

    empty(e) {
        return e === null ? "null" : "undefined";
    }

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
        if (value == null) {
            return this.empty(value);
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

export interface KeywordFormatSpecifier {
    propertyKey: (key: string) => string;
    constructorTag: (ctor: string, hasKeys: boolean) => string;
    arrayPrefix: string
    indent: string;
    threwAlert : (error : any) => string;
    sparseArrayIndex : (index : number | string) => string;
}

export class KeywordFormatter implements KeywordFormatSpecifier {
    propertyKey(key: string) {
        key = /[^a-zA-Z0-9_$]/.test(key) ? `'${key}'` : key;
        return `${key} = `;
    }

    constructorTag(instance: any, hasKeys: boolean) {
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
            if (ctor === Object || !ctor) {
                return hasKeys ? "" : "[Object]";
            }
            line = instance.constructor && instance.constructor.name;
        }
        return line && `[${line}]` || "";
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
        return `!!! ${line} !!!`;
    }
    circular = "~Circular~";
    arrayPrefix = "▸ ";
    indent = "  ";
}

export interface PrinterPreferences {
    scalarFormatter: ScalarFormatter;
    keywordFormatter: KeywordFormatter;
}



class RecursivePrinter {
    private _knownNodes: any[] = [];
    private _writer = new IndentedWriter();

    constructor(private _preferences: PrinterPreferences) {

    }

    print(o: any) {
        this._printObject(o, false);
        let str = this._writer.output();
        this._writer.clear();
        this._knownNodes.length = 0;
        return str;
    }

    private _printArray(value: any[]) {
        let {_writer, _preferences : {keywordFormatter}} = this;
        if (value.length === 0) {
            _writer.write("[]");
        }
        let lastIndex = -1;
        let isSparse = value.some((x, index) => {
            if (index !== lastIndex + 1) return true;
            lastIndex++;
            return false;
        });

        Object.keys(value).forEach(key => {
            if (isSparse || Number.isNaN(+key)) _writer.write(keywordFormatter.sparseArrayIndex(key));
            let item = value[key];
            _writer.write(keywordFormatter.arrayPrefix);
            _writer.indent(1);
            this._printObject(item, false);
            _writer.indent(-1);
        });
    }

    private _printObjectKeys(value: any, asValue: boolean) {
        class ErrMarker {
            constructor(public error : Error) {}
        }
        let keys = new Map<string, any>();
        let getInheritedValueKeys = (v : any) => {
            try {
                let proto = Object.getPrototypeOf(v);
                if (proto === Object.prototype || !proto) return;
                Object.keys(proto).forEach(key => {
                    if (typeof key !== "string") return undefined;
                    if (keys.has(key)) return;
                    try {
                        let v = value[key];
                        if (!(v instanceof Function)) {
                            keys.set(key, v);
                        }
                    } catch (err) {
                        keys.set(key, new ErrMarker(err));
                    }
                });
                getInheritedValueKeys(proto);
            }
            catch (err) {
                //if there was an error, drop out
            }
        };
        Object.keys(value).forEach(key => {
            try {
                let v = value[key];
                keys.set(key, v);
            }
            catch (err) {
                keys.set(key, new ErrMarker(err));
            }
        });
        getInheritedValueKeys(value);

        let {_writer, _preferences: {keywordFormatter}} = this;

        if (asValue) {
            _writer.indent(1);
        }

        let typeLine = keywordFormatter.constructorTag(value, keys.size > 0);

        if (typeLine) {
            _writer.writeLine(typeLine);
        }
        else if (asValue) {
            _writer.writeLine();
        }
        for (let [key, v] of keys) {
            _writer.write(keywordFormatter.propertyKey(key));
            if (v instanceof ErrMarker) {
                _writer.write(keywordFormatter.threwAlert(v.error));
            } else {
                this._printObject(v, true);
            }
        }

        if (asValue) {
            _writer.indent(-1);
        }
    }

    private _printObject(value: any, asValue: boolean) {
        let {_writer, _preferences: {keywordFormatter, scalarFormatter}} = this;
        let scalar = scalarFormatter.formatScalar(value);

        if (scalar != null) {
            _writer.writeLine(scalar);
            return;
        } else {
            if (this._knownNodes.indexOf(value) >= 0) {
                _writer.writeLine(keywordFormatter.circular);
                return;
            }
            this._knownNodes.push(value);
            if (Array.isArray(value)) {
                if (asValue) {
                    _writer.writeLine();
                    _writer.indent(1);
                }
                this._printArray(value);
                if (asValue) {
                    _writer.indent(-1);
                }
            }
            else if (typeof value === 'object' || typeof value === 'function') {
                this._printObjectKeys(value, asValue);
            }
            this._knownNodes.pop();
        }
    }
}

export function yamprint(preferences ?: Partial<PrinterPreferences>) {
    let prefs = {
        scalarFormatter : new ScalarFormatter(),
        keywordFormatter : new KeywordFormatter()
    } as PrinterPreferences;
    Object.assign(prefs, preferences);
    let printer = new RecursivePrinter(prefs);
    return (obj: any) => {
        return printer.print(obj);
    }
}
