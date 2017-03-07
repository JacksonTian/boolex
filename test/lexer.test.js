'use strict';

const expect = require('expect.js');

const Lexer = require('../lib/lexer');
const TokenCode = require('../lib/token_code');

const lex = function (source) {
  var lexer = new Lexer(source);
  lexer.getch();

  var tokens = [];
  do {
    lexer.getToken();
    tokens.push(lexer.token.spelling);
  } while (lexer.token.tkcode !== TokenCode.TK_EOF);

  return tokens;
};

describe('lexer', function () {
  it('(@node == "v4.1.0") should ok', function () {
    expect(lex("@node == 'v4.1.0'")).to.eql(['@node', '==', '\'v4.1.0\'', 'End_Of_File']);
    expect(lex("'v4.1.0' == @node")).to.eql(['\'v4.1.0\'', '==', '@node', 'End_Of_File']);
  });

  it('(@num != 0) should ok', function () {
    expect(lex('@num != 0')).to.eql(['@num', '!=', '0', 'End_Of_File']);
  });

  it('(@a != 0) should ok', function () {
    expect(lex('@a != 0')).to.eql(['@a', '!=', '0', 'End_Of_File']);
  });

  it('(@num != 0) should not ok', function () {
    expect(function () {
      lex('@num ! 0');
    }).to.throwException(/期待'='，但实际是' '/);
  });

  it('(@num > 10) should ok', function () {
    expect(lex('@num > 10')).to.eql(['@num', '>', '10', 'End_Of_File']);
  });

  it('(@num >= 10) should ok', function () {
    expect(lex('@num >= 10')).to.eql(['@num', '>=', '10', 'End_Of_File']);
  });

  it('(@count < 10) should ok', function () {
    expect(lex('@count < 10')).to.eql(['@count', '<', '10', 'End_Of_File']);
  });

  it('(@count <= 10) should ok', function () {
    expect(lex('@count <= 10')).to.eql(['@count', '<=', '10', 'End_Of_File']);
  });

  it('(@message include "TypeError") should ok', function () {
    expect(lex('@message include "TypeError"')).to.eql([
      '@message', 'include', '"TypeError"', 'End_Of_File']);
  });

  it('(@message include "TypeError) should not ok', function () {
    expect(function () {
      lex('@message include "TypeError');
    }).to.throwException(/未期望的结束/);
  });

  it('(@num > 10 && @num < 20) should ok', function () {
    expect(lex('@num > 10 && @num < 20')).to.eql([
      '@num', '>', '10', '&&', '@num', '<', '20', 'End_Of_File']);
  });

  it('(@num > 10 & @num < 20) should throw exception', function () {
    expect(function () {
      lex('@num > 10 & @num < 20');
    }).to.throwException(/期待'&'，但实际是' '/);
  });

  it('(@num > 10 || @num < 20) should ok', function () {
    expect(lex('@num > 10 || @num < 20')).to.eql([
      '@num', '>', '10', '||', '@num', '<', '20', 'End_Of_File']);
  });

  it('(@num > 10 | @num < 20) should throw exception', function () {
    expect(function () {
      lex('@num > 10 | @num < 20');
    }).to.throwException(/期待'|'，但实际是' '/);
  });

  it('(=> @node == \"v4.1.0\") should throw exception', function () {
    expect(function () {
      lex('=> @node == "v4.1.0"');
    }).to.throwException(/期待'='，但实际是'>'/);
  });

  it('(@count <= 10.1) should ok', function () {
    expect(lex('@count <= 10.1')).to.eql([
      '@count', '<=', '10.1', 'End_Of_File']);
  });

  it('(@count include "\"hehe") should ok', function () {
    expect(lex('@count include "\\\"hehe"')).to.eql([
      '@count', 'include', '"\\\"hehe"', 'End_Of_File']);
  });

  it('(@count + 10 > 5) should ok', function () {
    expect(lex('@count + 10 > 5')).to.eql([
      '@count', '+', '10', '>', '5', 'End_Of_File']);
  });

  it('(@count - 10 > 5) should ok', function () {
    expect(lex('@count - 10 > 5')).to.eql([
      '@count', '-', '10', '>', '5', 'End_Of_File']);
  });

  it('(@count * 10 > 5) should ok', function () {
    expect(lex('@count * 10 > 5')).to.eql([
      '@count', '*', '10', '>', '5', 'End_Of_File']);
  });

  it('(@count / 10 > 5) should ok', function () {
    expect(lex('@count / 10 > 5')).to.eql([
      '@count', '/', '10', '>', '5', 'End_Of_File']);
  });

  it('(@count % 10 > 5) should ok', function () {
    expect(lex('@count % 10 > 5')).to.eql([
      '@count', '%', '10', '>', '5', 'End_Of_File']);
  });

  it('(@used / @limit > 0.8) should ok', function () {
    expect(lex('@used / @limit > 0.8')).to.eql([
      '@used', '/', '@limit', '>', '0.8', 'End_Of_File']);
  });

  it('(@used && (@limit || 0.8)) should ok', function () {
    expect(lex('@used && (@limit || 0.8)')).to.eql([
      '@used', '&&', '(', '@limit', '||', '0.8', ')', 'End_Of_File']);
  });

  it('\\ escape should ok', function () {
    expect(lex(`"\\0\\a\\b\\t\\n\\v\\f\\r\\"\\'\\\\"`)).to.eql([
      `"\\0\\a\\b\\t\\n\\v\\f\\r\\"\\'\\\\"`, 'End_Of_File']);
    expect(lex(`"\\c"`)).to.eql([`"\\c"`, 'End_Of_File']);
  });
});
