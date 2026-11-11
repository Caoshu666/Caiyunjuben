<template>
	<view class="screen">
		<text class="summary__title">{{ game.t('summaryTitle') }}</text>
		<text class="summary__stage">{{ stage ? stage.name + ' · ' + stage.theme : '' }}</text>

		<!-- 阶段评级 -->
		<view class="summary__rating">
			<view class="summary__ring" :style="{ borderColor: ratingColor }">
				<text class="summary__rating-text" :style="{ color: ratingColor }">{{ ratingLabel }}</text>
			</view>
			<text class="summary__rating-cap">阶段评级</text>
		</view>

		<WsCard custom-style="margin-top: 44rpx; padding: 40rpx 36rpx 24rpx;">
			<AttrBars :attrs="attrs" />
		</WsCard>

		<text class="summary__next">
			下一个阶段：{{ nextStage ? nextStage.name : '剧本结局' }}
		</text>

		<view class="summary__actions">
			<WsButton :label="game.t('btnNext')" size="lg" @tap="onNext" />
		</view>

		<!--
			看完评级才后悔，是这一屏最典型的情绪。
			入口放在主按钮下面（不抢焦点），但一定要有 ——
			玩家看到「差」才发现上一件事选错了，这时候不给他回头的路很劝退。
		-->
		<!-- <text v-if="game.canStageBack" class="summary__back" @tap="onBack">
			{{ game.t('summaryBack') }}
		</text> -->

		<WsHomeFoot :game="game" :stick="false" />
	</view>
</template>

<script>
	import WsCard from '../ui/ws-card.vue'
	import WsButton from '../ui/ws-button.vue'
	import AttrBars from '../ui/attr-bars.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'

	export default {
		name: 'ScreenSummary',
		components: { WsCard, WsButton, AttrBars, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		data() {
			return { tapGuardUntil: 0 }
		},
		mounted() {
			/*
			 * 防「一次点击连跳两级」。
			 * 阶段页结算浮层的「继续」→ advance() 会切到本页；在 H5 上同一次
			 * 点击可能又落到本页的「继续」上，让 nextStage() 连调两次 —— 表现
			 * 就是转折期结算后本该进收尾期，却直接进了结果页。进页的头一瞬间
			 * 与每次点击后的极短窗口内忽略点击，挡掉这次重复。
			 */
			this.tapGuardUntil = Date.now() + 400
		},
		computed: {
			stage() {
				return this.game.currentStage
			},
			nextStage() {
				return this.game.nextStage
			},
			attrs() {
				return this.game.state.attrs || {}
			},
			ratingLabel() {
				const r = this.game.state.stageRating
				return r ? r.label : '中'
			},
			ratingColor() {
				const l = this.ratingLabel
				if (l === '好') return '#3F7A5C'
				if (l === '差') return '#8C8271'
				return '#B8860B'
			}
		},
		methods: {
			onNext() {
				if (Date.now() < this.tapGuardUntil) return
				this.tapGuardUntil = Date.now() + 400
				this.game.sfx.play('tap')
				this.game.actions.nextStage()
			},
			onBack() {
				this.game.sfx.play('tap')
				this.game.actions.stageBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 48rpx 40rpx;
	}

	.summary {
		&__title {
			font-size: 34rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__stage {
			margin-top: 18rpx;
			font-size: 26rpx;
			color: $ws-muted;
		}

		&__rating {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 70rpx;
		}

		&__ring {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			border: 5rpx solid $ws-gold;
		}

		&__rating-text {
			font-size: 62rpx;
			font-weight: bold;
			line-height: 1;
		}

		&__rating-cap {
			margin-top: 28rpx;
			font-size: 24rpx;
			color: $ws-muted;
		}

		&__next {
			margin-top: auto;
			padding-bottom: 40rpx;
			font-size: 26rpx;
			color: $ws-ink-2;
		}

		&__actions {
			width: 100%;
			padding: 0 45rpx;
		}

		&__back {
			margin-top: 30rpx;
			font-size: 23rpx;
			color: $ws-muted;
			text-decoration: underline;
		}
	}
</style>
