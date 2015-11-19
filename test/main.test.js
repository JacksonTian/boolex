'use strict';

var expect = require('expect.js');

var boolex = require('../');

describe('boolex', function () {
  it('parse should ok', function () {
    var expr = "@count >= 10";
    var ast = boolex.parse(expr);

    expect(ast).to.eql({
      token: { tkcode: 11, spelling: '>=' },
      expr1: {
        token: { tkcode: 21, spelling: '@count' }
      },
      expr2: {
        token: { tkcode: 17, spelling: '10' }
      }
    });
  });

  it('compile should ok', function () {
    var expr = "@count >= 10";

    var check = boolex.compile(expr);

    expect(check({count: 10})).to.be(true);
    expect(check({count: 5})).to.be(false);
  });
});
