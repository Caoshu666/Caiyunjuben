/**
 * 配置表 4/6 —— event.js 事件表
 *
 * 34 个事件，4 个阶段各 8 个（另有 3 个仅通过「连锁」触发的隐藏事件，weight=0）。
 *
 * 【数值标定原则】—— 这份数值是配合 tools/simulate.js 跑出来的，不是拍脑袋定的：
 *   1. 任何给出较高现金收益的选项，都必须付出代价（胆识/认知/人脉/运势 的损耗）；
 *   2. 每个事件至少有一个选项是「有真实下行风险」的，避免变成「选择你的奖励」；
 *   3. 机遇类事件的方差最大（安全选项 +3 现金，激进选项 +15 现金但掉认知）；
 *   4. 再叠加 stage.upkeep 的生活开销，形成持续向下的重力。
 *   调参流程：改这里的数字 → 跑 npm run sim → 看分布是否接近 S 8% / A 27% / B 45% / C 20%。
 *
 * 字段说明：
 *   id          唯一标识
 *   stage       所属阶段 1-4
 *   type        positive 正向 / negative 负向 / chance 机遇 / crisis 危机
 *   rarity      N / R / SR / SSR
 *   weight      基础权重（越大越常出；0 表示不会被随机抽到，只能被连锁带出）
 *   require     出现条件（受限表达式），不满足则不进候选池
 *   personaTags 人格专属标签，命中则权重 ×2
 *   options[]   text 文案 / effect 属性增减 / narration 结算旁白
 *               flag 关键抉择标记（用于隐藏结局判定）
 *               chain {when, next} 结算后按条件触发连锁事件
 *
 * 玩家看到的是 text 与 narration，永远看不到 effect 的数值 ——
 * 所有数值都只存在于这张表里。
 */
(function (g) {
  'use strict';
  var NS = (g.WS = g.WS || {});
  NS.Tables = NS.Tables || {};

  NS.Tables.event = [
    /* ==================== 第 1 阶段 · 初入社会 ==================== */
    {
      id: 'S1E1', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['networker', 'mentor'],
      title: '入职第一周',
      desc: '部门里有个不成文的规矩：新人要请大家喝一次奶茶。三十几杯，小一千块。',
      options: [
        {
          text: '请，图个熟脸', effect: { social: 9, cash: -7 },
          narration: '你端着奶茶一杯杯递过去。从那天起，工位上有人主动跟你打招呼了。'
        },
        {
          text: '先观察，等混熟了再说', effect: { cognition: 4, social: -3 },
          narration: '你把钱留在了卡里，也把名字留在了没人记得的角落。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S1E2', stage: 1, type: 'chance', rarity: 'R', weight: 80, personaTags: ['hunter', 'accumulator'],
      title: '一个周末副业',
      desc: '大学同学拉你一起接单做项目。投入不大，但要占掉你所有的周末。',
      options: [
        {
          text: '干，年轻就该多试试', effect: { guts: 6, cash: 4, cognition: 2 },
          narration: '你连着两个月没休过周末。钱不多，但你第一次知道自己的时间能卖两次。', flag: 'aggressive'
        },
        {
          text: '算了，先把主业做扎实', effect: { cognition: 4, cash: 2 },
          narration: '你把周末还给了自己，也把专注力给了本职。', flag: 'longterm'
        },
        {
          text: '先接一单试试水，再决定', effect: { cognition: 3, cash: 3, guts: 2 },
          narration: '你用一个周末换了一次低成本试错。'
        }
      ]
    },
    {
      id: 'S1E3', stage: 1, type: 'negative', rarity: 'N', weight: 100, personaTags: [],
      title: '第一个坑',
      desc: '你花了 1999 元报了一个「稳赚不赔」的理财课，进了群才发现是套壳的推销。',
      options: [
        {
          text: '认栽，把这个教训记牢', effect: { cash: -9, cognition: 6 },
          narration: '两千块买了句实话：凡是「稳赚」，都是赚你的钱。'
        },
        {
          text: '去投诉，尽力把钱要回来', effect: { cash: -5, guts: 5, social: 2 },
          narration: '你折腾了两个星期，要回来一半。原来维权本身就是一种能力。'
        }
      ]
    },
    {
      id: 'S1E4', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['aggressive', 'lucky'],
      title: '项目上线前夜',
      desc: '上线前最后一晚，leader 把最关键、也最容易出问题的一块交给了你。',
      options: [
        {
          text: '扛下来，做到最好', effect: { cognition: 6, guts: 5, cash: 2 },
          narration: '凌晨四点，你提交了最后一个版本。第二天没人提到你的名字，但系统记住了你。'
        },
        {
          text: '先保证不出错，别冒进', effect: { cash: 4, cognition: 3, guts: -3 },
          narration: '你选了最保守的实现方式。稳，但也就到这儿了。'
        }
      ]
    },
    {
      id: 'S1E5', stage: 1, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'cash <= 25',
      title: '现金流告急',
      desc: '房租、花呗、下个月的饭钱，三样叠在一起。你第一次真切地意识到自己没钱了。',
      options: [
        {
          text: '跟家里开口', effect: { cash: 15, social: -6, guts: -4 },
          narration: '电话那头沉默了两秒，然后说「多少」。你挂了电话，很久没说话。'
        },
        {
          text: '刷信用卡扛过去', effect: { cash: 10, guts: 3, cognition: -5 },
          narration: '现金流是续上了，但你知道自己把问题往后推了一个月。'
        },
        {
          text: '接个能立刻结钱的活', effect: { cash: 8, guts: 4, cognition: 2 },
          narration: '你用一个通宵换了一笔现钱。辛苦，但账是干净的。'
        }
      ]
    },
    {
      id: 'S1E6', stage: 1, type: 'positive', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '一次饭局',
      desc: '部门聚餐，座位表把你安排在了总监旁边。',
      options: [
        {
          text: '主动聊，多听多问', effect: { social: 8, cognition: 4 },
          narration: '你没说什么漂亮话，但你记住了他提到的两个行业名词，回去查了一晚上。'
        },
        {
          text: '安静吃饭，少说少错', effect: { cognition: 3, social: -2 },
          narration: '整顿饭你只说了三次「嗯」。没人觉得你失礼，也没人记得你来过。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S1E7', stage: 1, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['steady', 'accumulator', 'gambler'],
      title: '第一笔投资',
      desc: '你攒下了人生第一个五位数。这笔钱怎么放，几乎是个性格问题。',
      options: [
        {
          text: '买指数基金，长期拿着不动', effect: { cash: 9, cognition: 5, guts: -3 },
          narration: '你设了个定投，然后把 App 删了。不看，就不慌。', flag: 'longterm'
        },
        {
          text: '跟着群里炒一波短线', effect: { guts: 9, cash: 5, cognition: -6 },
          narration: '第一周赚了两千，你觉得自己找到了答案。', flag: 'aggressive'
        },
        {
          text: '先不动，自己先学明白', effect: { cognition: 8, cash: 2 },
          narration: '你花了三个月读书、算账、复盘。收益率不高，但你知道自己在干什么。', flag: 'longterm'
        }
      ]
    },
    {
      id: 'S1E8', stage: 1, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '室友跑了',
      desc: '合租室友半夜搬走，押金和最后两个月房租，全落在你一个人头上。',
      options: [
        {
          text: '自己扛下来，不折腾', effect: { cash: -12, guts: 3 },
          narration: '你把账单付了。有些亏，花钱买清静。'
        },
        {
          text: '找房东好好谈一次', effect: { cash: -8, social: 5 },
          narration: '你摆事实讲道理，房东退了一步。原来绝大多数事都是可以谈的。'
        },
        {
          text: '发到群里曝光他', effect: { cash: -10, social: -5, guts: 3 },
          narration: '你出了一口气，也丢了一个朋友的朋友。'
        }
      ]
    },

    /* ==================== 第 2 阶段 · 积累期 ==================== */
    {
      id: 'S2E1', stage: 2, type: 'chance', rarity: 'R', weight: 85, personaTags: ['aggressive', 'hunter'],
      title: '跳槽机会',
      desc: '一个猎头找到你，薪资涨 40%，但公司刚融完 A 轮，随时可能死掉。',
      options: [
        {
          text: '去，赌一把', effect: { cash: 9, guts: 8, social: -5 },
          narration: '你签了 offer。入职三个月后，公司又融了一轮。', flag: 'aggressive'
        },
        {
          text: '拿这个 offer 回去谈涨薪', effect: { cash: 7, social: 4, cognition: 4 },
          narration: '你没走，但你的身价被重新评估了一次。'
        },
        {
          text: '不动，现在挺好', effect: { cash: 3, cognition: 3 },
          narration: '你留在了熟悉的地方。安稳，也是一种选择。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S2E2', stage: 2, type: 'positive', rarity: 'N', weight: 100, personaTags: ['accumulator', 'hunter'],
      title: '副业开始有收入',
      desc: '你断断续续做了两年的副业，这个月第一次超过了工资的一半。',
      options: [
        {
          text: '加大投入，做成第二条路', effect: { cash: 9, guts: 6, cognition: 3 },
          narration: '你开始认真算时薪，认真想什么样的活值得接。', flag: 'aggressive'
        },
        {
          text: '维持现状，慢慢来', effect: { cash: 4, cognition: 4 },
          narration: '副业成了你工资之外的一块安全垫。'
        }
      ]
    },
    {
      id: 'S2E3', stage: 2, type: 'negative', rarity: 'N', weight: 100, personaTags: ['mentor', 'networker'],
      title: '朋友借钱',
      desc: '一个关系不错的朋友找你借五万块，说是周转一个月，没提利息。',
      options: [
        {
          text: '借，相信他', effect: { cash: -14, social: 10, guts: 3 },
          narration: '钱转过去，聊天框安静了很久。三个月后，他还了。'
        },
        {
          text: '借一部分，说清楚是救急', effect: { cash: -9, social: 6, cognition: 5 },
          narration: '你划了条线。朋友没生气，反而松了口气。'
        },
        {
          text: '拒绝，但帮他想了别的办法', effect: { cash: -2, social: 2, cognition: 6 },
          narration: '你没借他钱，但给他介绍了一个能接活的人。'
        }
      ]
    },
    {
      id: 'S2E4', stage: 2, type: 'positive', rarity: 'R', weight: 70, personaTags: ['aggressive', 'networker'],
      title: '一次涨薪谈判',
      desc: '你手里握着两个 offer，也知道部门正在缺人。涨薪窗口就在眼前。',
      options: [
        {
          text: '开口要，把数字说清楚', effect: { cash: 12, guts: 7, social: 3 },
          narration: '你把行业薪资表拍在桌上。谈到最后，涨了 28%。'
        },
        {
          text: '不提，等公司主动', effect: { cash: 3, cognition: 3, guts: -4 },
          narration: '年底调薪 5%。你觉得理所当然，也有点不是滋味。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S2E5', stage: 2, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['hunter', 'mentor'],
      title: '内部转岗名额',
      desc: '公司有一个新业务线在内部招人，成了就是元老，败了就要重新开始。',
      options: [
        {
          text: '报名，赌新业务', effect: { guts: 9, cognition: 5, cash: 3, social: -4 },
          narration: '你成了第 4 个加入的人。半年后，这条线成了公司增长最快的部分。', flag: 'aggressive'
        },
        {
          text: '留在原岗位，稳扎稳打', effect: { cash: 6, cognition: 4 },
          narration: '你把熟悉的事做得更熟。深，也是一种壁垒。', flag: 'longterm'
        },
        {
          text: '先打听清楚再决定', effect: { cognition: 7, social: 4 },
          narration: '你找了新业务线上的三个人聊过，最后做了个不那么冲动的决定。'
        }
      ]
    },
    {
      id: 'S2E6', stage: 2, type: 'negative', rarity: 'N', weight: 90, personaTags: [],
      title: '随礼季',
      desc: '这个月有四场婚礼、两个满月酒，还有一位长辈住院。',
      options: [
        {
          text: '该给的都给足', effect: { cash: -13, social: 9 },
          narration: '你把这个月的奖金全散出去了。人情账户，也是在存钱。'
        },
        {
          text: '只给最亲近的', effect: { cash: -6, social: -4, cognition: 5 },
          narration: '你第一次认真筛了一遍「谁的礼必须给」。'
        }
      ]
    },
    {
      id: 'S2E7', stage: 2, type: 'positive', rarity: 'N', weight: 90, personaTags: ['steady', 'accumulator'],
      title: '父母的支持',
      desc: '父母说，家里有一笔闲钱，问你要不要拿去周转，不用还。',
      options: [
        {
          text: '收下，用在自己的事上', effect: { cash: 14, guts: 4, cognition: -6 },
          narration: '这笔钱让你喘了口气，也让你的起点不再只是自己。'
        },
        {
          text: '不收，让他们留着养老', effect: { cash: 2, cognition: 6, social: 5, guts: 4 },
          narration: '你说了句「我自己的事我自己来」。说完心里挺踏实。'
        }
      ]
    },
    {
      id: 'S2E8', stage: 2, type: 'crisis', rarity: 'R', weight: 60, personaTags: [],
      require: 'social <= 15',
      title: '没人可求',
      desc: '你遇到了一个自己绝对搞不定的坎，翻遍通讯录，找不到一个能开口的人。',
      options: [
        {
          text: '硬着头皮去认识新的人', effect: { social: 12, guts: 6, cash: -7 },
          narration: '你参加了三个完全不熟的局，说了很多次「你好」。很别扭，但有用。'
        },
        {
          text: '花钱解决，请专业的人来办', effect: { cash: -13, cognition: 7 },
          narration: '钱花了，事办了。你第一次明白，钱也是一种关系。'
        },
        {
          text: '自己扛，慢慢磨', effect: { cash: -6, guts: 5, cognition: 5 },
          narration: '你用了四个月。扛过去之后，你觉得以后好像也没什么好怕的。'
        }
      ]
    },

    /* ==================== 第 3 阶段 · 转折期 ==================== */
    {
      id: 'S3E1', stage: 3, type: 'chance', rarity: 'SSR', weight: 20, personaTags: ['lucky', 'gambler', 'hunter'],
      title: '一次风口',
      desc: '一个你从没听过的行业，在两个月里估值翻了十倍。朋友圈里所有人都在讨论它。',
      options: [
        {
          text: '重仓进去，这是时代的机会', effect: { cash: 18, guts: 10, cognition: -7, luck: 3 },
          narration: '你把大半身家押了进去。三个月后，你成了那个「抓到过风口的人」。', flag: 'aggressive'
        },
        {
          text: '小仓位参与，当作一次期权', effect: { cash: 8, guts: 5, cognition: 4, luck: 2 },
          narration: '你赚了一点，也留下了一点清醒。'
        },
        {
          text: '仔细研究后决定不参与', effect: { cognition: 9, cash: -3, luck: -4 },
          narration: '你看懂了它的商业模式，然后发现自己看不懂的东西还是多。'
        }
      ]
    },
    {
      id: 'S3E2', stage: 3, type: 'chance', rarity: 'SR', weight: 45, personaTags: ['networker', 'aggressive', 'mentor'],
      title: '合伙创业',
      desc: '一个老朋友拉你一起做一件事，需要你出钱、出时间，还要辞掉现在的工作。',
      options: [
        {
          text: '辞职入伙，全力以赴', effect: { guts: 11, cash: -14, cognition: 4, social: 4 },
          narration: '你签了协议。第一年，你们亏了；第二年，账终于平了。', flag: 'aggressive',
          chain: { when: 'cash > 45', next: 'S3C1' }
        },
        {
          text: '不辞职，出钱占小股', effect: { cash: -6, social: 6, cognition: 4 },
          narration: '你留了一份工资作底。参与，但不 all in。'
        },
        {
          text: '婉拒，但帮他对接资源', effect: { social: 8, cash: 2, cognition: 3 },
          narration: '你介绍了两个人给他。后来他说，最感激的是你没让他更难做。'
        }
      ]
    },
    {
      id: 'S3E3', stage: 3, type: 'negative', rarity: 'R', weight: 80, personaTags: ['gambler', 'aggressive'],
      title: '投资被套',
      desc: '你重仓的那个东西跌了 40%，群里从欢呼变成了沉默。',
      options: [
        {
          text: '割肉离场，先把本金守住', effect: { cash: -15, cognition: 7, guts: -5 },
          narration: '你点了卖出。亏损的截图被你永久保存了下来。',
          chain: { when: 'cash > 40', next: 'S3C2' }
        },
        {
          text: '补仓，摊低成本', effect: { cash: -12, guts: 9, cognition: -7 },
          narration: '你在跌的路上又加了一次。要么翻身，要么彻底输光。', flag: 'aggressive',
          chain: { when: 'cash <= 40', next: 'S3C3' }
        },
        {
          text: '不动，也不看', effect: { cash: -9, cognition: 3, guts: -2 },
          narration: '你把 App 删了。有些账，只能交给时间。'
        }
      ]
    },
    {
      id: 'S3E4', stage: 3, type: 'positive', rarity: 'R', weight: 70, personaTags: ['lucky'],
      title: '意外之财',
      desc: '一笔你早就忘掉的旧账突然被结清了，数目还不小。',
      options: [
        {
          text: '存起来，当作安全垫', effect: { cash: 11, cognition: 3 },
          narration: '你把它放进了那个几乎不动的账户。'
        },
        {
          text: '投出去，钱要动起来才有价值', effect: { cash: 5, guts: 8, cognition: -5 },
          narration: '你觉得这是老天给的弹药，不用就浪费了。', flag: 'aggressive'
        }
      ]
    },
    {
      id: 'S3E5', stage: 3, type: 'chance', rarity: 'R', weight: 85, personaTags: ['steady', 'timid', 'average'],
      title: '一套房子',
      desc: '一套位置不错的房子，首付掏空你所有积蓄，月供占收入一半。',
      options: [
        {
          text: '买，早上车早安心', effect: { cash: -18, guts: 7, social: 3, cognition: 5 },
          narration: '你签了合同。那晚你在空房子里坐了很久，算了一笔很长的账。', flag: 'longterm'
        },
        {
          text: '不买，把钱留在手里', effect: { cash: 5, cognition: 5, guts: -5 },
          narration: '你继续租房。手里的现金让你睡得着，也让你偶尔有点失落。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S3E6', stage: 3, type: 'negative', rarity: 'R', weight: 70, personaTags: ['aggressive', 'hunter'],
      title: '身体亮红灯',
      desc: '体检报告上出现了几个箭头。医生说，再这么熬下去，会出事。',
      options: [
        {
          text: '停下来，调整节奏', effect: { cash: -11, cognition: 8, guts: -5 },
          narration: '你推掉了两个项目，第一次按时下班。收入降了，人还在。', flag: 'longterm'
        },
        {
          text: '先扛过这一阵再说', effect: { cash: 5, guts: 5, cognition: -9 },
          narration: '你把报告塞进抽屉。机会窗口就这么几年，你告诉自己。'
        }
      ]
    },
    {
      id: 'S3E7', stage: 3, type: 'positive', rarity: 'N', weight: 90, personaTags: ['hunter', 'networker'],
      title: '行业回暖',
      desc: '你所在的行业突然被资本重新看上，猎头电话又开始响了。',
      options: [
        {
          text: '抓住窗口，换一个更高的位置', effect: { cash: 11, social: 5, guts: 5 },
          narration: '你带着这几年的履历，拿到了一个之前不敢想的 title。'
        },
        {
          text: '留在原地，把盘子做大', effect: { cash: 6, cognition: 5, social: 2 },
          narration: '别人跳来跳去的时候，你把手里的事做成了标杆。', flag: 'longterm'
        }
      ]
    },
    {
      id: 'S3E8', stage: 3, type: 'crisis', rarity: 'SR', weight: 50, personaTags: [],
      require: 'cash <= 20',
      title: '债务危机',
      desc: '几笔账撞在一起，你第一次认真算了一下：如果现在失业，你撑不过两个月。',
      options: [
        {
          text: '坦白，跟家人一起扛', effect: { cash: 16, social: 5, guts: -6 },
          narration: '你把数字说了出来。说完的那一刻，反而轻松了。'
        },
        {
          text: '变卖不必要的东西，收缩开支', effect: { cash: 12, cognition: 7, guts: 4 },
          narration: '你卖了车、退了健身卡、搬了家。生活降级，但账开始变干净。'
        },
        {
          text: '赌一把，用最后一笔钱博个大的', effect: { cash: 20, guts: 12, luck: 6, cognition: -9 },
          narration: '你把最后的筹码推了出去。这次，你赢了。', flag: 'aggressive'
        }
      ]
    },
    /* 仅通过连锁触发（weight=0，不会被随机抽到） */
    {
      id: 'S3C1', stage: 3, type: 'positive', rarity: 'SR', weight: 0, personaTags: [],
      title: '账终于平了',
      desc: '创业第二年年底，你们的账第一次走到了正数。',
      options: [
        {
          text: '继续做大', effect: { cash: 9, guts: 6, cognition: 3 },
          narration: '你把利润全部投了回去。这一次，你知道钱会去哪儿。'
        },
        {
          text: '分红，先落袋为安', effect: { cash: 13, cognition: 5, guts: -3 },
          narration: '你第一次从这家公司里，拿到了属于自己的那一份。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S3C2', stage: 3, type: 'chance', rarity: 'R', weight: 0, personaTags: [],
      title: '翻盘机会',
      desc: '割肉之后手头还有余粮。朋友给你介绍了一个更朴素、但看得懂的机会。',
      options: [
        {
          text: '这次看懂了再投', effect: { cash: 10, cognition: 6, guts: 3 },
          narration: '你没有再听消息，而是把对方的账本翻了三遍。'
        },
        {
          text: '先不动，歇一段时间', effect: { cognition: 7, cash: 2 },
          narration: '你把钱放进活期，然后花了半年时间什么都不干。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S3C3', stage: 3, type: 'negative', rarity: 'R', weight: 0, personaTags: [],
      title: '债务缠身',
      desc: '补仓之后继续下跌。你开始接到银行的电话。',
      options: [
        {
          text: '彻底清仓，认了', effect: { cash: -13, cognition: 9, guts: -6 },
          narration: '你清掉了所有仓位。亏掉的钱，够你上好几年课。'
        },
        {
          text: '再借一笔，扛下去', effect: { cash: -10, guts: 8, cognition: -9, social: -4 },
          narration: '你把窟窿挖得更深了一点。你告诉自己，只要不卖就不算亏。'
        }
      ]
    },

    /* ==================== 第 4 阶段 · 收尾期 ==================== */
    {
      id: 'S4E1', stage: 4, type: 'positive', rarity: 'N', weight: 100, personaTags: ['average', 'steady'],
      title: '一次复盘',
      desc: '你把这十几年赚的和亏的，一笔一笔列了出来。',
      options: [
        {
          text: '认真复盘，把规律写下来', effect: { cognition: 9, cash: 3 },
          narration: '你发现真正赚到钱的那几笔，都是你真正看懂了的。'
        },
        {
          text: '过去就过去了，往前看', effect: { guts: 4, cash: 4, cognition: -3 },
          narration: '你把那页纸撕了。有些账，算了也没用。'
        }
      ]
    },
    {
      id: 'S4E2', stage: 4, type: 'chance', rarity: 'R', weight: 70, personaTags: ['gambler', 'aggressive', 'lucky'],
      title: '最后一次机会',
      desc: '一个你年轻时错过的东西，又出现在了面前。这次你有钱了。',
      options: [
        {
          text: '这一次，我要抓住它', effect: { cash: 14, guts: 10, luck: 4, cognition: -6 },
          narration: '你补上了当年那一课。但这次你不是因为年轻。', flag: 'aggressive'
        },
        {
          text: '算了，错过了就是错过了', effect: { cognition: 8, cash: 4 },
          narration: '你笑了笑，转身走了。', flag: 'longterm'
        }
      ]
    },
    {
      id: 'S4E3', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['mentor', 'networker'],
      title: '一个年轻人来问你',
      desc: '一个刚工作的年轻人找到你，想听听你的经验。',
      options: [
        {
          text: '认真讲，把踩过的坑都说了', effect: { social: 9, cognition: 5, cash: 2 },
          narration: '你讲了两个小时。讲完之后，你发现自己也想明白了一些事。'
        },
        {
          text: '简单敷衍两句', effect: { cognition: 2, social: -4 },
          narration: '你说「慢慢来吧」。他道了谢，转身走了。', flag: 'low_profile'
        }
      ]
    },
    {
      id: 'S4E4', stage: 4, type: 'negative', rarity: 'N', weight: 85, personaTags: [],
      title: '一次亏损',
      desc: '一笔你以为很稳的投入出了问题，损失不算致命，但很伤。',
      options: [
        {
          text: '及时止损，调整结构', effect: { cash: -10, cognition: 7 },
          narration: '你没有再犹豫。认亏，是这几年你学会的最贵的一课。'
        },
        {
          text: '再等等，总会回来', effect: { cash: -14, guts: 5, cognition: -6 },
          narration: '你选择了再等等。时间证明，这次你等错了。'
        }
      ]
    },
    {
      id: 'S4E5', stage: 4, type: 'positive', rarity: 'R', weight: 75, personaTags: ['accumulator', 'steady'],
      title: '被动收入',
      desc: '你早年做的那些不起眼的小事，开始每个月往你卡里打钱了。',
      options: [
        {
          text: '继续加码，把系统做得更稳', effect: { cash: 10, cognition: 5, guts: -2 },
          narration: '你终于理解了那句话：真正的财富，是你睡觉时也在增长的东西。', flag: 'longterm'
        },
        {
          text: '卖掉，换成现金', effect: { cash: 12, cognition: 1, guts: 3 },
          narration: '你落袋为安，拿着这笔钱准备干点别的。'
        }
      ]
    },
    {
      id: 'S4E6', stage: 4, type: 'chance', rarity: 'SR', weight: 40, personaTags: ['mentor', 'networker'],
      title: '要不要传下去',
      desc: '有人愿意出高价接手你这些年做起来的东西。也有人希望你能带着他们继续做。',
      options: [
        {
          text: '卖掉，套现离场', effect: { cash: 16, social: -6, cognition: 4 },
          narration: '你签了字。钱到账那天，你有点空。'
        },
        {
          text: '不卖，带一群人继续做', effect: { cash: 5, social: 11, cognition: 5 },
          narration: '你把股份分了一部分出去。有些东西，比钱更值得留。', flag: 'longterm'
        }
      ]
    },
    {
      id: 'S4E7', stage: 4, type: 'positive', rarity: 'N', weight: 90, personaTags: ['networker', 'mentor'],
      title: '一个老朋友',
      desc: '一个二十年前帮过你的人，现在遇到了难处，想找你帮个忙。',
      options: [
        {
          text: '尽力帮，不问回报', effect: { cash: -9, social: 11, cognition: 4 },
          narration: '你打了个电话，把事情办了。他在那头说了三遍谢谢。'
        },
        {
          text: '能力范围内帮一点', effect: { cash: -3, social: 4, cognition: 4 },
          narration: '你没有大包大揽，但也没有装看不见。'
        }
      ]
    },
    {
      id: 'S4E8', stage: 4, type: 'positive', rarity: 'R', weight: 65, personaTags: ['lucky', 'accumulator'],
      title: '时间给的礼物',
      desc: '一件你几乎忘了的早年小事，以完全没想到的方式回到了你身上。',
      options: [
        {
          text: '收下，这是应得的', effect: { cash: 12, luck: 5, cognition: 3 },
          narration: '你笑了笑。有些回报，只是来得比较晚。'
        },
        {
          text: '转手送给更需要的人', effect: { cash: 2, social: 9, luck: 4, cognition: 4 },
          narration: '你把这份运气递给了别人。很奇怪，你反而更踏实了。'
        }
      ]
    }
  ];
})(typeof globalThis !== 'undefined' && globalThis || typeof self !== 'undefined' && self || typeof window !== 'undefined' && window || typeof global !== 'undefined' && global);
