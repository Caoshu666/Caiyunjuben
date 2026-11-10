<template>
	<view class="screen">
		<!-- 顶栏：左边「上一题」，右边题号 -->
		<view class="quiz__bar">
			<view
				class="quiz__back"
				:class="{ 'is-off': !game.canQuizBack }"
				:hover-class="game.canQuizBack ? 'ws-tap--hover' : 'none'"
				:hover-stay-time="60"
				@tap="onBack"
			>
				<text class="quiz__back-text" :class="{ 'is-off': !game.canQuizBack }">
					‹ {{ game.t('btnQuizBack') }}
				</text>
			</view>
			<text class="quiz__count">{{ game.t('quizProgress', { n: game.quizIndex, total: game.quizTotal }) }}</text>
			<view class="quiz__pad" />
		</view>

		<WsProgress :value="game.quizProgress" />

		<text class="quiz__hint">{{ game.t('quizHint') }}</text>

		<!-- 题干 -->
		<WsCard custom-style="margin-top: 20rpx; padding: 44rpx 36rpx;">
			<text class="quiz__stem">{{ q ? q.stem : '' }}</text>
		</WsCard>

		<!--
			选项。点击监听挂在外面这层普通 view 上，而不是 WsOption 组件上 ——
			自定义组件绑 @tap 在 H5 端可能被「组件 $emit + 原生冒泡」命中两次，
			那会让一次点击连跳两题。挂普通 view 两端都只有冒泡一条路径。
		-->
		<view class="quiz__options">
			<view
				v-for="(opt, i) in (q ? q.options : [])"
				:key="i"
				@tap="onAnswer(i)"
			>
				<WsOption :text="opt.text" :index="i" :picked="i === game.quizChoice" />
			</view>
		</view>

		<!-- 只有真的退回来过才出现：正常答题时不需要这条提示占位置 -->
		<text v-if="game.quizChoice >= 0" class="quiz__foot">
			这是你上一次的选择，换一个直接点就行
		</text>

		<WsHomeFoot :game="game" />
	</view>
</template>

<script>
	import WsCard from '../ui/ws-card.vue'
	import WsProgress from '../ui/ws-progress.vue'
	import WsOption from '../ui/ws-option.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'

	export default {
		name: 'ScreenQuiz',
		components: { WsCard, WsProgress, WsOption, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		computed: {
			q() {
				return this.game.currentQuestion
			}
		},
		methods: {
			onAnswer(i) {
				this.game.sfx.play('tap')
				this.game.actions.answerQuiz(i)
			},
			onBack() {
				if (!this.game.canQuizBack) {
					this.game.showToast('已经是第一题了')
					return
				}
				this.game.sfx.play('tap')
				this.game.actions.quizBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 48rpx 48rpx 40rpx;
	}

	.quiz {
		&__bar {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 24rpx;
		}

		&__back {
			width: 190rpx;
			padding: 10rpx 0;

			&.is-off {
				opacity: 0.45;
			}
		}

		&__back-text {
			font-size: 27rpx;
			color: $ws-ink-2;

			&.is-off {
				color: $ws-muted;
			}
		}

		&__count {
			font-size: 23rpx;
			color: $ws-muted;
		}

		&__bank {
			margin-left: 14rpx;
			padding: 4rpx 14rpx;
			font-size: 21rpx;
			color: $ws-gold-ink;
			background: $ws-gold-soft;
			border: 1rpx solid $ws-gold-line;
			border-radius: 999rpx;
		}

		&__pad {
			width: 190rpx;
		}

		&__hint {
			display: block;
			margin-top: 18rpx;
			font-size: 21rpx;
			color: $ws-muted;
			text-align: center;
		}

		&__stem {
			font-size: 34rpx;
			font-weight: bold;
			color: $ws-ink;
			line-height: 1.5;
		}

		&__options {
			margin-top: 40rpx;
		}

		/* 选项卡片的样式全部在 components/ui/ws-option.vue 里 */

		&__foot {
			display: block;
			margin-top: 12rpx;
			font-size: 20rpx;
			color: $ws-muted;
			text-align: center;
		}
	}
</style>
