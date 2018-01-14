import {BinaryScalar} from "./object-graph";

declare let Blob, ArrayBuffer, ArrayBufferView;
export interface BinaryTypeInfo {
    name : string;
    size : number;
}
/*
    Binary types are platform-local (i.e. DOM and Node can have different ones)
 */

export module BinaryTypeIdentifier {
    let constructors = {
        Blob: typeof Blob === "undefined" ? null : Blob,
        ArrayBuffer: typeof ArrayBuffer === "undefined" ? null : ArrayBuffer,
        ArrayBufferView: typeof ArrayBufferView === "undefined" ? null : ArrayBufferView,
        Buffer: typeof Buffer === "undefined" ? null : Buffer
    };

    let measures = {
        Blob: (x: any) => x.size,
        ArrayBuffer: (x: any) => x.length,
        ArrayBufferView: (x: any) => x.length,
        Buffer: (x: any) => x.length
    };

    export function getBinaryTypeInfo(binary: any) : BinaryTypeInfo | null {
        for (let k of Object.keys(constructors)) {
            let ctor = constructors[k];
            if (ctor && binary instanceof ctor) {
                let size = measures[k](binary);
                return new BinaryScalar(ctor.name, size);
            }
        }
        return null;
    }
}