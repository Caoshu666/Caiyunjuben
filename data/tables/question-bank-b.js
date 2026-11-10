/**
 * question-bank-b.js —— 题库 B（主题：日常职场与消费决策）
 *
 * 与题库 A（data/tables/question.js）字段格式完全一致。
 * 每题带 set 标记 'B'，供「整库随机」抽取时按套隔离。
 * 24 题，4 维度 × 6 题，选项打 0/1/2 分。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.questionBank_B = [
    /* ============ RISK 风险偏好 ============ */
    {
      id: 'Q_R1_B', dim: 'RISK', set: 'B',
      stem: '工资到账，还完房贷信用卡，剩下一笔钱，你会？',
      options: [
        { text: '存定期/货币基金，稳稳的', dim: { RISK: 0 } },
        { text: '拿一部分买基金或股票', dim: { RISK: 1 } },
        { text: '全部投进去博收益', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R2_B', dim: 'RISK', set: 'B',
      stem: '公司发了笔项目奖金，你第一反应是？',
      options: [
        { text: '先存起来备用', dim: { RISK: 0 } },
        { text: '给自己买个一直想要的东西', dim: { RISK: 1 } },
        { text: '拿去加仓或投个新项目', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R3_B', dim: 'RISK', set: 'B',
      stem: '一个朋友说有个「稳赚」的项目带你，条件是先投一笔。',
      options: [
        { text: '谢谢不用，我信不过', dim: { RISK: 0 } },
        { text: '投一小笔，亏了也不心疼', dim: { RISK: 1 } },
        { text: '机会难得，投一把大的', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R4_B', dim: 'RISK', set: 'B',
      stem: '你更认同下面哪句话？',
      options: [
        { text: '落袋为安', dim: { RISK: 0 } },
        { text: '鸡蛋不要放在一个篮子里', dim: { RISK: 1 } },
        { text: '高收益就要敢冒险', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R5_B', dim: 'RISK', set: 'B',
      stem: '手机里突然推送一个「稳赚不赔」的理财广告。',
      options: [
        { text: '直接划走', dim: { RISK: 0 } },
        { text: '点进去看看，但不会投', dim: { RISK: 1 } },
        { text: '研究一下，可能真能赚', dim: { RISK: 2 } }
      ]
    },
    {
      id: 'Q_R6_B', dim: 'RISK', set: 'B',
      stem: '关于「加杠杆」这件事，你的态度是？',
      options: [
        { text: '从不碰，风险太大', dim: { RISK: 0 } },
        { text: '在可控范围内可以接受', dim: { RISK: 1 } },
        { text: '会用的才有未来', dim: { RISK: 2 } }
      ]
    },

    /* ============ CHANCE 机会敏感 ============ */
    {
      id: 'Q_C1_B', dim: 'CHANCE', set: 'B',
      stem: '你在刷手机时看到一条行业新政策，你会？',
      options: [
        { text: '划走，跟我没关系', dim: { CHANCE: 0 } },
        { text: '大概看一眼', dim: { CHANCE: 1 } },
        { text: '认真读，想想对自己有什么影响', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C2_B', dim: 'CHANCE', set: 'B',
      stem: '你平时怎么了解行业动态？',
      options: [
        { text: '基本不主动了解', dim: { CHANCE: 0 } },
        { text: '偶尔刷到会看看', dim: { CHANCE: 1 } },
        { text: '有几个固定渠道，持续追踪', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C3_B', dim: 'CHANCE', set: 'B',
      stem: '同事说他想做个副业，问你要不要一起，你怎么想？',
      options: [
        { text: '太折腾了，算了吧', dim: { CHANCE: 0 } },
        { text: '先了解一下是什么', dim: { CHANCE: 1 } },
        { text: '觉得有机会，马上深入聊', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C4_B', dim: 'CHANCE', set: 'B',
      stem: '出现一个新的风口，你会？',
      options: [
        { text: '等它凉了再看热闹', dim: { CHANCE: 0 } },
        { text: '观望，看别人先试', dim: { CHANCE: 1 } },
        { text: '第一时间去研究怎么做', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C5_B', dim: 'CHANCE', set: 'B',
      stem: '一个朋友跟你说「这个行业要火」，你会？',
      options: [
        { text: '听听就好，不一定准', dim: { CHANCE: 0 } },
        { text: '留意一下，后面验证', dim: { CHANCE: 1 } },
        { text: '马上去查资料、找人聊', dim: { CHANCE: 2 } }
      ]
    },
    {
      id: 'Q_C6_B', dim: 'CHANCE', set: 'B',
      stem: '你觉得自己对「机会」的敏感度是？',
      options: [
        { text: '基本抓不到，错过了才知道', dim: { CHANCE: 0 } },
        { text: '有时能感觉到，但行动慢', dim: { CHANCE: 1 } },
        { text: '经常比身边人先看到机会', dim: { CHANCE: 2 } }
      ]
    },

    /* ============ SOCIAL 关系依赖 ============ */
    {
      id: 'Q_S1_B', dim: 'SOCIAL', set: 'B',
      stem: '遇到一个搞不定的难题，你会？',
      options: [
        { text: '自己慢慢磨，不求人', dim: { SOCIAL: 0 } },
        { text: '先自己试，不行再问', dim: { SOCIAL: 1 } },
        { text: '直接找最懂的人帮忙', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S2_B', dim: 'SOCIAL', set: 'B',
      stem: '你请别人帮了忙，一般会怎么回报？',
      options: [
        { text: '说声谢谢就行', dim: { SOCIAL: 0 } },
        { text: '下次也帮对方一次', dim: { SOCIAL: 1 } },
        { text: '主动请吃饭/送礼，维护关系', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S3_B', dim: 'SOCIAL', set: 'B',
      stem: '关于维护人脉，你的真实状态是？',
      options: [
        { text: '随缘，不怎么刻意', dim: { SOCIAL: 0 } },
        { text: '偶尔联络一下重要的人', dim: { SOCIAL: 1 } },
        { text: '有意识经营，定期维护', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S4_B', dim: 'SOCIAL', set: 'B',
      stem: '你需要换个工作，会优先怎么做？',
      options: [
        { text: '自己投简历海投', dim: { SOCIAL: 0 } },
        { text: '找猎头/招聘平台', dim: { SOCIAL: 1 } },
        { text: '找熟人内推', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S5_B', dim: 'SOCIAL', set: 'B',
      stem: '一个不太熟的朋友突然请你帮个大忙。',
      options: [
        { text: '婉拒，不太想掺和', dim: { SOCIAL: 0 } },
        { text: '看情况，能帮就帮一点', dim: { SOCIAL: 1 } },
        { text: '能帮就帮，多个朋友多条路', dim: { SOCIAL: 2 } }
      ]
    },
    {
      id: 'Q_S6_B', dim: 'SOCIAL', set: 'B',
      stem: '对你来说，人脉的价值是？',
      options: [
        { text: '锦上添花，不是必需', dim: { SOCIAL: 0 } },
        { text: '关键时刻能帮上忙', dim: { SOCIAL: 1 } },
        { text: '最重要的资源之一', dim: { SOCIAL: 2 } }
      ]
    },

    /* ============ EGO 自我认知 ============ */
    {
      id: 'Q_E1_B', dim: 'EGO', set: 'B',
      stem: '事情搞砸了，你第一时间会想？',
      options: [
        { text: '运气不好，不怪我', dim: { EGO: 0 } },
        { text: '有运气成分，也有自己的问题', dim: { EGO: 1 } },
        { text: '主要是我哪里没做好', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E2_B', dim: 'EGO', set: 'B',
      stem: '你对自己能力的评价是？',
      options: [
        { text: '挺普通的，没什么特别', dim: { EGO: 0 } },
        { text: '还行，有长处也有短板', dim: { EGO: 1 } },
        { text: '我很清楚自己强在哪', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E3_B', dim: 'EGO', set: 'B',
      stem: '别人夸你，你的反应通常是？',
      options: [
        { text: '不好意思，连连推辞', dim: { EGO: 0 } },
        { text: '礼貌回应，心里开心', dim: { EGO: 1 } },
        { text: '坦然接受，我确实做得好', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E4_B', dim: 'EGO', set: 'B',
      stem: '展望未来几年，你的感觉是？',
      options: [
        { text: '不太敢想，走一步看一步', dim: { EGO: 0 } },
        { text: '希望越来越好', dim: { EGO: 1 } },
        { text: '我很确定会更好', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E5_B', dim: 'EGO', set: 'B',
      stem: '遇到挫折，你习惯？',
      options: [
        { text: '先找外部原因', dim: { EGO: 0 } },
        { text: '内外都看看', dim: { EGO: 1 } },
        { text: '先反思自己', dim: { EGO: 2 } }
      ]
    },
    {
      id: 'Q_E6_B', dim: 'EGO', set: 'B',
      stem: '你相信自己能掌控自己的人生吗？',
      options: [
        { text: '不太能，很多事不由我', dim: { EGO: 0 } },
        { text: '一半一半', dim: { EGO: 1 } },
        { text: '基本能，取决于我的选择', dim: { EGO: 2 } }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
