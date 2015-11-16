# Bool Expression

A DSL for Bool judge

## BNF

```
// E = (E)
// E = E && E
// E = E || E
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
