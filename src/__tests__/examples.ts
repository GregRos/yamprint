
import {yamprint} from "../lib/yamprint";
let yamprinter = yamprint();
[
    true,
    false,
    null,
    undefined,
    "hi",
    Symbol("asdgfg"),
    () => {},
    function Test() {

    },
    new Error("blah"),
    3243214.4,
    {
        a : 1,
        b : 2,
        c : {
            a : "abc",
            boo : "1"
        },
        d : 56,
        e : {},
        f : new function NamedObject() {
            this.blah = 1234;
        }()
    },
    {},
    [1, 2, {
    a : 1,
        b : 2
    }]
].forEach(v => console.log(yamprinter(v)))