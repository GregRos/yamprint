export interface NodeMetadata {
    depthExceeded ?: boolean;
    sizeExceeded ?: boolean;
}

export class NodeBase {
    metadata : NodeMetadata;
    withMetadata(metadata : NodeMetadata) :  this {
        this.metadata = metadata;
        return this;
    }
}

export class PropertyItem  {
    constructor(public name: string, public value: Node) {

    }
}

export class SparseArrayNode extends NodeBase {
    constructor(public items: PropertyItem[]) {
        super();
    }
}

export class ArrayNode extends NodeBase {
    constructor(public items: Node[]) {
        super();
    }
}

export class ObjectNode extends NodeBase {
    constructor(public ctor: Function, public readonly properties: PropertyItem[]) {
        super();
    }
}

export class TextBlockScalar extends NodeBase {
    constructor(public lines : string[]) {
        super();
    }
}

export class EmptyObjectScalar extends NodeBase {
    constructor(public readonly ctor : Function) {
        super();
    }
}

export class CircularReferenceScalar extends NodeBase {
}

export class EmptyArrayScalar extends NodeBase {
}

export class UnresolvedGetterScalar extends NodeBase {
    constructor(public readonly func: Function) {
        super();
    }
}

export class BinaryScalar extends NodeBase {
    constructor(public name: string, public size: number) {
        super();
    }
}

export class ThrewErrorScalar extends NodeBase {
    constructor(public error: Error) {
        super();
    }
}

export class DepthExceededScalar extends NodeBase {
    constructor(public error : Error) {
        super();
    }
}


export type LiteralScalar = boolean | string | number | Date | RegExp | null | undefined | Symbol | Function;

export type ScalarNode =
    LiteralScalar
    | ThrewErrorScalar
    | BinaryScalar
    | CircularReferenceScalar
    | EmptyArrayScalar
    | EmptyObjectScalar
    | UnresolvedGetterScalar;

export type ComplexNode = ObjectNode | SparseArrayNode | ArrayNode | TextBlockScalar;

export type Node = ScalarNode | ComplexNode;