<template>
	<!--
		页脚「回首页」。所有界面共用同一个组件，理由有两条：

		① 位置一致：玩家在任何一屏迷路了，都知道「往下看」能找到家。
		   各屏各写一份，位置和留白迟早会飘。
		② 语义一致：它必须永远只是「导航」，不能带任何破坏性副作用
		   （见 core/game-engine.js 里 goHome 的注释）。集中在这里，
		   哪天要加二次确认或埋点，只改一处。

		stick=true 时用 margin-top:auto 把自己顶到屏幕最下方；
		但像阶段结算 / 结局 / 结果卡这几屏，主操作按钮已经用了 auto 吸底，
		同时存在两个 auto 会把空白平分给两处、两边都不到底，
		所以那几屏要显式传 :stick="false"，让它紧跟在主操作下面。
	-->
	<view class="ws-homefoot" :class="{ 'is-stick': stick }">
		<view class="ws-homefoot__rule" />
		<WsButton :label="label" variant="plain" size="sm" @tap="onTap" />
	</view>
</template>

<script>
	import WsButton from './ws-button.vue'

	export default {
		name: 'WsHomeFoot',
		components: { WsButton },
		props: {
			game: { type: Object, required: true },
			/** 是否吸底。主操作已经吸底的界面请传 false */
			stick: { type: Boolean, default: true },
			/** 需要换称呼时（例如「放弃这一局」）由调用方给文案 */
			text: { type: String, default: '' }
		},
		computed: {
			label() {
				return this.text || this.game.t('btnHome')
			}
		},
		methods: {
			onTap() {
				this.game.sfx.play('tap')
				this.game.actions.goHome()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ws-homefoot {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 32rpx;

		&.is-stick {
			margin-top: auto;
		}

		/*
			一小段居中的短横线，而不是通栏分割线：
			它要表达的是「主内容到此为止」，通栏线会像卡片边界，
			在已经有很多描边的界面里显得吵。
		*/
		&__rule {
			width: 96rpx;
			height: 2rpx;
			margin-bottom: 20rpx;
			background-color: $ws-line;
		}
	}
</style>
