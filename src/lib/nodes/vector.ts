import {LengthExceededScalar, ReferenceCode, RefOnlyNode} from "./scalar";
import {Node} from "./index";

export type KeyedCollectionType = "map" | "non-linear-array" | "other";
export type KeylessCollectionType = "array" | "set" | "iterator" | "other";

export class KeyValuePair {
	constructor(
		public key: RefOnlyNode,
		public value: Node
	) {}
}

export class KeyedCollection {
	public ref: ReferenceCode;
	constructor(
		public object: object,
		public type: KeyedCollectionType,
		public items: (KeyValuePair | LengthExceededScalar)[],
	) {}
}

export class KeylessCollection {
	ref: ReferenceCode;
	constructor(
		public type: KeylessCollectionType,
		public object: object,
		public items: Node[]
	) {}
}

export class ObjectNode {
	ref: ReferenceCode;
	constructor(
		public object: object,
		public props: (PropertyItem | LengthExceededScalar)[]
	) {}
}

export class PropertyItem {
	constructor(
		public owner: object,
		public key: PropertyKey,
		public value: Node
	) {}
}

export class ErrorObjectNode {
	constructor(
		public object: object,
		public stack: string,
		public message: string,
		public props: (PropertyItem | LengthExceededScalar)[],
		public ref: ReferenceCode
	) {}
}


export type ComplexNode = ObjectNode | ErrorObjectNode | KeylessCollection | KeyedCollection;

