/**
 * 配置表 2/6 —— question.js 题库表
 *
 * 24 道题，每个维度 6 道。测试时每维度抽 2 道，共 8 题。
 * 每题一个主维度 dim，选项给该维度打 0 / 1 / 2 分。
 * 因此每个维度的最终得分严格落在 0-4，与人格表的 condition 完全对齐。
 *
 * 注意：选项的展示顺序会在运行时被 TestEngine 打乱（防作弊），
 * 所以这里 options 的书写顺序（低→高）不代表玩家看到的顺序。
 * 想扩展成「一题同时影响多个维度」也可以：给 option.dim 里多写几个键即可，
 * 引擎与人格表都支持，只是最终会把每个维度裁剪到 0-4。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.question = [
    /* ============ RISK 风险偏好 ============ */
    {
      id: 'Q_R1', dim: 'RISK',
      stem: '手里突然多出一笔闲钱，你会先做什么？',
      options: [
        { text: '存起来，或者买点稳健理财', dim: { RISK: 0 } },
        { text: '先放一部分试试水', dim: { RISK: 1 } },
        { text: '看准了就直接重仓进去', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R2', dim: 'RISK',
      stem: '有件事：一半概率翻倍，一半概率全没。你？',
      options: [
        { text: '不参与，我受不了这个', dim: { RISK: 0 } },
        { text: '投一点点，当买张彩票', dim: { RISK: 1 } },
        { text: '能投多少投多少', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R3', dim: 'RISK',
      stem: '朋友拉你合伙创业，需要你拿出一半积蓄。',
      options: [
        { text: '婉拒，稳妥为上', dim: { RISK: 0 } },
        { text: '先谈条件、要股份再决定', dim: { RISK: 1 } },
        { text: '直接干，机会不等人', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R4', dim: 'RISK',
      stem: '下面哪句话你最认同？',
      options: [
        { text: '不亏就是赚', dim: { RISK: 0 } },
        { text: '风险和收益成正比', dim: { RISK: 1 } },
        { text: '富贵险中求', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R5', dim: 'RISK',
      stem: '突然被裁员，手里只够撑六个月。',
      options: [
        { text: '马上找一份稳定的工作', dim: { RISK: 0 } },
        { text: '一边找，一边接点私活过渡', dim: { RISK: 1 } },
        { text: '干脆全职做自己的项目', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R6', dim: 'RISK',
      stem: '关于买房这件事，你的态度是？',
      options: [
        { text: '攒够钱再说，不借杠杆', dim: { RISK: 0 } },
        { text: '适度贷款是可以接受的', dim: { RISK: 1 } },
        { text: '能加杠杆就加杠杆，早上车早好', dim: { RISK: 2 } }
      ]
    },

    /* ============ CHANCE 机会敏感 ============ */
    {
      id: 'Q_C1', dim: 'CHANCE',
      stem: '你听到同事闲聊，说某个行业最近「要起飞」。',
      options: [
        { text: '听听就算了，跟我没什么关系', dim: { CHANCE: 0 } },
        { text: '回头查查资料，看看是不是真的', dim: { CHANCE: 1 } },
        { text: '立刻去找相关的人和信息交叉验证', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C2', dim: 'CHANCE',
      stem: '你一般怎么发现机会？',
      options: [
        { text: '别人告诉我，我才知道', dim: { CHANCE: 0 } },
        { text: '平时会留意一下行业动态', dim: { CHANCE: 1 } },
        { text: '主动泡在信息源里，通常比身边人早知道', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C3', dim: 'CHANCE',
      stem: '出现一个新平台 / 新工具，你会？',
      options: [
        { text: '等它成熟了、大家都用了再说', dim: { CHANCE: 0 } },
        { text: '先观望一阵，看看别人怎么用', dim: { CHANCE: 1 } },
        { text: '第一时间上手试，做第一批吃螃蟹的', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C4', dim: 'CHANCE',
      stem: '你的信息来源主要是？',
      options: [
        { text: '基本靠熟人聊天和短视频', dim: { CHANCE: 0 } },
        { text: '有几个固定看的号或群', dim: { CHANCE: 1 } },
        { text: '多渠道交叉验证，偶尔自己挖数据', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C5', dim: 'CHANCE',
      stem: '一个同事跳槽去了家你没听过的公司，你会？',
      options: [
        { text: '祝福一下就过去了', dim: { CHANCE: 0 } },
        { text: '问问那边待遇怎么样', dim: { CHANCE: 1 } },
        { text: '研究一下这家公司值不值得自己跟进', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C6', dim: 'CHANCE',
      stem: '「信息差」这三个字，你怎么看？',
      options: [
        { text: '现在信息这么透明，没什么差', dim: { CHANCE: 0 } },
        { text: '多少还是有用的', dim: { CHANCE: 1 } },
        { text: '钱基本上都是在信息差里赚的', dim: { CHANCE: 2 } }
      ]
    },

    /* ============ SOCIAL 关系依赖 ============ */
    {
      id: 'Q_S1', dim: 'SOCIAL',
      stem: '遇到一个你搞不定的问题，你会？',
      options: [
        { text: '自己硬啃，实在不行就算了', dim: { SOCIAL: 0 } },
        { text: '先自己试，不行再找人问', dim: { SOCIAL: 1 } },
        { text: '直接找那个能搞定的人', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S2', dim: 'SOCIAL',
      stem: '年终奖发下来，你最想做的第一件事是？',
      options: [
        { text: '存进定期或买稳健理财', dim: { SOCIAL: 0 } },
        { text: '给自己买点一直想买的东西', dim: { SOCIAL: 1 } },
        { text: '请几个关键的人吃顿饭', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S3', dim: 'SOCIAL',
      stem: '关于饭局，你的真实状态是？',
      options: [
        { text: '能推就推，不如回家躺着', dim: { SOCIAL: 0 } },
        { text: '必要的才去，去完就走', dim: { SOCIAL: 1 } },
        { text: '会主动攒局，认识新的人', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S4', dim: 'SOCIAL',
      stem: '换工作的时候，你更依赖哪种方式？',
      options: [
        { text: '投简历，走流程', dim: { SOCIAL: 0 } },
        { text: '看猎头或招聘平台推的', dim: { SOCIAL: 1 } },
        { text: '找朋友内推，直接聊到用人的人', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S5', dim: 'SOCIAL',
      stem: '一个还算熟的朋友找你借钱。',
      options: [
        { text: '直接拒绝，钱和朋友不能混', dim: { SOCIAL: 0 } },
        { text: '借个小数目，权当送', dim: { SOCIAL: 1 } },
        { text: '能借就借，人比钱重要', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S6', dim: 'SOCIAL',
      stem: '对你来说，「人脉」是什么？',
      options: [
        { text: '挺麻烦的，不如自己变强', dim: { SOCIAL: 0 } },
        { text: '偶尔能用得上的资源', dim: { SOCIAL: 1 } },
        { text: '最重要的资产之一', dim: { SOCIAL: 2 } }
      ]
    },

    /* ============ EGO 自我认知 ============ */
    {
      id: 'Q_E1', dim: 'EGO',
      stem: '复盘一次失败的时候，你更常想的是什么？',
      options: [
        { text: '运气不好，时机不对', dim: { EGO: 0 } },
        { text: '一半运气，一半自己', dim: { EGO: 1 } },
        { text: '主要是我自己判断错了', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E2', dim: 'EGO',
      stem: '你觉得自己是个什么样的人？',
      options: [
        { text: '就是个普通人', dim: { EGO: 0 } },
        { text: '有点东西，但也就那样', dim: { EGO: 1 } },
        { text: '运气一直不错，总能抓住点什么', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E3', dim: 'EGO',
      stem: '别人夸你「有眼光」，你的第一反应是？',
      options: [
        { text: '客气一下，哪儿有', dim: { EGO: 0 } },
        { text: '心里还是挺高兴的', dim: { EGO: 1 } },
        { text: '我也这么觉得', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E4', dim: 'EGO',
      stem: '想到五年后的自己，你的感觉是？',
      options: [
        { text: '不太敢想，走一步看一步', dim: { EGO: 0 } },
        { text: '希望能稳中有进吧', dim: { EGO: 1 } },
        { text: '我很确定会比现在好很多', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E5', dim: 'EGO',
      stem: '出了岔子，你习惯先往哪儿找原因？',
      options: [
        { text: '先看外部原因，很多事不怪我', dim: { EGO: 0 } },
        { text: '有时候会回头想想自己', dim: { EGO: 1 } },
        { text: '习惯了先反求诸己', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E6', dim: 'EGO',
      stem: '你相信「命」吗？',
      options: [
        { text: '信，很多东西早就安排好了', dim: { EGO: 0 } },
        { text: '一半一半吧', dim: { EGO: 1 } },
        { text: '我的运气是我自己攒出来的', dim: { EGO: 2 } }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
