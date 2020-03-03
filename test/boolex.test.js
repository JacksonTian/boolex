'use strict';

const expect = require('expect.js');

const boolex = require('../');

describe('boolex', function () {
  it('parse ast should ok', function () {
    var expr = '@count >= 10';
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

  it('(@node == "v4.1.0") should ok', function () {
    var fn = boolex.compile("@node == 'v4.1.0'");
    expect(fn({node: 'v4.1.0'})).to.be(true);
    expect(fn({node: 'v4.1.1'})).to.be(false);
  });

  it('(@num != 0) should ok', function () {
    var fn = boolex.compile('@num != 0');
    expect(fn({num: 1})).to.be(true);
    expect(fn({num: 0})).to.be(false);
  });

  it('(@num > 10) should ok', function () {
    var fn = boolex.compile('@num > 10');
    expect(fn({num: 11})).to.be(true);
    expect(fn({num: 5})).to.be(false);
  });

  it('(@num >= 10) should ok', function () {
    var fn = boolex.compile('@num >= 10');
    expect(fn({num: 10})).to.be(true);
    expect(fn({num: 5})).to.be(false);
  });

  it('(@count < 10) should ok', function () {
    var fn = boolex.compile('@count < 10');
    expect(fn({count: 5})).to.be(true);
    expect(fn({count: 10})).to.be(false);
  });

  it('(@count <= 10) should ok', function () {
    var fn = boolex.compile('@count <= 10');
    expect(fn({count: 10})).to.be(true);
    expect(fn({count: 11})).to.be(false);
  });

  it('(@message include "TypeError") should ok', function () {
    var fn = boolex.compile('(@message include "TypeError")');
    expect(fn({message: 'TypeError should ok'})).to.be(true);
    expect(fn({message: 'foo'})).to.be(false);
  });

  it('(@message include "TypeError") should ok', function () {
    var fn = boolex.compile('@message include "TypeError"');
    expect(fn({message: 'TypeError should ok'})).to.be(true);
    expect(fn({message: 'foo'})).to.be(false);
  });

  it('((@message include "TypeError") != true) should ok', function () {
    var fn = boolex.compile('((@message include "TypeError")) != true');
    console.log(fn.toString());
    expect(fn({message: 'TypeError should ok'})).to.be(false);
    expect(fn({message: 'foo'})).to.be(true);
  });

  it('(@num > 10 && @num < 20) should ok', function () {
    var fn = boolex.compile('@num > 10 && @num < 20');
    expect(fn({num: 11})).to.be(true);
    expect(fn({num: 1})).to.be(false);
  });

  it('(@num > 10 || @num < 5) should ok', function () {
    var fn = boolex.compile('@num > 10 || @num < 5');
    expect(fn({num: 3})).to.be(true);
    expect(fn({num: 11})).to.be(true);
    expect(fn({num: 6})).to.be(false);
  });

  it('(@count <= 10 && (@num == 10 || @num == 20)) should ok', function () {
    var fn = boolex.compile('@count <= 10 && (@num == 15 || @num == 20)');
    expect(fn({num: 15, count: 10})).to.be(true);
    expect(fn({num: 15, count: 15})).to.be(false);
  });

  it('(@count + 1 <= 10) should ok', function () {
    var fn = boolex.compile('@count + 1 <= 10');
    expect(fn({count: 5})).to.be(true);
    expect(fn({count: 10})).to.be(false);
  });

  it('(@count - 1 <= 10) should ok', function () {
    var fn = boolex.compile('@count - 1 <= 10');
    expect(fn({count: 5})).to.be(true);
    expect(fn({count: 15})).to.be(false);
  });

  it('(@count * 1 <= 10) should ok', function () {
    var fn = boolex.compile('@count * 1 <= 10');
    expect(fn({count: 5})).to.be(true);
    expect(fn({count: 15})).to.be(false);
  });

  it('(@count / 1 <= 10) should ok', function () {
    var fn = boolex.compile('@count / 1 <= 10');
    expect(fn({count: 5})).to.be(true);
    expect(fn({count: 15})).to.be(false);
  });

  it('(@count % 1 <= 10) should ok', function () {
    var fn = boolex.compile('@count % 2 == 1');
    expect(fn({count: 5})).to.be(true);
    expect(fn({count: 6})).to.be(false);
  });

  it('(@count1 + @count2) * 2 == 22 should ok', function () {
    var fn = boolex.compile('(@count1 + @count2) * 2 == 22');
    expect(fn({count1: 5, count2: 6})).to.be(true);
    expect(fn({count1: 5, count2: 5})).to.be(false);
  });
});
