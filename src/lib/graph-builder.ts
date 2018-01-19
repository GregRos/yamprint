import {
    ArrayNode, BinaryScalar, CircularReferenceScalar, DepthExceededScalar, EmptyArrayScalar, EmptyObjectScalar, Node,
    NodeBase, ObjectNode,
    PropertyItem,
    SparseArrayNode, TextBlockScalar, ThrewErrorScalar, UnresolvedGetterScalar
} from "./object-graph";
import {BinaryTypeIdentifier} from "./binary-type-identifier";


export interface PropertyInfo {
    name : string;
    descriptor : PropertyDescriptor;
    owner : object;
    objectDepth : number;
    treeDepth : number;
}

export interface GraphBuilderRules {
    maxDepth : number;
    maxObjectLength : number;
    resolveGetters : boolean;
    propertyFilter : (info : PropertyInfo) => boolean;
    isPrototypeExplorable : (proto : any) => boolean;
    getConstructor(obj : any) : Function;
}

const circularReferenceScalar = new CircularReferenceScalar();
const emptyArrayScalar = new EmptyArrayScalar();
const notScalar = {};

export class YamprintGraphBuilder {
    private _knownNodes = new Set<any>();
    private _currentDepth = -1;
    constructor(private _rules : GraphBuilderRules){

    }

    /**
     * Takes an object and tries to identify it as a scalar. Returns a `Node` (could be a literal) if it was successful, or `null` if not.
     *
     * If you want to add more scalar types, you should do it here.
     * @param value
     * @returns {Node}
     * @private
     */
    protected _tryBuildScalar(value : any) {
        if (value == null) return value;
        if ([String, Number, Boolean, Symbol, Function].some(ctor => value instanceof ctor)) {
            value = value.valueOf();
        }
        if (typeof value === "string") {
            let lines = value.split(/(?:\r\n|\r|\n)/);
            if (lines.length === 1) return value;
            return new TextBlockScalar(lines);
        }

        if (typeof value !== "object") return value;

        if ([Date, RegExp].find(ctor => value instanceof ctor)) {
            return value;
        }

        let bt = BinaryTypeIdentifier.getBinaryTypeInfo(value);
        if (bt) return new BinaryScalar(bt.name, bt.size);
        return notScalar;
    }

    protected _readObjectProprties(instance : object) {
        if (this._rules.maxDepth <= this._currentDepth) {
            return new EmptyObjectScalar(this._rules.getConstructor(instance)).withMetadata({
                depthExceeded : true
            });
        }
        let resolveKey = (key : string) => {
            try {
                var value = instance[key]
            } catch (err) {
                return new ThrewErrorScalar(err);
            }
            return this._toGraph(value);
        };

        let allProperties = new Map<string, PropertyInfo>();
        let reachedMaxProperties = false;
        let registerAllKeys = (definingObject : any, objectDepth : number) => {
            let names = Object.getOwnPropertyNames(definingObject);

            for (let name of names) {
                //when there is an overriden property on the prototype
                if (allProperties.has(name)) continue;
                if (allProperties.size >= this._rules.maxObjectLength) {
                    reachedMaxProperties = true;
                    return;
                }
                allProperties.set(name, {
                    name: name,
                    descriptor: Object.getOwnPropertyDescriptor(definingObject, name),
                    owner: definingObject,
                    treeDepth : this._currentDepth,
                    objectDepth : objectDepth
                } as PropertyInfo);
            }

            let proto = Object.getPrototypeOf(definingObject);
            if (proto && this._rules.isPrototypeExplorable(proto)) {
                registerAllKeys(proto, objectDepth + 1);
            }
        };

        registerAllKeys(instance, 0);

        let properties = [] as PropertyItem[];
        for (let [name, property] of allProperties) {
            let result = this._rules.propertyFilter(property);
            if (!result) continue;
            if (property.descriptor.get && !this._rules.resolveGetters) {
                properties.push({
                    name : name,
                    value : new UnresolvedGetterScalar()
                })
            }
            else if (result === true) {
                properties.push({
                    name: name,
                    value: resolveKey(name)
                });
            }
        }
        if (properties.length === 0) {
            return new EmptyObjectScalar(this._rules.getConstructor(instance));
        }
        return new ObjectNode(this._rules.getConstructor(instance), properties).withMetadata({
            sizeExceeded : reachedMaxProperties
        });
    }

    protected _readArray(value : Array<any>) {
        let lastIndex = -1;
        let isSparse = value.some((x, index) => {
            if (index !== lastIndex + 1) return true;
            lastIndex++;
            return false;
        });

        if (isSparse) {
            let keys = Object.keys(value);
            let maxSizeReached = false;

            let propertyItems = [] as PropertyItem[];
            for (let key of keys) {
                if (isNaN(+key)) continue;
                if (propertyItems.length >= this._rules.maxObjectLength) {
                    maxSizeReached = true;
                    break;
                }
                let innerValue = this._toGraph(value[key]);
                propertyItems.push(new PropertyItem(key,  innerValue));
            }
            return new SparseArrayNode(propertyItems).withMetadata({
                sizeExceeded : maxSizeReached
            });
        } else if (lastIndex === -1) {
            return emptyArrayScalar;
        }
        else  {
            let maxSizeReached = false;
            let graphItems = [];
            for (let item of value) {
                if (graphItems.length >= this._rules.maxObjectLength) {
                    maxSizeReached = true;
                    break;
                }
                graphItems.push(this._toGraph(item));
            }
            return new ArrayNode(graphItems).withMetadata({
                sizeExceeded : maxSizeReached
            });
        }
    }

    protected _toGraph(instance : any) {
        this._currentDepth++;
        let result : any;
        let scalar = this._tryBuildScalar(instance);
        if (scalar !== notScalar) {
            result = scalar;
        } else if (this._knownNodes.has(instance)) {
            result = circularReferenceScalar;
        } else {
            this._knownNodes.add(instance);
            if (Array.isArray(instance)) {
                result = this._readArray(instance);
            } else {
                result = this._readObjectProprties(instance);
            }
            this._knownNodes.delete(instance);
        }
        this._currentDepth--;
        return result;
    }

    toGraph(instance : any) {
        try {
            return this._toGraph(instance);
        }
        finally {
            //even if GraphBuilder errors, we need to restore its neutral state so it doesn't get totally broken.
            this._currentDepth = -1;
            this._knownNodes.clear();
        }
    }
}