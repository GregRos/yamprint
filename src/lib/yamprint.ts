import {YamprintFormatter, YamprintTheme} from "./yamprint-formatter";
import {GraphBuilderRules as YamprintRules, YamprintGraphBuilder} from "./graph-builder";
import {YamprintGraphPrinter} from "./graph-printer";

export {YamprintRules};

export interface Yamprinter {
    /**
     * Returns a string representation of the object using the default yamprinter.
     */
    (objToPrint: any): string;

    extend(optionTransform ?: Partial<YamprintOptions> | ((options: YamprintOptions & {formatter : YamprintFormatter}) => Partial<YamprintOptions>)): Yamprinter;
}

export type YamprintOptions = YamprintRules & {
    formatter : YamprintFormatter | YamprintTheme
};


function defaultsDeep2<T>(base: any, ...objects: any[]) {
    if (!base) {
        base = {} as T;
    }
    for (let obj of objects) {
        if (!obj) continue;
        Object.getOwnPropertyNames(obj).forEach(name => {
            if (!(name in base) || base[name] == null) {
                base[name] = obj[name];
            } else if (typeof base[name] === "object") {
                let myProto = Object.getPrototypeOf(base[name]);
                if (myProto === Object.prototype) {
                    defaultsDeep2(base[name], obj[name]);
                }
            }
        });
    }
    return base;
}

function create(options ?: YamprintOptions & { formatter: YamprintFormatter }) {
    let options2 = defaultsDeep2({}, options) as any;
    let {formatter} = options2;
    let builder = new YamprintGraphBuilder(options2);
    let printer = new YamprintGraphPrinter(formatter);
    let yamprinter: any = (obj: any) => {
        let graph = builder.toGraph(obj);
        return printer.print(graph);
    };

    yamprinter.extend = function (optionsSource: ((options: YamprintOptions & { formatter: YamprintFormatter }) => YamprintOptions) | YamprintOptions) {
        let newOptions: YamprintOptions;
        if (optionsSource instanceof Function) {
            newOptions = optionsSource(options);
            newOptions = defaultsDeep2({}, newOptions, options);
        } else {
            newOptions = defaultsDeep2({}, optionsSource, options);
        }
        if (!(newOptions.formatter instanceof YamprintFormatter)) {
            newOptions.formatter = options.formatter.theme(newOptions.formatter);
        }
        return create(newOptions as YamprintOptions & { formatter: YamprintFormatter });
    };

    return yamprinter as Yamprinter;
}

export const yamprint = create({
    formatter: new YamprintFormatter(),
    propertyFilter: (prop) => {
        return ["constructor", "arguments", "prototype"].indexOf(prop.name) < 0 && !prop.name.startsWith("__") && !(prop.descriptor.value instanceof Function && prop.objectDepth > 0)
    },
    maxDepth: 10,
    maxObjectLength: 50,
    resolveGetters: true,
    isPrototypeExplorable: (proto) => {
        return [Error, Object, Function].map(x => x.prototype).indexOf(proto) < 0
    },
    getConstructor: (o: any) => o.constructor
});





