'use strict';

/* 单词编码 */
module.exports = {
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
  TK_CBOOL: 19,   // 布尔常量

  /* 关键字 */
  KW_INCLUDE: 20, // include关键字
  // 标示符
  TK_IDENT: 21,
  TK_NE: 22       // ! 非
};
