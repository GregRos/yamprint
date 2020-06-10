import {BinaryDataType, BinaryScalar} from "../nodes/scalar";

declare let Blob, Uint16Array, BigInt64Array, BigUint64Array;

const noMatch = function noMatch() {} as any;

// tslint:disable-next-line:naming-convention
const BlobCtor = typeof Blob !== "undefined" ? Blob : noMatch;

// tslint:disable-next-line:naming-convention
const BigInt64ArrayCtor: typeof Int8Array = typeof BigInt64Array !== "undefined" ? BigInt64Array : noMatch;

// tslint:disable-next-line:naming-convention
const BigUint64ArrayCtor: typeof Int8Array = typeof BigUint64Array !== "undefined" ? BigUint64Array : noMatch;

// tslint:disable-next-line:naming-convention
const BufferCtor: typeof Buffer = typeof Buffer !== "undefined" ? Buffer : noMatch;

interface BinaryInfo {
	size: number;
	data: BinaryDataType;
}

function getArrayDataType(x: object): BinaryDataType {
	const proto = Object.getPrototypeOf(x);
	switch (proto) {
		case Uint8Array.prototype:
			return "byte";
		case Int8Array.prototype:
			return "int8";
		case Int16Array.prototype:
			return "int16";
		case Int32Array.prototype:
			return "int32";
		case Uint16Array.prototype:
			return "uint16";
		case Uint32Array.prototype:
			return "uint32";
		case Float32Array.prototype:
			return "float32";
		case Float64Array.prototype:
			return "float64";
		case Uint8ClampedArray.prototype:
			return "byte";
		case BigUint64ArrayCtor?.prototype:
			return "uint64";
		case BigInt64ArrayCtor?.prototype:
			return "int64";
		default:
			return "byte";
	}
}

// tslint:disable-next-line:naming-convention
const TypedArray = Object.getPrototypeOf(Uint8Array.prototype).constructor;

function getBinInfo(obj): BinaryInfo | null {
	if (BlobCtor && obj instanceof BlobCtor) {
		return {
			size: obj.size,
			data: "byte"
		};
	} else if (obj instanceof ArrayBuffer) {
		return {
			size: obj.byteLength,
			data: "byte"
		};
	} else if (obj instanceof TypedArray) {
		return {
			size: obj.length,
			data: getArrayDataType(obj)
		};
	} else if (obj instanceof DataView) {
		return {
			size: obj.byteLength,
			data: "byte"
		};
	} else if (obj instanceof BufferCtor) {
		return {
			size: obj.length,
			data: "byte"
		};
	}
	return null;
}