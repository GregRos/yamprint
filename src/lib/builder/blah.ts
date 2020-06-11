import {ScalarNode} from "../nodes/scalar";


export type KeyedItemType = "property" | "kvp" | "element"

export interface GenericKeyedValueInfo {
	readonly key: any;
	readonly type: KeyedItemType;
	readonly isEvaluated: boolean;
	readonly value: unknown;
	readonly owner: object;
}

export interface PropertyInfo extends GenericKeyedValueInfo {
	key: PropertyKey;
	type: "property";
}

export interface KvpInfo extends GenericKeyedValueInfo {
	readonly type: "kvp";
	readonly isEvaluated: true;
}

export interface ElementInfo {
	readonly type: "element";
	readonly key: number;
	readonly isEvaluated: true;
}

export type ObjectClassification =
	| "object"
	| "keyed-collection"
	| "keyless-collection";


export type SomeKeyedValueInfo = PropertyInfo | KvpInfo | ElementInfo;

export type ExploreAction = "skip" | "ref-only" | "explore";

export interface ExplorationRules {
	explore: {
		skipAdjacent: boolean;
		prototype(target: object, proto: object): boolean;
		property(target: object, info: SomeKeyedValueInfo): ExploreAction;
	};
	isKeyedCollection(target: object): boolean;
	max: {
		size: number;
		containmentDepth: number;
		protoDepth: number;
		flatLength: number;
	};

}
