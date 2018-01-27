export class IndentedWriter {
    private _inner = "";
    private _depth = 0;
    private _needsIndent = false;

    constructor(private _indentStr : string) {

    }
    write(str: string) {
        if (this._needsIndent) {
            str = `\n${this._indentStr.repeat(this._depth)}${str}`;
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