
import {FormatSpecifier, YamprintFormatter} from "./keyword-formatter";


export type PostTransform = (input : string) => string;



class IndentedWriter {
    private _inner = "";
    private _depth = 0;
    private _needsIndent = false;

    constructor(private _indentStr : string) {

    }
    write(str: string) {
        if (this._needsIndent) {
            str = "\n" + this._indentStr.repeat(this._depth) + str;
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
                _writer.write(_formatter.threwAlert(v.error));
            } else {
                this._printObject(v, true);
            }
        }

        if (asValue) {
            _writer.indent(-1);
        }
    }

    private _printObject(value: any, asValue: boolean) {
        let {_writer, _formatter} = this;
        let scalar = _formatter.formatScalar(value);

        if (scalar != null) {
            _writer.writeLine(scalar);
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

function create(formatter ?: YamprintFormatter) {
    formatter = formatter || new YamprintFormatter();
    let printer = new RecursivePrinter(formatter);
    return (obj: any) => {
        return printer.print(obj);
    }
}

let def = create();

export const yamprint = function Yamprint(obj : any) {
    return def(obj);
} as any as {

    (obj : any) : string;
    create(preferences ?: YamprintFormatter) : (obj : any) => string;
};
yamprint.create = create;




