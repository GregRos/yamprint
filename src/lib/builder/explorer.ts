import {ExplorationRules} from "./blah";
import {Node} from "../nodes";
import {ComplexNode} from "../nodes/vector";
import {ReferenceOnlyScalar} from "../nodes/scalar";

export class ObjectGraphBuilder {
	private _adjacent: Map<object, ComplexNode>;
	private _parents: Map<object, ComplexNode>;
	private _refCounter = 1;
	constructor(private _rules: ExplorationRules) {

	}

	private _getRef() {
		return this._refCounter++;
	}

	build(target: object) {
		const {_parents, _adjacent, _rules} = this;
		const existingParent = _parents.get(target);
		if (existingParent) {
			if (!existingParent.ref) {
				existingParent.ref = this._getRef();
			}
			return new ReferenceOnlyScalar(target, "circular", existingParent.ref);
		}
		const existingAdjacent = _adjacent.get(target);
		if (existingAdjacent && _rules.explore.skipAdjacentObjects) {
			if (!existingAdjacent.ref) {
				existingAdjacent.ref = this._getRef();
			}
			return new ReferenceOnlyScalar(target, "adjacent", existingAdjacent.ref);
		}
		const ref = existingAdjacent?.ref;
		const canExplore = _rules.explore.
	}
}