
import {yamprint} from "../lib/yamprint";

[
    true,
    false,
    null,
    undefined,
    "hi",
    3243214.4,
    {
        a : 1,
        b : 2,
        c : {
            a : "abc",
            boo : "1"
        }
    },
    [1, 2, {
    a : 1,
        b : 2
    }]
].forEach(v => console.log(yamprint(v)))