import {KeyedCollectionType, KeylessCollectionType} from "./enums";
import {ReferenceCode, ScalarNode} from "./scalar";

export interface NodeMetadata {
	depthExceeded?: boolean
	sizeExceeded?: boolean
}

export class KeyValuePair {
	constructor(
		public key: any,
		public value: Node
	) {}
}

export class KeyedCollection {
	public ref: ReferenceCode;
	constructor(
		public object: object,
		public type: KeyedCollectionType,
		public items: KeyValuePair[],
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
		public props: PropertyItem[]
	) {}
}

export class PropertyItem {
	constructor(
		public owner: object,
		public name: string | symbol,
		public value: Node
	) {}
}

export class ErrorObject {
	constructor(
		public object: object,
		public stack: string,
		public message: string,
		public props: PropertyItem[],
		public ref: ReferenceCode
	) {}
}

export class DepthExceededScalar {
	constructor(public object: object) {

	}
}


export type ComplexNode = ObjectNode | SparseArrayNode | ArrayNode | TextBlockScalar

export type Node = ScalarNode | ComplexNode