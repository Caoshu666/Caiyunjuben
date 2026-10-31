<template>
	<view class="screen">
		<text class="privacy__title">{{ game.t('privacyTitle') }}</text>

		<WsCard custom-style="padding: 40rpx 36rpx;">
			<text class="privacy__body">{{ game.t('privacyBody') }}</text>
		</WsCard>

		<view class="privacy__actions">
			<WsButton label="同意并继续" size="lg" @tap="onAgree" />
			<view class="privacy__gap" />
			<WsButton label="拒绝" variant="plain" size="sm" @tap="onReject" />
		</view>

		<text class="privacy__foot">本游戏为娱乐向内容，不构成任何投资建议</text>
	</view>
</template>

<script>
	import WsCard from '../ui/ws-card.vue'
	import WsButton from '../ui/ws-button.vue'

	export default {
		name: 'ScreenPrivacy',
		components: { WsCard, WsButton },
		props: {
			game: { type: Object, required: true }
		},
		methods: {
			onAgree() {
				this.game.sfx.play('tap')
				this.game.actions.acceptPrivacy()
			},
			onReject() {
				this.game.actions.rejectPrivacy()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 60rpx 48rpx 40rpx;
	}

	.privacy {
		&__title {
			font-size: 38rpx;
			font-weight: bold;
			color: $ws-ink;
			text-align: center;
			margin-bottom: 40rpx;
		}

		&__body {
			font-size: 23rpx;
			line-height: 1.85;
			color: $ws-ink-2;
			/* 文案里有 \n\n 分段，pre-line 才能保住空行 */
			white-space: pre-line;
		}

		&__actions {
			margin-top: auto;
			padding-top: 40rpx;
		}

		&__gap {
			height: 24rpx;
		}

		&__foot {
			margin-top: 32rpx;
			font-size: 20rpx;
			color: $ws-muted;
			text-align: center;
		}
	}
</style>
