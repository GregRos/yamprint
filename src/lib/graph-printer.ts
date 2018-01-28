import {
    ArrayNode, BinaryScalar, CircularReferenceScalar, EmptyArrayScalar, EmptyObjectScalar, Node, NodeBase, ObjectNode,
    SparseArrayNode, TextBlockScalar, ThrewErrorScalar, UnresolvedGetterScalar
} from "./object-graph";
import {YamprintFormatter} from "./yamprint-formatter";
import {IndentedWriter} from "./indented-writer";


export class YamprintGraphPrinter {
    private _writer : IndentedWriter;
    constructor(public readonly formatter : YamprintFormatter) {
        this._writer = new IndentedWriter(formatter.indent);
    }
    protected _formatLiteral(literal : any) {
        if (literal === null) return this.formatter.null;
        if (literal === undefined) return this.formatter.undefined;
        switch (typeof literal) {
            case "boolean":
                return this.formatter.boolean(literal);
            case "string":
                return this.formatter.string(literal);
            case "symbol":
                return this.formatter.symbol(literal);
            case "number":
                return this.formatter.number(literal);
            case "function":
                return this.formatter.function(literal);
        }
        if (literal instanceof Date) {
            return this.formatter.date(literal);
        } else if (literal instanceof RegExp) {
            return this.formatter.regexp(literal);
        } else {
            return null;
        }
    }

    protected _printArray(instance : ArrayNode) {
        if (instance.metadata.depthExceeded) {
            this._writer.writeLine(this.formatter.arrayDepthExceeded);
            return;
        }
        let lines = [];
        for (let item of instance.items) {
            let result = this._formatScalar(item);
            this._writer.write(this.formatter.arrayPrefix);
            if (result != null) {
                this._writer.writeLine(result);
            } else {
                this._writer.indent(1);
                this._printComplex(item);
                this._writer.indent(-1);
            }
        }

        if (instance.metadata.sizeExceeded) {
            this._writer.writeLine(this.formatter.sizeExceededToken);
        }
    }

    protected _printSparseArray(node : SparseArrayNode) {
        let lines = [];
        for (let item of node.items) {
            let result = this._formatScalar(item.value);
            this._writer.write(`(${item.name}) ${this.formatter.arrayPrefix}`);
            if (result != null) {
                this._writer.writeLine(result);
            } else {
                this._writer.indent(1);
                this._printComplex(item.value);
                this._writer.indent(-1);
            }
        }
        if (node.metadata.sizeExceeded) {
            this._writer.writeLine(this.formatter.sizeExceededToken);
        }
    }

    protected _formatScalar(scalar : any) {
        if (scalar instanceof NodeBase) {
            if (scalar instanceof BinaryScalar) {
                return this.formatter.binary(scalar);
            } else if (scalar instanceof CircularReferenceScalar) {
                return this.formatter.circularReference;
            } else if (scalar instanceof EmptyArrayScalar) {
                return this.formatter.emptyArray;
            } else if (scalar instanceof EmptyObjectScalar) {
                return this.formatter.emptyObject(scalar.ctor, scalar.metadata);
            } else if (scalar instanceof UnresolvedGetterScalar) {
                return this.formatter.unreoslvedGetter;
            } else if (scalar instanceof ThrewErrorScalar) {
                return this.formatter.threwAlert(scalar.error);
            }
        }
        else {
            return this._formatLiteral(scalar);
        }
    }

    protected _printTextBlock(block : TextBlockScalar) {
        for (let line of block.lines) {
            this._writer.writeLine(this.formatter.lineInMultilineBlock(line));
        }
    }

    protected _printObject(node : ObjectNode) {
        let tag = this.formatter.constructorTag(node.ctor);
        if (tag) this._writer.writeLine(tag);
        for (let property of node.properties) {
            let tryScalar = this._formatScalar(property.value);
            let name = this.formatter.propertyKey(property.name);
            if (tryScalar != null) {
                this._writer.writeLine(`${name}${tryScalar}`)
            } else {
                this._writer.writeLine(`${name}`);
                this._writer.indent(1);
                this._printComplex(property.value);
                this._writer.indent(-1);
            }
        }
        if (node.metadata.sizeExceeded) {
            this._writer.writeLine(this.formatter.sizeExceededToken);
        }
    }

    protected _printComplex(node : Node) {
        if (node instanceof ObjectNode) {
            this._printObject(node);
        } else if (node instanceof ArrayNode) {
            this._printArray(node);
        } else if (node instanceof SparseArrayNode) {
            this._printSparseArray(node);
        } else if (node instanceof TextBlockScalar) {
            this._printTextBlock(node);
        }
    }

    print(node : Node) {
        try {
            let scalar = this._formatScalar(node);
            if (scalar != null) {
                this._writer.writeLine(scalar);
            } else {
                this._printComplex(node);
            }
            let result = this._writer.output();
            return result;
        }
        finally {
            this._writer.clear();
        }
    }

}