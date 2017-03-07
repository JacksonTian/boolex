'use strict';

const TokenCode = require('./token_code');

/* 单词存储结构定义 */
class TkWord {
  constructor(tkcode, spelling) {
    this.tkcode = tkcode;      // 单词编码
    this.spelling = spelling;  // 单词字符串
  }
}

TkWord.PLUS = new TkWord(TokenCode.TK_PLUS,   '+');
TkWord.MINUS = new TkWord(TokenCode.TK_MINUS,  '-');
TkWord.STAR = new TkWord(TokenCode.TK_STAR,   '*');
TkWord.DIVIDE = new TkWord(TokenCode.TK_DIVIDE, '/');
TkWord.MOD = new TkWord(TokenCode.TK_MOD,    '%');
TkWord.EQ = new TkWord(TokenCode.TK_EQ,     '==');
TkWord.NEQ = new TkWord(TokenCode.TK_NEQ,   '!=');
TkWord.LT = new TkWord(TokenCode.TK_LT,     '<');
TkWord.LEQ = new TkWord(TokenCode.TK_LEQ,    '<=');
TkWord.GT = new TkWord(TokenCode.TK_GT,     '>');
TkWord.GEQ = new TkWord(TokenCode.TK_GEQ,    '>=');
TkWord.AND = new TkWord(TokenCode.TK_AND,    '&&');
TkWord.OR = new TkWord(TokenCode.TK_OR,     '||');
TkWord.OPENPA = new TkWord(TokenCode.TK_OPENPA,  '(');
TkWord.CLOSEPA = new TkWord(TokenCode.TK_CLOSEPA, ')');
TkWord.EOF = new TkWord(TokenCode.TK_EOF, 'End_Of_File');

module.exports = TkWord;
