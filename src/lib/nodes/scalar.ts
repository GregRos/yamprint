import {BinaryInfo} from "../builder/special-scalar-identifiers";
import {fastIntSqrt} from "../math";

export type ReferenceCode = number;
export type ReferenceOnlyReason = "depth-exceeded" | "circular" | "adjacent" | "unevaluated";

function countOccurrences(haystack: string, needle: string) {
	let len = needle.length;
	let count = 0;
	for (let lastIndex = haystack.indexOf(needle); lastIndex !== -1; lastIndex = haystack.indexOf(needle, lastIndex + len)) {
		count++;
	}
	return count;
}

export class PrimitiveScalar {
	readonly size = 0;
	constructor(
		public data: any
	) {}
}

export class PrimitiveString {
	readonly lines: string[];
	readonly size: number;
	constructor(
		public raw: string
	) {
		const lines = this.lines = raw.split("\n");
		let size = 0;
		for (let line of lines) {
			size = (line.length >> 8) + 1;
		}
		this.size = size;
	}
}


export class RefOnlyNode {
	readonly size = 0;

	constructor(
		public target: object,
		public type: ReferenceOnlyReason,
		public ref: ReferenceCode
	) {
	}
}

export class GetAccessorThrewErrorScalar {
	readonly size = 0;
	constructor(public error: Error) {

	}
}

export type BinaryScalarType =
	"Blob"
	| "Buffer"
	| "ArrayBuffer"
	| "TypedArray"
	| "DataView"
	| "Other";
export type BinaryDataType =
	"byte"
	| "int8"
	| "int16"
	| "int32"
	| "uint16"
	| "uint32"
	| "float32"
	| "float64"
	| "int64"
	| "uint64"

export class BinaryScalar {
	readonly size = 0;
	constructor(
		public object: object,
		public info: BinaryInfo
	) {
	}
}

export class LengthExceededScalar {
	readonly size = 0;
	constructor() {

	}
}
export class UnevaluatedScalar {
	readonly size = 0;
	constructor(public reason: string) {

	}
}

export type LiteralScalar = boolean | string | number | Date | RegExp | null | undefined | Symbol | Function
export type ScalarNode =
	PrimitiveString
	| PrimitiveScalar
	| GetAccessorThrewErrorScalar
	| BinaryScalar
	| RefOnlyNode
	| UnevaluatedScalar
	| LengthExceededScalar;