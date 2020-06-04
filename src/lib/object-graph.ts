export interface NodeMetadata {
    depthExceeded ?: boolean
    sizeExceeded ?: boolean
}

export type KeyedCollectionType = "map" | "non-linear-array" | "other";

export type KeylessCollectionType = "array" | "set" | "iterator" | "other";

export type ReferenceCode = number;

export class KeyValuePair {
    constructor(
        public key: any,
        public value: Node
    ) {

    }
}

export class KeyedCollection {
    constructor(
        public object: object,
        public type: KeyedCollectionType,
        public items: KeyValuePair[],
        public ref: ReferenceCode
    ) {

    }
}

export class KeylessCollection {
    constructor(
        public object: object,
        public type: KeylessCollectionType,
        public items: Node[]
    ) {

    }
}

export class ObjectNode {
    constructor(
        public object: object,
        public props: PropertyItem[],
        public ref: ReferenceCode
    ) {

    }
}

export class PropertyItem  {
    constructor(
        public owner: object,
        public name: string | symbol,
        public value: Node
    ) {

    }
}

export class ReferenceScalar {
    constructor(
        public target: object,
        public reference: ReferenceCode,
        public type: "circular" | "adjacent"
    ) {

    }
}

export class UnresolvedGetterScalar {
    constructor() {
        
    }
}

export class BinaryScalar {
    constructor(
        public object: object,
    ) {
        
    }
}

export class ThrewErrorScalar {
    constructor(public error: Error) {
        
    }
}

export class DepthExceededScalar {
    constructor(public error : Error) {
        
    }
}


export type LiteralScalar = boolean | string | number | Date | RegExp | null | undefined | Symbol | Function

export type ScalarNode =
    LiteralScalar
    | ThrewErrorScalar
    | BinaryScalar
    | CircularReferenceScalar
    | EmptyArrayScalar
    | EmptyObjectScalar
    | UnresolvedGetterScalar

export type ComplexNode = ObjectNode | SparseArrayNode | ArrayNode | TextBlockScalar

export type Node = ScalarNode | ComplexNode