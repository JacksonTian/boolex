'use strict';

var Lexer = require('./lexer');
var e_TokenCode = Lexer.e_TokenCode;
var Node = require('./node');

var Parser = function (source) {
  this.lexer = new Lexer(source);
  this.lexer.getch(); // read a char from source code
  this.code = '';
  this.level = 0;
  this.ast = null;
  Object.defineProperty(this, 'token', {
    get: function() { return this.lexer.token; }
  });
};

Parser.prototype.getToken = function () {
  this.lexer.getToken();
};

/***********************************************************
 * 功能:  跳过单词v,取下一单词,如果当前单词不是v,提示错误
 * v:   单词编号
 **********************************************************/
Parser.prototype.skip = function (v) {
  if (this.token.tkcode !== v) {
    throw new Error("缺少" + this.token.spelling);
  }
  this.getToken();
};

/***********************************************************
 * 功能:  解析翻译单位
 *
 *  <bool>::={E}<TK_EOF>
 **********************************************************/
Parser.prototype.bool = function () {
  var x = this.join();

  while (this.token.tkcode === e_TokenCode.TK_OR) {
    var token = this.token;
    this.getToken();
    x = new Node.Or(token, x, this.join());
  }

  return x;
};

Parser.prototype.join = function () {
  var x = this.equality();

  while (this.token.tkcode === e_TokenCode.TK_AND) {
    var token = this.token;
    this.getToken();
    x = new Node.And(token, x, this.equality());
  }

  return x;
};

Parser.prototype.equality = function () {
  var x = this.rel();

  while (this.token.tkcode === e_TokenCode.TK_EQ ||
    this.token.tkcode === e_TokenCode.TK_NEQ) {
    var token = this.token;
    this.getToken();
    x = new Node.Rel(token, x, this.rel());
  }

  return x;
};

Parser.prototype.rel = function () {
  var x = this.expr();

  switch (this.token.tkcode) {
  case e_TokenCode.TK_LT:
  case e_TokenCode.TK_LEQ:
  case e_TokenCode.TK_GT:
  case e_TokenCode.TK_GEQ:
    var token = this.token;
    this.getToken();
    return new Node.Rel(token, x, this.expr());
  default:
    return x;
  }
};

Parser.prototype.expr = function () {
  var x = this.term();
  while (this.token.tkcode === e_TokenCode.TK_PLUS ||
    this.token.tkcode === e_TokenCode.TK_MINUS) {
    var token = this.token;
    this.getToken();
    x = new Node.Arith(token, x, this.term());
  }
  return x;
};

Parser.prototype.term = function () {
  var x = this.factor();
  while (this.token.tkcode === e_TokenCode.TK_STAR ||
    this.token.tkcode === e_TokenCode.TK_DIVIDE ||
    this.token.tkcode === e_TokenCode.TK_MOD ||
    this.token.tkcode === e_TokenCode.KW_INCLUDE) {
    var token = this.token;
    this.getToken();
    if (token.tkcode === e_TokenCode.KW_INCLUDE) {
      x = new Node.Include(token, x, this.factor());
    } else {
      x = new Node.Arith(token, x, this.factor());
    }
  }
  return x;
};

Parser.prototype.factor = function () {
  var x = null;
  var token;
  if (this.token.tkcode === e_TokenCode.TK_OPENPA) {
    this.getToken();
    x = this.bool();
    x.withPA = true;
    this.skip(e_TokenCode.TK_CLOSEPA);
    return x;
  } else if (this.token.tkcode === e_TokenCode.TK_IDENT) {
    // E = a >= val
    // E = a <= val
    // E = a == val
    // E = a != val
    // E = a > val
    // E = a < val
    // E = a include val
    token = this.token;
    this.getToken();
    return new Node.ID(token);
  } else if (this.token.tkcode === e_TokenCode.TK_CINT ||
    this.token.tkcode === e_TokenCode.TK_CSTR) {
    token = this.token;
    this.getToken();
    return new Node.Constant(token);
  } else {
    this.lexer.error();
  }
};

/***********************************************************
 * 功能:  提示错误，此处需要缺少某个语法成份
 * msg:   需要什么语法成份
 **********************************************************/
Parser.prototype.expect = function (str) {
  this.lexer.error(str);
};

Parser.prototype.getRaw = function (token) {
  var raw = this.lexer.get_tkstr(token);
  if (token >= e_TokenCode.TK_IDENT) {
    return raw.replace('@', '');
  }
  return raw;
};

Parser.prototype.parse = function () {
  this.getToken();
  this.ast = this.bool();
};

Parser.prototype.gen = function () {
  this.parse();
  var _code = '';
  var emit = function (code) {
    _code += code;
  };

  emit('(function (context) {\n');
  emit('  // ' + this.lexer.source + '\n');
  emit('  return ');
  this.ast.gen(emit);
  emit(';\n');
  emit('})\n');

  return _code;
};

module.exports = Parser;
