/**
 * 事件库 E —— 「自我成长与人生选择」主题
 * 与 event.js（事件库 A）结构完全一致，侧重个人成长、自我突破、
 * 兴趣与事业、人生意义的探索等主题。
 *
 * 数值严格对齐 A 套量级，保持结局分布不变。连锁事件自成闭环。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.eventBank_E = [
    /* ==================== 第 1 阶段 · 初入社会 ==================== */
    {
      id: 'E1E1', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['networker', 'mentor'],
      title: '找到方向',
      desc: '初入职场的你，在迷茫中慢慢找到了自己真正想做的事。',
      options: [
        { text: '坚定方向，深耕下去', effect: { cognition: 6, cash: 4, guts: 3 }, narration: '你找到了方向，并决定深耕。方向对了，就不怕路远。', flag: 'longterm' },
        { text: '再观望看看', effect: { cognition: 3, cash: 2, social: -2 }, narration: '你还在观望。迷茫，往往是因为想得太多，做得太少。', flag: 'low_profile' }
      ]
    },
    {
      id: 'E1E2', stage: 1, type: 'chance', rarity: 'R', weight: 80, personaTags: ['hunter', 'aggressive'],
      title: '兴趣与工作',
      desc: '你有一个热爱多年的兴趣，现在有机会把它变成工作。',
      options: [
        { text: '辞职，做热爱的事', effect: { guts: 8, cash: -3, cognition: 3 }, narration: '你选择了做自己热爱的事。虽然起步难，但每天都有劲。', flag: 'aggressive' },
        { text: '先当副业，慢慢过渡', effect: { cash: 4, cognition: 5, guts: 2 }, narration: '你把它当副业，慢慢过渡。稳，也是一种智慧。', flag: 'longterm' },
        { text: '放弃，专心主业', effect: { cash: 4, cognition: 2, social: 2 }, narration: '你选择了放弃兴趣，专心主业。遗憾，藏在心里。' }
      ]
    },
    {
      id: 'E1E3', stage: 1, type: 'negative', rarity: 'N', weight: 100, personaTags: [],
      title: '自我怀疑',
      desc: '工作不顺，你开始怀疑自己是不是选错了路。',
      options: [
        { text: '停下来，好好复盘', effect: { cognition: 6, cash: -3, guts: 2 }, narration: '你停下来认真复盘。有时候，慢下来是为了走得更远。' },
        { text: '咬牙坚持，不轻易放弃', effect: { guts: 5, cognition: 2, cash: -2 }, narration: '你咬牙坚持。熬过瓶颈期，就是另一片天。' },
        { text: '自暴自弃，消极怠工', effect: { cash: -5, cognition: -4, guts: -3 }, narration: '你有点自暴自弃。低谷，是人生的一部分，但不是全部。' }
      ]
    },
    {
      id: 'E1E4', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['aggressive', 'lucky'],
      title: '突破自我',
      desc: '你遇到了一个挑战，做成了，就是一次巨大的自我突破。',
      options: [
        { text: '勇敢迎接挑战', effect: { cognition: 7, guts: 6, cash: 3 }, narration: '你勇敢迎接挑战，并成功突破了自己。成长，就是不断突破舒适区。' },
        { text: '保守一点，不冒险', effect: { cash: 3, cognition: 3, guts: -3 }, narration: '你选择了保守。安全，但也错过了成长的机会。', flag: 'low_profile' }
      ]
    },
    {
      id: 'E1E5', stage: 1, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'cash <= 25',
      title: '囊中羞涩',
      desc: '你追求梦想的路上，遇到了现实的窘境——钱不够花了。',
      options: [
        { text: '兼职补贴，坚持梦想', effect: { cash: 10, guts: 5, cognition: 2 }, narration: '你找了份兼职，一边补贴生活，一边坚持梦想。' },
        { text: '暂时放下，先赚钱', effect: { cash: 12, cognition: 3, guts: -3 }, narration: '你暂时放下了梦想，先解决温饱。梦想，可以晚点再追。' },
        { text: '借钱，硬撑', effect: { cash: 9, guts: 4, cognition: -4 }, narration: '你借钱硬撑。压力山大，但你不愿放弃。', flag: 'aggressive' }
      ]
    },
    {
      id: 'E1E6', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '良师益友',
      desc: '你遇到了一位良师益友，对方愿意指点你。',
      options: [
        { text: '虚心求教，珍惜机会', effect: { social: 8, cognition: 5, cash: -2 }, narration: '你虚心求教，受益匪浅。良师，是人生最大的贵人。' },
        { text: '泛泛之交，不深交', effect: { cognition: 2, social: -2 }, narration: '你只是泛泛之交。机会，就这样错过了。', flag: 'low_profile' }
      ]
    },
    {
      id: 'E1E7', stage: 1, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['steady', 'accumulator', 'gambler'],
      title: '深造机会',
      desc: '你有了一个深造（读研/考证/出国）的机会，但需要投入时间和金钱。',
      options: [
        { text: '去深造，投资自己', effect: { cash: -8, cognition: 9, guts: 3 }, narration: '你选择了深造，投资自己。这是回报率最高的投资。', flag: 'longterm' },
        { text: '放弃，先工作赚钱', effect: { cash: 6, cognition: 2, guts: -2 }, narration: '你选择了先工作。错过的，可能再也回不来。' },
        { text: '边工作边学', effect: { cash: -2, cognition: 6, guts: 3 }, narration: '你选择了边工作边学。辛苦，但两不耽误。' }
      ]
    },
    {
      id: 'E1E8', stage: 1, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '社交焦虑',
      desc: '你有点社交焦虑，害怕在人群中表现自己。',
      options: [
        { text: '主动练习，慢慢克服', effect: { social: 6, cognition: 4, guts: 3 }, narration: '你主动练习，慢慢克服了社交焦虑。勇气，是可以锻炼的。' },
        { text: '回避，待在舒适区', effect: { cognition: 2, social: -4 }, narration: '你选择了回避。舒适区，是最温柔的陷阱。', flag: 'low_profile' }
      ]
    },

    /* ==================== 第 2 阶段 · 积累期 ==================== */
    {
      id: 'E2E1', stage: 2, type: 'chance', rarity: 'R', weight: 85, personaTags: ['aggressive', 'hunter'],
      title: '跨界机会',
      desc: '一个完全不同的领域向你抛来了橄榄枝，挑战很大，但机会也大。',
      options: [
        { text: '跨界，拥抱未知', effect: { guts: 9, cognition: 5, cash: 2 }, narration: '你选择了跨界。未知，也意味着无限可能。', flag: 'aggressive' },
        { text: '留在熟悉的领域', effect: { cash: 5, cognition: 4, guts: -2 }, narration: '你留在了熟悉的领域。熟悉，是安全的，也是局限的。', flag: 'longterm' },
        { text: '先了解，再决定', effect: { cognition: 6, social: 4 }, narration: '你先深入了解，再决定。谨慎，也是一种成熟。' }
      ]
    },
    {
      id: 'E2E2', stage: 2, type: 'positive', rarity: 'N', weight: 100, personaTags: ['accumulator', 'hunter'],
      title: '个人品牌',
      desc: '你开始在某个领域小有名气，有了自己的个人品牌。',
      options: [
        { text: '认真经营，放大影响', effect: { social: 8, cash: 5, cognition: 4 }, narration: '你认真经营个人品牌，影响力越来越大。', flag: 'aggressive' },
        { text: '低调，专注内容', effect: { cognition: 6, cash: 3 }, narration: '你选择低调，专注打磨内容。酒香不怕巷子深。', flag: 'longterm' }
      ]
    },
    {
      id: 'E2E3', stage: 2, type: 'negative', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '被人嫉妒',
      desc: '你的成功引来了周围人的嫉妒和非议。',
      options: [
        { text: '一笑置之，专注自己', effect: { cognition: 6, cash: 2, social: -2 }, narration: '你一笑置之，专注做好自己。不招人妒是庸才。' },
        { text: '反思自己，低调行事', effect: { social: 4, cognition: 4, cash: -2 }, narration: '你反思了自己，选择低调。谦虚，是长久之道。' },
        { text: '针锋相对，怼回去', effect: { guts: 5, social: -5, cash: -3 }, narration: '你针锋相对。爽是爽了，但伤了和气。' }
      ]
    },
    {
      id: 'E2E4', stage: 2, type: 'positive', rarity: 'R', weight: 70, personaTags: ['aggressive', 'networker'],
      title: '关键抉择',
      desc: '你面临一个关键的人生抉择：安稳，还是搏一把？',
      options: [
        { text: '搏一把，不留遗憾', effect: { guts: 9, cash: 4, cognition: 2 }, narration: '你选择了搏一把。人生，就是一场豪赌。', flag: 'aggressive' },
        { text: '稳一点，细水长流', effect: { cash: 6, cognition: 5, guts: -3 }, narration: '你选择了安稳。细水长流，也是一种智慧。', flag: 'longterm' },
        { text: '权衡利弊，理性决策', effect: { cognition: 7, cash: 3 }, narration: '你理性地权衡了利弊，做出了最优解。' }
      ]
    },
    {
      id: 'E2E5', stage: 2, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['hunter', 'mentor'],
      title: '创业冲动',
      desc: '你内心燃起了创业的冲动，想要做一番自己的事业。',
      options: [
        { text: '辞职创业', effect: { guts: 10, cash: -8, cognition: 4 }, narration: '你辞了职，开始了创业之路。路很难，但很值得。', flag: 'aggressive' },
        { text: '先做市场调研', effect: { cognition: 7, cash: -2, social: 3 }, narration: '你先做了充分的市场调研，再决定。谋定而后动。', flag: 'longterm' },
        { text: '压制冲动，继续上班', effect: { cash: 5, cognition: 3, guts: -4 }, narration: '你压制了创业的冲动。遗憾，也是一种成长。' }
      ]
    },
    {
      id: 'E2E6', stage: 2, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '职业倦怠',
      desc: '你对工作产生了深深的倦怠，提不起任何兴趣。',
      options: [
        { text: '主动调整，寻找意义', effect: { cognition: 6, cash: -3, social: 2 }, narration: '你主动调整，重新找到了工作的意义。' },
        { text: '硬撑，熬过这段时间', effect: { cash: 3, guts: 4, cognition: -3 }, narration: '你选择硬撑。倦怠，可能会越来越重。' },
        { text: '裸辞，给自己放个假', effect: { cash: -8, guts: 5, cognition: 2 }, narration: '你选择了裸辞。自由了，但也焦虑了。', flag: 'aggressive' }
      ]
    },
    {
      id: 'E2E7', stage: 2, type: 'positive', rarity: 'N', weight: 90, personaTags: ['steady', 'accumulator'],
      title: '技能精进',
      desc: '你在某个技能上取得了长足的进步，成了这方面的专家。',
      options: [
        { text: '继续深耕，精益求精', effect: { cognition: 8, cash: 5 }, narration: '你继续深耕，精益求精。专业，是最好的护城河。', flag: 'longterm' },
        { text: '用技能变现', effect: { cash: 8, cognition: 3, guts: 3 }, narration: '你开始用技能变现。知识，就是财富。', flag: 'aggressive' }
      ]
    },
    {
      id: 'E2E8', stage: 2, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'social <= 15',
      title: '孤独迷茫',
      desc: '你在追求目标的路上，感到前所未有的孤独和迷茫。',
      options: [
        { text: '主动社交，寻找同路人', effect: { social: 9, cognition: 4, cash: -2 }, narration: '你主动社交，找到了同路人。独行快，众行远。' },
        { text: '向内探索，自我和解', effect: { cognition: 8, guts: 4 }, narration: '你向内探索，与自己和解。孤独，是成长的必修课。' },
        { text: '寻求心理咨询', effect: { cash: -8, cognition: 6, social: 2 }, narration: '你寻求了专业的心理咨询。求助，不是软弱，是智慧。' }
      ]
    },

    /* ==================== 第 3 阶段 · 转折期 ==================== */
    {
      id: 'E3E1', stage: 3, type: 'chance', rarity: 'SSR', weight: 20, personaTags: ['lucky', 'gambler', 'hunter'],
      title: '人生巅峰',
      desc: '你迎来了人生的高光时刻，一个千载难逢的机遇摆在面前。',
      options: [
        { text: '全力以赴，all in', effect: { cash: 16, guts: 10, cognition: -4, luck: 4 }, narration: '你全力以赴，抓住了这个机遇。人生，能有几次这样的机会。', flag: 'aggressive' },
        { text: '谨慎参与，留有余地', effect: { cash: 9, cognition: 6, guts: 4, luck: 2 }, narration: '你谨慎参与，留有余地。稳中求进。' },
        { text: '研究清楚，再出手', effect: { cognition: 9, cash: 2, luck: -2 }, narration: '你深入研究，谋定而后动。' }
      ]
    },
    {
      id: 'E3E2', stage: 3, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['networker', 'aggressive', 'mentor'],
      title: '重大转型',
      desc: '你决定进行一次重大的人生/事业转型，需要放弃现有的积累。',
      options: [
        { text: '果断转型，破釜沉舟', effect: { guts: 11, cash: -14, cognition: 5, social: 3 }, narration: '你果断转型，破釜沉舟。转型，是为了更好的未来。', flag: 'aggressive', chain: { when: 'cash > 45', next: 'E3C1' } },
        { text: '渐进式转型，稳扎稳打', effect: { cash: -6, cognition: 6, social: 4 }, narration: '你选择渐进式转型。慢，但稳。', flag: 'longterm' },
        { text: '暂缓，再等等', effect: { social: 6, cash: 2, cognition: 3 }, narration: '你选择了暂缓。时机，很重要。' }
      ]
    },
    {
      id: 'E3E3', stage: 3, type: 'negative', rarity: 'R', weight: 80, personaTags: ['gambler', 'aggressive'],
      title: '重大挫折',
      desc: '你遭遇了人生中一次重大的挫折，几乎击垮了你的信心。',
      options: [
        { text: '及时止损，重新规划', effect: { cash: -14, cognition: 7, guts: -5 }, narration: '你及时止损，重新规划。挫折，是成长的催化剂。', chain: { when: 'cash > 40', next: 'E3C2' } },
        { text: '死磕到底，不认输', effect: { cash: -12, guts: 9, cognition: -6 }, narration: '你选择死磕到底。有时候，坚持就是胜利；有时候，不是。', flag: 'aggressive', chain: { when: 'cash <= 40', next: 'E3C3' } },
        { text: '一蹶不振，消极逃避', effect: { cash: -8, cognition: -6, guts: -7 }, narration: '你有点一蹶不振。跌倒了不可怕，可怕的是不愿站起来。' }
      ]
    },
    {
      id: 'E3E4', stage: 3, type: 'positive', rarity: 'R', weight: 70, personaTags: ['lucky'],
      title: '意外收获',
      desc: '你多年的坚持和积累，突然以一种意想不到的方式开花结果。',
      options: [
        { text: '乘胜追击，扩大战果', effect: { cash: 10, guts: 7, cognition: 3 }, narration: '你乘胜追击，扩大战果。', flag: 'aggressive' },
        { text: '稳扎稳打，巩固成果', effect: { cash: 8, cognition: 5, guts: -2 }, narration: '你稳扎稳打，巩固成果。', flag: 'longterm' }
      ]
    },
    {
      id: 'E3E5', stage: 3, type: 'chance', rarity: 'R', weight: 85, personaTags: ['steady', 'timid', 'average'],
      title: '人生平衡',
      desc: '你在追求事业的同时，开始思考人生的意义和平衡。',
      options: [
        { text: '追求事业与生活的平衡', effect: { cognition: 6, social: 5, cash: 3 }, narration: '你开始追求事业与生活的平衡。会生活，才会工作。', flag: 'longterm' },
        { text: '继续冲刺事业', effect: { cash: 8, guts: 6, cognition: -2 }, narration: '你选择继续冲刺事业。鱼和熊掌，有时难以兼得。', flag: 'aggressive' }
      ]
    },
    {
      id: 'E3E6', stage: 3, type: 'negative', rarity: 'R', weight: 70, personaTags: ['aggressive', 'hunter'],
      title: '健康透支',
      desc: '长期的高压和拼搏，让你的身体发出了严重的警告。',
      options: [
        { text: '放慢脚步，好好休息', effect: { cash: -10, cognition: 8, guts: -4 }, narration: '你放慢了脚步，好好休息。身体，是革命的本钱。', flag: 'longterm' },
        { text: '继续拼，还能撑', effect: { cash: 5, guts: 6, cognition: -8 }, narration: '你选择继续拼。可是，身体可能撑不住了。' }
      ]
    },
    {
      id: 'E3E7', stage: 3, type: 'positive', rarity: 'N', weight: 90, personaTags: ['hunter', 'networker'],
      title: '自我实现',
      desc: '你的事业和人生达到了一个新的高度，实现了自我价值。',
      options: [
        { text: '继续突破，追求卓越', effect: { cash: 11, guts: 6, cognition: 4 }, narration: '你继续突破，追求卓越。人生的意义，在于不断超越。', flag: 'aggressive' },
        { text: '享受成果，回馈社会', effect: { cash: 6, social: 7, cognition: 5 }, narration: '你开始享受成果，回馈社会。独乐乐不如众乐乐。', flag: 'longterm' }
      ]
    },
    {
      id: 'E3E8', stage: 3, type: 'crisis', rarity: 'SR', weight: 50, personaTags: [],
      require: 'cash <= 20',
      title: '人生低谷',
      desc: '你陷入了人生的低谷，事业、财富、信心都跌到了谷底。',
      options: [
        { text: '寻求帮助，走出低谷', effect: { cash: 14, social: 6, guts: -4 }, narration: '你寻求了帮助，慢慢走出了低谷。求助，是走出低谷的第一步。' },
        { text: '自我疗愈，重新出发', effect: { cash: 10, cognition: 8, guts: 5 }, narration: '你自我疗愈，重新出发。低谷，是为了下一次的崛起。' },
        { text: '孤注一掷，最后一搏', effect: { cash: 20, guts: 12, luck: 6, cognition: -9 }, narration: '你孤注一掷，做最后一搏。这一次，你赌赢了。', flag: 'aggressive' }
      ]
    },
    /* 仅通过连锁触发（weight=0） */
    {
      id: 'E3C1', stage: 3, type: 'positive', rarity: 'SR', weight: 0, personaTags: [],
      title: '转型成功',
      desc: '你的重大转型取得了成功，人生翻开了新篇章。',
      options: [
        { text: '继续深耕，做大做强', effect: { cash: 10, guts: 6, cognition: 4 }, narration: '你继续深耕，把事业做大做强。' },
        { text: '稳扎稳打，巩固成果', effect: { cash: 12, cognition: 5, guts: -2 }, narration: '你稳扎稳打，巩固转型的成果。', flag: 'low_profile' }
      ]
    },
    {
      id: 'E3C2', stage: 3, type: 'chance', rarity: 'R', weight: 0, personaTags: [],
      title: '重新起航',
      desc: '及时止损后，你重新规划，一个稳健的新机会出现了。',
      options: [
        { text: '这次更谨慎地开始', effect: { cash: 10, cognition: 6, guts: 3 }, narration: '你这次更谨慎，做足了功课才开始。' },
        { text: '先休息，调整状态', effect: { cognition: 7, cash: 2 }, narration: '你先休息，调整好状态再出发。', flag: 'low_profile' }
      ]
    },
    {
      id: 'E3C3', stage: 3, type: 'negative', rarity: 'R', weight: 0, personaTags: [],
      title: '越陷越深',
      desc: '死磕到底的结果，是陷入了更深的困境。',
      options: [
        { text: '彻底止损，重新开始', effect: { cash: -13, cognition: 9, guts: -6 }, narration: '你彻底止损，重新开始。虽然难，但还不晚。' },
        { text: '再扛一扛，不甘心', effect: { cash: -10, guts: 8, cognition: -9, social: -4 }, narration: '你不甘心，继续硬扛。沉没成本，是最贵的成本。' }
      ]
    },

    /* ==================== 第 4 阶段 · 收尾期 ==================== */
    {
      id: 'E4E1', stage: 4, type: 'positive', rarity: 'N', weight: 100, personaTags: ['average', 'steady'],
      title: '人生复盘',
      desc: '你回顾这一生，有得有失，有遗憾也有圆满。',
      options: [
        { text: '坦然接受，知足常乐', effect: { cognition: 9, social: 4, cash: 2 }, narration: '你坦然接受这一生，知足常乐。' },
        { text: '心有不甘，还想折腾', effect: { guts: 5, cash: 3, cognition: -2 }, narration: '你心有不甘，还想再折腾一把。' }
      ]
    },
    {
      id: 'E4E2', stage: 4, type: 'chance', rarity: 'R', weight: 70, personaTags: ['gambler', 'aggressive', 'lucky'],
      title: '最后的梦想',
      desc: '你年轻时的一个梦想，如今还有机会去实现。',
      options: [
        { text: '去实现它，不留遗憾', effect: { cash: 12, guts: 10, luck: 4, cognition: -4 }, narration: '你决定去实现这个梦想。人生，不留遗憾。', flag: 'aggressive' },
        { text: '算了，放下执念', effect: { cognition: 8, cash: 4 }, narration: '你选择了放下。放下，也是一种智慧。', flag: 'longterm' }
      ]
    },
    {
      id: 'E4E3', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['mentor', 'networker'],
      title: '传道授业',
      desc: '有年轻人慕名而来，想听听你的人生经验和感悟。',
      options: [
        { text: '倾囊相授，传承经验', effect: { social: 9, cognition: 5, cash: 2 }, narration: '你倾囊相授，把自己的经验传承下去。' },
        { text: '点到为止，不深说', effect: { cognition: 3, social: -3 }, narration: '你点到为止。有些路，还是要自己走。', flag: 'low_profile' }
      ]
    },
    {
      id: 'E4E4', stage: 4, type: 'negative', rarity: 'N', weight: 85, personaTags: [],
      title: '晚年遗憾',
      desc: '你晚年回首，发现有些遗憾再也无法弥补。',
      options: [
        { text: '释怀，与自己和解', effect: { cognition: 8, social: 3, cash: -2 }, narration: '你学会了释怀，与自己和解。', flag: 'longterm' },
        { text: '耿耿于怀，难以释怀', effect: { cognition: -5, social: -3 }, narration: '你耿耿于怀，难以释怀。遗憾，成了心里的刺。' }
      ]
    },
    {
      id: 'E4E5', stage: 4, type: 'positive', rarity: 'R', weight: 75, personaTags: ['accumulator', 'steady'],
      title: '人生圆满',
      desc: '你的人生，因为早年的努力和选择，过得充实而圆满。',
      options: [
        { text: '知足感恩，享受人生', effect: { cash: 10, social: 6, cognition: 5 }, narration: '你知足感恩，享受圆满的人生。', flag: 'longterm' },
        { text: '发挥余热，继续贡献', effect: { cash: 6, social: 8, cognition: 5 }, narration: '你发挥余热，继续为社会做贡献。' }
      ]
    },
    {
      id: 'E4E6', stage: 4, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['mentor', 'networker'],
      title: '功成身退',
      desc: '你的事业已经到了可以功成身退的时候，也到了需要传承的时候。',
      options: [
        { text: '优雅退场，享受人生', effect: { cash: 14, social: -3, cognition: 5 }, narration: '你选择优雅退场，享受人生。' },
        { text: '退而不休，继续发挥', effect: { cash: 6, social: 11, cognition: 5 }, narration: '你选择退而不休，继续发挥余热。', flag: 'longterm' }
      ]
    },
    {
      id: 'E4E7', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['networker', 'mentor'],
      title: '知己相伴',
      desc: '晚年的你，有几个知己老友相伴，这是人生最大的财富。',
      options: [
        { text: '珍惜这份情谊', effect: { social: 10, cognition: 4, cash: -2 }, narration: '你珍惜这份情谊。人生得一知己，足矣。' },
        { text: '顺其自然，随缘', effect: { social: 4, cognition: 4 }, narration: '你顺其自然，随缘而处。' }
      ]
    },
    {
      id: 'E4E8', stage: 4, type: 'positive', rarity: 'R', weight: 65, personaTags: ['lucky', 'accumulator'],
      title: '善的回报',
      desc: '你早年播下的善种，晚年结出了丰硕的果实。',
      options: [
        { text: '坦然接受，感恩', effect: { cash: 12, luck: 5, cognition: 3 }, narration: '你坦然接受，心怀感恩。善有善报。' },
        { text: '传递下去，帮助他人', effect: { cash: 2, social: 9, luck: 4, cognition: 4 }, narration: '你把这份善意传递下去。爱的传递，让世界更美好。' }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
