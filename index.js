'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');

const Parser = require('./lib/parser');

function noop () {}

exports.parse = function (source) {
  var parser = new Parser(source);
  parser.parse();
  return parser.ast;
};

exports.compile = function (source) {
  var parser = new Parser(source);
  var code = parser.gen();
  // get function with vm
  var name = crypto.createHash('sha1').update(source).digest('hex');
  var filename = path.join(os.tmpdir(), name + '.js');

  if (process.env.NODE_ENV !== 'production') {
    fs.writeFile(filename, code, 'utf8', noop);
  }

  return vm.runInThisContext(code, {
    filename: filename
  });
};
