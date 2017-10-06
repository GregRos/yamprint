# Yamprint
[![build](https://travis-ci.org/GregRos/yamprint.svg?branch=master)](https://travis-ci.org/GregRos/yamprint)
[![codecov](https://codecov.io/gh/GregRos/yamprint/branch/master/graph/badge.svg)](https://codecov.io/gh/GregRos/yamprint)
[![npm](https://badge.fury.io/js/yamprint.svg )](https://www.npmjs.com/package/yamprint)

`yamprint` is yet another pretty-printing library, inspired by YAML syntax. Yamprint stringifies objects into an elegant, easily navigable format that can be printed to console or to a log file.

Example output:

	obj = 
	  number = 123.45
	  string = 'hello'
	  boolean = false
	  etc1 = null
	  etc2 = undefined
	  functionWithName = [function nameOfFunction]
	  array = 
		▸ anotherNumber = 123454
		  symbol = Symbol(example)
		▸ ▸ 'nested'
		  ▸ 'array'
		  ▸ ▸ 'even deeper'
	  sparseArray = 
		(1) ▸ 'sparse'
		(10) ▸ 'array'
		(5000) ▸ 'with indexes and'
		'string' ▸ 'keys'
	  thrownException = !!! THREW EvenExceptionsAreOkay !!!
