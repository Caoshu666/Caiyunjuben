/**
 * canvas-kit.js —— Canvas 绘制工具（雷达图 / 结果卡）
 *
 * 为什么 uni-app 版本里还留着 Canvas？
 *   整个界面已经改成 Vue 组件 + CSS 了，唯独两处必须用 Canvas：
 *     1) 雷达图 —— 五边形数据面，纯 CSS 做出来要么变形要么在部分小程序端不支持
 *        （clip-path 兼容性不稳），Canvas 反而是最稳的方案；
 *     2) 结果卡 —— 它的最终用途是「变成一张图片」发给朋友，所以它天然就该是
 *        一张画布。这样「保存到相册」是所见即所得，不需要额外引 html2canvas。
 *
 * ★ 属性名与危机线一律从逻辑层取（core/attr-system.js），不在这里重新写一份。
 *   上游版本正是在 ui-kit.js 里硬编码了一套 LABEL，改配置表时漏改一处就会
 *   出现「属性条显示旧名字、属性 chips 显示新名字」这类难查的错位。
 *
 * API 约定：这里用的是 uni 的 CanvasContext，且统一用**属性赋值**风格
 * （ctx.fillStyle = ...）而不是 setFillStyle() 方法 —— 属性风格在 H5 与
 * 各小程序端都是标准写法，setXxx 系列已标记废弃。
 *
 * 坐标系统一使用【设计像素】：750rpx 宽的设计稿里 1 设计像素 = 1rpx。
 * 调用方负责把 canvas 的尺寸与 designWidth 对齐（见各组件实现）。
 */
import WS from '../ws.js';

export const FONT_FAMILY = 'PingFang SC, Microsoft YaHei, Hiragino Sans GB, sans-serif';

export const COLORS = {
  bg: '#FAF7F0',
  surface: '#FFFFFF',
  surface2: '#FDF9EF',
  surface3: '#F4F1EA',
  ink: '#221D16',
  ink2: '#544B3E',
  muted: '#8C8271',
  gold: '#B8860B',
  gold2: '#D9A520',
  gold3: '#F2C94C',
  goldLine: '#E7D08A',
  goldInk: '#8A6D1F',
  line: '#E9E1D2',
  cardInk: '#6B6152',
  cardBg1: '#FFFDF7',
  cardBg2: '#FDF6E2',
  cardBg3: '#F8EAC4'
};

/** 结局品质配色，与 uni.scss 里的 $ws-q-* 保持同步 */
export const QUALITY = {
  S: { color: '#8A6D1F', bg: '#FFF6DA', border: '#EBCF7E' },
  A: { color: '#3F7A5C', bg: '#EFF6F1', border: '#BEDCCB' },
  B: { color: '#5A6E86', bg: '#F1F4F8', border: '#CBD6E2' },
  C: { color: '#8C8271', bg: '#F6F3EF', border: '#E2DACE' }
};

/* ---- 以下三项的唯一来源是 core/attr-system.js，此处只是转发 ---- */

/** 属性 key 的固定顺序 */
export const ATTRS = WS.AttrSystem.ATTRS;

/** 属性中文名 */
export const ATTR_LABEL = WS.AttrSystem.LABEL;

/** 各属性的危机线：跌破即标红 */
export const CRISIS_LINE = WS.AttrSystem.CRISIS_LINE;

/* ------------------------------------------------------------------ */
/* 基础绘制                                                            */
/* ------------------------------------------------------------------ */

export function setFont(ctx, size, weight) {
  ctx.font = (weight ? weight + ' ' : '') + size + 'px ' + FONT_FAMILY;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y + rr, x + rr, y, rr);
  ctx.closePath();
}

export function text(ctx, str, x, y, opt) {
  opt = opt || {};
  setFont(ctx, opt.size || 26, opt.weight);
  ctx.fillStyle = opt.color || COLORS.ink;
  ctx.textAlign = opt.align || 'left';
  ctx.textBaseline = opt.baseline || 'top';
  ctx.fillText(String(str), x, y);
}

/** 中英文混排的按字符换行（Canvas 没有自动换行，只能自己量） */
export function wrapLines(ctx, str, maxWidth, size, weight) {
  setFont(ctx, size, weight);
  const paragraphs = String(str).split('\n');
  const out = [];
  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    if (para === '') {
      out.push('');
      continue;
    }
    let line = '';
    for (let i = 0; i < para.length; i++) {
      const test = line + para.charAt(i);
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        out.push(line);
        line = para.charAt(i);
      } else {
        line = test;
      }
    }
    if (line !== '') out.push(line);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 5 维雷达图                                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {CanvasContext} ctx
 * @param {number} cx 圆心 x（设计像素）
 * @param {number} cy 圆心 y
 * @param {number} r  外接圆半径
 * @param {Array<{label:string,value:number}>} entries 恰好 5 项
 * @param {Object} opt { labelSize, fill, stroke }
 */
export function radar(ctx, cx, cy, r, entries, opt) {
  opt = opt || {};
  const n = entries.length;
  if (!n) return;

  function pt(idx, ratio) {
    const ang = -Math.PI / 2 + (Math.PI * 2 * idx) / n;
    return { x: cx + Math.cos(ang) * r * ratio, y: cy + Math.sin(ang) * r * ratio };
  }

  // 网格（三圈）
  const rings = [0.35, 0.68, 1];
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  for (let k = 0; k < rings.length; k++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p = pt(i, rings[k]);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // 轴线
  ctx.strokeStyle = '#EDE4D0';
  for (let i = 0; i < n; i++) {
    const pe = pt(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pe.x, pe.y);
    ctx.stroke();
  }

  // 数据面
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const pv = pt(i, Math.max(0.04, Math.min(1, entries[i].value / 100)));
    if (i === 0) ctx.moveTo(pv.x, pv.y);
    else ctx.lineTo(pv.x, pv.y);
  }
  ctx.closePath();
  ctx.fillStyle = opt.fill || 'rgba(242,201,76,0.42)';
  ctx.fill();
  ctx.strokeStyle = opt.stroke || COLORS.gold2;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 维度标签
  for (let i = 0; i < n; i++) {
    const lp = pt(i, 1.24);
    text(ctx, entries[i].label, lp.x, lp.y, {
      size: opt.labelSize || 20,
      color: COLORS.muted,
      align: 'center',
      baseline: 'middle'
    });
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

/* ------------------------------------------------------------------ */
/* 结果卡（导出图片用，540 × 760 设计像素）                              */
/* ------------------------------------------------------------------ */

const CARD_W = 540;
const CARD_H = 760;

/**
 * 把结果卡画到 canvas 上
 * @param {CanvasContext} ctx
 * @param {Object} d {
 *   persona, attrs, result, pseudoPercent
 * }
 *
 * 与原 Canvas 版本的区别：原版直接画在 750×1334 的主画布上，
 * 这里抽成独立函数、只画卡片本身（540×800），这样它既能当页面上的展示，
 * 也能直接导出成图片。卡片内部的坐标全部相对卡片左上角。
 */
export function drawResultCard(ctx, d) {
  const persona = d.persona || {};
  const attrs = d.attrs || {};
  const r = d.result || {};
  const q = QUALITY[r.quality] || QUALITY.B;

  const cardX = 0;
  const cardY = 0;
  const cardW = CARD_W;
  const cardH = CARD_H;

  // 卡片底（竖向渐变）
  const grd = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  grd.addColorStop(0, COLORS.cardBg1);
  grd.addColorStop(0.55, COLORS.cardBg2);
  grd.addColorStop(1, COLORS.cardBg3);
  ctx.fillStyle = grd;
  roundRect(ctx, cardX, cardY, cardW, cardH, 26);
  ctx.fill();
  ctx.strokeStyle = COLORS.goldLine;
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardX + 0.75, cardY + 0.75, cardW - 1.5, cardH - 1.5, 26);
  ctx.stroke();

  const cx = cardX + cardW / 2;

  // 卡头
  text(ctx, '我的财运剧本', cx, cardY + 44, {
    size: 24, weight: 'bold', color: COLORS.goldInk, align: 'center'
  });
  ctx.strokeStyle = COLORS.goldLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 30, cardY + 74);
  ctx.lineTo(cardX + cardW - 30, cardY + 74);
  ctx.stroke();

  // 人格徽章
  ctx.beginPath();
  ctx.arc(cx, cardY + 136, 44, 0, Math.PI * 2);
  ctx.fillStyle = persona.color || COLORS.gold;
  ctx.fill();
  text(ctx, persona.badge || '财', cx, cardY + 136, {
    size: 38, weight: 'bold', color: '#FFFFFF', align: 'center', baseline: 'middle'
  });

  text(ctx, persona.name || '', cx, cardY + 206, {
    size: 40, weight: 'bold', color: COLORS.ink, align: 'center'
  });
  text(ctx, '结局 · ' + (r.title || ''), cx, cardY + 262, {
    size: 25, color: COLORS.ink2, align: 'center'
  });

  // 品质 + 财运指数合并成一个 pill
  //
  // 为什么不另起一行：卡片总高 800 已经排满了，插一行就得整体重排（雷达图、
  // 属性行全要挪），风险远大于收益。而这两项本来就该并排读 ——
  // 「S 级剧本 · 财运指数 82」，一个是名次、一个是分数。
  const pillText =
    (r.quality || '') + ' 级剧本 · 财运指数 ' + (r.index === undefined || r.index === null ? '--' : r.index);
  const pillW = 336;
  ctx.fillStyle = q.bg;
  roundRect(ctx, cx - pillW / 2, cardY + 300, pillW, 42, 21);
  ctx.fill();
  ctx.strokeStyle = q.border;
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - pillW / 2, cardY + 300, pillW, 42, 21);
  ctx.stroke();
  text(ctx, pillText, cx, cardY + 321, {
    size: 21, weight: 'bold', color: q.color, align: 'center', baseline: 'middle'
  });

  // 旁白（最多 3 行，避免长文案把卡片撑破）
  const lines = wrapLines(ctx, r.narration || '', cardW - 90, 21).slice(0, 3);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  setFont(ctx, 21);
  ctx.fillStyle = COLORS.cardInk;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, cardY + 366 + i * 32);
  }

  // 迷你雷达（用属性首字当标签）
  const entries = ATTRS.map(function (k) {
    return { label: (ATTR_LABEL[k] || k).charAt(0), value: attrs[k] || 0 };
  });
  radar(ctx, cx, cardY + 560, 92, entries, { labelSize: 17 });

  // 属性终值
  text(
    ctx,
    ATTRS.map(function (k) {
      return (ATTR_LABEL[k] || k) + (attrs[k] || 0);
    }).join('  '),
    cx,
    cardY + 676,
    { size: 20, color: COLORS.ink2, align: 'center' }
  );

  // 稀有度钩子
  const pw = 320;
  ctx.fillStyle = '#FFF6DA';
  roundRect(ctx, cx - pw / 2, cardY + 706, pw, 38, 19);
  ctx.fill();
  ctx.strokeStyle = '#EBCF7E';
  ctx.lineWidth = 1;
  roundRect(ctx, cx - pw / 2, cardY + 706, pw, 38, 19);
  ctx.stroke();
  text(ctx, '全服仅 ' + (d.pseudoPercent || '0.0') + '% 玩家达成此结局', cx, cardY + 725, {
    size: 20, weight: 'bold', color: COLORS.goldInk, align: 'center', baseline: 'middle'
  });

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

export const CARD_SIZE = { width: CARD_W, height: CARD_H };

export default {
  FONT_FAMILY,
  COLORS,
  QUALITY,
  ATTRS,
  ATTR_LABEL,
  CRISIS_LINE,
  setFont,
  roundRect,
  text,
  wrapLines,
  radar,
  drawResultCard,
  CARD_SIZE
};
