

import {FormatSpecifier, YamprintFormatter, YamprintTheme} from "./yamprint-formatter";

import {IndentedWriter} from "./indented-writer";

class RecursivePrinter {
    private _knownNodes: any[] = [];
    private _writer : IndentedWriter;

    constructor(private _formatter : YamprintFormatter) {
        this._writer = new IndentedWriter(_formatter.indent);
    }

    print(o: any) {
        this._printObject(o, false);
        let str = this._writer.output();
        this._writer.clear();
        this._knownNodes.length = 0;
        return str;
    }

    protected isKeyPrintable(key : string) {
        return ["constructor", "arguments"].indexOf(key) < 0 && !key.startsWith("__");
    }

    protected isPrototypeExplorable(proto : any) {
        if (!proto) return false;
        if (proto instanceof Function) return false;
        if ([Error.prototype, Object.prototype, Array.prototype].indexOf(proto) >= 0) return false;
        return true;
    }


    protected _printArray(value: any[]) {
        let {_writer, _formatter} = this;
        if (value.length === 0) {
            _writer.writeLine("[]");
            return;
        }
        let lastIndex = -1;
        let isSparse = value.some((x, index) => {
            if (index !== lastIndex + 1) return true;
            lastIndex++;
            return false;
        });

        Object.keys(value).forEach(key => {
            if (isSparse || Number.isNaN(+key)) _writer.write(_formatter.sparseArrayIndex(key));
            let item = value[key];
            _writer.write(_formatter.arrayPrefix);
            _writer.indent(1);
            this._printObject(item, false);
            _writer.indent(-1);
        });
    }

    protected _printObjectKeys(value: any, asValue: boolean) {
        class ErrMarker {
            constructor(public error : Error) {}
        }
        let keys = new Map<string, {}>();

        let getInheritedValueKeys = (v : any, layer : number) => {
            try {
                let proto = Object.getPrototypeOf(v);
                if (!proto || !this.isPrototypeExplorable(proto)) return;
                Object.getOwnPropertyNames(proto).forEach(key => {
                    if (keys.has(key)) return;
                    if (!this.isKeyPrintable(key)) return;

                    try {
                        let v = value[key];
                        if (!(v instanceof Function)) {
                            keys.set(key, v);
                        }
                    } catch (err) {
                        keys.set(key, v);
                    }
                });
                getInheritedValueKeys(proto, layer + 1);
            }
            catch (err) {
                let x = 5;
                //if there was an error, drop out
            }
        };
        Object.getOwnPropertyNames(value).forEach(key => {
            try {
                let v = value[key];
                keys.set(key, v);
            }
            catch (err) {
                keys.set(key, new ErrMarker(err));
            }
        });
        getInheritedValueKeys(value, 0);

        let {_writer, _formatter} = this;
        if (keys.size === 0) {
            _writer.writeLine(_formatter.scalarObjectTag(value));
            return;
        }
        if (asValue) {
            _writer.indent(1);
        }

        let typeLine = _formatter.constructorTag(value);

        if (typeLine) {
            _writer.writeLine(typeLine);
        }
        else if (asValue) {
            _writer.writeLine();
        }
        for (let [key, v] of keys) {
            _writer.write(_formatter.propertyKey(key));
            if (v instanceof ErrMarker) {
                _writer.writeLine(_formatter.threwAlert(v.error));
            } else {
                this._printObject(v, true);
            }
        }

        if (asValue) {
            _writer.indent(-1);
        }
    }

    protected _writeScalar(scalar : string) {
        let splitIntoLines = scalar.split(/(?:\r\n|[\r\n\u000b\u000c\u0085\u2028\u2029])/g);
        if (splitIntoLines.length > 1) {
            this._writer.writeLine();
            this._writer.indent(1);
            for (let line of splitIntoLines) {
                this._writer.writeLine(this._formatter.multilineMargin + line);
            }
            this._writer.indent(-1);
        }
        else {
            this._writer.writeLine(scalar);
        }
    }

    protected _printObject(value: any, asValue: boolean) {
        let {_writer, _formatter} = this;
        let scalar = _formatter.formatScalar(value);

        if (scalar != null) {
            this._writeScalar(scalar);
            return;
        } else {
            if (this._knownNodes.indexOf(value) >= 0) {
                _writer.writeLine(_formatter.circular);
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

export interface Yamprinter {
    /**
     * Returns a string representation of the object using yamprint.
     */
    (objToPrint : object) : string;
}

function create(formatterOrTheme ?: YamprintFormatter | YamprintTheme) {
    let formatter : YamprintFormatter;
    if (!formatterOrTheme) {
        formatter = new YamprintFormatter();
    } else if (formatterOrTheme instanceof YamprintFormatter) {
        formatter = formatterOrTheme;
    } else {
        formatter = new YamprintFormatter().theme(formatterOrTheme);
    }
    let printer = new RecursivePrinter(formatter);
    return (obj: any) => {
        return printer.print(obj);
    }
}

let def = create();

export const yamprint = function Yamprint(obj : any) {
    return def(obj);
} as Yamprinter & {
    /**
     * Creates a new Yamprinter with the default formatter/theme.
     */
    create() : Yamprinter;
    /**
     * Creates a new Yamprinter with the given theme, using the default formatter.
     */
    create(theme : YamprintTheme) : Yamprinter;
    /**
     * Creates a new Yamprinter with the given formatter.
     */
    create(preferences : YamprintFormatter) : Yamprinter;
};
yamprint.create = create;




