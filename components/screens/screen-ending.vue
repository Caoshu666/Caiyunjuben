<template>
	<view class="screen">
		<text class="ending__cap">{{ game.t('endingTitle') }}</text>

		<!-- 品质徽章 -->
		<view class="ending__badge" :style="{ backgroundColor: quality.bg, borderColor: quality.border }">
			<text class="ending__badge-text" :style="{ color: quality.color }">{{ r ? r.quality : '' }}</text>
		</view>
		<text class="ending__quality" :style="{ color: quality.color }">
			{{ hidden ? game.t('hiddenTag') : gradeLabel }}
		</text>

		<text v-if="persona" class="ending__persona">{{ (persona.badge || '') }}  {{ persona.name }}</text>
		<text class="ending__title">【{{ r ? r.title : '' }}】</text>

		<!--
			财运指数：等级回答「你排第几」，指数回答「你拿了多少分」。
			两条轴并列展示，玩家既知道自己比多少人好，也知道自己这一局具体几分。
		-->
		<view v-if="r" class="index">
			<view class="index__left">
				<text class="index__cap">{{ game.t('indexLabel') }}</text>
				<text class="index__band">{{ r.indexLabel }}</text>
			</view>
			<text class="index__num" :style="{ color: quality.color }">{{ r.index }}</text>
		</view>

		<!-- 人设标签：让结果像一份测试报告，而不是一句评价 -->
		<view v-if="r && r.tags && r.tags.length" class="tags">
			<view v-for="(tg, i) in r.tags" :key="i" class="tags__item">
				<text class="tags__text">{{ tg }}</text>
			</view>
		</view>

		<WsCard flat custom-style="margin-top: 28rpx; padding: 40rpx;">
			<text class="ending__narration">{{ r ? r.narration : '' }}</text>
		</WsCard>

		<text class="ending__attrs">
			{{ ATTRS.map((k) => LABEL[k] + ' ' + (attrs[k] || 0)).join('   ') }}
		</text>

		<!-- 本局新解锁：给一个明确的「又收集到了一个」的即时反馈 -->
		<view v-if="fresh.length" class="fresh">
			<text class="fresh__cap">本局新解锁</text>
			<view v-for="(u, i) in fresh" :key="i" class="fresh__row">
				<text class="fresh__text">{{ labelOf(u) }}</text>
			</view>
			<text class="fresh__tip" @tap="onOpenCodex">去图鉴看看 ›</text>
		</view>

		<view class="ending__actions">
			<WsButton label="看看我的结果卡" size="lg" @tap="onToCard" />
		</view>

		<WsHomeFoot :game="game" :stick="false" />

		<!-- 翻盘弹层：只在 C 级且没用过时出现 -->
		<view v-if="isRevive" class="revive-mask">
			<view class="revive">
				<text class="revive__title">{{ game.t('reviveTitle') }}</text>
				<text class="revive__body">{{ game.t('reviveBody') }}</text>
				<view class="revive__action">
					<WsButton :label="game.t('btnWatchAd')" size="md" @tap="onWatchAd" />
				</view>
				<view class="revive__gap" />
				<WsButton :label="game.t('btnSkipAd')" variant="plain" size="sm" @tap="onSkip" />
			</view>
		</view>
	</view>
</template>

<script>
	import WsCard from '../ui/ws-card.vue'
	import WsButton from '../ui/ws-button.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'
	import { QUALITY, ATTRS, ATTR_LABEL } from '../../utils/canvas-kit.js'

	export default {
		name: 'ScreenEnding',
		components: { WsCard, WsButton, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		data() {
			return { ATTRS, LABEL: ATTR_LABEL }
		},
		computed: {
			r() {
				return this.game.state.finalResult
			},
			persona() {
				return this.game.state.persona
			},
			attrs() {
				return this.game.state.attrs || {}
			},
			hidden() {
				return !!(this.r && this.r.hidden)
			},
			quality() {
				return QUALITY[(this.r && this.r.quality) || 'B'] || QUALITY.B
			},
			/*
			 * 等级的一句话说明。文案表里的键名规则是 grade + 等级字母，
			 * t() 找不到键时会原样返回键名，所以这里不用额外兜底也不会渲染成空白。
			 */
			gradeLabel() {
				return this.game.t('grade' + ((this.r && this.r.quality) || 'B'))
			},
			isRevive() {
				return this.game.state.phase === 'revive'
			},
			fresh() {
				return this.game.state.newUnlocks || []
			}
		},
		methods: {
			/** 把「新解锁」条目翻译成一句提示文案 */
			labelOf(u) {
				if (u.kind === 'persona') {
					return this.game.t('unlockPersona', { name: u.name || '' })
				}
				if (u.hidden) {
					return this.game.t('unlockEndingHidden', { title: u.title || '' })
				}
				return this.game.t('unlockEnding', { title: u.title || '' })
			},
			onOpenCodex() {
				this.game.actions.openCodex('ending')
			},
			onToCard() {
				this.game.sfx.play('tap')
				this.game.actions.watchAdForResultCard()
			},
			onWatchAd() {
				this.game.actions.watchAd()
			},
			onSkip() {
				this.game.actions.skipRevive()
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
		align-items: center;
		padding: 56rpx 48rpx 40rpx;
	}

	.ending {
		&__cap {
			font-size: 28rpx;
			color: $ws-muted;
		}

		&__badge {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 156rpx;
			height: 156rpx;
			margin-top: 32rpx;
			border-radius: 50%;
			border: 4rpx solid #EBCF7E;
		}

		&__badge-text {
			font-size: 66rpx;
			font-weight: bold;
			line-height: 1;
		}

		&__quality {
			margin-top: 22rpx;
			font-size: 24rpx;
			font-weight: bold;
		}

		&__persona {
			margin-top: 26rpx;
			font-size: 30rpx;
			color: $ws-ink-2;
		}

		&__title {
			margin-top: 18rpx;
			font-size: 50rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__narration {
			font-size: 26rpx;
			line-height: 1.85;
			color: $ws-ink-2;
		}

		&__attrs {
			margin-top: 28rpx;
			font-size: 23rpx;
			color: $ws-muted;
		}

		&__actions {
			width: 100%;
			margin-top: auto;
			padding-top: 44rpx;
		}
	}

	/* ---- 财运指数 ---- */
	.index {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		margin-top: 30rpx;
		padding: 24rpx 34rpx;
		background-color: $ws-surface-2;
		border-radius: 20rpx;

		&__left {
			display: flex;
			flex-direction: column;
		}

		&__cap {
			font-size: 21rpx;
			color: $ws-muted;
		}

		&__band {
			margin-top: 10rpx;
			font-size: 26rpx;
			font-weight: bold;
			color: $ws-ink-2;
		}

		&__num {
			font-size: 58rpx;
			font-weight: bold;
			line-height: 1;
		}
	}

	/* ---- 人设标签 ---- */
	.tags {
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin-top: 20rpx;

		&__item {
			padding: 10rpx 22rpx;
			margin: 0 10rpx;
			border-radius: 999rpx;
			background-color: $ws-surface-3;
		}

		&__text {
			font-size: 22rpx;
			color: $ws-ink-2;
		}
	}

	/* ---- 新解锁 ---- */
	.fresh {
		width: 100%;
		box-sizing: border-box;
		margin-top: 28rpx;
		padding: 26rpx 30rpx;
		background-color: $ws-gold-soft;
		border: 2rpx solid $ws-gold-line;
		border-radius: 20rpx;

		&__cap {
			font-size: 20rpx;
			font-weight: bold;
			color: $ws-gold-ink;
		}

		&__row {
			margin-top: 12rpx;
		}

		&__text {
			font-size: 24rpx;
			color: $ws-ink-2;
		}

		&__tip {
			display: block;
			margin-top: 14rpx;
			font-size: 21rpx;
			color: $ws-gold;
		}
	}

	/* ---- 翻盘 ---- */
	.revive-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $ws-mask;
	}

	.revive {
		width: 564rpx;
		padding: 56rpx 44rpx 40rpx;
		background-color: #FFFFFF;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		&__title {
			font-size: 38rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__body {
			margin-top: 30rpx;
			font-size: 25rpx;
			line-height: 1.75;
			color: $ws-ink-2;
			text-align: center;
			/* 文案里有换行 */
			white-space: pre-line;
		}

		&__action {
			width: 100%;
			margin-top: 48rpx;
		}

		&__gap {
			height: 20rpx;
		}
	}
</style>
