# Bool Expression

A DSL for Bool judge

- [![Build Status](https://secure.travis-ci.org/JacksonTian/boolex.png)](http://travis-ci.org/JacksonTian/boolex)
- [![NPM version](https://badge.fury.io/js/boolex.png)](http://badge.fury.io/js/boolex)
- [![Dependencies Status](https://david-dm.org/JacksonTian/boolex.png)](https://david-dm.org/JacksonTian/boolex)
- [![Coverage Status](https://coveralls.io/repos/JacksonTian/boolex/badge.png)](https://coveralls.io/r/JacksonTian/boolex)

[![NPM](https://nodei.co/npm/boolex.png?downloads=true&stars=true)](https://nodei.co/npm/boolex)

## BNF

```
// E = E || E
// E = E && E
// E = => E
// E = e >= e
// E = e <= e
// E = e == e
// E = e != e
// E = e > e
// E = e < e
// E = e include e
// e = '@'+xxx
// e = number
// e = 'string'
// e = "string"
// e = (E)
```

## Usage
Install with npm:

```sh
$ npm install boolex --save
```

Script with boolex:

```
var boolex = require('boolex');
var vm = require('vm');

var expr = "@count >= 10";

var code = boolex.parse(expr);
// get function with vm
var check = vm.runInThisContext(code);

var result = check({count: 10});
// => result is true
var result = check({count: 5});
// => result is false
```
## License
The MIT license
