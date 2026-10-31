<template>
	<view class="ws-progress">
		<view class="ws-progress__fill" :style="{ width: pct }" />
	</view>
</template>

<script>
	export default {
		name: 'WsProgress',
		props: {
			// 0 ~ 1
			value: { type: Number, default: 0 }
		},
		computed: {
			pct() {
				const v = Math.max(0, Math.min(1, this.value || 0))
				return (v * 100).toFixed(2) + '%'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ws-progress {
		width: 100%;
		height: 8rpx;
		border-radius: 4rpx;
		background-color: $ws-surface-3;
		overflow: hidden;

		&__fill {
			height: 100%;
			border-radius: 4rpx;
			background-color: $ws-gold-2;
			/* 让进度变化有过渡感，而不是生硬跳变 */
			transition: width 0.25s ease-out;
		}
	}
</style>
