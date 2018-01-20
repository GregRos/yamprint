import {YamprintFormatter, YamprintTheme} from "./yamprint-formatter";
import {GraphBuilderRules as YamprintRules, YamprintGraphBuilder} from "./graph-builder";
import {YamprintGraphPrinter} from "./graph-printer";
import defaultsDeep = require("lodash/defaultsDeep");

export {YamprintRules};

export interface Yamprinter {
    /**
     * Returns a string representation of the object using the default yamprinter.
     */
    (objToPrint : any) : string;
}

export interface YamprintOptions {
    formatter ?: YamprintFormatter | YamprintTheme;
    rules ?: Partial<YamprintRules>;
}

function create(options ?:  YamprintOptions) {
    options = options || {};
    let {formatter, rules} = defaultsDeep({}, options, yamprint.defaults);
    if (!(formatter instanceof YamprintFormatter)) {
        formatter = yamprint.defaults.formatter.theme(formatter);
    }

    let builder = new YamprintGraphBuilder(rules);
    let printer = new YamprintGraphPrinter(formatter);

    return (obj: any) => {
        let graph = builder.toGraph(obj);
        return printer.print(graph);
    }
}

let yamprinter : Yamprinter;

export const yamprint = function Yamprint(obj : any) {
    if (!yamprinter) {
        yamprinter = create();
    }
    return yamprinter(obj);
} as Yamprinter & {
    /**
     * Creates a new Yamprinter.
     */
    create(options ?: YamprintOptions) : Yamprinter;

    defaults : {
        rules : YamprintRules;
        formatter : YamprintFormatter;
    }
};
yamprint.create = create;
yamprint.defaults = {
    formatter : new YamprintFormatter(),
    rules : {
        propertyFilter : (prop) => {
            return ["constructor", "arguments", "prototype"].indexOf(prop.name) < 0 && !prop.name.startsWith("__") && !(prop.descriptor.value instanceof Function && prop.objectDepth > 0)
        },
        maxDepth : 10,
        maxObjectLength : 50,
        resolveGetters : true,
        isPrototypeExplorable : (proto) => {
            return [Error, Object, Function].indexOf(proto) < 0
        },
        getConstructor : (o : any) => o.constructor
    }
};





