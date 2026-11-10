/**
 * expr-evaluator.js —— 受限表达式求值器
 *
 * 为什么需要它：微信小游戏平台【禁止动态执行代码】（无 eval / new Function）。
 * 但配置表里的结局条件、事件触发条件又需要用字符串描述，于是自研一个
 * 只支持「四则运算 + 比较 + 与或非 + 属性引用」的极小解释器。
 *
 * 支持语法：
 *   cash >= 80 && (social >= 60 || guts > 70)
 *   lowProfileCount >= 6
 *   true / false
 * 支持运算：|| && ! > >= < <= == != + - * / ( )
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  var OPS2 = ['>=', '<=', '==', '!=', '&&', '||'];

  function tokenize(src) {
    var out = [];
    var i = 0;
    while (i < src.length) {
      var c = src.charAt(i);
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
        i++;
        continue;
      }
      if (c >= '0' && c <= '9') {
        var s0 = i;
        while (i < src.length && ((src.charAt(i) >= '0' && src.charAt(i) <= '9') || src.charAt(i) === '.')) i++;
        out.push({ k: 'num', v: parseFloat(src.slice(s0, i)) });
        continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        var s1 = i;
        while (i < src.length && /[A-Za-z0-9_.]/.test(src.charAt(i))) i++;
        out.push({ k: 'id', v: src.slice(s1, i) });
        continue;
      }
      var two = src.substr(i, 2);
      if (OPS2.indexOf(two) >= 0) {
        out.push({ k: 'op', v: two });
        i += 2;
        continue;
      }
      if ('+-*/()<>!'.indexOf(c) >= 0) {
        out.push({ k: 'op', v: c });
        i++;
        continue;
      }
      throw new Error('[ExprEvaluator] 不支持的字符: ' + c);
    }
    out.push({ k: 'eof', v: null });
    return out;
  }

  function Parser(tokens, vars) {
    this.t = tokens;
    this.i = 0;
    this.vars = vars || {};
  }

  Parser.prototype.peek = function () {
    return this.t[this.i];
  };
  Parser.prototype.take = function () {
    return this.t[this.i++];
  };
  Parser.prototype.isOp = function (v) {
    var tk = this.peek();
    return tk.k === 'op' && tk.v === v;
  };

  /** 或运算（优先级最低） */
  Parser.prototype.parseOr = function () {
    var left = this.parseAnd();
    while (this.isOp('||')) {
      this.take();
      var right = this.parseAnd();
      left = left || right;
    }
    return left;
  };

  Parser.prototype.parseAnd = function () {
    var left = this.parseEquality();
    while (this.isOp('&&')) {
      this.take();
      var right = this.parseEquality();
      left = left && right;
    }
    return left;
  };

  Parser.prototype.parseEquality = function () {
    var left = this.parseCompare();
    while (this.isOp('==') || this.isOp('!=')) {
      var op = this.take().v;
      var right = this.parseCompare();
      left = op === '==' ? left === right : left !== right;
    }
    return left;
  };

  Parser.prototype.parseCompare = function () {
    var left = this.parseAdd();
    while (this.isOp('>') || this.isOp('>=') || this.isOp('<') || this.isOp('<=')) {
      var op = this.take().v;
      var right = this.parseAdd();
      if (op === '>') left = left > right;
      else if (op === '>=') left = left >= right;
      else if (op === '<') left = left < right;
      else left = left <= right;
    }
    return left;
  };

  Parser.prototype.parseAdd = function () {
    var left = this.parseMul();
    while (this.isOp('+') || this.isOp('-')) {
      var op = this.take().v;
      var right = this.parseMul();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  };

  Parser.prototype.parseMul = function () {
    var left = this.parseUnary();
    while (this.isOp('*') || this.isOp('/')) {
      var op = this.take().v;
      var right = this.parseUnary();
      left = op === '*' ? left * right : left / right;
    }
    return left;
  };

  Parser.prototype.parseUnary = function () {
    if (this.isOp('!')) {
      this.take();
      return !this.parseUnary();
    }
    if (this.isOp('-')) {
      this.take();
      return -this.parseUnary();
    }
    return this.parsePrimary();
  };

  Parser.prototype.parsePrimary = function () {
    var tk = this.take();
    if (tk.k === 'num') return tk.v;
    if (tk.k === 'id') {
      if (tk.v === 'true') return true;
      if (tk.v === 'false') return false;
      if (tk.v === 'null') return null;
      var v = this.vars[tk.v];
      return v === undefined ? 0 : v;
    }
    if (tk.k === 'op' && tk.v === '(') {
      var v2 = this.parseOr();
      if (!this.isOp(')')) throw new Error('[ExprEvaluator] 缺少右括号');
      this.take();
      return v2;
    }
    throw new Error('[ExprEvaluator] 意外的标记: ' + tk.v);
  };

  /**
   * 求值
   * @param {string} expr
   * @param {Object} vars 变量表
   * @returns {*} 结果（布尔或数字）
   */
  function evaluate(expr, vars) {
    if (expr === undefined || expr === null || expr === '') return true;
    if (typeof expr === 'boolean') return expr;
    var p = new Parser(tokenize(String(expr)), vars);
    var v = p.parseOr();
    return v;
  }

  /** 求值并转成布尔 */
  function test(expr, vars) {
    return !!evaluate(expr, vars);
  }

  NS.ExprEvaluator = {
    evaluate: evaluate,
    test: test,
    // 暴露出来方便单测
    _tokenize: tokenize
  };
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
