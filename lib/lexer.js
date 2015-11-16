'use strict';

/* 单词存储结构定义 */
var TkWord = function (tkcode, spelling) {
  if (typeof tkcode === "undefined") {
    throw new Error('');
  }
  this.tkcode = tkcode; // 单词编码
  this.spelling = spelling;  // 单词字符串
};

var EOF = -1;

// E = (E)
// E = E && E
// E = E || E
// E = some => E
// E = a >= val
// E = a <= val
// E = a == val
// E = a != val
// E = a > val
// E = a < val
// E = a include val
// a = '@'+xxx
// val = number
// val = 'string'
// val = "string"

/* 单词编码 */
var e_TokenCode = {
  /* 运算符及分隔符 */
  TK_EQ: 1,       // == 等于号
  TK_NEQ: 2,      // != 不等于号
  TK_LT: 3,       // < 小于号
  TK_LEQ: 4,      // <= 小于等于号
  TK_GT: 5,      // > 大于号
  TK_GEQ: 6,     // >= 大于等于号
  TK_ARROW: 7,   // => 子表达式
  TK_AND: 8,     // && 左圆括号
  TK_OR: 9,      // || 右圆括号
  TK_OPENPA: 10,  // ( 左圆括号
  TK_CLOSEPA: 11, // ) 右圆括号
  TK_EOF: 12,     // 文件结束符

  /* 常量 */
  TK_CINT: 13,    // 整型常量
  TK_CCHAR: 14,   // 字符常量
  TK_CSTR: 15,    // 字符串常量

  /* 关键字 */
  KW_INCLUDE: 16,    // include关键字
  // 标示符
  TK_IDENT: 17
};

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
  this.table = {};
  this.hashtable = {};
  this.init();
};

/***********************************************************
 * 功能:  词法分析初始化
 **********************************************************/
Lexer.prototype.init = function () {
  this.keywords = [
    new TkWord(e_TokenCode.TK_EQ,     "=="),
    new TkWord(e_TokenCode.TK_NEQ,    "!="),
    new TkWord(e_TokenCode.TK_LT,     "<"),
    new TkWord(e_TokenCode.TK_LEQ,    "<="),
    new TkWord(e_TokenCode.TK_GT,     ">"),
    new TkWord(e_TokenCode.TK_GEQ,    ">="),
    new TkWord(e_TokenCode.TK_ARROW,  "=>"),
    new TkWord(e_TokenCode.TK_AND,    "&&"),
    new TkWord(e_TokenCode.TK_OR,     "||"),
    new TkWord(e_TokenCode.TK_OPENPA,  "("),
    new TkWord(e_TokenCode.TK_CLOSEPA, ")"),
    new TkWord(e_TokenCode.TK_EOF, "End_Of_File"),

    new TkWord(e_TokenCode.TK_CINT,  "整型常量"),
    new TkWord(e_TokenCode.TK_CCHAR, "字符常量"),
    new TkWord(e_TokenCode.TK_CSTR,  "字符串常量"),

    new TkWord(e_TokenCode.KW_INCLUDE,  "include"),

    new TkWord(0,       null)
  ];

  for (var i = 0; i < this.keywords.length; i++) {
    var tp = this.keywords[i];
    this.hashtable[tp.spelling] = tp;
    this.table[tp.tkcode] = tp;
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

Lexer.prototype.ungetch = function () {
  this.index--;
  this.ch = this.source[this.index]; // 其它返回实际字节值
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
    var tp = this.parse_property();
    this.token = tp.tkcode;
    break;
  }
  case '0': case '1': case '2': case '3':
  case '4': case '5': case '6': case '7':
  case '8': case '9':
    this.parse_num();
    this.token = e_TokenCode.TK_CINT;
    break;
  case '=':
    this.getch();
    if (this.ch === '=') {
      this.token = e_TokenCode.TK_EQ;
      this.getch();
    } else if (this.ch === '>') {
      this.token = e_TokenCode.TK_ARROW;
      this.getch();
    } else {
      this.error();
    }
    break;
  case '!':
    this.getch();
    if (this.ch === '=') {
      this.token = e_TokenCode.TK_NEQ;
      this.getch();
    } else {
      throw new Error("暂不支持'!'(非操作符)");
    }
    break;
  case '<':
    this.getch();
    if (this.ch === '=') {
      this.token = e_TokenCode.TK_LEQ;
      this.getch();
    } else {
      this.token = e_TokenCode.TK_LT;
    }
    break;
  case '>': // >, >=
    this.getch();
    if (this.ch === '=') {
      this.token = e_TokenCode.TK_GEQ;
      this.getch();
    } else {
      this.token = e_TokenCode.TK_GT;
    }
    break;
  case '&': // &&
    this.getch();
    if (this.ch === '&') {
      this.token = e_TokenCode.TK_AND;
      this.getch();
    } else {
      throw new Error("暂不支持'&'操作符");
    }
    break;
  case '|': // ||
    this.getch();
    if (this.ch === '|') {
      this.token = e_TokenCode.TK_OR;
      this.getch();
    } else {
      this.error();
    }
    break;
  case ')': // )
    this.token = e_TokenCode.TK_CLOSEPA;
    this.getch();
    break;
  case '(': // (
    this.token = e_TokenCode.TK_OPENPA;
    this.getch();
    break;
  case '\'':
    this.parse_string(this.ch);
    this.token = e_TokenCode.TK_CCHAR;
    this.tkvalue = this.tkstr;
    break;
  case '\"':
    this.parse_string(this.ch);
    this.token = e_TokenCode.TK_CSTR;
    break;
  case EOF:
    this.token = e_TokenCode.TK_EOF;
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
  this.tkstr = this.ch;
  this.getch();
  while (is_nodigit(this.ch) || is_digit(this.ch)) {
    this.tkstr += this.ch;
    this.getch();
  }

  if (!this.hashtable[this.tkstr]) {
    var tkcode = Object.keys(this.hashtable).length;
    var tp = new TkWord(tkcode, this.tkstr);
    this.hashtable[this.tkstr] = tp;
    this.table[tp.tkcode] = tp;
  }

  return this.hashtable[this.tkstr];
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
  var c;
  this.tkstr = sep;
  this.getch();

  for (;;) {
    if (this.ch === sep) {
      break;
    } else if (this.ch === '\\') {
      this.tkstr += this.ch;
      this.getch();

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
      this.tkstr += this.ch;
      this.getch();
    } else {
      this.tkstr += this.ch;
      this.getch();
    }
  }
  this.tkstr += sep;
  this.getch();
};

/***********************************************************
 *  功能: 预处理，忽略分隔符及注释
 **********************************************************/
Lexer.prototype.preprocess = function () {
  while (1) {
    if (this.ch === ' ' || this.ch === '\t' ||
      this.ch === '\r' || this.ch === '\n') {
      this.skip_white_space();
    } else if (this.ch === '/') {
      //向前多读一个字节看是否是注释开始符，猜错了把多读的字符再放回去
      this.getch();
      if (this.ch === '*') {
        this.parse_comment();
      } else {
        this.ungetch(); //把一个字符退回到输入流中
        this.ch = '/';
        break;
      }
    } else {
      break;
    }
  }
};

/***********************************************************
 * 功能:  解析整型常量
 **********************************************************/
Lexer.prototype.parse_num = function () {
  this.tkstr = '';
  do {
    this.tkstr += this.ch;
    this.getch();
  } while (is_digit(this.ch));
  if (this.ch === '.') {
    do {
      this.tkstr += this.ch;
      this.getch();
    } while (is_digit(this.ch));
  }
  this.tkvalue = parseFloat(this.tkstr);
};

Lexer.prototype.get_tkstr = function (v) {
  if (v > Object.keys(this.table).length) {
    return null;
  } else if (v >= e_TokenCode.TK_CINT && v <= e_TokenCode.TK_CSTR) {
    return this.tkstr;
  } else {
    var tp = this.table[v];
    return tp.spelling;
  }
};

/***********************************************************
 *  功能: 解析注释
 **********************************************************/
Lexer.prototype.parse_comment = function () {
  this.getch();
  do {
    do {
      if (this.ch === '\n' || this.ch === '*' || this.ch === EOF) {
        break;
      } else {
        this.getch();
      }
    } while (1);
    if (this.ch === '\n') {
      this.line_num++;
      this.getch();
    } else if (this.ch === '*') {
      this.getch();
      if (this.ch === '/') {
        this.getch();
        return;
      }
    } else {
      console.error("一直到文件尾未看到配对的注释结束符");
      return;
    }
  } while (1);
};

Lexer.e_TokenCode = e_TokenCode;

module.exports = Lexer;
