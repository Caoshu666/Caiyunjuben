/**
 * 事件库 C —— 「创业与投资」主题
 * 与 event.js（事件库 A）结构完全一致，侧重创业、投资、理财、机会把握。
 *
 * 数值严格对齐 A 套量级，保持结局分布不变。连锁事件自成闭环。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.eventBank_C = [
    /* ==================== 第 1 阶段 · 初入社会 ==================== */
    {
      id: 'C1E1', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['networker', 'mentor'],
      title: '第一次谈客户',
      desc: 'leader 带你第一次见客户，让你也发个言，介绍下方案。',
      options: [
        { text: '大胆讲，把亮点说透', effect: { social: 8, cognition: 5, cash: 2 }, narration: '你鼓起勇气讲了五分钟。客户点头了，leader 也记住了你。' },
        { text: '少说，怕说错', effect: { cognition: 3, social: -3 }, narration: '你全程只说了三句话。安全，但也没留下任何印象。', flag: 'low_profile' }
      ]
    },
    {
      id: 'C1E2', stage: 1, type: 'chance', rarity: 'R', weight: 80, personaTags: ['hunter', 'aggressive'],
      title: '大学同学创业',
      desc: '大学同学开了个小工作室，想拉你入股，投一点点钱就行。',
      options: [
        { text: '投，支持一把', effect: { guts: 6, cash: 3, cognition: 2 }, narration: '你投了一笔小钱。没想到，这个小工作室后来做起来了。', flag: 'aggressive' },
        { text: '不投，先观望', effect: { cognition: 4, cash: 2 }, narration: '你选择了观望。错过了一次，也避开了可能的坑。', flag: 'longterm' },
        { text: '投一点，顺便学经验', effect: { cognition: 5, cash: 2, social: 3 }, narration: '你投了一点点，主要为了近距离看看创业是怎么回事。' }
      ]
    },
    {
      id: 'C1E3', stage: 1, type: 'negative', rarity: 'N', weight: 100, personaTags: [],
      title: '冲动消费',
      desc: '工资到账没几天，你就被各种种草冲昏了头，买了一堆用不上的东西。',
      options: [
        { text: '及时止损，能退的退', effect: { cash: -6, cognition: 5 }, narration: '你退掉了大部分东西。省下的钱，比你想象的多。' },
        { text: '算了，买了就买了', effect: { cash: -10, cognition: -2, guts: 2 }, narration: '你安慰自己「钱就是用来花的」。下个月账单到的时候，就不这么想了。' }
      ]
    },
    {
      id: 'C1E4', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['aggressive', 'lucky'],
      title: '关键项目',
      desc: '一个没人愿意接的烂摊子项目，如果做成了，就是你的成名之战。',
      options: [
        { text: '接，当成机会', effect: { cognition: 6, guts: 6, cash: 3 }, narration: '你接了那个烫手山芋。三个月后，它成了你的代表作。' },
        { text: '接，但先谈条件', effect: { cash: 4, cognition: 4, social: 3 }, narration: '你没白干，先跟 leader 谈好了资源和奖励。' }
      ]
    },
    {
      id: 'C1E5', stage: 1, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'cash <= 25',
      title: '突发急用钱',
      desc: '家里突然有急事，需要一笔钱，而你的存款远不够。',
      options: [
        { text: '跟家里/朋友借', effect: { cash: 15, social: -4, guts: -4 }, narration: '你硬着头皮开了口。钱借到了，人情也记下了。' },
        { text: '网贷应急', effect: { cash: 11, guts: 3, cognition: -5 }, narration: '你用了网贷。应急是应急了，但利息像滚雪球。' },
        { text: '变卖闲置筹钱', effect: { cash: 8, cognition: 4, guts: 2 }, narration: '你把闲置的数码、衣物都挂了出去。折腾，但账是干净的。' }
      ]
    },
    {
      id: 'C1E6', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '贵人出现',
      desc: '一次偶然的机会，你认识了一位行业里的前辈，对方似乎挺欣赏你。',
      options: [
        { text: '主动请教，保持联系', effect: { social: 8, cognition: 4 }, narration: '你虚心地请教了几个问题，逢年过节也会问候。这位前辈，成了你后来的贵人。' },
        { text: '礼貌性加个微信就算了', effect: { cognition: 3, social: -2 }, narration: '你加了微信，但再也没主动联系过。机会，就这样从指缝溜走了。', flag: 'low_profile' }
      ]
    },
    {
      id: 'C1E7', stage: 1, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['steady', 'accumulator', 'gambler'],
      title: '投资启蒙',
      desc: '你第一次认真思考「钱生钱」这件事，手里也有了一点启动资金。',
      options: [
        { text: '定投，长期主义', effect: { cash: 9, cognition: 5, guts: -3 }, narration: '你开始了定投。时间，会奖励有耐心的人。', flag: 'longterm' },
        { text: '短线，赚快钱', effect: { guts: 9, cash: 5, cognition: -6 }, narration: '你迷上了短线。刺激，但也在慢慢消耗本金。', flag: 'aggressive' },
        { text: '先学习，再动手', effect: { cognition: 8, cash: 2 }, narration: '你花了大半年学习投资知识，才敢小仓位试水。', flag: 'longterm' }
      ]
    },
    {
      id: 'C1E8', stage: 1, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '被骗',
      desc: '你相信了一个「稳赚」的项目，投进去的钱打了水漂。',
      options: [
        { text: '报警，尽力追回', effect: { cash: -6, guts: 5, cognition: 3 }, narration: '你报了警，虽然追回的可能性不大，但你没有坐以待毙。' },
        { text: '认栽，长记性', effect: { cash: -9, cognition: 6 }, narration: '你把这当成学费。从此，「稳赚」两个字在你这里等于「骗局」。' }
      ]
    },

    /* ==================== 第 2 阶段 · 积累期 ==================== */
    {
      id: 'C2E1', stage: 2, type: 'chance', rarity: 'R', weight: 85, personaTags: ['aggressive', 'hunter'],
      title: '副业起量',
      desc: '你业余做的小生意，这个月开始有了稳定的收入，甚至超过了工资。',
      options: [
        { text: '辞掉主业，全职干', effect: { guts: 9, cash: 6, cognition: 3 }, narration: '你鼓足勇气辞了职，全身心投入副业。几个月后，它真的成了主业。', flag: 'aggressive' },
        { text: '边上班边做，稳一点', effect: { cash: 6, cognition: 4 }, narration: '你选择两头兼顾。累，但心里有底。', flag: 'longterm' },
        { text: '雇人放大规模', effect: { cash: 4, cognition: 5, social: 4 }, narration: '你开始雇人帮忙，把生意从「一个人」变成「一套系统」。' }
      ]
    },
    {
      id: 'C2E2', stage: 2, type: 'positive', rarity: 'N', weight: 100, personaTags: ['accumulator', 'hunter'],
      title: '第一桶金',
      desc: '通过几年的积累，你终于攒下了人生的第一桶金。',
      options: [
        { text: '存起来，做安全垫', effect: { cash: 10, cognition: 4 }, narration: '你把第一桶金存了起来。有了底，你做事更有底气。' },
        { text: '投出去，让它增值', effect: { cash: 5, guts: 7, cognition: -3 }, narration: '你把第一桶金投了出去。钱要动起来，才有价值。', flag: 'aggressive' }
      ]
    },
    {
      id: 'C2E3', stage: 2, type: 'negative', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '朋友合伙的坑',
      desc: '朋友拉你合伙做项目，投了不少钱，后来才发现账目不清。',
      options: [
        { text: '及时抽身，止损', effect: { cash: -12, cognition: 6 }, narration: '你果断撤了，虽然亏了钱，但没被拖下水。' },
        { text: '摊牌，要个说法', effect: { cash: -8, social: -4, guts: 5 }, narration: '你跟朋友摊了牌，闹得不太愉快，但至少心里清楚了。' },
        { text: '继续扛，等翻身', effect: { cash: -10, guts: 4, cognition: -3 }, narration: '你选择了继续相信。有时候，信任本身就是一种赌博。', flag: 'aggressive' }
      ]
    },
    {
      id: 'C2E4', stage: 2, type: 'positive', rarity: 'R', weight: 70, personaTags: ['aggressive', 'networker'],
      title: '一次融资机会',
      desc: '你的项目被一家机构看中，对方愿意投一笔钱，但要签对赌协议。',
      options: [
        { text: '签，博一把大的', effect: { cash: 12, guts: 8, cognition: -3 }, narration: '你签了对赌。压力很大，但这也逼出了你的潜力。', flag: 'aggressive' },
        { text: '不签，稳步发展', effect: { cash: 5, cognition: 5, guts: -3 }, narration: '你拒绝了对赌，选择稳扎稳打。慢，但每一步都踏实。', flag: 'longterm' }
      ]
    },
    {
      id: 'C2E5', stage: 2, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['hunter', 'mentor'],
      title: '抓住风口',
      desc: '你敏锐地察觉到，一个新的风口正在形成。',
      options: [
        { text: 'all in，抢占先机', effect: { guts: 9, cognition: 5, cash: 3, social: -2 }, narration: '你果断杀入。风口上，猪都能飞起来。', flag: 'aggressive' },
        { text: '小规模试水', effect: { cash: 5, cognition: 5 }, narration: '你先投了一点试试水，既不错过，也不重仓。', flag: 'longterm' },
        { text: '深入研究再决定', effect: { cognition: 7, social: 4 }, narration: '你没有急着跟风，而是花时间把风口研究透了。' }
      ]
    },
    {
      id: 'C2E6', stage: 2, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '投资亏损',
      desc: '你的一笔投资出现了不小的亏损，账面浮亏让你寝食难安。',
      options: [
        { text: '止损，保住本金', effect: { cash: -12, cognition: 6 }, narration: '你果断止损。虽然亏了，但本金保住了大半。' },
        { text: '死扛，等回本', effect: { cash: -8, guts: 3, cognition: -4 }, narration: '你选择了死扛。时间会告诉你，这个决定对不对。' }
      ]
    },
    {
      id: 'C2E7', stage: 2, type: 'positive', rarity: 'N', weight: 90, personaTags: ['steady', 'accumulator'],
      title: '意外分红',
      desc: '你早年的一笔小投资，突然给你带来了一笔意外的分红。',
      options: [
        { text: '继续投入，复利', effect: { cash: 8, cognition: 5 }, narration: '你把分红又投了进去。复利，是时间的朋友。', flag: 'longterm' },
        { text: '拿出来犒劳自己', effect: { cash: 10, guts: 2, cognition: -2 }, narration: '你拿出这笔钱，给自己和家人买了点好东西。' }
      ]
    },
    {
      id: 'C2E8', stage: 2, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'social <= 15',
      title: '资金链紧张',
      desc: '你的现金流突然紧张起来，几个应收款都迟迟不到账。',
      options: [
        { text: '找人周转，欠人情', effect: { cash: 12, social: -3, guts: -2 }, narration: '你找了几个朋友周转。钱到账了，人情也欠下了。' },
        { text: '收缩业务，挺过去', effect: { cash: 8, cognition: 6, guts: 4 }, narration: '你收缩了业务，砍掉了不赚钱的部分，硬是挺了过去。' },
        { text: '借钱豪赌一把', effect: { cash: 15, guts: 10, cognition: -6 }, narration: '你借了钱，押注一个高风险的机会。这次，你赢了。', flag: 'aggressive' }
      ]
    },

    /* ==================== 第 3 阶段 · 转折期 ==================== */
    {
      id: 'C3E1', stage: 3, type: 'chance', rarity: 'SSR', weight: 20, personaTags: ['lucky', 'gambler', 'hunter'],
      title: '公司上市',
      desc: '你早期投资/创业的公司，突然迎来了上市的机会。',
      options: [
        { text: '全部兑现', effect: { cash: 18, guts: 5, cognition: -4, luck: 3 }, narration: '你在上市时全部兑现。一夜之间，你成了别人口中的「成功人士」。' },
        { text: '兑现一部分', effect: { cash: 9, guts: 6, cognition: 3, luck: 2 }, narration: '你兑现了一部分，留了一部分继续持有。' },
        { text: '一股不卖，赌未来', effect: { cash: -3, guts: 11, cognition: -6, luck: 4 }, narration: '你选择一股不卖，赌公司的未来。要么财富自由，要么打回原形。', flag: 'aggressive' }
      ]
    },
    {
      id: 'C3E2', stage: 3, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['networker', 'aggressive', 'mentor'],
      title: '二次创业',
      desc: '你有了新的创业想法，需要投入大量资金和精力。',
      options: [
        { text: '全身心投入', effect: { guts: 11, cash: -14, cognition: 4, social: 4 }, narration: '你押上了全部身家。这一次，你比第一次更成熟。', flag: 'aggressive', chain: { when: 'cash > 45', next: 'C3C1' } },
        { text: '先小规模验证', effect: { cash: -6, cognition: 5, social: 3 }, narration: '你先做了个小规模验证，跑通了再放大。' },
        { text: '观望，暂缓', effect: { social: 6, cash: 2, cognition: 4 }, narration: '你选择了观望。不是没勇气，是更谨慎了。' }
      ]
    },
    {
      id: 'C3E3', stage: 3, type: 'negative', rarity: 'R', weight: 80, personaTags: ['gambler', 'aggressive'],
      title: '爆雷',
      desc: '你重仓的一个项目爆雷了，本金损失惨重。',
      options: [
        { text: '及时抽身', effect: { cash: -15, cognition: 7, guts: -5 }, narration: '你果断抽身，虽然损失惨重，但没被彻底套牢。', chain: { when: 'cash > 40', next: 'C3C2' } },
        { text: '加仓抄底', effect: { cash: -12, guts: 9, cognition: -7 }, narration: '你选择了抄底。赌它只是暂时的下跌。', flag: 'aggressive', chain: { when: 'cash <= 40', next: 'C3C3' } },
        { text: '装死，不看了', effect: { cash: -9, cognition: 3, guts: -2 }, narration: '你关掉了账户，选择不再去看。' }
      ]
    },
    {
      id: 'C3E4', stage: 3, type: 'positive', rarity: 'R', weight: 70, personaTags: ['lucky'],
      title: '意外之财',
      desc: '一笔你早就忘记的投资，突然给你带来了丰厚的回报。',
      options: [
        { text: '落袋为安', effect: { cash: 11, cognition: 3 }, narration: '你把钱落袋。意外之财，落袋才安心。' },
        { text: '继续复投', effect: { cash: 5, guts: 8, cognition: -5 }, narration: '你选择继续投入。钱生钱，是滚雪球。', flag: 'aggressive' }
      ]
    },
    {
      id: 'C3E5', stage: 3, type: 'chance', rarity: 'R', weight: 85, personaTags: ['steady', 'timid', 'average'],
      title: '买核心资产',
      desc: '一个核心地段的资产机会摆在面前，需要你投入大量资金。',
      options: [
        { text: '买，长期持有', effect: { cash: -18, guts: 7, social: 3, cognition: 5 }, narration: '你咬咬牙买了。核心资产，长期看不会错。', flag: 'longterm' },
        { text: '不买，保持流动性', effect: { cash: 5, cognition: 5, guts: -5 }, narration: '你选择保持现金。流动性，也是一种安全。', flag: 'low_profile' }
      ]
    },
    {
      id: 'C3E6', stage: 3, type: 'negative', rarity: 'R', weight: 70, personaTags: ['aggressive', 'hunter'],
      title: '身体透支',
      desc: '长期的高压和熬夜，让你的身体亮起了红灯。',
      options: [
        { text: '停下来，调理身体', effect: { cash: -11, cognition: 8, guts: -5 }, narration: '你停下了脚步，认真调理身体。健康，是最大的财富。', flag: 'longterm' },
        { text: '再扛一扛', effect: { cash: 5, guts: 5, cognition: -9 }, narration: '你选择继续扛。机会不等人，你告诉自己。' }
      ]
    },
    {
      id: 'C3E7', stage: 3, type: 'positive', rarity: 'N', weight: 90, personaTags: ['hunter', 'networker'],
      title: '事业突破',
      desc: '你的事业迎来了一个关键突破，名利双收的机会就在眼前。',
      options: [
        { text: '趁势而上，做大做强', effect: { cash: 11, social: 5, guts: 5 }, narration: '你抓住了机会，事业上了一个新台阶。' },
        { text: '稳扎稳打，巩固成果', effect: { cash: 6, cognition: 5, social: 2 }, narration: '你没有急着扩张，而是先巩固已有成果。', flag: 'longterm' }
      ]
    },
    {
      id: 'C3E8', stage: 3, type: 'crisis', rarity: 'SR', weight: 50, personaTags: [],
      require: 'cash <= 20',
      title: '债务危机',
      desc: '几笔债务同时到期，你的现金流彻底断裂了。',
      options: [
        { text: '坦白，寻求帮助', effect: { cash: 16, social: 5, guts: -6 }, narration: '你选择了坦白。家人朋友伸出援手，帮你度过了难关。' },
        { text: '变卖资产，清偿债务', effect: { cash: 12, cognition: 7, guts: 4 }, narration: '你变卖了资产，一点点清偿债务。虽然心疼，但无债一身轻。' },
        { text: '最后一搏', effect: { cash: 20, guts: 12, luck: 6, cognition: -9 }, narration: '你押上了最后的本钱，做最后一搏。这一次，你赌赢了。', flag: 'aggressive' }
      ]
    },
    /* 仅通过连锁触发（weight=0） */
    {
      id: 'C3C1', stage: 3, type: 'positive', rarity: 'SR', weight: 0, personaTags: [],
      title: '创业成功',
      desc: '二次创业的项目，终于跑通了商业模式，开始盈利。',
      options: [
        { text: '继续扩张', effect: { cash: 9, guts: 6, cognition: 3 }, narration: '你选择继续扩张。这次，你更有把握。' },
        { text: '分红，落袋', effect: { cash: 13, cognition: 5, guts: -3 }, narration: '你选择了分红。落袋为安，心里踏实。', flag: 'low_profile' }
      ]
    },
    {
      id: 'C3C2', stage: 3, type: 'chance', rarity: 'R', weight: 0, personaTags: [],
      title: '翻盘机会',
      desc: '及时抽身后，你手头还有余粮，一个稳健的机会出现了。',
      options: [
        { text: '这次看懂了再投', effect: { cash: 10, cognition: 6, guts: 3 }, narration: '你这次做足了功课，才决定下手。' },
        { text: '先歇歇', effect: { cognition: 7, cash: 2 }, narration: '你决定先休息一段时间，不急着投资。', flag: 'low_profile' }
      ]
    },
    {
      id: 'C3C3', stage: 3, type: 'negative', rarity: 'R', weight: 0, personaTags: [],
      title: '债务缠身',
      desc: '抄底失败，你彻底被套牢，债务越来越多。',
      options: [
        { text: '彻底清仓，认栽', effect: { cash: -13, cognition: 9, guts: -6 }, narration: '你彻底清仓，交了一笔昂贵的学费。' },
        { text: '再借一笔，死扛', effect: { cash: -10, guts: 8, cognition: -9, social: -4 }, narration: '你又借了一笔，继续死扛。窟窿越来越大。' }
      ]
    },

    /* ==================== 第 4 阶段 · 收尾期 ==================== */
    {
      id: 'C4E1', stage: 4, type: 'positive', rarity: 'N', weight: 100, personaTags: ['average', 'steady'],
      title: '财富复盘',
      desc: '你把这辈子的投资和创业经历，从头到尾复盘了一遍。',
      options: [
        { text: '认真总结，形成方法论', effect: { cognition: 9, cash: 3 }, narration: '你总结出了一套自己的方法论。真正赚到钱的，都是看懂的。' },
        { text: '过去就过去了', effect: { guts: 4, cash: 4, cognition: -3 }, narration: '你不想再纠结过去。往前看，才是正道。' }
      ]
    },
    {
      id: 'C4E2', stage: 4, type: 'chance', rarity: 'R', weight: 70, personaTags: ['gambler', 'aggressive', 'lucky'],
      title: '最后的机遇',
      desc: '一个你年轻时错过的大机会，如今又出现在了面前。',
      options: [
        { text: '这次抓住它', effect: { cash: 14, guts: 10, luck: 4, cognition: -6 }, narration: '你这次果断出手。有些机会，一辈子只有一次。', flag: 'aggressive' },
        { text: '算了，错过就错过', effect: { cognition: 8, cash: 4 }, narration: '你笑了笑，选择了放下。', flag: 'longterm' }
      ]
    },
    {
      id: 'C4E3', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['mentor', 'networker'],
      title: '年轻人请教',
      desc: '一个年轻的创业者找到你，想听听你的经验和建议。',
      options: [
        { text: '倾囊相授', effect: { social: 9, cognition: 5, cash: 2 }, narration: '你把踩过的坑、悟出的道理都告诉了他。讲完，自己也通透了。' },
        { text: '点到为止', effect: { cognition: 3, social: -3 }, narration: '你简单说了几句。年轻人很礼貌，但没再来找你。', flag: 'low_profile' }
      ]
    },
    {
      id: 'C4E4', stage: 4, type: 'negative', rarity: 'N', weight: 85, personaTags: [],
      title: '一笔失误',
      desc: '你晚年的一笔投资判断失误，损失了一笔不小的钱。',
      options: [
        { text: '及时止损', effect: { cash: -10, cognition: 6 }, narration: '你果断止损。认亏，是多年积累的智慧。' },
        { text: '再等等看', effect: { cash: -14, guts: 5, cognition: -6 }, narration: '你选择再等等。时间证明，这次等错了。' }
      ]
    },
    {
      id: 'C4E5', stage: 4, type: 'positive', rarity: 'R', weight: 75, personaTags: ['accumulator', 'steady'],
      title: '财富自由',
      desc: '你多年的积累和投资，终于让你实现了财富自由。',
      options: [
        { text: '继续经营，做系统', effect: { cash: 10, cognition: 5, guts: -2 }, narration: '你没有停下，而是把这套系统经营得更好。', flag: 'longterm' },
        { text: '享受生活', effect: { cash: 12, cognition: 1, guts: 3 }, narration: '你决定好好享受生活，犒劳这些年努力的自己。' }
      ]
    },
    {
      id: 'C4E6', stage: 4, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['mentor', 'networker'],
      title: '功成身退',
      desc: '有人愿意高价收购你的公司/资产，你也可以选择继续经营。',
      options: [
        { text: '套现离场', effect: { cash: 16, social: -6, cognition: 4 }, narration: '你签了字，套现离场。自由了，也空了。' },
        { text: '继续经营，带团队', effect: { cash: 5, social: 11, cognition: 5 }, narration: '你选择继续，带着团队一起走下去。', flag: 'longterm' }
      ]
    },
    {
      id: 'C4E7', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['networker', 'mentor'],
      title: '老友求助',
      desc: '一个多年的老友生意失败，处境艰难，想找你帮忙。',
      options: [
        { text: '尽力帮，不问回报', effect: { cash: -9, social: 11, cognition: 4 }, narration: '你尽力帮了他。多年后，这份情义以另一种方式回报了你。' },
        { text: '量力而行', effect: { cash: -3, social: 4, cognition: 4 }, narration: '你帮了一部分。帮人是情分，量力是清醒。' }
      ]
    },
    {
      id: 'C4E8', stage: 4, type: 'positive', rarity: 'R', weight: 65, personaTags: ['lucky', 'accumulator'],
      title: '善有善报',
      desc: '你早年的一件善举，多年后以一种意想不到的方式回馈了你。',
      options: [
        { text: '坦然收下', effect: { cash: 12, luck: 5, cognition: 3 }, narration: '你笑了笑。有些回报，只是来得晚了一些。' },
        { text: '转赠他人', effect: { cash: 2, social: 9, luck: 4, cognition: 4 }, narration: '你把这份善意又递了出去。你反而更踏实了。' }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
