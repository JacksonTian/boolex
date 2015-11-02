'use strict';

var expect = require('expect.js');

var Parser = require('../lib/parser');

var parse = function (source) {
  // console.log('------ source -------');
  // console.log(source);
  var parser = new Parser(source);
  parser.parse();
  // console.log('------ compiled -------');
  // console.log(parser.code);
  return parser.code;
};

describe('parser', function () {
  it('(@node == "v4.1.0") should ok', function () {
    var result = `// @node == 'v4.1.0'\nfunction (context) {\n  return context.node == 'v4.1.0';\n}\n`;
    expect(parse("@node == 'v4.1.0'")).to.be(result);
  });

  it('(@num != 0) should ok', function () {
    var result = `// @num != 0\nfunction (context) {\n  return context.num != 0;\n}\n`;
    expect(parse("@num != 0")).to.be(result);
  });

  it('(@num > 10) should ok', function () {
    var result = `// @num > 10\nfunction (context) {\n  return context.num > 10;\n}\n`;
    expect(parse("@num > 10")).to.be(result);
  });

  it('(@num >= 10) should ok', function () {
    var result = `// @num >= 10\nfunction (context) {\n  return context.num >= 10;\n}\n`;
    expect(parse("@num >= 10")).to.be(result);
  });

  it('(@count < 10) should ok', function () {
    var result = `// @count < 10\nfunction (context) {\n  return context.count < 10;\n}\n`;
    expect(parse("@count < 10")).to.be(result);
  });

  it('(@count <= 10) should ok', function () {
    var result = `// @count <= 10\nfunction (context) {\n  return context.count <= 10;\n}\n`;
    expect(parse("@count <= 10")).to.be(result);
  });

  it('(@message include "TypeError") should ok', function () {
    var result = `// @message include "TypeError"\nfunction (context) {\n  return ("" + context.message).indexOf("TypeError") !== -1;\n}\n`;
    expect(parse('@message include "TypeError"')).to.be(result);
  });

  it('(@num > 10 && @num < 20) should ok', function () {
    var result = `// @num > 10 && @num < 20\nfunction (context) {\n  return context.num > 10 && context.num < 20;\n}\n`;
    expect(parse("@num > 10 && @num < 20")).to.be(result);
  });

  it('(@num > 10 || @num < 20) should ok', function () {
    var result = `// @num > 10 || @num < 20\nfunction (context) {\n  return context.num > 10 || context.num < 20;\n}\n`;
    expect(parse("@num > 10 || @num < 20")).to.be(result);
  });

  it('(some => @node == \"v4.1.0\") should ok', function () {
    var result = `// some => @node == "v4.1.0"\nfunction (context) {\n  return Array.isArray(context) && context.some(function (context) {\n    return context.node == "v4.1.0";\n  });\n}\n`;
    expect(parse("some => @node == \"v4.1.0\"")).to.be(result);
  });

  it('(@count <= 10 && (@num == 10 || @num == 20)) should ok', function () {
    var result = `// @count <= 10 && (@num == 10 || @num == 20)\nfunction (context) {\n  return context.count <= 10 && (context.num == 10 || context.num == 20);\n}\n`;
    expect(parse("@count <= 10 && (@num == 10 || @num == 20)")).to.be(result);
  });
});
