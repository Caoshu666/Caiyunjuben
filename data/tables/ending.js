/**
 * 配置表 5/6 —— ending.js 结局表
 *
 * 两块内容：
 *   A. 人格绑定结局 × 10 —— 每个人格一个主结局，主结局再按 S/A/B/C
 *      拆成 4 个文案变体，合计 40 个结局文案。
 *   B. 隐藏结局 × 3 —— condition 满足时优先命中，品质固定 S 级。
 *
 * 判定优先级：隐藏结局 > 人格绑定结局 + 数值等级。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.ending = [
    /* ============ 人格绑定结局 × 10 ============ */
    {
      id: 'END_STEADY', personaId: 'steady', title: '细水长流',
      grades: {
        S: { narration: '你没暴富过，但你从没让账户见底。回头看，你赢的不是运气，是每一笔都算过的克制。' },
        A: { narration: '你攒下了一份体面的家底。不惊艳，但足够让家里人睡得踏实。' },
        B: { narration: '你没亏，也没赚太多。日子平平顺顺地过完了。' },
        C: { narration: '你守住了很多，但守得有点久。有些机会，你其实看得见，只是没伸手。' }
      }
    },
    {
      id: 'END_AGGRESSIVE', personaId: 'aggressive', title: '孤注一掷',
      grades: {
        S: { narration: '你赌上了全部，然后赢了。别人说你有眼光，只有你知道那几晚没睡着的样子。' },
        A: { narration: '你冲得比谁都快，也摔过几次。好在每一次，你都爬起来了。' },
        B: { narration: '你试过很多次，成了几次，也废了几次。人生一半的精彩都在你可能性的那一半。' },
        C: { narration: '你每一次都把筹码推了出去。有些勇气值得敬佩，但勇气不能当饭吃。' }
      }
    },
    {
      id: 'END_MENTOR', personaId: 'mentor', title: '东风借力',
      grades: {
        S: { narration: '你还不够强，但总有人在关键处拉你一把。你最大的资产，是别人愿意帮你。' },
        A: { narration: '你身边的人，构成了你的护城河。你赚的钱里，有一半是关系给的。' },
        B: { narration: '你有很多朋友，也帮过很多人。关键时候，有人记得你。' },
        C: { narration: '你的人情账户存了很多，只是有些账，一辈子也没取出来。' }
      }
    },
    {
      id: 'END_ACCUMULATOR', personaId: 'accumulator', title: '种树的人',
      grades: {
        S: { narration: '你走得慢，但每一步都算数。时间最后替你算了一次复利，数字大得吓人。' },
        A: { narration: '你没有一夜暴富，但你种的树，已经能乘凉了。' },
        B: { narration: '你踏实、稳定、从不冒险。收获不算多，但一年比一年厚。' },
        C: { narration: '你很勤恳，但勤恳只解决了一半的问题。方向，可能比努力更重要。' }
      }
    },
    {
      id: 'END_HUNTER', personaId: 'hunter', title: '追风者',
      grades: {
        S: { narration: '你抓住了三次风口，也被吹散过两次。但最后，你站在了风里。' },
        A: { narration: '你总能比身边人早半步知道。这半步，值很多钱。' },
        B: { narration: '你看得见趋势，但有时候看得见和拿得住，是两件事。' },
        C: { narration: '你一直在追风，却总在风停的时候才赶到。' }
      }
    },
    {
      id: 'END_AVERAGE', personaId: 'average', title: '大众剧本',
      grades: {
        S: { narration: '你什么都不极端，却在每一件事上都拿到了及格线以上。稳定，本身就是一种稀缺。' },
        A: { narration: '你活成了还不错的样子：有房、有存款、有几个朋友。' },
        B: { narration: '你活成了大多数人的样子。这不丢人，大多数人也是这么想的。' },
        C: { narration: '你哪条路都没走到底，于是哪条路的风景都没看全。' }
      }
    },
    {
      id: 'END_GAMBLER', personaId: 'gambler', title: '过山车人生',
      grades: {
        S: { narration: '你在天台和巅峰之间来回横跳，最后一次靠岸的时候，你成了赢家。' },
        A: { narration: '你的资产曲线像心电图，但最后是往上走的。' },
        B: { narration: '你赚过也亏过，起起落落，最后剩下的和一开始差不多。' },
        C: { narration: '你每次都相信下一把会翻本。这句话本身，就是最大的坑。' }
      }
    },
    {
      id: 'END_TIMID', personaId: 'timid', title: '错过清单',
      grades: {
        S: { narration: '你什么风险都没冒，于是什么坑都没踩。你的账户很干净，干净得让人羡慕。' },
        A: { narration: '你守住了底线，也守住了生活。没赚大钱，但没吃过亏。' },
        B: { narration: '你的账户很安全。同时，你的遗憾也很整齐地排在那儿。' },
        C: { narration: '这十几年，你做得最多的一件事就是「再等等」。等着等着，就过去了。' }
      }
    },
    {
      id: 'END_NETWORKER', personaId: 'networker', title: '场子里的人',
      grades: {
        S: { narration: '你的资源都在饭桌上，你的机会都在电话里。你赚的每一笔，背后都有人。' },
        A: { narration: '你混出了一张别人挤不进去的网。网越大，捞上来的越多。' },
        B: { narration: '你认识很多人，很多人也认识你。这已经比大多数人强了。' },
        C: { narration: '你把人脉当资产，但有些关系，只在你有用的时候才成立。' }
      }
    },
    {
      id: 'END_LUCKY', personaId: 'lucky', title: '意外之财',
      grades: {
        S: { narration: '连你自己都不知道为什么这么顺。但你在顺的时候没有飘，这才是最难的。' },
        A: { narration: '你的运气一直不错。更不错的是，你在运气好的时候做了对的事。' },
        B: { narration: '你总能遇到一些好事。虽然你也没太想明白为什么。' },
        C: { narration: '好运气来过几次，但每次你都没准备好接住它。' }
      }
    },

    /* ============ 隐藏结局 × 3（品质固定 S） ============ */
    {
      id: 'END_HIDDEN_1', hidden: true, title: '隐形富豪',
      condition: 'lowProfileCount >= 4 && cash < 55 && social >= 70',
      narration: '你从来不说自己有多少钱，也不发朋友圈。你赚的每一分都沉在水面之下 —— ' +
        '账户上的数字不大，但你需要的时候，永远拿得出来。'
    },
    {
      id: 'END_HIDDEN_2', hidden: true, title: '时间的朋友',
      condition: 'longtermCount >= 4',
      narration: '每个阶段，你都选了那条看起来更慢的路。当时没有人夸你聪明。' +
        '十多年后回头看，你发现慢的那条路，其实是唯一走得通的那条。'
    },
    {
      id: 'END_HIDDEN_3', hidden: true, title: '白手起家',
      condition: 'startCash < 50 && cash > 80',
      narration: '开局你手里几乎什么都没有，还敢往里冲。所有人都说你疯了。' +
        '现在他们改口了，说你从一开始就看得很清楚。'
    }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
