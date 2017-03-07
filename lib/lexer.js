'use strict';

const TokenCode = require('./token_code');
const TkWord = require('./token_word');

const EOF = -1;

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

class Lexer {
  constructor(source) {
    this.source = source;
    this.index = -1;
    this.ch = undefined;
    this.token = undefined;
    this.words = {};
    this.reserve();
  }

  /***********************************************************
   * 功能:  词法分析初始化
   **********************************************************/
  reserve() {
    var keywords = [
      new TkWord(TokenCode.KW_INCLUDE,  'include'),
    ];

    for (var i = 0; i < keywords.length; i++) {
      var word = keywords[i];
      this.words[word.spelling] = word;
    }
  }

  /***********************************************************
   * 功能:  从SC源文件中读取一个字符
   **********************************************************/
  getch() {
    if (this.index >= this.source.length - 1) { //文件尾返回EOF
      this.ch = EOF;
    } else {
      this.index++;
      this.ch = this.source[this.index]; // 其它返回实际字节值
    }
    return this.ch;
  }

  /***********************************************************
   *  功能: 取单词
   **********************************************************/
  getToken() {
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
        this.error(`期待'='，但实际是'${this.ch}'`);
      }
      break;
    case '!': // !=
      this.getch();
      if (this.ch === '=') {
        this.token = TkWord.NEQ;
        this.getch();
      } else {
        this.error(`期待'='，但实际是'${this.ch}'`);
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
        this.error(`期待'&'，但实际是'${this.ch}'`);
      }
      break;
    case '|': // ||
      this.getch();
      if (this.ch === '|') {
        this.token = TkWord.OR;
        this.getch();
      } else {
        this.error(`期待'|'，但实际是'${this.ch}'`);
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
    case '\"':
      var str = this.parse_string(this.ch);
      this.token = new TkWord(TokenCode.TK_CSTR, str);
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
      this.error(`未期望的字符'${this.ch}'`);
    }
  }

  error(message) {
    // 上面字符以外的字符，只允许出现在源码字符串，不允许出现的源码的其它位置
    console.log('\n' + this.source);
    console.log(' '.repeat(this.index) + '^');
    throw new SyntaxError(message);
  }

  /***********************************************************
   * 功能:  解析标识符
   **********************************************************/
  parse_property() {
    var tkstr = this.ch;
    this.getch();
    while (is_nodigit(this.ch) || is_digit(this.ch)) {
      tkstr += this.ch;
      this.getch();
    }

    if (!this.words[tkstr]) {
      var word = new TkWord(TokenCode.TK_IDENT, tkstr);
      this.words[tkstr] = word;
    }

    return this.words[tkstr];
  }

  /***********************************************************
   *  功能: 忽略空格,TAB及回车
   **********************************************************/
  skip_white_space() {
    // 忽略空格,和TAB ch =='\n'
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
      if (this.ch === '\n') {
        // line number
      }
      this.getch();
    }
  }

  /***********************************************************
   * 功能:  解析字符常量、字符串常量
   * sep:   字符常量界符标识为单引号(')
        字符串常量界符标识为双引号(")
   **********************************************************/
  parse_string(sep) {
    var tkstr = sep;
    this.getch();

    for (;;) {
      if (this.ch === sep) {
        break;
      } else if (this.ch === EOF) {
        this.error('未期望的结束'); // 非法结束
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
            console.warn(`非法转义字符: '\\${c}'`); // 33-126 0x21-0x7E可显示字符部分
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
  }

  /***********************************************************
   *  功能: 预处理，忽略分隔符
   **********************************************************/
  preprocess() {
    while (1) {
      if (this.ch === ' ' || this.ch === '\t' ||
        this.ch === '\r' || this.ch === '\n') {
        this.skip_white_space();
      } else {
        break;
      }
    }
  }

  /***********************************************************
   * 功能:  解析整型常量
   **********************************************************/
  parse_num() {
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

    return new TkWord(TokenCode.TK_CINT, tkstr);
  }

}

module.exports = Lexer;
