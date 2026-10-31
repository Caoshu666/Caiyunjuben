<template>
	<!-- 属性条列表。建号页与阶段结算页用它展示 5 维终值 -->
	<view class="bars">
		<view v-for="k in keys" :key="k" class="bar">
			<text class="bar__label">{{ LABEL[k] }}</text>
			<view class="bar__track">
				<view
					class="bar__fill"
					:class="{ 'is-danger': isDanger(k) }"
					:style="{ width: ratio(k) }"
				/>
			</view>
			<text class="bar__value">{{ attrs[k] || 0 }}</text>
		</view>
	</view>
</template>

<script>
	import { ATTRS, ATTR_LABEL, CRISIS_LINE } from '../../utils/canvas-kit.js'

	export default {
		name: 'AttrBars',
		props: {
			attrs: { type: Object, default: () => ({}) }
		},
		data() {
			return { keys: ATTRS, LABEL: ATTR_LABEL }
		},
		methods: {
			ratio(k) {
				const v = Math.max(0, Math.min(100, this.attrs[k] || 0))
				return v + '%'
			},
			isDanger(k) {
				return (this.attrs[k] || 0) <= (CRISIS_LINE[k] || 0)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bars {
		width: 100%;
	}

	.bar {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 62rpx;

		&__label {
			width: 72rpx;
			font-size: 22rpx;
			color: $ws-ink-2;
			flex-shrink: 0;
		}

		&__track {
			flex: 1;
			height: 10rpx;
			border-radius: 5rpx;
			background-color: $ws-surface-3;
			overflow: hidden;
		}

		&__fill {
			height: 100%;
			border-radius: 5rpx;
			background-color: $ws-gold-2;
			transition: width 0.3s ease-out;

			&.is-danger {
				background-color: $ws-danger-soft;
			}
		}

		&__value {
			width: 76rpx;
			text-align: right;
			font-size: 22rpx;
			font-weight: bold;
			color: $ws-ink;
			flex-shrink: 0;
		}
	}
</style>
