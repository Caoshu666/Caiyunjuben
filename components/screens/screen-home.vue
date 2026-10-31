<template>
	<view class="screen">
		<!-- 装饰光晕：上游是 Canvas 径向渐变，这里用径向渐变圆做成 -->
		<view class="home__glow" />

		<view class="home__head">
			<text class="home__title">{{ game.t('title') }}</text>
			<text class="home__slogan">{{ game.t('slogan') }}</text>
		</view>

		<!-- ============ 每日财运签 ============ -->
		<!--
			为什么把「每日一签」放在首页最显眼的位置：
			这个游戏一局只有三四分钟，天然缺一个「明天再回来」的理由。
			每日一签正好补上这一环，而且是中文语境里最不需要解释的载体。
		-->
		<view v-if="daily" class="daily" :style="{ borderLeftColor: daily.color }">
			<view class="daily__head" @tap="toggleDaily">
				<text class="daily__cap">{{ game.t('dailyTitle') }}</text>
				<text class="daily__date">{{ game.dateLabel(daily.dateKey) }}</text>
				<text class="daily__toggle">{{ folded ? '看签' : '收起' }}</text>
			</view>

			<view class="daily__main">
				<text class="daily__level" :style="{ color: daily.color }">{{ daily.label }}</text>
				<view class="daily__score">
					<text class="daily__score-cap">{{ game.t('dailyIndex') }}</text>
					<text class="daily__score-num">{{ daily.index }}</text>
				</view>
			</view>

			<text class="daily__tip">{{ daily.tip }}</text>

			<view v-if="!folded" class="daily__detail">
				<view class="daily__line">
					<text class="daily__tag is-good">{{ game.t('dailyGood') }}</text>
					<text class="daily__items">{{ daily.good.join(' · ') }}</text>
				</view>
				<view class="daily__line">
					<text class="daily__tag is-bad">{{ game.t('dailyBad') }}</text>
					<text class="daily__items">{{ daily.bad.join(' · ') }}</text>
				</view>
				<view class="daily__line">
					<text class="daily__tag is-plain">{{ game.t('dailyLucky') }}</text>
					<view class="daily__luck">
						<view class="daily__swatch" :style="{ backgroundColor: daily.colorHex }" />
						<text class="daily__items">
							{{ daily.colorName }} · {{ daily.luckyNumber }} · {{ daily.direction }}
						</text>
					</view>
				</view>
				<text class="daily__foot">{{ game.t('dailyDisclaimer') }}</text>
			</view>
		</view>

		<!-- ============ 主操作 ============ -->
		<view class="home__actions">
			<WsButton :label="game.t('btnStart')" size="lg" @tap="onStart" />
			<text class="home__sub">{{ game.t('homeStartSub') }}</text>

			<view v-if="game.hasSave" class="home__gap" />
			<WsButton
				v-if="game.hasSave"
				:label="game.t('btnContinue')"
				variant="ghost"
				size="md"
				@tap="onContinue"
			/>
		</view>

		<!-- ============ 图鉴入口 ============ -->
		<WsCard flat custom-style="margin-top: 32rpx; padding: 30rpx 34rpx 20rpx;">
			<view class="codex__row" hover-class="ws-tap--hover" :hover-stay-time="60" @tap="onCodex('persona')">
				<view class="codex__line">
					<text class="codex__label">{{ game.t('codexTabPersona') }}</text>
					<text class="codex__value">{{ d.personaDone }} / {{ d.personaTotal }}</text>
				</view>
				<WsProgress :value="d.personaTotal ? d.personaDone / d.personaTotal : 0" />
			</view>

			<view
				class="codex__row codex__row--second"
				hover-class="ws-tap--hover"
				:hover-stay-time="60"
				@tap="onCodex('ending')"
			>
				<view class="codex__line">
					<text class="codex__label">{{ game.t('codexTabEnding') }}</text>
					<text class="codex__value">{{ d.endingDone }} / {{ d.endingTotal }}</text>
				</view>
				<WsProgress :value="d.endingTotal ? d.endingDone / d.endingTotal : 0" />
			</view>

			<view
				class="codex__foot"
				hover-class="ws-tap--hover"
				:hover-stay-time="60"
				@tap="onCodex('persona')"
			>
				<text class="codex__entry">查看图鉴 ›</text>
				<text class="codex__count">{{ game.t('homePlayCount', { n: playCount }) }}</text>
			</view>
		</WsCard>
	</view>
</template>

<script>
	import WsButton from '../ui/ws-button.vue'
	import WsCard from '../ui/ws-card.vue'
	import WsProgress from '../ui/ws-progress.vue'

	export default {
		name: 'ScreenHome',
		components: { WsButton, WsCard, WsProgress },
		props: {
			game: { type: Object, required: true }
		},
		data() {
			return {
				/**
				 * 签默认展开。它是首页最强的一个「钩子」，藏起来等于白做；
				 * 但玩家连着几天看腻了可以收起，收起状态只存在内存里，
				 * 下次进来还是完整的签 —— 免得某天忘了自己收过、以为签不见了。
				 */
				folded: false
			}
		},
		computed: {
			d() {
				return this.game.codexData
			},
			daily() {
				return this.game.daily
			},
			playCount() {
				return this.game.state.playCount || 0
			}
		},
		methods: {
			toggleDaily() {
				this.folded = !this.folded
			},
			onStart() {
				this.game.sfx.play('tap')
				this.game.actions.startTest()
			},
			onContinue() {
				this.game.sfx.play('tap')
				this.game.actions.continueGame()
			},
			onCodex(tab) {
				this.game.sfx.play('tap')
				this.game.actions.openCodex(tab)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.screen {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 44rpx 40rpx;
		overflow: hidden;
	}

	.home {
		&__glow {
			position: absolute;
			left: 50%;
			top: 60rpx;
			width: 620rpx;
			height: 620rpx;
			margin-left: -310rpx;
			border-radius: 50%;
			/* 模拟上游的 createRadialGradient(242,201,76, 0.35 → 0) */
			background: radial-gradient(
				circle closest-side,
				rgba(242, 201, 76, 0.35),
				rgba(242, 201, 76, 0) 100%
			);
			pointer-events: none;
		}

		&__head {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 130rpx;
		}

		&__title {
			font-size: 62rpx;
			font-weight: bold;
			color: $ws-ink;
			letter-spacing: 4rpx;
		}

		&__slogan {
			margin-top: 24rpx;
			font-size: 26rpx;
			color: $ws-muted;
		}

		&__actions {
			position: relative;
			margin-top: 44rpx;
			padding: 0 8rpx;
		}

		&__sub {
			display: block;
			margin-top: 20rpx;
			font-size: 21rpx;
			color: $ws-muted;
			text-align: center;
		}

		&__gap {
			height: 24rpx;
		}
	}

	/* ---- 每日财运签 ---- */
	.daily {
		position: relative;
		margin-top: 44rpx;
		padding: 26rpx 30rpx 24rpx;
		background-color: #FFFFFF;
		border: 2rpx solid $ws-line;
		/* 左侧色条直接用当天签文的颜色 —— 每天的颜色都不一样，有新鲜感 */
		border-left: 8rpx solid $ws-gold;
		border-radius: 22rpx;

		&__head {
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		&__cap {
			font-size: 22rpx;
			font-weight: bold;
			color: $ws-ink-2;
		}

		&__date {
			flex: 1;
			margin-left: 16rpx;
			font-size: 20rpx;
			color: $ws-muted;
		}

		&__toggle {
			font-size: 20rpx;
			color: $ws-gold;
		}

		&__main {
			display: flex;
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
			margin-top: 18rpx;
		}

		&__level {
			font-size: 52rpx;
			font-weight: bold;
			line-height: 1;
		}

		&__score {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
		}

		&__score-cap {
			font-size: 19rpx;
			color: $ws-muted;
		}

		&__score-num {
			margin-top: 6rpx;
			font-size: 38rpx;
			font-weight: bold;
			color: $ws-ink;
			line-height: 1;
		}

		&__tip {
			display: block;
			margin-top: 18rpx;
			font-size: 24rpx;
			color: $ws-ink-2;
			line-height: 1.55;
		}

		&__detail {
			margin-top: 22rpx;
			padding-top: 20rpx;
			border-top: 2rpx solid $ws-line;
		}

		&__line {
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-bottom: 14rpx;
		}

		&__tag {
			width: 42rpx;
			height: 34rpx;
			line-height: 34rpx;
			text-align: center;
			font-size: 20rpx;
			border-radius: 8rpx;
			color: #FFFFFF;
			flex-shrink: 0;

			&.is-good {
				background-color: $ws-gold;
			}

			&.is-bad {
				background-color: $ws-neg;
			}

			&.is-plain {
				background-color: $ws-muted;
			}
		}

		&__items {
			flex: 1;
			margin-left: 18rpx;
			font-size: 23rpx;
			color: $ws-ink-2;
		}

		&__luck {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-left: 18rpx;
		}

		&__swatch {
			width: 22rpx;
			height: 22rpx;
			border-radius: 6rpx;
			margin-right: 12rpx;
		}

		&__foot {
			display: block;
			margin-top: 6rpx;
			font-size: 18rpx;
			color: $ws-muted;
		}
	}

	/* ---- 图鉴入口 ---- */
	.codex {
		&__row {
			padding: 6rpx 0 12rpx;

			&--second {
				margin-top: 20rpx;
			}
		}

		&__line {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 14rpx;
		}

		&__label {
			font-size: 23rpx;
			color: $ws-ink-2;
		}

		&__value {
			font-size: 23rpx;
			font-weight: bold;
			color: $ws-gold;
		}

		&__foot {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			margin-top: 16rpx;
			padding-top: 18rpx;
			border-top: 2rpx solid $ws-line;
		}

		&__entry {
			font-size: 21rpx;
			color: $ws-gold;
			font-weight: bold;
		}

		&__count {
			font-size: 20rpx;
			color: $ws-muted;
		}
	}
</style>
