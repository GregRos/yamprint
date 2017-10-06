import {yamprint} from "../../lib/yamprint";
import chalk = require('chalk');

describe("automated tests", () => {

    let _printNext = "";
    beforeEach(() => {
        if (_printNext) {
            _printNext = "▌ " + _printNext.replace(/\n/gi, "\n▌ ");
            console.info(chalk.gray(_printNext));
            _printNext = "";
        }
    });

    let printNext = v => {
        _printNext = v;
        _printNext = "\n▌ " + _printNext.replace(/\n/gi, "\n▌ ");
        console.info(chalk.gray(_printNext));
        _printNext = "";
    };
    describe("construct", () => {
        it("basic construct", () => {
            let yp = yamprint();
        });
    });

    let yp = yamprint();

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
            let x = new function() {
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

        it("array turned object", () => {
            let arr = [1, 5, 10];
            arr["a"] = 20;
            let result = yp(arr);
            printNext(result);
            expect(result).toMatch(/a.*20/);

        });

        it("object with number keys", () => {
            let o = {
                1 : "a",
                2 : "b"
            };
            let result = yp(o);
            printNext(result);
            expect(result).toMatch(/1.*a[\s\S]*2.*b/);
        });

        it("ignore symbol keys", () => {
            let o = {
                x : 12,
                [Symbol.for("y")] : 34
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
            expect(result).toBe("[Object]");
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
            expect(result).toMatch(/[\s\S]*1[\s\S]*true[\s\S]*'hi'[\s\S]*Object/)
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
                        d : 6
                    },
                    {
                        e : 11
                    }
                ],
                e : 7
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
                let x = new SimpleProto({a : 1});
                let result = yp(x);
                expect(result).toMatch(/SimpleProto[\s\S]*a[\s\S]*1/);
                printNext(result);
            });

            it("nested prototype tag", () => {
                let x = new SimpleProto({b : 1});
                let result = yp({
                    a : x
                });
                expect(result).toMatch(/[\s\S]*a[\s\S]*SimpleProto[\s\S]*b[\s\S]*1/);
                printNext(result);
            });

            it("nested just prototype", () => {
                let x = new SimpleProto({});
                let result = yp({
                    a : x
                });
                expect(result).toMatch(/[\s\S]*a[\s\S]*SimpleProto/);
                printNext(result);
            });

            it("proto tag in array", () => {
                let x = [1, 2, 3].map(n => new SimpleProto({v : n}));
                let result = yp({
                    a : x
                });
                expect(result).toMatch(/([\s\S]*SimpleProto[\s\S]*v[\s\S]*\d){3}/);
                printNext(result);
            });

            it("props in prototypes", () => {
                let a = {
                    a : 1,
                    af : function() {}
                };
                let b = Object.assign(Object.create(a), {
                    b : 2,
                    bf : function() {}
                });
                let c = b = Object.assign(Object.create(b), {
                    c : 3,
                    cf : function cf() {}
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
                    af() {}
                }

                class B extends A {
                    b = 2;
                    bf() {}
                }

                class C extends B {
                    c = 3;
                    cf() {}
                }

                let x = new C();

                let result = yp(x);

                printNext(result);
                expect(result).toMatch(/\[C]/);
                expect(result).toMatch(/a.*1/);
                expect(result).toMatch(/b.*2/);
                expect(result).toMatch(/c.*3/);
                expect(result).not.toMatch(/(bf|af|cf)/);
            })
        })
    });

    describe("getter/setters", () => {
        it("object with getter only", () => {
            let o = {
                get a() {return 1}
            };
            let result = yp(o);
            printNext(result);
            expect(result).toMatch(/a.*1/);

        });

        it("object with setter only", () => {
            let o = {
            };
            Object.defineProperty(o, "setter_only", {
                set(v) {

                },
                enumerable : true,
                configurable : true
            });
            o["setter_only"] = "a";
            let result = yp(o);
            printNext(result);
            //setter-only props create an undefined value there
            expect(result).toMatch(/setter_only.*undefined/gi);

        });

        it("getter throws exception", () => {
            class SpecialError extends Error {
                get name(){
                    return "SpecialError";
                }
            }
            let o = {
                a : {
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
    it("", () => {
    });
});