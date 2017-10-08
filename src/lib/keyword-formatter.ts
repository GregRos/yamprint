import {PostTransform} from "./yamprint";

export interface KeywordFormatSpecifier {
    propertyKey: (key: string) => string;
    constructorTag: (ctor: string, hasKeys: boolean) => string;
    arrayPrefix: string
    indent: string;
    threwAlert : (error : any) => string;
    sparseArrayIndex : (index : number | string) => string;
}

export type KeywordFormatterPostTransforms = {
    [K in keyof KeywordFormatSpecifier] : PostTransform;
    }

export class KeywordFormatter implements KeywordFormatSpecifier {
    propertyKey(key: string) {
        key = /[^a-zA-Z0-9_$]/.test(key) ? `'${key}'` : key;
        return `${key} = `;
    }

    constructorTag(instance: any, hasKeys: boolean) {
        let line = "";
        if (instance instanceof Function) {
            line = "function";
            if (instance.name) {
                line += " " + instance.name;
            }
        }
        else if (instance instanceof Error) {
            line = instance.name || "Error";
            if (instance.message) {
                line += " - " + instance.message;
            }
        }
        else {
            let ctor = instance.constructor;
            if (ctor === Object || !ctor) {
                return hasKeys ? "" : "[Object]";
            }
            line = instance.constructor && instance.constructor.name;
        }
        return line && `[${line}]` || "";
    };

    sparseArrayIndex(ix : number | string) {
        return !Number.isNaN(+ix) ? `(${ix}) ` : `'${ix}' `;
    }


    threwAlert(err : any) {
        let line = "THREW";
        if (!(err instanceof Error)) {
            line += " " + (err  && err.toString || Object.prototype.toString).call(err);
        }
        else {
            if (err.name) {
                line += " " + err.name;
            } else if (err.constructor && err.constructor.name) {
                line += `${err.constructor.name}`;
            } else {
                line += " Error";
            }
        }
        return `‼ ${line} ‼`;
    }
    circular = "~Circular~";
    arrayPrefix = "► ";
    indent = "  ";
}
