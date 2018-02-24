import {yamprint} from "../../lib/yamprint";
import chalk = require("chalk");
import * as _ from "lodash";

/*tslint:disable no-construct */
function sparseArray(...pairs: [any, any][]): any[] {
    let arr = [];
    for (let [index, value] of pairs) {
        arr[index] = value;
    }
    return arr;
}

describe("automated tests", () => {

    let printNextToken = "";
    beforeEach(() => {
        if (printNextToken) {
            printNextToken = `▌ ${printNextToken.replace(/\n/gi, "\n▌ ")}`;
            console.info(chalk.gray(printNextToken));
            printNextToken = "";
        }
    });

    let printNext = v => {
        printNextToken = v;
        printNextToken = `\n▌ ${printNextToken.replace(/\n/gi, "\n▌ ")}`;
        console.info(chalk.gray(printNextToken));
        printNextToken = "";
    };
    describe("construct", () => {
        it("basic construct", () => {
            let yp = yamprint;
        });
    });

    let yp = yamprint.extend();

    describe("edge cases", () => {
        describe("circular ref", () => {

            it("depth-1", () => {
                let a = {} as any;
                a.x = a;
                let actual = yp(a);
                expect(actual).toMatch(/circular/gi);
                printNext(actual);
            });

            it("depth-2", () => {
                let a = {} as any;
                a.b = {
                    c: a
                };
                let actual = yp(a);
                expect(actual).toMatch(/circular/gi);
                printNext(actual);
            });

            it("doesn't think a duplicate object is a circular ref", () => {
                let x = {};
                let b = {
                    a: x,
                    b: x
                };
                let actual2 = yp(b);
                expect(actual2).not.toMatch(/circular/gi)
                printNext(actual2);
            });

            it("identical scalar values still get printed", () => {
                let date = new Date();
                let actual = yp({
                    a: date,
                    b: date
                });
                expect(actual).not.toMatch(/circular/gi);
                printNext(actual);
            });
        });

        it("null prototype object", () => {
            let x = Object.create(null);
            x.a = 123445;
            let actual = yp(x);
            expect(actual).toMatch(x.a + "");
            printNext(actual);
        });

        it("object with weird chars in key", () => {
            let weirdString = "a b c @ ∬ \0 ℳ: ש ב ג ";
            let actual = yp({
                [weirdString]: true
            });
            expect(actual).toMatch(weirdString);
            printNext(actual);
        });

        describe("scalar wrappers", () => {

            it("number", () => {
                let actual = yp(new Number(5));
                expect(actual).toBe("5");
                printNext(actual);
            });

            it("boolean", () => {
                let actual = yp(new Boolean(true));
                expect(actual).toBe("true");
                printNext(actual);
            });

            it("string", () => {

                let actual = yp(new String("hi"));
                expect(actual).toBe("'hi'");
                printNext(actual);
            });
        });

        it("nameless ctor prototype", () => {
            let x = new function () {
                this.x = 5;
            };
            let result = yp(x);
            expect(result).toMatch(/[\s\S]*x.*5/);
            printNext(result);
        });

        it("sparse array", () => {
            let arr = [];
            arr[2] = 2;
            arr[10] = 10;
            let result = yp(arr);
            expect(result).toMatch(/2.*2[\s\S]*10.*10/);
            printNext(result);
        });

        it("object with number keys", () => {
            let o = {
                1: "a",
                2: "b"
            };
            let result = yp(o);
            printNext(result);
            expect(result).toMatch(/1.*a[\s\S]*2.*b/);
        });

        it("ignore symbol keys", () => {
            let o = {
                x: 12,
                [Symbol.for("y")]: 34
            };
            let result = yp(o);
            expect(result).toMatch(/x.*12/);
            printNext(result);
        });


    });

    describe("with prototype", () => {
        let ExampleProto = function ExampleProto(props = {} as any) {
            Object.keys(props).forEach(k => this[k] = props[k]);
        };
        it("object prototype invisible with property", () => {
            let o = {a: 1};
            let result = yp(o);
            expect(result).not.toMatch("Object");
            printNext(result);
        });

        it("object prototype visible when empty", () => {
            let o = {};
            let result = yp(o);
            expect(result).toContain("");
            printNext(result);
        });

        it("named prototype when empty", () => {
            let result = yp(new ExampleProto());
            expect(result).toMatch("ExampleProto");
            printNext(result);
        });

        it("prototype tag when with property", () => {
            let result = yp(new ExampleProto({a: 1}));
            expect(result).toMatch("ExampleProto");
            expect(result).toMatch(/a.*1/);
            printNext(result);
        });

        it("error prototype", () => {
            class MyError extends Error {

            }

            let result = yp(new MyError("something"));
            printNext(result);
        })
    });

    describe("more complex objects", () => {

        it("nested depth-2", () => {
            let a = {
                b: {
                    c: {
                        d: 1
                    }
                }
            };
            let result = yp(a);
            expect(result).toMatch(/b[\s\S]*c[\s\S]*d[\s\S]*1/);
            printNext(result);
        });

        it("two properties with nested", () => {
            let a = {
                b: {
                    c: 1
                },
                d: {
                    e: 2
                }
            };
            let result = yp(a);
            expect(result).toMatch(/b[\s\S]*c[\s\S]*1[\s\S]*d[\s\S]*e[\s\S]*2/);
            printNext(result);
        });

        it("nested with two properties", () => {
            let a = {
                b: {
                    c: 1,
                    d: 2
                }
            };
            let result = yp(a);
            expect(result).toMatch(/b[\s\S]*c[\s\S]*1[\s\S]*d[\s\S]*2/);
            printNext(result);
        })
    });

    describe("with arrays", () => {
        it("empty array", () => {
            let result = yp([]);
            expect(result).toMatch(/\[\]/ig);
            printNext(result);
        });

        it("single element array", () => {
            let result = yp([1]);
            expect(result).toMatch(/. 1/);
            printNext(result);
        });

        it("multi element array", () => {
            let result = yp([1, true, "hi", {}]);
            expect(result).toMatch(/[\s\S]*1[\s\S]*true[\s\S]*'hi'/)
            printNext(result);
        });

        it("nested array", () => {
            let result = yp([[1, 2], [3, 4]]);

            expect(result).toMatch(/[\s\S]*1[\s\S]*2[\s\S]*3[\s\S]*4/);
            printNext(result);
        });

        it("array in property", () => {
            let result = yp({
                a: [1, 2],
                b: [3, 4]

            });

            expect(result).toMatch(/[\s\S]*a[\s\S]*1[\s\S]*2/)
            printNext(result);
        });

        it("object in array", () => {
            let result = yp([
                {a: 1},
                {b: 1}
            ]);
            printNext(result);
        });

        it("object in nested array", () => {
            let result = yp({
                a: [
                    {
                        b: [
                            {
                                c: 5
                            }
                        ],
                        d: 6
                    },
                    {
                        e: 11
                    }
                ],
                e: 7
            });

            printNext(result);
        })


    });


    describe("advanced prototypes", () => {
        describe("prototype tags", () => {
            function SimpleProto(ownProps = {}) {
                Object.keys(ownProps).forEach(k => this[k] = ownProps[k]);
            }

            it("simple protype tag", () => {
                let x = new SimpleProto({a: 1});
                let result = yp(x);
                expect(result).toMatch(/SimpleProto[\s\S]*a[\s\S]*1/);
                printNext(result);
            });

            it("nested prototype tag", () => {
                let x = new SimpleProto({b: 1});
                let result = yp({
                    a: x
                });
                expect(result).toMatch(/[\s\S]*a[\s\S]*SimpleProto[\s\S]*b[\s\S]*1/);
                printNext(result);
            });

            it("nested just prototype", () => {
                let x = new SimpleProto({});
                let result = yp({
                    a: x
                });
                expect(result).toMatch(/[\s\S]*a[\s\S]*SimpleProto/);
                printNext(result);
            });

            it("proto tag in array", () => {
                let x = [1, 2, 3].map(n => new SimpleProto({v: n}));
                let result = yp({
                    a: x
                });
                expect(result).toMatch(/([\s\S]*SimpleProto[\s\S]*v[\s\S]*\d){3}/);
                printNext(result);
            });

            it("props in prototypes", () => {
                let a = {
                    a: 1,
                    af: function () {
                    }
                };
                let b = Object.assign(Object.create(a), {
                    b: 2,
                    bf: function () {
                    }
                });
                let c = b = Object.assign(Object.create(b), {
                    c: 3,
                    cf: function cf() {
                    }
                } as any);
                let result = yp(c);
                printNext(result);
                expect(result).toMatch(/a.*1/);
                expect(result).toMatch(/b.*2/);
                expect(result).toMatch(/c.*3/);
                expect(result).toMatch("function cf");
                expect(result).not.toMatch(/(bf|af)/);
            });

            it("props in prototypes with classes", () => {
                class A {
                    a = 1;

                    af() {
                    }
                }

                class B extends A {
                    b = 2;

                    bf() {
                    }

                    get d() {
                        return 6;
                    }
                }

                class C extends B {
                    c = 3;

                    cf() {
                    }

                    get d() {
                        return 5;
                    }
                }


                let x = new C();

                let result = yp(x);

                printNext(result);
                expect(result).toMatch(/C/);
                expect(result).toMatch(/a.*1/);
                expect(result).toMatch(/b.*2/);
                expect(result).toMatch(/c.*3/);
                expect(result).toMatch(/d.*5/);
                expect(result).not.toMatch(/d.*6/);
                expect(result).not.toMatch(/(bf|af|cf)/);
            })
        })
    });

    describe("getter/setters", () => {
        it("object with getter only", () => {
            let o = {
                get a() {
                    return 1
                }
            };
            let result = yp(o);
            printNext(result);
            expect(result).toMatch(/a.*1/);

        });

        it("object with setter only", () => {
            let o = {};
            Object.defineProperty(o, "setter_only", {
                set(v) {

                },
                enumerable: true,
                configurable: true
            });
            o["setter_only"] = "a";
            let result = yp(o);
            printNext(result);
            //setter-only props create an undefined value there
            expect(result).toMatch(/setter_only.*undefined/gi);

        });

        it("getter throws exception", () => {
            class SpecialError extends Error {
                get name() {
                    return "SpecialError";
                }
            }

            let o = {
                a: {
                    get blah() {
                        throw new SpecialError();
                    }
                }
            };
            let result = yp(o);
            expect(result).toMatch(/a[\s\S]*blah.*THREW.*SpecialError/);
            printNext(result);
        })

    });

    class EvenExceptionsAreOkay extends Error {
        get name() {
            return this.constructor.name;
        }
    }

    let circ = {
        a: null
    };

    circ.a = circ;

    let arrCircular = {
        arr: []
    };

    class MeaningfulError extends Error {
        get specialInfo() {
            return 1235;
        }

        url = "http://www.google.com";

        time = new Date();
    }

    arrCircular.arr.push(arrCircular);
    arrCircular.arr.push(12355);
    let result = yp({
        obj: {
            number: 123.45,
            string: "hello",
            boolean: false,
            etc1: null,
            etc2: undefined,
            regexp: /(abc)+/,
            date: new Date(),
            circular: circ,
            arrCircular: arrCircular,
            multiLineText:
                `yamprint is yet another pretty-printing library, with output inspired by YAML syntax.
yamprint stringifies objects into a convenient syntax that allows you to easily inspect their properties. 
It is also highly customizable and supports printing many types of data.
It also supports stuff like word wrapping and has a special format that allows it pretty-print text or other data spanning several lines.`,
            withPrototype: new function ProtoName() {

            },
            withAnonPrototype: new function () {

            },
            withPrototypeAndKeys: new function OtherProtoName() {
                this.a = 2345;
                this.b = [];
                this.c = {};
            },
            error: new MeaningfulError("Blah!"),
            functionWithName: function nameOfFunction(arg1, arg2, arg = 5) {

            },
            array: [
                {
                    anotherNumber: 123454,
                    symbol: Symbol.for("example")
                },
                [
                    "nested",
                    "array",
                    [
                        "even deeper"
                    ]
                ]
            ],
            get thrownException() {
                throw new Error("asdf")
            },
            sparseArray: sparseArray([1, "sparse"], [10, "array"], [5000, "with indexes and"], ["string", "keys"])
        },

    });

    console.log(result);

    describe("big objects", () => {
        let yp = yamprint.extend({
            maxDepth: 3,
            maxObjectLength: 10
        });

        let getArr = () => {
            let arr = _.range(0, 13);
            return arr;
        };

        let getObj = (prefix, num) => {
            let wideObject = {};
            _.range(0, num).forEach(n => {
                wideObject[prefix + n] = `prop${n}`;
            });
            return wideObject;
        };

        it("trims an object with over 10 properties", () => {
            let wideObject = getObj("x", 13);
            let result = yp(wideObject);
            printNext(result);
            expect(result).toMatch(/size exceeded/);
            expect(result).not.toMatch(/x10/);
        });
        it("trims an array with over 10 items", () => {
            let arr = getArr();
            let result = yp(arr);
            printNext(result);
            expect(result).toMatch(/size exceeded/);
            expect(result).not.toMatch(/10/);
        });
        it("trims an array with 10 items at level 2", () => {
            let obj = {
                inner: {
                    arr: getArr()
                }
            };
            let result = yp(obj);
            printNext(result);
            expect(result).toMatch("inner");
            expect(result).toMatch("size exceeded");
            expect(result).not.toMatch("10");
        });
        it("doesn't count excluded properties.", () => {
            let yp2 = yp.extend(options => {
                return {
                    propertyFilter: prop => options.propertyFilter(prop) && !prop.name.startsWith("$")
                }
            });
            let obj = {
                inner: {
                    obj: {
                        ...getObj("$x", 10),
                        a1: 2,
                        a2: 3,
                        a3: 4
                    }
                }
            };
            let result = yp2(obj);
            printNext(result);
            expect(result).not.toContain("$");
            expect(result).not.toContain("size exceeded");
            expect(result).not.toContain("10");
        });

        it("stops at the 3rd level", () => {
            let obj = {
                a0: {
                    a1: {
                        a2: {
                            a3: "nope"
                        }
                    }
                }
            };
            let result = yp(obj);
            printNext(result);
            expect(result).not.toContain("nope");
            expect(result).toContain("a2");
            expect(result).not.toContain("a3");
        })

    });
});