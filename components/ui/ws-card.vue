<template>
	<view class="ws-card" :class="{ 'is-flat': flat }" :style="customStyle">
		<slot />
	</view>
</template>

<script>
	export default {
		name: 'WsCard',
		props: {
			// 把底色/圆角交给调用方覆盖，用于结果卡这类特殊容器
			customStyle: { type: [String, Object], default: '' },
			flat: { type: Boolean, default: false }
		}
	}
</script>

<style lang="scss" scoped>
	.ws-card {
		box-sizing: border-box;
		background-color: #FFFFFF;
		border: 2rpx solid $ws-line;
		border-radius: 26rpx;
		padding: 36rpx;

		&.is-flat {
			background-color: $ws-surface-2;
			border-color: transparent;
		}
	}
</style>
