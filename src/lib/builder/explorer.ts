import {ElementInfo, ExplorationRules, KvpInfo, ObjectClassification} from "./blah";
import {Node, RefNode} from "../nodes";
import {ComplexNode} from "../nodes/vector";
import {
	BinaryScalar,
	LengthExceededScalar,
	PrimitiveScalar,
	PrimitiveString,
	RefOnlyNode
} from "../nodes/scalar";
import {getBinInfo} from "./special-scalar-identifiers";

export class ObjectGraphBuilder {
	private _adjacent: Map<object, RefNode>;
	private _parents: Map<object, ComplexNode>;
	private _refCounter = 1;
	private _approxWeight = 0;
	constructor(private _rules: ExplorationRules) {

	}

	private _getRef() {
		return this._refCounter++;
	}

	_getRefFor(target: any) {

	}

	_collection(target: any, maxWeight: number) {
		const {_parents, _adjacent, _rules} = this;
		const curWeight = 0;
		const isKeyed = _rules.isKeyedCollection(target);
		let obj = {
			isEvaluated: true,
			key: null as any,
			owner: target,
			type: isKeyed ? "kvp" : "element",
			value: null as any
		}
		let i = 0;
		const children = [] as Node[];
		for (let x of target) {
			if (curWeight >= maxWeight) {
				children.push(new LengthExceededScalar())
			}
			if (isKeyed) {
				obj.key = x[0];
				obj.value = x[1];
			} else {
				obj.key = i;
				obj.value = x;
			}
			const action = _rules.explore.property(target, obj as KvpInfo);
			if (action === "ref-only") {
				const stubNode = this._scalarOrReferenceOnly(target, true)!;
				if ("ref" in stubNode) {
					_adjacent.set(target, stubNode);
				}
			} else if (action === "skip") {
				continue;
			}
		}
	}

	_scalarOrReferenceOnly(target: any, forceReturn = false): Node | null {
		const {_parents, _adjacent, _rules} = this;
		let ref: number|undefined;
		if (typeof target === "string") return new PrimitiveString(target);
		if (typeof target !== "object" || target == null) return new PrimitiveScalar(target);
		const binInfo = getBinInfo(target);
		if (binInfo) {
			return new BinaryScalar(target as object, binInfo);
		}
		const existingParent = _parents.get(target);
		if (existingParent) {
			if (!existingParent.ref) {
				existingParent.ref = this._getRef();
			}
			return new RefOnlyNode(target, "circular", existingParent.ref);
		}
		const existingAdjacent = _adjacent.get(target);
		if (existingAdjacent) {
			if (!existingAdjacent.ref) {
				existingAdjacent.ref = this._getRef();
			}
			if (_rules.explore.skipAdjacent) {
				return new RefOnlyNode(target, "adjacent", existingAdjacent.ref);
			}
		}
		ref = existingAdjacent?.ref ?? this._getRef();

		return forceReturn ? new RefOnlyNode(target, "unevaluated", ref) : null;
	}

	build(target: any, maxWeight: number) {

		const iterator = target[Symbol.iterator];
		if (iterator) {
			return this._collection(target, maxWeight);
		}

	}
}