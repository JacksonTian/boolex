'use strict';

var expect = require('expect.js');

var boolex = require('../');
var vm = require('vm');

describe('boolex', function () {
  it('parse should ok', function () {
    var expr = "@count >= 10";
    var code = boolex.parse(expr);
    // get function with vm
    var check = vm.runInThisContext(code);

    expect(check({count: 10})).to.be(true);
    expect(check({count: 5})).to.be(false);
  });

  it('compile should ok', function () {
    var expr = "@count >= 10";

    var check = boolex.compile(expr);

    expect(check({count: 10})).to.be(true);
    expect(check({count: 5})).to.be(false);
  });
});
