import {
    ArrayNode, BinaryScalar, CircularReferenceScalar, EmptyArrayScalar, EmptyObjectScalar, Node, NodeBase, ObjectNode,
    SparseArrayNode, TextBlockScalar, ThrewErrorScalar, UnresolvedGetterScalar
} from "./object-graph";
import {YamprintFormatter} from "./yamprint-formatter";
import {IndentedWriter} from "./indented-writer";


export class YamprintGraphPrinter {
    private _writer : IndentedWriter;
    constructor(private _formatter : YamprintFormatter) {
        this._writer = new IndentedWriter(_formatter.indent);
    }
    private _formatLiteral(literal : any) {
        if (literal === null) return this._formatter.nul;
        if (literal === undefined) return this._formatter.undefined;
        switch (typeof literal) {
            case "boolean":
                return this._formatter.boolean(literal);
            case "string":
                return this._formatter.string(literal);
            case "symbol":
                return this._formatter.symbol(literal);
            case "number":
                return this._formatter.number(literal);
            case "function":
                return this._formatter.function(literal);
        }
        if (literal instanceof Date) {
            return this._formatter.date(literal);
        } else if (literal instanceof RegExp) {
            return this._formatter.regexp(literal);
        } else {
            return null;
        }
    }

    private _printArray(instance : ArrayNode) {
        if (instance.metadata.depthExceeded) {
            this._writer.writeLine(this._formatter.arrayDepthExceeded);
            return;
        }
        let lines = [];
        for (let item of instance.items) {
            let result = this._formatScalar(item);
            this._writer.write(this._formatter.arrayPrefix);
            if (result != null) {
                this._writer.writeLine(result);
            } else {
                this._writer.indent(1);
                this._printComplex(item);
                this._writer.indent(-1);
            }
        }

        if (instance.metadata.sizeExceeded) {
            this._writer.writeLine(this._formatter.sizeExceededToken);
        }
    }

    private _printSparseArray(node : SparseArrayNode) {
        let lines = [];
        for (let item of node.items) {
            let result = this._formatScalar(item.value);
            this._writer.write(`(${item.name}) ${this._formatter.arrayPrefix}`);
            if (result != null) {
                this._writer.writeLine(result);
            } else {
                this._writer.indent(1);
                this._printComplex(item.value);
                this._writer.indent(-1);
            }
        }
        if (node.metadata.sizeExceeded) {
            this._writer.writeLine(this._formatter.sizeExceededToken);
        }
    }

    private _formatScalar(scalar : any) {
        if (scalar instanceof NodeBase) {
            if (scalar instanceof BinaryScalar) {
                return this._formatter.binary(scalar);
            } else if (scalar instanceof CircularReferenceScalar) {
                return this._formatter.circularReference;
            } else if (scalar instanceof EmptyArrayScalar) {
                return this._formatter.emptyArray;
            } else if (scalar instanceof EmptyObjectScalar) {
                return this._formatter.emptyObject(scalar.ctor);
            } else if (scalar instanceof UnresolvedGetterScalar) {
                return this._formatter.unreoslvedGetter;
            } else if (scalar instanceof ThrewErrorScalar) {
                return this._formatter.threwAlert(scalar.error);
            }
        }
        else {
            return this._formatLiteral(scalar);
        }
    }

    private _printTextBlock(block : TextBlockScalar) {
        return this._formatter.textBlock(block);
    }

    private _printObject(node : ObjectNode) {
        if (node.metadata.depthExceeded) {
            this._writer.writeLine(this._formatter.objectDepthExceeded(node.ctor));
            return;
        }
        let tag = this._formatter.constructorTag(node.ctor);
        if (tag) this._writer.writeLine(tag);
        for (let property of node.properties) {
            let tryScalar = this._formatScalar(property.value);
            let name = this._formatter.propertyKey(property.name);
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
            this._writer.writeLine(this._formatter.sizeExceededToken);
        }
    }

    private _printComplex(node : Node) {
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