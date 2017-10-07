
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
## Usage
Import the `yamprint` function:

```
import {yamprint} from 'yamprint';
```

You can stringify an object by:

```
let string = yamprint({
	example : 1
});
```

Alternatively, you can create a custom printer function using:

```
let yp = yamprint.create({
	//... options
});

let string = yp({example : 1});
```

The custom printer function lets you customize the way values of different types and different parts of the syntax are formatted/printed.

1. `scalarFormatter` - for formatting values such as stirings, numbers, etc. When the printer encounters an object, it will try to use this object to format it. This object should be of the class `ScalarFormatter` (you can `extend` it).
2. `keywordFormatter` -- an object of the type `KeywordFormatter`. Formats parts of syntax etc.

