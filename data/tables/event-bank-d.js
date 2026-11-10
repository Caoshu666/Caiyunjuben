/**
 * 事件库 D —— 「家庭与责任」主题
 * 与 event.js（事件库 A）结构完全一致，侧重家庭、婚姻、赡养、子女教育、
 * 亲情与责任等人生阶段的重要抉择。
 *
 * 数值严格对齐 A 套量级，保持结局分布不变。连锁事件自成闭环。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.eventBank_D = [
    /* ==================== 第 1 阶段 · 初入社会 ==================== */
    {
      id: 'D1E1', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['networker', 'mentor'],
      title: '第一份工资',
      desc: '你拿到了人生第一份工资，虽然不多，但意义非凡。',
      options: [
        { text: '给爸妈买点东西', effect: { social: 8, cash: -5, cognition: 2 }, narration: '你用第一份工资给爸妈买了礼物。他们嘴上说浪费，眼里全是笑。' },
        { text: '存起来，先攒着', effect: { cash: 6, cognition: 3, social: -2 }, narration: '你把工资存了起来。理性，但也少了点温度。', flag: 'low_profile' }
      ]
    },
    {
      id: 'D1E2', stage: 1, type: 'chance', rarity: 'R', weight: 80, personaTags: ['hunter', 'aggressive'],
      title: '家里给安排工作',
      desc: '家里托关系给你安排了一份稳定但没什么前途的工作。',
      options: [
        { text: '拒绝，自己闯', effect: { guts: 7, cash: 3, cognition: 2 }, narration: '你拒绝了家里的安排，选择自己闯。辛苦，但路是自己选的。', flag: 'aggressive' },
        { text: '接受，先稳定下来', effect: { cash: 5, cognition: 2, social: 2 }, narration: '你接受了安排。稳定，但也少了点冲劲。', flag: 'longterm' },
        { text: '接受，边做边看', effect: { cognition: 4, cash: 4, social: 2 }, narration: '你接受了安排，但没放弃自己的想法，边做边寻找机会。' }
      ]
    },
    {
      id: 'D1E3', stage: 1, type: 'negative', rarity: 'N', weight: 100, personaTags: [],
      title: '随份子压力',
      desc: '这个月好几个同学朋友结婚，份子钱压得你喘不过气。',
      options: [
        { text: '量力而行，不硬撑', effect: { cash: -5, cognition: 5 }, narration: '你根据自己的情况量力随礼。人情世故，也要量力。' },
        { text: '硬撑着给足面子', effect: { cash: -10, social: 3, cognition: -2 }, narration: '你硬撑着给足了份子钱。面子有了，钱包空了。' }
      ]
    },
    {
      id: 'D1E4', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['aggressive', 'lucky'],
      title: '父母生病',
      desc: '父母突然生病住院，需要一笔医疗费，而你的积蓄不多。',
      options: [
        { text: '全力承担，想办法凑钱', effect: { cash: -8, guts: 6, cognition: 3, social: 3 }, narration: '你四处筹钱，全力承担。家人，是最大的责任。' },
        { text: '和兄弟姐妹一起分担', effect: { cash: -5, social: 6, cognition: 3 }, narration: '你和兄弟姐妹一起商量分担。家庭，本就是互相扶持。' }
      ]
    },
    {
      id: 'D1E5', stage: 1, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'cash <= 25',
      title: '家庭变故',
      desc: '家里突然出了变故，急需一笔钱周转，而你手头很紧。',
      options: [
        { text: '跟朋友借', effect: { cash: 15, social: -5, guts: -3 }, narration: '你硬着头皮跟朋友借了钱。钱借到了，人情也欠下了。' },
        { text: '网贷应急', effect: { cash: 11, guts: 3, cognition: -5 }, narration: '你用了网贷应急。应急是应急了，但利息压人。' },
        { text: '变卖自己的东西', effect: { cash: 8, cognition: 3, guts: 3 }, narration: '你变卖了自己的贵重物品，凑够了钱。心疼，但值得。' }
      ]
    },
    {
      id: 'D1E6', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '相亲',
      desc: '家里给你安排了一场相亲，对方条件不错。',
      options: [
        { text: '认真对待，好好了解', effect: { social: 7, cognition: 3, cash: -2 }, narration: '你认真去见了，聊得不错。缘分，有时候需要主动。' },
        { text: '敷衍了事', effect: { cognition: 2, social: -2 }, narration: '你敷衍地见了一面，没怎么上心。错过了一个可能合适的人。', flag: 'low_profile' }
      ]
    },
    {
      id: 'D1E7', stage: 1, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['steady', 'accumulator', 'gambler'],
      title: '买房首付',
      desc: '你到了谈婚论嫁的年纪，买房成了绕不开的话题。',
      options: [
        { text: '和家里一起凑首付', effect: { cash: -8, social: 5, cognition: 3, guts: 2 }, narration: '家里帮你凑了部分首付。你有了房，也有了压力。', flag: 'longterm' },
        { text: '自己攒，不靠家里', effect: { cash: 5, guts: 7, cognition: 2 }, narration: '你决定自己攒钱买房，不靠家里。辛苦，但有骨气。', flag: 'aggressive' },
        { text: '先租房，不着急', effect: { cash: 6, cognition: 5, guts: -3 }, narration: '你选择先租房，把买房往后放。自由，也是一种选择。' }
      ]
    },
    {
      id: 'D1E8', stage: 1, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '被催婚',
      desc: '逢年过节，家里亲戚的催婚大军又来了，让你不胜其烦。',
      options: [
        { text: '耐心沟通，说明想法', effect: { social: 5, cognition: 4, cash: -2 }, narration: '你耐心跟家人沟通了你的想法。虽然没完全解决，但至少被理解了。' },
        { text: '敷衍应付，敷衍过去', effect: { cognition: 2, social: -3 }, narration: '你敷衍地应付了过去。问题还在，只是被暂时压下了。', flag: 'low_profile' },
        { text: '正面硬刚', effect: { cash: -2, guts: 5, social: -4 }, narration: '你正面硬刚了回去。爽是爽了，但家庭关系有点僵。' }
      ]
    },

    /* ==================== 第 2 阶段 · 积累期 ==================== */
    {
      id: 'D2E1', stage: 2, type: 'chance', rarity: 'R', weight: 85, personaTags: ['aggressive', 'hunter'],
      title: '结婚',
      desc: '你和恋人决定结婚，但婚礼、彩礼、房子都是一笔不小的开销。',
      options: [
        { text: '办得体面，一步到位', effect: { cash: -10, social: 8, guts: 3 }, narration: '你办了一场体面的婚礼。累，但值得。', flag: 'aggressive' },
        { text: '简办，把钱花在刀刃上', effect: { cash: -4, social: 4, cognition: 5 }, narration: '你选择简办，把钱省下来用在更重要的地方。', flag: 'longterm' },
        { text: '旅行结婚，不办酒席', effect: { cash: -6, cognition: 4, social: -3 }, narration: '你选择了旅行结婚。少了热闹，多了浪漫。' }
      ]
    },
    {
      id: 'D2E2', stage: 2, type: 'positive', rarity: 'N', weight: 100, personaTags: ['accumulator', 'hunter'],
      title: '孩子出生',
      desc: '你迎来了人生的新阶段——孩子出生了。',
      options: [
        { text: '全职陪伴一段时间', effect: { cash: -8, social: 8, cognition: 3 }, narration: '你选择全职陪伴孩子一段时间。虽然收入少了，但陪伴无价。' },
        { text: '继续工作，请人带', effect: { cash: 4, cognition: 4, social: -3 }, narration: '你选择继续工作，请人帮忙带。事业和家庭，总要取舍。' }
      ]
    },
    {
      id: 'D2E3', stage: 2, type: 'negative', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '房贷压力',
      desc: '每个月的房贷，像一座大山，压得你有点喘不过气。',
      options: [
        { text: '咬牙坚持，开源节流', effect: { cash: -6, cognition: 5, guts: 4 }, narration: '你开源节流，咬牙坚持。熬过了最难的阶段，就好了。' },
        { text: '考虑卖掉换小的', effect: { cash: -3, cognition: 5, guts: -3 }, narration: '你考虑卖掉换个小点的。量力而行，也是一种智慧。', flag: 'low_profile' }
      ]
    },
    {
      id: 'D2E4', stage: 2, type: 'positive', rarity: 'R', weight: 70, personaTags: ['aggressive', 'networker'],
      title: '家庭投资决策',
      desc: '家里有一笔闲钱，你和家人对怎么投资产生了分歧。',
      options: [
        { text: '坚持自己的判断', effect: { cash: 8, guts: 7, social: -3 }, narration: '你坚持了自己的判断，最终证明你是对的。', flag: 'aggressive' },
        { text: '尊重家人意见', effect: { cash: 4, social: 6, cognition: 3 }, narration: '你尊重了家人的意见。钱可能少赚了，但家庭更和睦。', flag: 'longterm' },
        { text: '折中处理', effect: { cash: 5, cognition: 4, social: 4 }, narration: '你选择了折中方案。两边都照顾到了。' }
      ]
    },
    {
      id: 'D2E5', stage: 2, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['hunter', 'mentor'],
      title: '换大房子',
      desc: '随着家庭人口增多，现在的小房子有点不够住了。',
      options: [
        { text: '换大房子，改善居住', effect: { cash: -12, guts: 7, social: 4, cognition: 3 }, narration: '你换了大房子。虽然压力大了，但家人的生活品质提高了。', flag: 'aggressive' },
        { text: '先不换，改造现有', effect: { cash: -4, cognition: 5, guts: -2 }, narration: '你选择改造现有房子。省下的钱，可以做别的。', flag: 'longterm' },
        { text: '再等等，看房价', effect: { cognition: 5, cash: 2 }, narration: '你选择再等等。观望，也是一种策略。' }
      ]
    },
    {
      id: 'D2E6', stage: 2, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '家庭矛盾',
      desc: '生活中的琐事，让你和家人之间产生了不小的矛盾。',
      options: [
        { text: '主动沟通，化解矛盾', effect: { social: 6, cognition: 4, cash: -2 }, narration: '你主动沟通，化解了矛盾。家和，才能万事兴。' },
        { text: '冷战，等对方低头', effect: { social: -6, cognition: -2 }, narration: '你选择了冷战。矛盾没解决，反而加深了。' },
        { text: '让步，息事宁人', effect: { social: 3, cognition: 2, guts: -3 }, narration: '你选择了让步。表面和谐了，但问题还在。', flag: 'low_profile' }
      ]
    },
    {
      id: 'D2E7', stage: 2, type: 'positive', rarity: 'N', weight: 90, personaTags: ['steady', 'accumulator'],
      title: '家庭存款目标',
      desc: '你和家人一起定下了一个家庭存款目标。',
      options: [
        { text: '严格执行，共同存钱', effect: { cash: 9, cognition: 4, social: 3 }, narration: '你们严格执行存钱计划。看着存款数字增长，很有成就感。', flag: 'longterm' },
        { text: '顺其自然，不刻意', effect: { cash: 3, cognition: 2 }, narration: '你们顺其自然。虽然存得慢，但生活轻松。' }
      ]
    },
    {
      id: 'D2E8', stage: 2, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'social <= 15',
      title: '家庭经济危机',
      desc: '家里突然陷入经济危机，你一个人扛得异常艰难。',
      options: [
        { text: '向家人坦白，共渡难关', effect: { cash: 12, social: 4, guts: -3 }, narration: '你向家人坦白，大家一起想办法。难关，一起扛就不难。' },
        { text: '自己默默扛', effect: { cash: 8, cognition: 5, guts: 5 }, narration: '你选择自己默默扛。虽然累，但你有你的坚持。' },
        { text: '找朋友帮忙', effect: { cash: 13, social: -4, guts: 4 }, narration: '你找了朋友帮忙。钱借到了，人情也欠下了。' }
      ]
    },

    /* ==================== 第 3 阶段 · 转折期 ==================== */
    {
      id: 'D3E1', stage: 3, type: 'chance', rarity: 'SSR', weight: 20, personaTags: ['lucky', 'gambler', 'hunter'],
      title: '拆迁/意外财富',
      desc: '老家的房子突然拆迁，或是一笔意外的大额财富降临。',
      options: [
        { text: '全部用来改善家庭生活', effect: { cash: 16, social: 8, cognition: -2, luck: 3 }, narration: '你把钱用来改善家庭生活。家人的笑容，是最好的回报。' },
        { text: '一部分投资，一部分存', effect: { cash: 10, cognition: 6, guts: 4, luck: 2 }, narration: '你理性地做了分配，一部分投资，一部分存起来。' },
        { text: '全部拿去博一把大的', effect: { cash: -3, guts: 11, cognition: -7, luck: 4 }, narration: '你决定拿这笔意外之财博一把。要么翻身，要么打回原形。', flag: 'aggressive' }
      ]
    },
    {
      id: 'D3E2', stage: 3, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['networker', 'aggressive', 'mentor'],
      title: '子女教育大投资',
      desc: '孩子的教育到了一个关键节点，需要一笔大额投入。',
      options: [
        { text: '全力投入，上最好的', effect: { cash: -14, guts: 6, cognition: 4, social: 3 }, narration: '你全力投入孩子的教育。为了下一代，值得。', flag: 'aggressive', chain: { when: 'cash > 45', next: 'D3C1' } },
        { text: '量力而行，选合适的', effect: { cash: -6, cognition: 6, social: 3 }, narration: '你选择了适合孩子的教育路线。适合的，才是最好的。', flag: 'longterm' },
        { text: '顺其自然，不攀比', effect: { social: 5, cash: -2, cognition: 4 }, narration: '你不攀比，让孩子顺其自然。有些东西，比成绩重要。' }
      ]
    },
    {
      id: 'D3E3', stage: 3, type: 'negative', rarity: 'R', weight: 80, personaTags: ['gambler', 'aggressive'],
      title: '家庭投资失败',
      desc: '你为家庭做的一笔大额投资，出现了严重亏损。',
      options: [
        { text: '及时止损，坦诚相告', effect: { cash: -15, cognition: 7, guts: -5 }, narration: '你及时止损，并向家人坦诚。虽然亏了，但家人原谅了你。', chain: { when: 'cash > 40', next: 'D3C2' } },
        { text: '加仓，想翻本', effect: { cash: -12, guts: 9, cognition: -7 }, narration: '你想翻本，又加了仓。赌徒心理，要不得。', flag: 'aggressive', chain: { when: 'cash <= 40', next: 'D3C3' } },
        { text: '隐瞒，自己扛', effect: { cash: -9, cognition: 3, guts: -2, social: -3 }, narration: '你选择隐瞒，自己默默扛。纸，终究包不住火。' }
      ]
    },
    {
      id: 'D3E4', stage: 3, type: 'positive', rarity: 'R', weight: 70, personaTags: ['lucky'],
      title: '家庭意外之喜',
      desc: '家里的一笔旧账/旧投资，突然带来了一笔意外收益。',
      options: [
        { text: '存入家庭基金', effect: { cash: 11, cognition: 3 }, narration: '你把钱存入了家庭基金。有备无患。' },
        { text: '拿出一部分享受', effect: { cash: 8, social: 5, guts: 2 }, narration: '你拿出一部分，带家人去旅了个游。生活，也要有温度。' }
      ]
    },
    {
      id: 'D3E5', stage: 3, type: 'chance', rarity: 'R', weight: 85, personaTags: ['steady', 'timid', 'average'],
      title: '赡养父母',
      desc: '父母年纪大了，需要你投入更多的时间、精力和金钱来照顾。',
      options: [
        { text: '接来同住，亲力亲为', effect: { cash: -12, social: 8, cognition: 3, guts: 4 }, narration: '你把父母接来同住。辛苦，但心安。', flag: 'longterm' },
        { text: '请人照顾，常回家看', effect: { cash: -8, social: 5, cognition: 4 }, narration: '你请了人照顾，自己常回家看看。平衡，是一种能力。' },
        { text: '送养老机构', effect: { cash: -10, cognition: 4, social: -2 }, narration: '你选择了专业的养老机构。专业的事，交给专业的人。' }
      ]
    },
    {
      id: 'D3E6', stage: 3, type: 'negative', rarity: 'R', weight: 70, personaTags: ['aggressive', 'hunter'],
      title: '中年危机',
      desc: '人到中年，上有老下有小，事业却遇到了瓶颈，压力巨大。',
      options: [
        { text: '调整心态，重新出发', effect: { cash: -8, cognition: 8, guts: 4 }, narration: '你调整心态，重新出发。危机，也是转机。', flag: 'longterm' },
        { text: '硬扛，不轻易放弃', effect: { cash: -4, guts: 6, cognition: -3 }, narration: '你选择硬扛。相信熬过去，就是晴天。' },
        { text: '破罐破摔，消极对待', effect: { cash: -6, guts: -5, cognition: -6, social: -4 }, narration: '你有点自暴自弃。低谷，往往是自己挖的。' }
      ]
    },
    {
      id: 'D3E7', stage: 3, type: 'positive', rarity: 'N', weight: 90, personaTags: ['hunter', 'networker'],
      title: '家庭事业双丰收',
      desc: '你在事业上取得了突破，家庭也和睦幸福。',
      options: [
        { text: '保持平衡，继续经营', effect: { cash: 11, social: 5, cognition: 5 }, narration: '你努力保持事业和家庭的平衡。双丰收，是最大的幸福。', flag: 'longterm' },
        { text: '趁势而上，再进一步', effect: { cash: 8, guts: 6, social: -2 }, narration: '你趁势而上，想在事业上再进一步。', flag: 'aggressive' }
      ]
    },
    {
      id: 'D3E8', stage: 3, type: 'crisis', rarity: 'SR', weight: 50, personaTags: [],
      require: 'cash <= 20',
      title: '家庭重大危机',
      desc: '家庭遭遇重大危机（大病、事故等），急需一大笔钱。',
      options: [
        { text: '倾尽所有，全力救治', effect: { cash: 16, social: 6, guts: -4 }, narration: '你倾尽所有，全力救治。钱没了可以再赚，人没了就真没了。' },
        { text: '发动亲友，众筹', effect: { cash: 12, social: -3, cognition: 5 }, narration: '你发动亲友众筹，大家一起帮忙。人多力量大。' },
        { text: '借高利贷，铤而走险', effect: { cash: 18, guts: 10, cognition: -8 }, narration: '你借了高利贷。虽然解了燃眉之急，但后患无穷。', flag: 'aggressive' }
      ]
    },
    /* 仅通过连锁触发（weight=0） */
    {
      id: 'D3C1', stage: 3, type: 'positive', rarity: 'SR', weight: 0, personaTags: [],
      title: '孩子成才',
      desc: '你的全力投入有了回报，孩子取得了优异的成绩/成就。',
      options: [
        { text: '继续支持，深造', effect: { cash: 8, cognition: 6, social: 3 }, narration: '你继续支持孩子深造。教育，是回报率最高的投资。', flag: 'longterm' },
        { text: '欣慰，但适可而止', effect: { cash: 10, cognition: 4, guts: -2 }, narration: '你为孩子骄傲，但也懂得适可而止。', flag: 'low_profile' }
      ]
    },
    {
      id: 'D3C2', stage: 3, type: 'chance', rarity: 'R', weight: 0, personaTags: [],
      title: '家庭翻盘',
      desc: '坦诚相告后，家人的支持和你的努力，让家庭逐渐走出困境。',
      options: [
        { text: '一家人齐心协力', effect: { cash: 10, social: 6, cognition: 3 }, narration: '一家人齐心协力，慢慢走出了困境。患难见真情。' },
        { text: '先稳住，慢慢来', effect: { cognition: 7, cash: 3 }, narration: '你选择先稳住阵脚，一步步来。', flag: 'low_profile' }
      ]
    },
    {
      id: 'D3C3', stage: 3, type: 'negative', rarity: 'R', weight: 0, personaTags: [],
      title: '家庭债务缠身',
      desc: '翻本失败，家庭陷入了更深的债务危机。',
      options: [
        { text: '彻底止损，重新开始', effect: { cash: -13, cognition: 9, guts: -6 }, narration: '你彻底止损，一家人重新开始。虽然难，但有希望。' },
        { text: '再借，继续扛', effect: { cash: -10, guts: 8, cognition: -9, social: -4 }, narration: '你又借了一笔，继续扛。窟窿越来越大。' }
      ]
    },

    /* ==================== 第 4 阶段 · 收尾期 ==================== */
    {
      id: 'D4E1', stage: 4, type: 'positive', rarity: 'N', weight: 100, personaTags: ['average', 'steady'],
      title: '家庭复盘',
      desc: '你回顾这一生，家庭和事业的天平，你一直在寻找平衡。',
      options: [
        { text: '知足常乐，感恩拥有', effect: { cognition: 8, social: 5, cash: 2 }, narration: '你知足常乐，感恩这一路走来的点点滴滴。' },
        { text: '还有遗憾，想弥补', effect: { guts: 4, cash: 3, cognition: -2 }, narration: '你心里还有遗憾，想在余生去弥补。' }
      ]
    },
    {
      id: 'D4E2', stage: 4, type: 'chance', rarity: 'R', weight: 70, personaTags: ['gambler', 'aggressive', 'lucky'],
      title: '弥补遗憾',
      desc: '年轻时因为事业错过了很多家庭时光，如今你想弥补。',
      options: [
        { text: '放下事业，回归家庭', effect: { cash: -6, social: 10, cognition: 5, luck: 3 }, narration: '你选择放下事业，回归家庭。陪伴，是最长情的告白。', flag: 'longterm' },
        { text: '事业家庭兼顾', effect: { cash: 8, cognition: 6, social: 3 }, narration: '你努力兼顾事业和家庭。虽然累，但充实。', flag: 'aggressive' }
      ]
    },
    {
      id: 'D4E3', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['mentor', 'networker'],
      title: '含饴弄孙',
      desc: '你迎来了孙辈，享受天伦之乐。',
      options: [
        { text: '享受天伦之乐', effect: { social: 9, cognition: 4, cash: -2 }, narration: '你享受含饴弄孙的快乐。天伦之乐，千金不换。' },
        { text: '帮忙但保持独立', effect: { cognition: 5, social: 4 }, narration: '你帮忙照顾，但保持了自己的生活节奏。' }
      ]
    },
    {
      id: 'D4E4', stage: 4, type: 'negative', rarity: 'N', weight: 85, personaTags: [],
      title: '健康问题',
      desc: '年纪大了，身体开始出现各种问题，需要投入医疗开支。',
      options: [
        { text: '积极治疗，调整生活', effect: { cash: -10, cognition: 6, social: 3 }, narration: '你积极治疗，调整生活方式。健康，是晚年最大的福气。' },
        { text: '能省则省，硬扛', effect: { cash: -4, cognition: -3, guts: 3 }, narration: '你舍不得花钱，能省则省。有时候，省错了地方。' }
      ]
    },
    {
      id: 'D4E5', stage: 4, type: 'positive', rarity: 'R', weight: 75, personaTags: ['accumulator', 'steady'],
      title: '家庭财富传承',
      desc: '你开始考虑家庭财富的传承和规划。',
      options: [
        { text: '提前规划，做好传承', effect: { cash: 8, cognition: 8, social: 4 }, narration: '你提前做好了财富传承规划。未雨绸缪，是智慧。', flag: 'longterm' },
        { text: '顺其自然，走一步看一步', effect: { cash: 6, cognition: 2 }, narration: '你选择顺其自然。简单，也是一种活法。' }
      ]
    },
    {
      id: 'D4E6', stage: 4, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['mentor', 'networker'],
      title: '家族事业传承',
      desc: '你打拼多年的事业，是否要传给子女，成了一个重要的决定。',
      options: [
        { text: '传给子女，培养接班人', effect: { cash: -5, social: 9, cognition: 6 }, narration: '你把事业传给了子女。传承，是另一种延续。', flag: 'longterm' },
        { text: '交给职业经理人', effect: { cash: 10, cognition: 5, social: -3 }, narration: '你选择交给职业经理人。专业的事，交给专业的人。' }
      ]
    },
    {
      id: 'D4E7', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['networker', 'mentor'],
      title: '老友相伴',
      desc: '晚年的你，和老友一起，享受岁月静好。',
      options: [
        { text: '珍惜友谊，常聚常聊', effect: { social: 10, cognition: 4, cash: -2 }, narration: '你珍惜这份友谊，常和老友相聚。老友，是岁月的礼物。' },
        { text: '各自安好，偶尔联系', effect: { social: 4, cognition: 4 }, narration: '你们各自安好，偶尔联系。君子之交淡如水。' }
      ]
    },
    {
      id: 'D4E8', stage: 4, type: 'positive', rarity: 'R', weight: 65, personaTags: ['lucky', 'accumulator'],
      title: '晚年幸福',
      desc: '你的晚年生活，因为早年的积累和善举，过得安稳幸福。',
      options: [
        { text: '知足感恩，享受当下', effect: { cash: 10, social: 6, cognition: 4, luck: 3 }, narration: '你知足感恩，享受当下的每一刻。幸福，就在平淡中。' },
        { text: '回馈社会，帮助他人', effect: { cash: -3, social: 10, cognition: 5, luck: 4 }, narration: '你用余力回馈社会。赠人玫瑰，手有余香。' }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
