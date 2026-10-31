<template>
	<!-- 5 个属性的紧凑横排。主玩法界面顶部用它，让玩家随时知道自己的处境 -->
	<view class="chips">
		<view v-for="k in keys" :key="k" class="chip">
			<text class="chip__label">{{ LABEL[k] }}</text>
			<view class="chip__line">
				<text class="chip__value" :class="{ 'is-danger': isDanger(k) }">{{ val(k) }}</text>
				<text
					v-if="deltaOf(k)"
					class="chip__delta"
					:class="deltaOf(k) > 0 ? 'is-pos' : 'is-neg'"
				>{{ deltaOf(k) > 0 ? '+' : '' }}{{ deltaOf(k) }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { ATTRS, ATTR_LABEL, CRISIS_LINE } from '../../utils/canvas-kit.js'

	export default {
		name: 'AttrChips',
		props: {
			attrs: { type: Object, default: () => ({}) },
			// 结算后传入本次变化，未结算传 null
			deltas: { type: Object, default: null }
		},
		data() {
			return { keys: ATTRS, LABEL: ATTR_LABEL }
		},
		methods: {
			val(k) {
				const v = this.attrs ? this.attrs[k] : 0
				return v === undefined || v === null ? 0 : v
			},
			isDanger(k) {
				return this.val(k) <= (CRISIS_LINE[k] || 0)
			},
			deltaOf(k) {
				if (!this.deltas) return 0
				return this.deltas[k] || 0
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chips {
		display: flex;
		flex-direction: row;
		width: 100%;
	}

	.chip {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;

		&__label {
			font-size: 19rpx;
			color: $ws-muted;
			line-height: 1;
		}

		&__line {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			margin-top: 10rpx;
		}

		&__value {
			font-size: 27rpx;
			font-weight: bold;
			color: $ws-ink;
			line-height: 1;

			&.is-danger {
				color: $ws-danger;
			}
		}

		&__delta {
			font-size: 19rpx;
			font-weight: bold;
			margin-left: 6rpx;
			line-height: 1;

			&.is-pos {
				color: $ws-pos;
			}

			&.is-neg {
				color: $ws-neg;
			}
		}
	}
</style>
