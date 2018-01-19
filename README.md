# Yamprint
[![](https://travis-ci.org/GregRos/yamprint.svg?branch=master)](https://travis-ci.org/GregRos/yamprint)
[![](https://codecov.io/gh/GregRos/yamprint/branch/master/graph/badge.svg)](https://codecov.io/gh/GregRos/yamprint)
[![](https://badge.fury.io/js/yamprint.svg )](https://www.npmjs.com/package/yamprint)

`yamprint` is yet another pretty-printing library, with output inspired by YAML syntax.

`yamprint` stringifies objects into a convenient syntax that allows you to easily inspect their properties. It is also highly customizable and supports printing many types of data.

Example output:
```
obj = 
  number = 123.45
  string = 'hello'
  boolean = false
  etc1 = null
  etc2 = undefined
  functionWithName = [function nameOfFunction]
  array = 
    ► anotherNumber = 123454
      symbol = Symbol(example)
    ► ► 'nested'
      ► 'array'
      ► ► 'even deeper'
  sparseArray = 
    (1) ► 'sparse'
    (10) ► 'array'
    (5000) ► 'with indexes and'
    'string' ► 'keys'
  thrownException = ‼ THREW EvenExceptionsAreOkay ‼
```

Example color output using [`yamprint-ansi-color`]((https://github.com/GregRos/yamprint-ansi-color)) (requires compatible terminal emulator) (may be outdated a little):
![](https://image.prntscr.com/image/KHZF_75WTH6zWJgwB-vXaQ.png)
## Features
1. Pretty
2. Both the object traversal and the printing are customizable in lots of ways.
3. Handles circular references, exceptions thrown by getters, etc.
4. Handles many kinds of scalar data types, including binary data types.
6. Can print all the non-symbol properties of an object. You set up rules that limit what's printed, with some sensible default ones already set.

## Usage
Import the `yamprint` function. This function is a default `Yamprinter` that lets you stringify objects:
```
import {yamprint} from 'yamprint';
```
You can stringify an object by call this as a function:
```
let string = yamprint({
    example : 1
});
```
The `yamprint` function has a method `create` that lets you create another `Yamprinter`. This accepts an `options` object as follows. Both of these (and the object) are optional:

    let yp = yamprint.create({
        formatter : new YamprintFormatter(), //a YamprintFormatter or a YamprintTheme
        rules : {
            //all kinds of rules that tell the yamprint how to print an object
        }
    });
```
let yp = yamprint.create({formatter : new YamprintFormatter()});
let yp = yamprint.create({formatter : Themes.regular}); //requires yamprint-ansi-color
```

## Customization
The library supports several levels of customization, depending on how far you want to go. Also, the code that traverses and object and the code that prints it are totally separate.

### Simple stuff

#### Basics
Yamprint uses a plug-in object called a `Formatter` which is separate from the rest of the code. This object generates certain kinds of texts, such as:

1. The text for property keys, array prefixes bullet points, scalar values like numbers.
2. The tag at the head of an object specifying its constructor.

The formatter doesn't change *what* is printed, but rather *how* it's printed.

You can take the existing formatter and extend it through inheritance, but you can also theme it. A theme is just an object with the same property names as the `Formatter`, each being a function of type `string => string` that gets applied on the result of the formatter.

They're mostly meant to allow coloring using ANSI styling and things like that. Here is an example of a theme. `chalk` is a package for ANSI styling. Every expression like `chalk.magenta` is a function that  takes in a plain string and returns a styled string.

    {
        symbol: chalk.magenta,
        regexp: chalk.hex('#6d872c'),
        boolean: chalk.hex("#2A00E8"),
        string: chalk.hex("#9b9b9b"),
        number: chalk.hex("786CB0"),
        date: chalk.blue,
        nul : chalk.red,
        undefined : chalk.red,
        threwAlert: chalk.hex("#000000").bgHex("#FE4949"),
        constructorTag: chalk.cyan,
        propertyKey: chalk.bold.hex("#000000"),
        sparseArrayIndex: chalk.blue,
        function : chalk.underline.hex("#5255e1"),
        circular: chalk.hex("#ffffff").bold.bgCyan
    }

####  Rules
When you create a custom `Yamprinter`, you can give it a `YamprintRules` object. It contains some rules about how objects should be traversed. These rules don't change *how* things are printed, but instead *what* things are printed.

The rules are meant to be pretty simple and allow for the most common kinds of customizations. Here are some things the rules can let you do (consult the API for more accurate information).

1. Ignore certain properties entirely, based on name, descriptor, and defining prototype.
2. Don't explore certain prototypes entirely, like `Object`.
3. Set limits about how deep you should go, how big an object can be, etc.

### More advanced stuff
If those things aren't enough, you can dig deeper into the library!

`yamprint` works by having a `YamprintGraphBuilder` object take an object, traverse it, and build a graph/diagram (this is where the `YamprintRules` go). Then `YamprintGraphPrinter` takes that graph and turns it into a string (this is where the `YamprintFormatter` goes).

You can import those objects and modify them too. This requires a bit of familiarity with the source code, but the source code is short and well-organized so it's not hard to do.

You can do things like:

1. Add custom formatting for your own scalar objects.
2. Skip certain properties based on arcane and mysterious criteria comprehensible only to you.
3. Tear the fabric of reality asunder.

## [`yamprint-ansi-color`](https://github.com/GregRos/yamprint-ansi-color)
This additional package defines an ANSI color theme for `yamprint`. It defines a single export called `Theme` that has different themes. Right now the only theme is `regular`.

This is how you use it:

    import {yamprint} from 'yamprint';
    import {Themes} from 'yamprint-ansi-color';
    let yp = yamprint.create(Themes.regular);