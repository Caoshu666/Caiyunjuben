/**
 * ending-judge.js —— 结局判定模块
 *
 * 对应设计文档 3.6：
 *   1) 先判定隐藏结局（condition 表达式，固定 S 级）
 *   2) 再按 5 属性终值 + 关键抉择统计 判定 S / A / B / C
 *   3) 最后取「人格绑定结局」+ 该等级的文案变体
 *      → 10 人格 × 4 等级 = 40 个结局文案
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});

  /** 构造判定用的变量表 */
  function buildVars(ctx) {
    var attrs = ctx.attrs || {};
    var flags = ctx.flags || [];
    var vars = {
      cash: attrs.cash,
      social: attrs.social,
      cognition: attrs.cognition,
      guts: attrs.guts,
      luck: attrs.luck,
      avg: NS.AttrSystem.average(attrs),
      startCash: ctx.startCash === undefined ? 50 : ctx.startCash,
      lowProfileCount: countFlag(flags, 'low_profile'),
      longtermCount: countFlag(flags, 'longterm'),
      aggressiveCount: countFlag(flags, 'aggressive'),
      stageReached: ctx.stageReached || 4
    };
    // 把每个 flag 也暴露成变量，便于配置表直接写 `flag_xxx`
    for (var i = 0; i < flags.length; i++) {
      vars['flag_' + flags[i]] = true;
    }
    return vars;
  }

  function countFlag(flags, name) {
    var n = 0;
    for (var i = 0; i < flags.length; i++) if (flags[i] === name) n++;
    return n;
  }

  /**
   * 结局分级阈值
   * 这几个数字是配合 tools/simulate.js 标定的，让最终分布落在
   * S 8% / A 27% / B 45% / C 20% 附近。
   * 想改游戏难度，改这里比改事件表更直接。
   */
  var GRADE_RULES = {
    S: { cash: 89, attrAtLeast: 72, attrCount: 2 },
    A: { cash: 63, avg: 52 },
    B: { cash: 34, avg: 38 }
  };

  /* ------------------------------------------------------------------ */
  /* 财运指数与标签                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * 财运指数的权重。
   * 按各属性对最终结局的【实际影响力】排，而不是平均分：
   *   cash      0.34 —— 结局判定的主变量，S/A/B 三个档位全都有现金硬门槛
   *   cognition 0.22 —— 决定能不能识别机会（抽事件时的权重也挂了它）
   *   guts      0.16 —— 决定敢不敢下手
   *   social    0.16 —— 安全网：跌到危机线时靠它兜底
   *   luck      0.12 —— 纯随机项，刻意压权重，避免玩家把结果全归给运气
   */
  var INDEX_WEIGHT = { cash: 0.34, cognition: 0.22, guts: 0.16, social: 0.16, luck: 0.12 };

  /**
   * 财运指数的标定锚点。
   *
   * 为什么必须标定：直接加权求和得到的是「属性均值」的线性映射，而属性均值
   * 的实际分布非常窄 —— 实测 20 万局，原始分均值 60.3、标准差只有约 12、
   * 极差仅 32~87。不拉伸的话：
   *   1) 玩家永远只会看到 48~75 这一段数字，指数等于没有区分度；
   *   2) 档位形同虚设 —— 实测最高档只命中 1%、最低档一次都不出现。
   *
   * 所以把它线性拉伸成「50 = 平均水平、80 = 前 8%、100 = 封顶」的直觉刻度：
   *   原始 60.3（p50） → 50
   *   原始 73.5（p92） → 80
   *
   * ⚠️ 这两个数字来自 tools/simulate.js 的【财运指数分布】实测。
   *    改动 data/tables/event.js 或 balance.js 之后，务必重跑该脚本核对锚点，
   *    否则档位会和实际分布脱节（出现「指数 55 显示成财神眷顾」这类一眼假的档位）。
   *    写成常量而不是每次算分布，是为了让指数保持纯函数、可复现。
   */
  var INDEX_ANCHORS = { rawMid: 60.3, outMid: 50, rawTop: 73.5, outTop: 80 };

  var INDEX_SCALE = (INDEX_ANCHORS.outTop - INDEX_ANCHORS.outMid) /
    (INDEX_ANCHORS.rawTop - INDEX_ANCHORS.rawMid);
  var INDEX_OFFSET = INDEX_ANCHORS.outMid - INDEX_ANCHORS.rawMid * INDEX_SCALE;

  /**
   * 财运指数 0~100。
   *
   * 为什么已经有 S/A/B/C 了还要这个：
   *   等级是「名次」，只回答「你比多少人好」，而且判定里带硬门槛
   *   （现金不到 89 就绝无可能是 S）。玩家拿到 C 容易归因为「这局运气太差」，
   *   而不是反思自己的选择。
   *   指数是「分数」，连续、能体现每一局的细微差别，也更贴近玩家熟悉的
   *   心理测试 / 能力值的表达方式 —— 分享和复玩的意愿都更高。
   *   两者是两条独立的轴：等级是名次，指数是分数。
   */
  function wealthIndex(attrs) {
    var a = attrs || {};
    var raw = 0;
    for (var k in INDEX_WEIGHT) {
      if (Object.prototype.hasOwnProperty.call(INDEX_WEIGHT, k)) {
        raw += (Number(a[k]) || 0) * INDEX_WEIGHT[k];
      }
    }
    var out = Math.round(raw * INDEX_SCALE + INDEX_OFFSET);
    return Math.max(0, Math.min(100, out));
  }

  /**
   * 指数档位。
   * 阈值按标定后的分布取，让五档的命中率大致呈 8 / 22 / 40 / 22 / 8 的形状 ——
   * 既保证「财神眷顾」足够稀有（稀有才有分享欲），也保证「急需转运」真的会出现
   * （一个永远抽不到的档位等于不存在，反而会让玩家觉得系统没做完）。
   * 想调「玩家普遍觉得自己财运如何」，改这一张表就够了。
   */
  var INDEX_BANDS = [
    { min: 80, key: 'huge', label: '财神眷顾' },
    { min: 62, key: 'good', label: '财运不错' },
    { min: 42, key: 'mid', label: '中规中矩' },
    { min: 24, key: 'low', label: '略显拮据' },
    { min: 0, key: 'bad', label: '急需转运' }
  ];

  function indexBand(index) {
    for (var i = 0; i < INDEX_BANDS.length; i++) {
      if (index >= INDEX_BANDS[i].min) return INDEX_BANDS[i];
    }
    return INDEX_BANDS[INDEX_BANDS.length - 1];
  }

  /**
   * 人设标签：取终值最高的两个属性，各给一个标签。
   * 结果页除了「你排第几」之外还有「你是什么人」，这比纯数字更像一份测试报告。
   */
  var TAG_BY_ATTR = {
    cash: '现金流敏感',
    social: '人脉为王',
    cognition: '长期主义',
    guts: '敢想敢干',
    luck: '运气加持'
  };

  function tagsOf(attrs) {
    // 没有属性就没有画像 —— 返回空数组比硬凑两个标签更诚实
    if (!attrs) return [];
    var a = attrs;
    var ranked = NS.AttrSystem.ATTRS.slice().sort(function (x, y) {
      return (Number(a[y]) || 0) - (Number(a[x]) || 0);
    });
    var out = [];
    for (var i = 0; i < ranked.length && out.length < 2; i++) {
      var t = TAG_BY_ATTR[ranked[i]];
      if (t) out.push(t);
    }
    return out;
  }

  /** 按数值判定基础等级 */
  function gradeOf(vars) {
    var attrs = {
      cash: vars.cash, social: vars.social, cognition: vars.cognition,
      guts: vars.guts, luck: vars.luck
    };
    var r = GRADE_RULES;
    if (vars.cash >= r.S.cash &&
        NS.AttrSystem.countAtLeast(attrs, r.S.attrAtLeast) >= r.S.attrCount) {
      return 'S';
    }
    if (vars.cash >= r.A.cash && vars.avg >= r.A.avg) return 'A';
    if (vars.cash >= r.B.cash && vars.avg >= r.B.avg) return 'B';
    return 'C';
  }

  /**
   * 判定结局
   * @param {Object} ctx { attrs, flags, persona, endings, startCash, stageReached }
   * @returns {Object} { quality, hidden, endingId, title, narration, ending }
   */
  function judge(ctx) {
    var attrs = ctx.attrs;
    var persona = ctx.persona;
    var endings = ctx.endings || [];
    var vars = buildVars(ctx);

    /*
     * 财运指数与标签和「走哪条分支」无关，一律在这里算好，
     * 两条返回路径各带上 —— 只有 4 个字段，显式写两遍比引一个
     * 合并工具函数更好读（逻辑层刻意保持 ES5 风格，不用 Object.assign）。
     */
    var indexVal = wealthIndex(attrs);
    var band = indexBand(indexVal);
    var tagList = tagsOf(attrs);

    // ---- 1) 隐藏结局优先 ----
    for (var i = 0; i < endings.length; i++) {
      var he = endings[i];
      if (he.hidden && he.condition && NS.ExprEvaluator.test(he.condition, vars)) {
        return {
          quality: 'S',
          hidden: true,
          endingId: he.id,
          title: he.title,
          narration: he.narration,
          ending: he,
          index: indexVal,
          indexLabel: band.label,
          indexKey: band.key,
          tags: tagList
        };
      }
    }

    // ---- 2) 基础等级 ----
    var grade = gradeOf(vars);

    // ---- 3) 人格绑定结局 + 等级文案 ----
    var target = null;
    for (var k = 0; k < endings.length; k++) {
      if (!endings[k].hidden && endings[k].personaId === persona.id) {
        target = endings[k];
        break;
      }
    }
    if (!target) {
      // 极端兜底：配置表缺该人格结局时，用第一个人格结局顶上
      for (var m = 0; m < endings.length; m++) {
        if (!endings[m].hidden) {
          target = endings[m];
          break;
        }
      }
    }

    var narration = target && target.grades && target.grades[grade]
      ? target.grades[grade].narration
      : '这一局就这样过去了。';

    return {
      quality: grade,
      hidden: false,
      endingId: target ? target.id + '_' + grade : 'END_UNKNOWN_' + grade,
      title: target ? target.title : '无名剧本',
      narration: narration,
      ending: target,
      index: indexVal,
      indexLabel: band.label,
      indexKey: band.key,
      tags: tagList
    };
  }

  /** 阶段评级：用于每阶段结束时的即时反馈 */
  function stageRating(attrs) {
    var avg = NS.AttrSystem.average(attrs);
    if (avg >= 62 && attrs.cash >= 55) return { key: 'good', label: '好' };
    if (avg >= 42) return { key: 'mid', label: '中' };
    return { key: 'bad', label: '差' };
  }

  NS.EndingJudge = {
    judge: judge,
    gradeOf: gradeOf,
    stageRating: stageRating,
    buildVars: buildVars,
    wealthIndex: wealthIndex,
    indexBand: indexBand,
    tagsOf: tagsOf,
    INDEX_BANDS: INDEX_BANDS,
    INDEX_ANCHORS: INDEX_ANCHORS,
    INDEX_WEIGHT: INDEX_WEIGHT
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
