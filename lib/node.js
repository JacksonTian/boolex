'use strict';

class Node {
  constructor() {}

  error (str) {
    throw new Error('near line ' + this.lexline + ': ' + str);
  }
}

class Expr extends Node {
  constructor(token) {
    super();

    this.token = token;
  }
}

exports.Expr = Expr;

class Logical extends Expr {
  constructor(token, expr1, expr2) {
    super(token);
    this.expr1 = expr1;
    this.expr2 = expr2;
  }
}

class Or extends Logical {
  constructor(token, expr1, expr2) {
    super(token, expr1, expr2);
  }

  gen(emit) {
    if (this.withPA) {
      emit('(');
    }

    this.expr1.gen(emit);
    emit(' ' + this.token.spelling + ' ');
    this.expr2.gen(emit);

    if (this.withPA) {
      emit(')');
    }
  }
}

exports.Or = Or;

class And extends Logical {
  constructor(token, expr1, expr2) {
    super(token, expr1, expr2);
  }

  gen(emit) {
    this.expr1.gen(emit);
    emit(' ' + this.token.spelling + ' ');
    this.expr2.gen(emit);
  }
}

exports.And = And;

class ID extends Expr {
  constructor(token) {
    super(token);
  }

  gen(emit) {
    emit('context.' + this.token.spelling.replace('@', ''));
  }
}

exports.ID = ID;

class Rel extends Logical {
  constructor (token, expr1, expr2) {
    super(token, expr1, expr2);
  }

  gen(emit) {
    this.expr1.gen(emit);
    emit(' ' + this.token.spelling + ' ');
    this.expr2.gen(emit);
  }
}

exports.Rel = Rel;

class Constant extends Expr {
  constructor(token) {
    super(token);
  }

  gen(emit) {
    emit(this.token.spelling);
  }
}

exports.Constant = Constant;

class Op extends Expr {
  constructor(token) {
    super(token);
  }
}

class Arith extends Op {
  constructor(token, expr1, expr2) {
    super(token);
    this.expr1 = expr1;
    this.expr2 = expr2;
  }

  gen(emit) {
    if (this.withPA) {
      emit('(');
    }

    this.expr1.gen(emit);
    emit(' ' + this.token.spelling + ' ');
    this.expr2.gen(emit);

    if (this.withPA) {
      emit(')');
    }
  }
}

exports.Arith = Arith;

class Include extends Op {
  constructor(token, expr1, expr2) {
    super(token);
    this.expr1 = expr1;
    this.expr2 = expr2;
  }

  gen(emit) {
    emit('(');
    emit('("" + ');
    this.expr1.gen(emit);
    emit(')');
    emit('.indexOf(');
    this.expr2.gen(emit);
    emit(') !== -1');
    emit(')');
  }
}

exports.Include = Include;
