/**
 * 事件库 B —— 「职场跃迁」主题
 * 与 event.js（事件库 A）结构完全一致，仅主题调性不同：
 *   侧重职场晋升、跳槽、大厂裁员、内卷与反内卷等现代职场情境。
 *
 * 数值严格对齐 A 套量级（cash ±3~20、属性 ±2~12、type/rarity/weight 分布一致），
 * 以保持 S 8% / A 27% / B 45% / C 20% 的结局分布不被破坏。
 * 连锁事件自成闭环（chain.next 指向本库内 weight=0 的隐藏事件）。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.eventBank_B = [
    /* ==================== 第 1 阶段 · 初入社会 ==================== */
    {
      id: 'B1E1', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['networker', 'mentor'],
      title: '实习生转正',
      desc: '三个月实习期快到了，leader 暗示你「表现不错」，但转正名额只有一个。',
      options: [
        { text: '主动争取，把成果摆出来', effect: { social: 8, cognition: 5, cash: 2 }, narration: '你整理了一份复盘，主动找 leader 聊了一次。转正名单里，你排第一。' },
        { text: '等安排，不想太显眼', effect: { cognition: 3, social: -3 }, narration: '你把选择权交了出去。结果出来，你才知道原来规则是可以自己争取的。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B1E2', stage: 1, type: 'chance', rarity: 'R', weight: 80, personaTags: ['hunter', 'aggressive'],
      title: '内推的名额',
      desc: '学长在大厂，说可以内推你，但岗位和你专业八竿子打不着。',
      options: [
        { text: '投，先拿到 offer 再说', effect: { guts: 7, cash: 5, cognition: 2 }, narration: '你硬着头皮改了一份简历。面试三轮，居然过了。', flag: 'aggressive' },
        { text: '算了，做自己擅长的', effect: { cognition: 4, cash: 2 }, narration: '你把机会让给了更对口的人。安心，但不甘心。', flag: 'longterm' },
        { text: '先了解清楚岗位再投', effect: { cognition: 5, cash: 2, social: 3 }, narration: '你约学长吃了顿饭，把岗位问了个底朝天，才决定要不要投。' }
      ]
    },
    {
      id: 'B1E3', stage: 1, type: 'negative', rarity: 'N', weight: 100, personaTags: [],
      title: '被画大饼',
      desc: '老板跟你谈理想、谈期权，就是不谈工资。你发现自己的薪资比同级低了一截。',
      options: [
        { text: '忍了，先把资历混够', effect: { cash: -8, cognition: 5, guts: -2 }, narration: '你安慰自己「年轻人要多看成长」。有些账，只有自己心里清楚。' },
        { text: '直接提，把诉求说清楚', effect: { cash: -3, guts: 6, social: 2 }, narration: '你列了一堆数据，把薪资差异摆到台面上。结果没全要到，但你要到了尊严。' }
      ]
    },
    {
      id: 'B1E4', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['aggressive', 'lucky'],
      title: '第一次挑大梁',
      desc: '组长休产假，把一个重要的客户项目交给你。做成了出彩，做砸了背锅。',
      options: [
        { text: '接，干就完了', effect: { cognition: 6, guts: 6, cash: 3 }, narration: '你连熬三周，项目顺利上线。会议纪要里，第一次出现了你的名字。' },
        { text: '接，但先拉个老同事搭把手', effect: { cash: 3, cognition: 4, social: 4 }, narration: '你没硬扛，找了个靠谱的人一起。事成了，人脉也搭上了。' }
      ]
    },
    {
      id: 'B1E5', stage: 1, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'cash <= 25',
      title: '房租押一付三',
      desc: '换工作的空窗期，房租到期要一次性付四个月，卡里的钱不够。',
      options: [
        { text: '跟父母周转一下', effect: { cash: 15, social: -5, guts: -4 }, narration: '你张了几次口才说出来。钱到账了，心里堵得慌。' },
        { text: '借网贷，先撑过去', effect: { cash: 11, guts: 3, cognition: -5 }, narration: '你点开了那个从没用过的 App。到账很快，利息也很快。' },
        { text: '找合租分摊', effect: { cash: 8, social: 4, cognition: 2 }, narration: '你发了个招室友的帖子。一周后，来了个挺靠谱的人。' }
      ]
    },
    {
      id: 'B1E6', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '行业交流会',
      desc: '公司给了一张行业交流会的门票，可以翘半天班去听。',
      options: [
        { text: '去，多认识点人', effect: { social: 8, cognition: 4 }, narration: '你硬着头皮加了十几个人的微信。其中一个人的朋友圈，后来改变了你的职业走向。' },
        { text: '不去，手上活还没做完', effect: { cognition: 3, social: -2 }, narration: '你选择留下来加班。项目按时交了，但你错过了那扇门。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B1E7', stage: 1, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['steady', 'accumulator', 'gambler'],
      title: '第一份理财',
      desc: '工资攒了小半年，第一次有了闲钱。同事都在讨论怎么「钱生钱」。',
      options: [
        { text: '定投指数基金，佛系', effect: { cash: 9, cognition: 5, guts: -3 }, narration: '你设了自动定投，从此不看盘。时间会替你记账。', flag: 'longterm' },
        { text: '跟着大 V 买热门基金', effect: { guts: 9, cash: 5, cognition: -6 }, narration: '你冲进了排行榜第一的基金。那一刻，你觉得离财务自由不远了。', flag: 'aggressive' },
        { text: '先存定期，边学边看', effect: { cognition: 8, cash: 2 }, narration: '你把钱存了三年定期，然后开始系统学理财。慢，但踏实。', flag: 'longterm' }
      ]
    },
    {
      id: 'B1E8', stage: 1, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '同事抢功',
      desc: '你熬夜做的方案，被同事在周会上当成了「我们组的成果」汇报了。',
      options: [
        { text: '当场戳穿，把话说清楚', effect: { cash: -5, guts: 6, social: -4 }, narration: '你打断了汇报，把事情原委说清楚。气氛很尴尬，但大家心里都清楚了。' },
        { text: '私下找 leader 说明', effect: { cash: -3, social: 4, cognition: 3 }, narration: '你没在公开场合撕破脸，但让该知道的人知道了。' },
        { text: '算了，下次注意', effect: { cash: -2, social: -2, cognition: 2 }, narration: '你咽下了这口气。从那以后，你的方案都默默加了水印。', flag: 'low_profile' }
      ]
    },

    /* ==================== 第 2 阶段 · 积累期 ==================== */
    {
      id: 'B2E1', stage: 2, type: 'chance', rarity: 'R', weight: 85, personaTags: ['aggressive', 'hunter'],
      title: '大厂挖角',
      desc: '猎头开出翻倍的薪资，但新公司是出了名的「996 福报厂」。',
      options: [
        { text: '去，用几年换快钱', effect: { cash: 10, guts: 8, cognition: -3 }, narration: '你进了大厂。工资条很漂亮，体检报告也很「漂亮」。', flag: 'aggressive' },
        { text: '拿 offer 回去谈薪', effect: { cash: 7, social: 4, cognition: 4 }, narration: '你哪都没去，但你的价格被重新标了一次。' },
        { text: '不去，身体要紧', effect: { cash: 3, cognition: 4, guts: -3 }, narration: '你拒绝了。后来听说那批进去的人，不少提前「毕业」了。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B2E2', stage: 2, type: 'positive', rarity: 'N', weight: 100, personaTags: ['accumulator', 'hunter'],
      title: '技能变现',
      desc: '你业余做的技术分享，开始有人付费咨询，甚至邀你开课。',
      options: [
        { text: '做成副业，认真运营', effect: { cash: 9, guts: 6, cognition: 3 }, narration: '你开始认真经营自己的影响力。第一次，收入里有了「睡后」的部分。', flag: 'aggressive' },
        { text: '偶尔接点，不贪多', effect: { cash: 4, cognition: 4 }, narration: '你把它当成兴趣的副产品。有，更好；没有，也不亏。' }
      ]
    },
    {
      id: 'B2E3', stage: 2, type: 'negative', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '老领导求助',
      desc: '带过你的老领导创业，想拉你过去，但开不出现在的工资。',
      options: [
        { text: '去，看中人和前景', effect: { cash: -12, social: 8, guts: 5 }, narration: '你降薪去了。半年后公司起步，你成了最早的核心。', flag: 'aggressive' },
        { text: '婉拒，但尽力帮他对接', effect: { cash: -2, social: 6, cognition: 4 }, narration: '你没去，但给他介绍了两个投资人。人情，也算另一种投资。' },
        { text: '拒绝，保持现状', effect: { cash: 2, cognition: 2, social: -3 }, narration: '你选择了安稳。有些机会，错过就错过了。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B2E4', stage: 2, type: 'positive', rarity: 'R', weight: 70, personaTags: ['aggressive', 'networker'],
      title: '年度调薪季',
      desc: '又到调薪季，你知道自己过去一年的产出配得上更高的涨幅。',
      options: [
        { text: '主动约谈，摆数据', effect: { cash: 12, guts: 7, social: 3 }, narration: '你用一份漂亮的产出清单，把涨幅从平均线谈高了两档。' },
        { text: '等公司安排', effect: { cash: 3, cognition: 3, guts: -4 }, narration: '你拿到了「正常调整」。不多不少，刚刚好让人没有盼头。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B2E5', stage: 2, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['hunter', 'mentor'],
      title: '转管理岗',
      desc: '公司让你带一个小团队，但意味着你要从「技术大牛」变成「管人的」。',
      options: [
        { text: '转，挑战管理', effect: { guts: 9, social: 5, cash: 3, cognition: -2 }, narration: '你带起了第一支队伍。管人比写代码难，但天花板高多了。', flag: 'aggressive' },
        { text: '留在技术岗，深耕', effect: { cash: 6, cognition: 5 }, narration: '你选择继续做技术。深，也是一种稀缺。', flag: 'longterm' },
        { text: '先试带一个小项目', effect: { cognition: 6, social: 4 }, narration: '你拿一个小项目练手，既没放弃技术，也试了管理的水。' }
      ]
    },
    {
      id: 'B2E6', stage: 2, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '部门聚餐 AA',
      desc: '公司团建越来越频繁，这个月光聚餐就花了不少，还有各种「人情」。',
      options: [
        { text: '有节制地参与', effect: { cash: -7, social: 5, cognition: 4 }, narration: '你开始有选择地社交。重要的局不缺席，无效的局能推就推。' },
        { text: '全参加，怕被孤立', effect: { cash: -12, social: 3, cognition: -3 }, narration: '你一个不落地去了。热闹之后，钱包和精力都空了。' },
        { text: '大部分推掉', effect: { cash: -2, social: -6, cognition: 4 }, narration: '你省下了钱和精力，也悄悄退出了那个圈子。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B2E7', stage: 2, type: 'positive', rarity: 'N', weight: 90, personaTags: ['steady', 'accumulator'],
      title: '拿到年终奖',
      desc: '一笔不小的年终奖到账了。怎么花，是个问题。',
      options: [
        { text: '大部分存起来，小部分犒劳自己', effect: { cash: 10, cognition: 4 }, narration: '你把大头存了，用一小部分给自己买了件惦记很久的东西。' },
        { text: '全部投进去，钱滚钱', effect: { cash: 4, guts: 8, cognition: -4 }, narration: '你把年终奖一把梭了。涨了是本事，跌了是教训。', flag: 'aggressive' }
      ]
    },
    {
      id: 'B2E8', stage: 2, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'social <= 15',
      title: '被边缘化',
      desc: '部门重组后，你发现自己被调到了一个边缘岗位，没人跟你说为什么。',
      options: [
        { text: '主动沟通，问清楚', effect: { social: 10, guts: 6, cash: -3 }, narration: '你找了直属 leader 和 HR，把话聊开了。原来只是信息差。' },
        { text: '默默修炼，等机会', effect: { cognition: 7, cash: -4, guts: 3 }, narration: '你在边缘岗位做了半年，把新技能学透了。机会来的时候，你准备好了。' },
        { text: '直接准备跳槽', effect: { cash: -5, guts: 8, social: -2 }, narration: '你更新了简历。有时候，离开才是最好的止损。', flag: 'aggressive' }
      ]
    },

    /* ==================== 第 3 阶段 · 转折期 ==================== */
    {
      id: 'B3E1', stage: 3, type: 'chance', rarity: 'SSR', weight: 20, personaTags: ['lucky', 'gambler', 'hunter'],
      title: '期权到期',
      desc: '早些年入职拿的期权，现在公司要上市了。这是一笔可能改变人生的钱。',
      options: [
        { text: '全部兑现，落袋为安', effect: { cash: 18, guts: 5, cognition: -4, luck: 3 }, narration: '你在上市前把手里的期权都套了现。账户里那串数字，够你躺很久。' },
        { text: '兑现一半，留一半博', effect: { cash: 9, guts: 7, cognition: 3, luck: 2 }, narration: '你既保住了底，又留了向上的想象空间。' },
        { text: '一分不动，全押上市后', effect: { cash: -3, guts: 11, cognition: -6, luck: 4 }, narration: '你决定赌一把大的。上市那天，你盯着股价，心跳快得厉害。', flag: 'aggressive' }
      ]
    },
    {
      id: 'B3E2', stage: 3, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['networker', 'aggressive', 'mentor'],
      title: '合伙做公司',
      desc: '几个老同事想拉你一起创业，方向靠谱，但需要你投入积蓄。',
      options: [
        { text: '全职入伙，押上全部', effect: { guts: 11, cash: -14, cognition: 4, social: 4 }, narration: '你辞了职，把积蓄投了进去。前半年最难，后来慢慢有了起色。', flag: 'aggressive', chain: { when: 'cash > 45', next: 'B3C1' } },
        { text: '投钱占股，不全职', effect: { cash: -6, social: 6, cognition: 4 }, narration: '你出钱不出人，保留了一份工资做底。' },
        { text: '婉拒，但帮忙牵线', effect: { social: 8, cash: 2, cognition: 3 }, narration: '你给他们介绍了关键的资源。有时候，攒人情比攒股更重要。' }
      ]
    },
    {
      id: 'B3E3', stage: 3, type: 'negative', rarity: 'R', weight: 80, personaTags: ['gambler', 'aggressive'],
      title: '股票腰斩',
      desc: '你重仓的股票一路阴跌，已经亏掉了近一半本金。',
      options: [
        { text: '止损，认亏离场', effect: { cash: -15, cognition: 7, guts: -5 }, narration: '你在跌停前清掉了仓位。钱亏了，但人没被套死。', chain: { when: 'cash > 40', next: 'B3C2' } },
        { text: '加仓，摊薄成本', effect: { cash: -12, guts: 9, cognition: -7 }, narration: '你在下跌的路上又加了一笔。赌它反弹，或者赌自己看走眼。', flag: 'aggressive', chain: { when: 'cash <= 40', next: 'B3C3' } },
        { text: '装死，等它回来', effect: { cash: -9, cognition: 3, guts: -2 }, narration: '你关掉了行情软件。眼不见，心不烦，但仓位还在那里。' }
      ]
    },
    {
      id: 'B3E4', stage: 3, type: 'positive', rarity: 'R', weight: 70, personaTags: ['lucky'],
      title: '一笔赔偿金',
      desc: '公司裁员，你「幸运」地被列入了名单，拿到了一笔 N+3 的赔偿金。',
      options: [
        { text: '存起来，慢慢找下一份', effect: { cash: 11, cognition: 3 }, narration: '你把赔偿金当成缓冲，给自己放了个长假，认真想下一步。' },
        { text: '马上拿去做点生意', effect: { cash: 5, guts: 8, cognition: -5 }, narration: '你不想坐吃山空，拿这笔钱开了家小店。', flag: 'aggressive' }
      ]
    },
    {
      id: 'B3E5', stage: 3, type: 'chance', rarity: 'R', weight: 85, personaTags: ['steady', 'timid', 'average'],
      title: '买学区房',
      desc: '孩子到了上学的年纪，一套学区房首付要掏空大半积蓄。',
      options: [
        { text: '买，为了下一代', effect: { cash: -18, guts: 7, social: 3, cognition: 5 }, narration: '你咬着牙买了。房子旧了点，但学校是真好。', flag: 'longterm' },
        { text: '不买，换个思路', effect: { cash: 5, cognition: 5, guts: -5 }, narration: '你没跟风，选了别的教育路线。有些焦虑，是自己加的。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B3E6', stage: 3, type: 'negative', rarity: 'R', weight: 70, personaTags: ['aggressive', 'hunter'],
      title: '过劳的信号',
      desc: '连续高压工作后，你开始失眠、心悸，体检报告亮起一片黄灯。',
      options: [
        { text: '停下来，好好休息', effect: { cash: -11, cognition: 8, guts: -5 }, narration: '你请了假，去做了个全面检查，认真调整了作息。身体是 1，其余都是 0。', flag: 'longterm' },
        { text: '再撑一阵，项目关键期', effect: { cash: 5, guts: 5, cognition: -9 }, narration: '你吞了颗褪黑素继续熬。项目成了，身体垮了。' }
      ]
    },
    {
      id: 'B3E7', stage: 3, type: 'positive', rarity: 'N', weight: 90, personaTags: ['hunter', 'networker'],
      title: '行业新风口',
      desc: '你所在的行业出了个新方向，懂的人不多，你是最早一批接触的。',
      options: [
        { text: 'all in 新方向，抢占先机', effect: { cash: 11, social: 5, guts: 5 }, narration: '你成了公司里最早转过去的人。先发优势，让你吃了几年红利。' },
        { text: '边做边看，稳中求进', effect: { cash: 6, cognition: 5, social: 2 }, narration: '你没急着押注，而是先把新方向研究透，再慢慢切过去。', flag: 'longterm' }
      ]
    },
    {
      id: 'B3E8', stage: 3, type: 'crisis', rarity: 'SR', weight: 50, personaTags: [],
      require: 'cash <= 20',
      title: '失业空窗期',
      desc: '你突然失业了，存款只够撑三个月，而市场上合适的机会寥寥。',
      options: [
        { text: '降薪先就业，再谋发展', effect: { cash: 12, social: 5, guts: -4 }, narration: '你接受了一个降薪 offer，先稳住了现金流，再慢慢找更好的。' },
        { text: '收缩开支，硬扛着找', effect: { cash: 10, cognition: 7, guts: 5 }, narration: '你砍掉了所有非必要开支，用三个月时间，找到了一份更对的工作。' },
        { text: '借钱周转，博一个高薪岗', effect: { cash: 16, guts: 10, luck: 4, cognition: -6 }, narration: '你借了钱，把宝押在了一个高薪岗位上。这一次，你赌赢了。', flag: 'aggressive' }
      ]
    },
    /* 仅通过连锁触发（weight=0） */
    {
      id: 'B3C1', stage: 3, type: 'positive', rarity: 'SR', weight: 0, personaTags: [],
      title: '公司走上正轨',
      desc: '创业熬过了最难的阶段，公司第一次实现了盈亏平衡。',
      options: [
        { text: '继续扩张，再融资', effect: { cash: 9, guts: 6, cognition: 3 }, narration: '你把利润全部投入扩张。这一回，你更清楚钱该怎么花。' },
        { text: '分红，先回本', effect: { cash: 13, cognition: 5, guts: -3 }, narration: '你拿到了创业以来的第一笔分红。落袋为安，心里踏实。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B3C2', stage: 3, type: 'chance', rarity: 'R', weight: 0, personaTags: [],
      title: '止损后的机会',
      desc: '止损离场后，你手头还有余粮。一个你真正看懂的稳健机会出现了。',
      options: [
        { text: '这次稳着投', effect: { cash: 10, cognition: 6, guts: 3 }, narration: '你没有再凭消息，而是认真做足了功课才下手。' },
        { text: '先歇歇，不急着投', effect: { cognition: 7, cash: 2 }, narration: '你把钱放在活期，花了段时间让自己冷静下来。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B3C3', stage: 3, type: 'negative', rarity: 'R', weight: 0, personaTags: [],
      title: '越套越深',
      desc: '加仓之后继续下跌，你的资金链开始吃紧。',
      options: [
        { text: '彻底清仓，止损认栽', effect: { cash: -13, cognition: 9, guts: -6 }, narration: '你清掉了所有仓位，交了一笔昂贵的学费。' },
        { text: '再借一笔，死扛', effect: { cash: -10, guts: 8, cognition: -9, social: -4 }, narration: '你把窟窿越挖越深，告诉自己「不卖就不算亏」。' }
      ]
    },

    /* ==================== 第 4 阶段 · 收尾期 ==================== */
    {
      id: 'B4E1', stage: 4, type: 'positive', rarity: 'N', weight: 100, personaTags: ['average', 'steady'],
      title: '职业复盘',
      desc: '你把这几十年的职场路从头到尾捋了一遍。',
      options: [
        { text: '认真复盘，总结规律', effect: { cognition: 9, cash: 3 }, narration: '你发现真正让你成长的那几步，都是主动选择的结果。' },
        { text: '过去就过去了', effect: { guts: 4, cash: 4, cognition: -3 }, narration: '你不想再纠结过去。有些路，走过就够了。' }
      ]
    },
    {
      id: 'B4E2', stage: 4, type: 'chance', rarity: 'R', weight: 70, personaTags: ['gambler', 'aggressive', 'lucky'],
      title: '迟来的橄榄枝',
      desc: '年轻时梦寐以求的机会，在你不那么需要它的时候，突然出现了。',
      options: [
        { text: '接，圆了当年的梦', effect: { cash: 14, guts: 10, luck: 4, cognition: -6 }, narration: '你补上了年轻时错过的那一课。这次，你从容多了。', flag: 'aggressive' },
        { text: '算了，时机已过', effect: { cognition: 8, cash: 4 }, narration: '你笑了笑，婉拒了。有些东西，错过就是错过了。', flag: 'longterm' }
      ]
    },
    {
      id: 'B4E3', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['mentor', 'networker'],
      title: '带新人',
      desc: '公司安排你带一个刚入职的年轻人。',
      options: [
        { text: '倾囊相授', effect: { social: 9, cognition: 5, cash: 2 }, narration: '你把踩过的坑、悟出的道理都讲给他听。讲完，自己也通透了不少。' },
        { text: '点到为止，让他自己悟', effect: { cognition: 3, social: -3 }, narration: '你给了几句不痛不痒的建议。年轻人很客气，但没再来找你。', flag: 'low_profile' }
      ]
    },
    {
      id: 'B4E4', stage: 4, type: 'negative', rarity: 'N', weight: 85, personaTags: [],
      title: '一笔坏账',
      desc: '你早年借出去的一笔钱，对方至今没还，最近干脆联系不上了。',
      options: [
        { text: '算了，当买教训', effect: { cash: -10, cognition: 6 }, narration: '你决定不再纠结。有些钱，是花钱认识一个人的成本。' },
        { text: '想办法追讨', effect: { cash: -6, guts: 5, social: -3, cognition: 3 }, narration: '你走了法律途径。钱不一定追得回，但你要一个说法。' }
      ]
    },
    {
      id: 'B4E5', stage: 4, type: 'positive', rarity: 'R', weight: 75, personaTags: ['accumulator', 'steady'],
      title: '被动收入成型',
      desc: '你早年布局的那些副业和投资，如今开始稳定地产生现金流。',
      options: [
        { text: '继续滚大，做厚安全垫', effect: { cash: 10, cognition: 5, guts: -2 }, narration: '你把被动收入再投入，让它像雪球一样越滚越大。', flag: 'longterm' },
        { text: '落袋，享受生活', effect: { cash: 12, cognition: 1, guts: 3 }, narration: '你决定不再那么拼了，拿这些钱好好享受一下人生。' }
      ]
    },
    {
      id: 'B4E6', stage: 4, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['mentor', 'networker'],
      title: '公司并购',
      desc: '你所在的公司要被收购，你手里的股份可以套现，也可能被要求留下。',
      options: [
        { text: '套现离场，落袋为安', effect: { cash: 16, social: -6, cognition: 4 }, narration: '你签了字，把钱落袋。自由了，也空了。' },
        { text: '留下，带团队继续做', effect: { cash: 5, social: 11, cognition: 5 }, narration: '你选择留下，带一群人继续干。有些事，比钱更有意思。', flag: 'longterm' }
      ]
    },
    {
      id: 'B4E7', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['networker', 'mentor'],
      title: '老同事遇难',
      desc: '一个多年前并肩作战的老同事，最近生意失败，处境艰难。',
      options: [
        { text: '尽力帮，不问回报', effect: { cash: -9, social: 11, cognition: 4 }, narration: '你帮了他一把。多年后，这笔人情以另一种方式回报了你。' },
        { text: '量力而行', effect: { cash: -3, social: 4, cognition: 4 }, narration: '你帮了一部分。帮人是情分，量力是清醒。' }
      ]
    },
    {
      id: 'B4E8', stage: 4, type: 'positive', rarity: 'R', weight: 65, personaTags: ['lucky', 'accumulator'],
      title: '迟到的回报',
      desc: '一件你早年间不起眼的善意，多年后以一种意想不到的方式回馈了你。',
      options: [
        { text: '坦然收下', effect: { cash: 12, luck: 5, cognition: 3 }, narration: '你笑了笑。有些回报，只是来得晚了一些。' },
        { text: '转赠给需要的人', effect: { cash: 2, social: 9, luck: 4, cognition: 4 }, narration: '你把这份善意又递了出去。奇怪的是，你反而更踏实了。' }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
