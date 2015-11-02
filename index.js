'use strict';

var Parser = require('./lib/parser');

exports.parse = function (source) {
  var parser = new Parser(source);
  parser.parse();
  return parser.code;
};
