'use strict';

/* 单词存储结构定义 */
var TkWord = function (tkcode, spelling) {
  this.tkcode = tkcode;      // 单词编码
  this.spelling = spelling;  // 单词字符串
};

/* 单词编码 */
var e_TokenCode = {
  /* 运算符及分隔符 */
  TK_PLUS: 1,     // + 加号
  TK_MINUS: 2,    // - 减号
  TK_STAR: 3,     // * 星号
  TK_DIVIDE: 4,   // / 除号
  TK_MOD: 5,      // % 求余运算符
  TK_EQ: 6,       // == 等于号
  TK_NEQ: 7,      // != 不等于号
  TK_LT: 8,       // < 小于号
  TK_LEQ: 9,      // <= 小于等于号
  TK_GT: 10,      // > 大于号
  TK_GEQ: 11,     // >= 大于等于号
  TK_AND: 12,     // && 左圆括号
  TK_OR: 13,      // || 右圆括号
  TK_OPENPA: 14,  // ( 左圆括号
  TK_CLOSEPA: 15, // ) 右圆括号
  TK_EOF: 16,     // 文件结束符

  /* 常量 */
  TK_CINT: 17,    // 整型常量
  TK_CSTR: 18,    // 字符串常量

  /* 关键字 */
  KW_INCLUDE: 19, // include关键字
  // 标示符
  TK_IDENT: 21
};

TkWord.PLUS = new TkWord(e_TokenCode.TK_PLUS,   "+");
TkWord.MINUS = new TkWord(e_TokenCode.TK_MINUS,  "-");
TkWord.STAR = new TkWord(e_TokenCode.TK_STAR,   "*");
TkWord.DIVIDE = new TkWord(e_TokenCode.TK_DIVIDE, "/");
TkWord.MOD = new TkWord(e_TokenCode.TK_MOD,    "%");
TkWord.EQ = new TkWord(e_TokenCode.TK_EQ,     "==");
TkWord.NEQ = new TkWord(e_TokenCode.TK_NEQ,   "!=");
TkWord.LT = new TkWord(e_TokenCode.TK_LT,     "<");
TkWord.LEQ = new TkWord(e_TokenCode.TK_LEQ,    "<=");
TkWord.GT = new TkWord(e_TokenCode.TK_GT,     ">");
TkWord.GEQ = new TkWord(e_TokenCode.TK_GEQ,    ">=");
TkWord.AND = new TkWord(e_TokenCode.TK_AND,    "&&");
TkWord.OR = new TkWord(e_TokenCode.TK_OR,     "||");
TkWord.OPENPA = new TkWord(e_TokenCode.TK_OPENPA,  "(");
TkWord.CLOSEPA = new TkWord(e_TokenCode.TK_CLOSEPA, ")");
TkWord.EOF = new TkWord(e_TokenCode.TK_EOF, 'End_Of_File');

var EOF = -1;

// E = E && E
// E = E || E
// E = a >= val
// E = a <= val
// E = a == val
// E = a != val
// E = a > val
// E = a < val
// E = a include val
// E = (E)
// a = '@'+xxx
// val = number
// val = 'string'
// val = "string"

/***********************************************************
 * 功能:  判断c是否为字母(a-z,A-Z)或下划线(-)
 * c:   字符值
 **********************************************************/
var is_nodigit = function (c) {
  return (c >= 'a' && c <= 'z') ||
    (c >= 'A' && c <= 'Z') ||
    c === '_';
};

/***********************************************************
 * 功能:  判断c是否为数字
 * c:   字符值
 **********************************************************/
var is_digit = function (c) {
  return c >= '0' && c <= '9';
};

var Lexer = function (source) {
  this.source = source;
  this.index = -1;
  this.ch = undefined;
  this.token = undefined;
  this.words = {};
  this.reserve();
};

/***********************************************************
 * 功能:  词法分析初始化
 **********************************************************/
Lexer.prototype.reserve = function () {
  var keywords = [
    new TkWord(e_TokenCode.KW_INCLUDE,  "include"),
  ];

  for (var i = 0; i < keywords.length; i++) {
    var word = keywords[i];
    this.words[word.spelling] = word;
  }
};

/***********************************************************
 * 功能:  从SC源文件中读取一个字符
 **********************************************************/
Lexer.prototype.getch = function () {
  if (this.index >= this.source.length - 1) { //文件尾返回EOF
    this.ch = EOF;
  } else {
    this.index++;
    this.ch = this.source[this.index]; // 其它返回实际字节值
  }
  return this.ch;
};

/***********************************************************
 *  功能: 取单词
 **********************************************************/
Lexer.prototype.getToken = function () {
  this.preprocess();
  switch (this.ch) {
  case 'a': case 'b': case 'c': case 'd': case 'e': case 'f': case 'g':
  case 'h': case 'i': case 'j': case 'k': case 'l': case 'm': case 'n':
  case 'o': case 'p': case 'q': case 'r': case 's': case 't':
  case 'u': case 'v': case 'w': case 'x': case 'y': case 'z':
  case 'A': case 'B': case 'C': case 'D': case 'E': case 'F': case 'G':
  case 'H': case 'I': case 'J': case 'K': case 'L': case 'M': case 'N':
  case 'O': case 'P': case 'Q': case 'R': case 'S': case 'T':
  case 'U': case 'V': case 'W': case 'X': case 'Y': case 'Z':
  case '_': case '@': {
    this.token = this.parse_property();
    break;
  }
  case '0': case '1': case '2': case '3':
  case '4': case '5': case '6': case '7':
  case '8': case '9':
    this.token = this.parse_num();
    break;
  case '=': // ==
    this.getch();
    if (this.ch === '=') {
      this.token = TkWord.EQ;
      this.getch();
    } else {
      this.error();
    }
    break;
  case '!': // !=
    this.getch();
    if (this.ch === '=') {
      this.token = TkWord.NEQ;
      this.getch();
    } else {
      this.error();
    }
    break;
  case '<': // <, <=
    this.getch();
    if (this.ch === '=') {
      this.token = TkWord.LEQ;
      this.getch();
    } else {
      this.token = TkWord.LT;
    }
    break;
  case '>': // >, >=
    this.getch();
    if (this.ch === '=') {
      this.token = TkWord.GEQ;
      this.getch();
    } else {
      this.token = TkWord.GT;
    }
    break;
  case '&': // &&
    this.getch();
    if (this.ch === '&') {
      this.token = TkWord.AND;
      this.getch();
    } else {
      this.error();
    }
    break;
  case '|': // ||
    this.getch();
    if (this.ch === '|') {
      this.token = TkWord.OR;
      this.getch();
    } else {
      this.error();
    }
    break;
  case ')': // )
    this.token = TkWord.CLOSEPA;
    this.getch();
    break;
  case '(': // (
    this.token = TkWord.OPENPA;
    this.getch();
    break;
  case '\'':
    var str = this.parse_string(this.ch);
    this.token = new TkWord(e_TokenCode.TK_CSTR, str);
    break;
  case '\"':
    var str = this.parse_string(this.ch);
    this.token = new TkWord(e_TokenCode.TK_CSTR, str);
    break;
  case '+':
    this.token = TkWord.PLUS;
    this.getch();
    break;
  case '-':
    this.token = TkWord.MINUS;
    this.getch();
    break;
  case '*':
    this.token = TkWord.STAR;
    this.getch();
    break;
  case '/':
    this.token = TkWord.DIVIDE;
    this.getch();
    break;
  case '%':
    this.token = TkWord.MOD;
    this.getch();
    break;
  case EOF:
    this.token = TkWord.EOF;
    break;
  default:
    this.error();
  }
};

var spaces = function (n) {
  var str = '';
  for (var i = 0; i < n; i++) {
    str += ' ';
  }
  return str;
};

Lexer.prototype.error = function () {
  // 上面字符以外的字符，只允许出现在源码字符串，不允许出现的源码的其它位置
  console.log('\n' + this.source);
  console.log(spaces(this.index) + '^');
  throw new SyntaxError("不认识的字符: " + this.ch);
};

/***********************************************************
 * 功能:  解析标识符
 **********************************************************/
Lexer.prototype.parse_property = function () {
  var tkstr = this.ch;
  this.getch();
  while (is_nodigit(this.ch) || is_digit(this.ch)) {
    tkstr += this.ch;
    this.getch();
  }

  if (!this.words[tkstr]) {
    var word = new TkWord(e_TokenCode.TK_IDENT, tkstr);
    this.words[tkstr] = word;
  }

  return this.words[tkstr];
};

/***********************************************************
 *  功能: 忽略空格,TAB及回车
 **********************************************************/
Lexer.prototype.skip_white_space = function () {
  // 忽略空格,和TAB ch =='\n'
  while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
    if (this.ch === '\n') {
      // line number
    }
    this.getch();
  }
};

/***********************************************************
 * 功能:  解析字符常量、字符串常量
 * sep:   字符常量界符标识为单引号(')
      字符串常量界符标识为双引号(")
 **********************************************************/
Lexer.prototype.parse_string = function (sep) {
  var tkstr = sep;
  this.getch();

  for (;;) {
    if (this.ch === sep) {
      break;
    } else if (this.ch === EOF) {
      this.error(); // 非法结束
    } else if (this.ch === '\\') {
      tkstr += this.ch;
      this.getch();
      var c;
      switch(this.ch) { // 解析转义字符
      case '0':
        c = '\0';
        break;
      case 'a':
        c = '\a';
        break;
      case 'b':
        c = '\b';
        break;
      case 't':
        c = '\t';
        break;
      case 'n':
        c = '\n';
        break;
      case 'v':
        c = '\v';
        break;
      case 'f':
        c = '\f';
        break;
      case 'r':
        c = '\r';
        break;
      case '\"':
        c = '\"';
        break;
      case '\'':
        c = '\'';
        break;
      case '\\':
        c = '\\';
        break;
      default:
        c = this.ch;
        if (c >= '!' && c <= '~') {
          console.warn("非法转义字符: \'\\%c\'", c); // 33-126 0x21-0x7E可显示字符部分
        } else {
          console.warn("非法转义字符: \'\\0x%x\'", c);
        }
        break;
      }
      tkstr += this.ch;
      this.getch();
    } else {
      tkstr += this.ch;
      this.getch();
    }
  }
  tkstr += sep;
  this.getch();
  return tkstr;
};

/***********************************************************
 *  功能: 预处理，忽略分隔符
 **********************************************************/
Lexer.prototype.preprocess = function () {
  while (1) {
    if (this.ch === ' ' || this.ch === '\t' ||
      this.ch === '\r' || this.ch === '\n') {
      this.skip_white_space();
    } else {
      break;
    }
  }
};

/***********************************************************
 * 功能:  解析整型常量
 **********************************************************/
Lexer.prototype.parse_num = function () {
  var tkstr = '';
  do {
    tkstr += this.ch;
    this.getch();
  } while (is_digit(this.ch));
  if (this.ch === '.') {
    do {
      tkstr += this.ch;
      this.getch();
    } while (is_digit(this.ch));
  }

  return new TkWord(e_TokenCode.TK_CINT, tkstr);
};

Lexer.e_TokenCode = e_TokenCode;

module.exports = Lexer;
