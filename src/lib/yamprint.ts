import {YamprintFormatter, YamprintTheme} from "./yamprint-formatter";
import {RecursiveGraphBuilder} from "./graph-builder";
import {GraphPrinter} from "./graph-printer";


export interface Yamprinter {
    /**
     * Returns a string representation of the object using yamprint.
     */
    (objToPrint : any) : string;
}

function create(formatterOrTheme ?: YamprintFormatter | YamprintTheme) {
    let formatter : YamprintFormatter;
    if (!formatterOrTheme) {
        formatter = new YamprintFormatter();
    } else if (formatterOrTheme instanceof YamprintFormatter) {
        formatter = formatterOrTheme;
    } else {
        formatter = new YamprintFormatter().theme(formatterOrTheme);
    }
    let builder = new RecursiveGraphBuilder({
        propertyFilter : (prop) => {
            return ["constructor", "arguments"].indexOf(prop.name) < 0 && !prop.name.startsWith("__") && !(prop.descriptor.value instanceof Function && prop.objectDepth > 0)
        },
        maxDepth : 10,
        maxObjectLength : 100,
        resolveGetters : false,
        isPrototypeExplorable : (proto) => {
            return [Error, Object, Function].indexOf(proto) < 0
        },
        getConstructor : (o : any) => o.constructor
    });

    let printer = new GraphPrinter(formatter);

    return (obj: any) => {
        let graph = builder.toGraph(obj);
        return printer.print(graph);
    }
}

let def = create();

export const yamprint = function Yamprint(obj : any) {
    return def(obj);
} as Yamprinter & {
    /**
     * Creates a new Yamprinter with the default formatter/theme.
     */
    create() : Yamprinter;
    /**
     * Creates a new Yamprinter with the given theme, using the default formatter.
     */
    create(theme : YamprintTheme) : Yamprinter;
    /**
     * Creates a new Yamprinter with the given formatter.
     */
    create(preferences : YamprintFormatter) : Yamprinter;
};
yamprint.create = create;




