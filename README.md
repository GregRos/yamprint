

# Yamprint
[![build](https://travis-ci.org/GregRos/yamprint.svg?branch=master)](https://travis-ci.org/GregRos/yamprint)
[![codecov](https://codecov.io/gh/GregRos/yamprint/branch/master/graph/badge.svg)](https://codecov.io/gh/GregRos/yamprint)
[![npm](https://badge.fury.io/js/yamprint.svg )](https://www.npmjs.com/package/yamprint)

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

Example color output using `yamprint-ansi-color` (requires compatible terminal emulator):
![](https://image.prntscr.com/image/KHZF_75WTH6zWJgwB-vXaQ.png)
## Usage
Import the `yamprint` function. This function is a default `Yamprinter` that lets you stringify objects:
```
import {yamprint} from 'yamprint';
```
You can stringify an object by:
```
let string = yamprint({
	example : 1
});
```
The `Yamprinter` function has a method `create` that lets you create another Yamprinter. You can supply a custom `YamprintFormatter` or `YamprintTheme` to this function in order to customize the output, including adding ANSI colors (see the screenshot above).
```
let yp = yamprint.create(new YamprintFormatter());
let yp = yamprint.create(Themes.regular); //requires yamprint-ansi-color
```

## Customizing the formatter
Themes decorate the output of the `YamprintFormatter`. Basically, a theme is an object that has methods with the same names as the methods of the `YamprintFormatter`. When you theme a formatter, you map the output of every method in the formatter using the functions defined in the theme.

In order to apply a theme on an existing formatter, call its `theme` method.

If you want more control over the output than just decorating the output of the default formatter, you'll have to define a custom formatter by inheriting from the `YamprintFormatter` class itself.

Here is an example of the regular ANSI color theme in the `yamprint-ansi-color` package. It makes use of the `chalk` package.

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

## `yamprint-ansi-color`
This additional package defines an ANSI color theme for `yamprint`. It defines a single export called `Theme` that has different themes. Right now the only theme is `regular`.

This is how you use it:

	import {yamprint} from 'yamprint';
	import {Themes} from 'yamprint-ansi-color';
	let yp = yamprint.create(Themes.regular);