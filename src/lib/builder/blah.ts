import {ScalarNode} from "../nodes/scalar";

export type ObjectClassification =
	| "object"
	| "keyed-collection"
	| "keyless-collection"
	| "primitive"
	| "binary"
	| "error"
	| "ref-only";

export interface PropertyInfo {
	type: "property";
	key: PropertyKey;
	owner: object;
	isGetter: boolean;
	value(): any;
}

export interface KeyInfo {
	type: "key";
	key: any;
	value: any;
	owner: object;
}

export interface ItemInfo {
	type: "item";

}

export interface PropertyInfo {
	key: PropertyKey;
	owner: object;
	value(): unknown | null | undefined;
	isGetter: boolean;
}


export type ExplorationType = "skip" | "display" | "explore";

export interface ExplorationRules {
	explore: {
		prototype(target: object, proto: object): boolean;
		property(target: object, info: PropertyInfo): boolean;
		element(target: object, info: ElementInfo): boolean;
	};
	tryParseScalar(target: unknown): ScalarNode;

	max: {
		size: number;
		containmentDepth: number;
		protoDepth: number;
		flatLength: number;
	};

}
