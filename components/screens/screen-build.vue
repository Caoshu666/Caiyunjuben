<template>
	<view class="screen">
		<text class="build__title">{{ game.t('buildTitle') }}</text>
		<text class="build__hint">{{ game.t('buildHint') }}</text>

		<view v-if="persona" class="build__persona">
			<view class="build__badge" :style="{ backgroundColor: persona.color || '#B8860B' }">
				<text class="build__badge-text">{{ persona.badge || '财' }}</text>
			</view>
			<text class="build__name">{{ persona.name }}</text>
			<text class="build__desc">{{ persona.desc }}</text>
		</view>

		<AttrRadar :attrs="attrs" :size="340" />

		<WsCard flat custom-style="margin-top: 24rpx; padding: 24rpx 36rpx 12rpx;">
			<AttrBars :attrs="attrs" />
		</WsCard>

		<view class="build__actions">
			<!--
				揭晓人格之后仍然允许改答案。
				放在确认按钮【下方】而不是上方：走完了全部 8 题的人绝大多数是认可的，
				把它放在主操作上面反而会削弱「仪式感」；但真答错的人会往下找一眼就能看到。
			-->
			<text class="build__edit" hover-class="ws-tap--hover" :hover-stay-time="60" @tap="onEdit">
				{{ game.t('buildEdit') }}
			</text>
			<WsButton :label="game.t('btnConfirm')" size="lg" @tap="onConfirm" />
		</view>

		<!-- 主操作已经吸底了，这里必须关掉吸底，否则两个 auto 会把空白平分 -->
		<WsHomeFoot :game="game" :stick="false" />
	</view>
</template>

<script>
	import WsButton from '../ui/ws-button.vue'
	import WsCard from '../ui/ws-card.vue'
	import AttrRadar from '../ui/attr-radar.vue'
	import AttrBars from '../ui/attr-bars.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'

	export default {
		name: 'ScreenBuild',
		components: { WsButton, WsCard, AttrRadar, AttrBars, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		computed: {
			persona() {
				return this.game.state.persona
			},
			attrs() {
				return this.game.state.attrs || {}
			}
		},
		methods: {
			onConfirm() {
				this.game.sfx.play('tap')
				this.game.actions.confirmBuild()
			},
			onEdit() {
				this.game.sfx.play('tap')
				this.game.actions.editQuiz()
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
		padding: 56rpx 48rpx 40rpx;
	}

	.build {
		&__title {
			font-size: 32rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__hint {
			margin-top: 12rpx;
			font-size: 22rpx;
			color: $ws-muted;
		}

		&__persona {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 44rpx;
		}

		&__badge {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 148rpx;
			height: 148rpx;
			border-radius: 50%;
		}

		&__badge-text {
			font-size: 60rpx;
			font-weight: bold;
			color: #FFFFFF;
			line-height: 1;
		}

		&__name {
			margin-top: 32rpx;
			font-size: 46rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__desc {
			margin-top: 18rpx;
			font-size: 26rpx;
			color: $ws-muted;
		}

		&__actions {
			width: 100%;
			margin-top: auto;
			padding-top: 48rpx;
		}

		&__edit {
			display: block;
			margin-bottom: 24rpx;
			font-size: 22rpx;
			color: $ws-muted;
			text-align: center;
			text-decoration: underline;
		}
	}
</style>
