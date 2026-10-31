<template>
	<view class="overlay-root">
		<!-- Toast：轻提示，2 秒后自动消失 -->
		<view v-if="toast" class="toast">
			<text class="toast__text">{{ toast }}</text>
		</view>

		<!-- Busy：广告播放等需要阻塞交互的场景 -->
		<view v-if="busy" class="busy">
			<view class="busy__box">
				<text class="busy__title">{{ busyText || '广告播放中…' }}</text>
				<text class="busy__sub">看完即可继续</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'WsOverlay',
		props: {
			toast: { type: String, default: '' },
			busy: { type: Boolean, default: false },
			busyText: { type: String, default: '' }
		}
	}
</script>

<style lang="scss" scoped>
	.overlay-root {
		/* 只做浮层的容器，本身不占位、不吃点击 */
		position: fixed;
		left: 0;
		top: 0;
		width: 0;
		height: 0;
		z-index: 900;
	}

	.toast {
		position: fixed;
		left: 50%;
		/* 放在偏下位置，不遮挡主要内容 */
		bottom: 200rpx;
		transform: translateX(-50%);
		max-width: 600rpx;
		padding: 24rpx 40rpx;
		border-radius: 20rpx;
		background-color: $ws-toast;

		&__text {
			font-size: 26rpx;
			color: #FFFFFF;
			line-height: 1.4;
		}
	}

	.busy {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $ws-mask;
		z-index: 950;

		&__box {
			width: 400rpx;
			padding: 48rpx 32rpx;
			border-radius: 24rpx;
			background-color: #FFFFFF;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		&__title {
			font-size: 28rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__sub {
			margin-top: 16rpx;
			font-size: 22rpx;
			color: $ws-muted;
		}
	}
</style>
