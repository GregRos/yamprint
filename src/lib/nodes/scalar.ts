export type ReferenceCode = number;
export type ReferenceOnlyReason = "depth-exceeded" | "circular" | "adjacent" | "unevaluated";

export class ReferenceOnlyScalar {
	constructor(
		public target: object,
		public type: ReferenceOnlyReason,
		public reference: ReferenceCode
	) {
	}
}

export class GetAccessorThrewErrorScalar {
	constructor(public error: Error) {

	}
}

export type BinaryScalarType =
	"Blob"
	| "Buffer"
	| "ArrayBuffer"
	| "TypedArray"
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
	constructor(
		public object: object,
		public type: BinaryScalarType,
		public itemType: BinaryDataType,
		public length: number,
	) {
	}
}

export class LengthExceededScalar {
	constructor(public rest: number) {

	}
}
export class UnevaluatedScalar {
	constructor(public reason: string) {

	}
}

export type LiteralScalar = boolean | string | number | Date | RegExp | null | undefined | Symbol | Function
export type ScalarNode =
	LiteralScalar
	| GetAccessorThrewErrorScalar
	| BinaryScalar
	| ReferenceOnlyScalar
	| UnevaluatedScalar;