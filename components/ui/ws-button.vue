<template>
	<!--
		按钮：三种变体沿用上游 Canvas 版本的视觉语言
		  primary 金色实底 / ghost 描边 / plain 纯文字
		小程序端分享必须靠 <button open-type="share">，所以传 openType 时渲染成原生 button。
	-->
	<button
		v-if="openType"
		class="ws-btn"
		:class="['ws-btn--' + variant, 'ws-btn--' + size]"
		:open-type="openType"
		:disabled="disabled"
		@tap="$emit('tap')"
	>
		<text class="ws-btn__label">{{ label }}</text>
	</button>

	<view
		v-else
		class="ws-btn"
		:class="['ws-btn--' + variant, 'ws-btn--' + size, { 'is-disabled': disabled }]"
		:hover-class="disabled ? 'none' : 'ws-btn--hover'"
		:hover-stay-time="60"
		@tap="onTap"
	>
		<text class="ws-btn__label">{{ label }}</text>
	</view>
</template>

<script>
	export default {
		name: 'WsButton',
		emits: ['tap'],
		props: {
			label: { type: String, default: '' },
			// primary | ghost | plain
			variant: { type: String, default: 'primary' },
			// sm | md | lg
			size: { type: String, default: 'md' },
			disabled: { type: Boolean, default: false },
			// 传 'share' 时渲染为原生分享按钮（仅小程序端有意义）
			openType: { type: String, default: '' }
		},
		methods: {
			onTap() {
				if (this.disabled) return
				this.$emit('tap')
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 颜色一律取自 uni.scss 的 $ws-* 主题变量，这里不再自行定义一份 */

	.ws-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		border-radius: 24rpx;
		/* 重置 uni-app 原生 button 的默认样式 */
		padding: 0;
		margin: 0;
		line-height: 1;
		border: none;
		background: transparent;

		&::after {
			border: none;
		}

		&__label {
			line-height: 1.2;
		}

		/* ---- 尺寸 ---- */
		&--lg {
			height: 104rpx;

			.ws-btn__label {
				font-size: 34rpx;
				font-weight: bold;
			}
		}

		&--md {
			height: 96rpx;

			.ws-btn__label {
				font-size: 30rpx;
				font-weight: bold;
			}
		}

		&--sm {
			height: 80rpx;

			.ws-btn__label {
				font-size: 26rpx;
			}
		}

		/* ---- 变体 ---- */
		&--primary {
			background-color: $ws-gold;

			.ws-btn__label {
				color: #FFFFFF;
			}
		}

		&--ghost {
			background-color: #FFFFFF;
			border: 2rpx solid $ws-gold-line;

			.ws-btn__label {
				color: $ws-gold;
			}
		}

		&--plain {
			background-color: transparent;

			.ws-btn__label {
				color: $ws-muted;
				font-weight: normal;
			}
		}

		&.is-disabled {
			background-color: $ws-disabled;

			.ws-btn__label {
				color: #FFFFFF;
			}
		}
	}
</style>

<!--
	hover-class 是运行时动态加类名，scoped 的 [data-v-xxx] 属性选择器在部分
	小程序端对动态类名的匹配不稳，所以按压态样式单独放在非 scoped 块里。
-->
<style lang="scss">
	.ws-btn--hover {
		opacity: 0.82;
		transform: scale(0.985);
	}
</style>
