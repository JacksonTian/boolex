'use strict';

const Lexer = require('./lexer');
const TokenCode = require('./token_code');
const Node = require('./node');

class Parser {
  constructor(source) {
    this.lexer = new Lexer(source);
    this.lexer.getch(); // read a char from source code
    this.code = '';
    this.level = 0;
    this.ast = null;
  }

  get token() {
    return this.lexer.token;
  }

  getToken() {
    this.lexer.getToken();
  }

  /***********************************************************
   * 功能:  跳过单词v,取下一单词,如果当前单词不是v,提示错误
   * v:   单词编号
   **********************************************************/
  skip(v) {
    if (this.token.tkcode !== v) {
      throw new Error('缺少' + this.token.spelling);
    }
    this.getToken();
  }

  /***********************************************************
   * 功能:  解析翻译单位
   *
   *  <bool>::={E}<TK_EOF>
   **********************************************************/
  bool() {
    var x = this.join();

    while (this.token.tkcode === TokenCode.TK_OR) {
      var token = this.token;
      this.getToken();
      x = new Node.Or(token, x, this.join());
    }

    return x;
  }

  join() {
    var x = this.equality();

    while (this.token.tkcode === TokenCode.TK_AND) {
      var token = this.token;
      this.getToken();
      x = new Node.And(token, x, this.equality());
    }

    return x;
  }

  equality() {
    var x = this.rel();

    while (this.token.tkcode === TokenCode.TK_EQ ||
      this.token.tkcode === TokenCode.TK_NEQ) {
      var token = this.token;
      this.getToken();
      x = new Node.Rel(token, x, this.rel());
    }

    return x;
  }

  rel() {
    var x = this.expr();

    switch (this.token.tkcode) {
    case TokenCode.TK_LT:
    case TokenCode.TK_LEQ:
    case TokenCode.TK_GT:
    case TokenCode.TK_GEQ:
      var token = this.token;
      this.getToken();
      return new Node.Rel(token, x, this.expr());
    default:
      return x;
    }
  }

  expr() {
    var x = this.term();
    while (this.token.tkcode === TokenCode.TK_PLUS ||
      this.token.tkcode === TokenCode.TK_MINUS) {
      var token = this.token;
      this.getToken();
      x = new Node.Arith(token, x, this.term());
    }
    return x;
  }

  term() {
    var x = this.factor();
    while (this.token.tkcode === TokenCode.TK_STAR ||
      this.token.tkcode === TokenCode.TK_DIVIDE ||
      this.token.tkcode === TokenCode.TK_MOD ||
      this.token.tkcode === TokenCode.KW_INCLUDE) {
      var token = this.token;
      this.getToken();
      if (token.tkcode === TokenCode.KW_INCLUDE) {
        x = new Node.Include(token, x, this.factor());
      } else {
        x = new Node.Arith(token, x, this.factor());
      }
    }
    return x;
  }

  factor() {
    var x = null;
    var token;
    if (this.token.tkcode === TokenCode.TK_OPENPA) {
      this.getToken();
      x = this.bool();
      x.withPA = true;
      this.skip(TokenCode.TK_CLOSEPA);
      return x;
    } else if (this.token.tkcode === TokenCode.TK_IDENT) {
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
    } else if (this.token.tkcode === TokenCode.TK_CINT ||
      this.token.tkcode === TokenCode.TK_CSTR ||
      this.token.tkcode === TokenCode.TK_CBOOL) {
      token = this.token;
      this.getToken();
      return new Node.Constant(token);
    }
    this.lexer.error();

  }

  /***********************************************************
   * 功能:  提示错误，此处需要缺少某个语法成份
   * msg:   需要什么语法成份
   **********************************************************/
  expect(str) {
    this.lexer.error(str);
  }

  parse() {
    this.getToken();
    this.ast = this.bool();
  }

  gen() {
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
  }
}

module.exports = Parser;
