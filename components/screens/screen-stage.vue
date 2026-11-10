<template>
	<view class="screen">
		<!-- 阶段头 -->
		<view class="stage__header">
			<text class="stage__name">{{ stage ? stage.name : '' }}</text>
			<text class="stage__age">{{ stage ? stage.ageRange : '' }}</text>
		</view>
		<view class="stage__divider" />

		<!--
			顶栏：左边「上一件事」，右边进度。
			和答题页保持同一个位置关系 —— 玩家在测试里已经学会了「左上角往回退」，
			进到阶段里不用重新找。
		-->
		<view class="stage__bar">
			<view
				class="stage__back"
				:class="{ 'is-off': !game.canStageBack }"
				:hover-class="game.canStageBack ? 'ws-tap--hover' : 'none'"
				:hover-stay-time="60"
				@tap="onBack"
			>
				<!-- <text class="stage__back-text" :class="{ 'is-off': !game.canStageBack }">
					‹ {{ game.t('btnStageBack') }}
				</text> -->
			</view>
			<text class="stage__count">
				{{ game.t('stageProgress', { n: Math.min(eventsInStage + 1, stage ? stage.eventCount : 0), total: stage ? stage.eventCount : 0 }) }}
			</text>
			<view class="stage__pad" />
		</view>

		<view class="stage__chips">
			<AttrChips :attrs="attrs" :deltas="revealedDeltas" />
		</view>

		<!-- 事件卡 -->
		<view v-if="ev" class="event">
			<view class="event__bar" :style="{ backgroundColor: rarityColor }" />
			<view class="event__body">
				<text class="event__title">{{ ev.title }}</text>
				<text class="event__desc">{{ ev.desc }}</text>
			</view>
		</view>

		<!-- 选项：与答题页共用同一个组件，点击监听同样挂在外层普通 view 上 -->
		<view v-if="ev && !revealed" class="stage__options">
			<view
				v-for="(opt, i) in ev.options"
				:key="i"
				@tap="onChoose(i)"
			>
				<WsOption :text="opt.text" :index="i" :picked="i === game.stageChoice" />
			</view>
		</view>

		<!-- 只有真的退回来过才出现，正常推进时不占位置 -->
		<text v-if="!revealed && game.stageChoice >= 0" class="stage__foot">
			{{ game.t('stagePickedHint') }}
		</text>

		<text v-if="revealed" class="stage__chosen">你做出了选择</text>

		<!--
			回首页。放在结算浮层【之前】：浮层是 position:absolute 盖满全屏的，
			弹出的那几秒它会挡住页脚，正好和浮层里的「换一个选择」形成一对
			—— 结算时需要的是「改」，不是「走」。
		-->
		<WsHomeFoot :game="game" />

		<!-- 结算浮层 -->
		<view v-if="revealed && result" class="result-mask">
			<scroll-view class="result-scroll" scroll-y>
				<view class="result">
					<text class="result__label">抉择结算</text>

					<view class="result__deltas">
						<view
							v-for="(v, k) in result.deltas"
							:key="k"
							class="result__chip"
							:class="v > 0 ? 'is-pos' : 'is-neg'"
						>
							<text class="result__chip-text" :class="v > 0 ? 'is-pos' : 'is-neg'">
								{{ LABEL[k] || k }} {{ v > 0 ? '+' : '' }}{{ v }}
							</text>
						</view>
						<text v-if="noDelta" class="result__none">属性没有明显变化</text>
					</view>

					<text v-if="result.narration" class="result__narration">{{ result.narration }}</text>

					<view v-if="result.notes && result.notes.length" class="result__notes">
						<text v-for="(n, i) in result.notes" :key="i" class="result__note">· {{ n }}</text>
					</view>

					<view class="result__action">
						<WsButton :label="game.t('btnNext')" size="md" @tap="onNext" />
					</view>
					<!--
						已经在弹层里看到后果了才想改，是比「退到上一件事」更常见的场景，
						所以这里也留一个入口。它和返回按钮是同一个动作：
						撤销「最近这次抉择」，人留在原地重选。
					-->
					<view v-if="false" class="result__alt">
						<WsButton
							:label="game.t('btnChangeChoice')"
							variant="plain"
							size="sm"
							@tap="onChangeChoice"
						/>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import AttrChips from '../ui/attr-chips.vue'
	import WsButton from '../ui/ws-button.vue'
	import WsOption from '../ui/ws-option.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'
	import { ATTR_LABEL } from '../../utils/canvas-kit.js'

	const RARITY_COLOR = {
		N: '#E9E1D2',
		R: '#8FB6D6',
		SR: '#B79BD8',
		SSR: '#F2C94C'
	}

	export default {
		name: 'ScreenStage',
		components: { AttrChips, WsButton, WsOption, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		data() {
			return { LABEL: ATTR_LABEL, tapGuardUntil: 0 }
		},
		mounted() {
			/*
			 * 防「点击穿透」。
			 *
			 * 抖音小程序的点击语义接近 H5：如果被点中的元素在这一次触摸
			 * 结束前就被移除，这一次点击会「穿透」到下方新出现的元素上。
			 * 阶段页正好踩中：点「继续」会收起结算浮层、同时渲染下一件事的
			 * 选项，而选项的位置又和刚消失的按钮重合 —— 于是那一下点击被
			 * 顺带记成了对下一件事的选择（表现就是「第二、三件事自己选好了」）。
			 *
			 * 进入阶段页时同理：建号页点「开始人生」也可能穿透到刚出现的
			 * 第一个选项上。所以在「一屏内容刚变化」的极短窗口内忽略选项点击。
			 */
			this.guardTaps()
		},
		computed: {
			st() {
				return this.game.state
			},
			stage() {
				return this.game.currentStage
			},
			ev() {
				return this.st.currentEvent
			},
			attrs() {
				return this.st.attrs || {}
			},
			revealed() {
				return this.st.revealed
			},
			result() {
				return this.st.result
			},
			eventsInStage() {
				return this.st.eventsInStage || 0
			},
			rarityColor() {
				return (this.ev && RARITY_COLOR[this.ev.rarity]) || RARITY_COLOR.N
			},
			/** 只有结算后才显示增减，避免提前剧透 */
			revealedDeltas() {
				return this.revealed && this.result ? this.result.deltas : null
			},
			noDelta() {
				const d = this.result && this.result.deltas
				if (!d) return false
				for (const k in d) {
					if (Object.prototype.hasOwnProperty.call(d, k)) return false
				}
				return true
			}
		},
		methods: {
			/** 在接下来的一小段窗口里忽略选项点击，挡住点击穿透（见 mounted 的说明） */
			guardTaps() {
				this.tapGuardUntil = Date.now() + 400
			},
			onChoose(i) {
				if (Date.now() < this.tapGuardUntil) return
				this.game.sfx.play('tap')
				this.game.actions.chooseOption(i)
			},
			onNext() {
				this.guardTaps()
				this.game.sfx.play('tap')
				this.game.actions.advance()
			},
			onChangeChoice() {
				this.guardTaps()
				this.game.sfx.play('tap')
				this.game.actions.stageBack()
			},
			onBack() {
				if (!this.game.canStageBack) {
					this.game.showToast(this.game.t('stageBackFirst'))
					return
				}
				this.guardTaps()
				this.game.sfx.play('tap')
				this.game.actions.stageBack()
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
		padding: 56rpx 48rpx 40rpx;
	}

	.stage {
		&__header {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
		}

		&__name {
			font-size: 30rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__age {
			font-size: 22rpx;
			color: $ws-muted;
		}

		&__divider {
			height: 2rpx;
			background-color: $ws-line;
			margin: 24rpx 0 20rpx;
		}

		&__bar {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		&__back {
			width: 210rpx;
			padding: 10rpx 0;

			&.is-off {
				opacity: 0.45;
			}
		}

		&__back-text {
			font-size: 27rpx;
			color: $ws-ink-2;

			&.is-off {
				color: $ws-muted;
			}
		}

		/* 与「上一件事」等宽，把中间的进度真正顶到视觉中心 */
		&__pad {
			width: 210rpx;
		}

		&__count {
			font-size: 20rpx;
			color: $ws-muted;
		}

		&__chips {
			margin-top: 26rpx;
		}

		&__chosen {
			margin-top: 20rpx;
			font-size: 24rpx;
			color: $ws-muted;
		}

		&__options {
			margin-top: 44rpx;
		}

		/* 选项卡片的样式全部在 components/ui/ws-option.vue 里 */

		&__foot {
			display: block;
			margin-top: 12rpx;
			font-size: 20rpx;
			color: $ws-muted;
			text-align: center;
		}
	}

	.event {
		position: relative;
		display: flex;
		flex-direction: row;
		margin-top: 34rpx;
		padding: 34rpx 36rpx 34rpx 24rpx;
		background-color: #FFFFFF;
		border: 2rpx solid $ws-line;
		border-radius: 26rpx;

		/* 左侧稀有度色条 */
		&__bar {
			width: 6rpx;
			border-radius: 3rpx;
			margin-right: 22rpx;
			flex-shrink: 0;
		}

		&__body {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		&__title {
			font-size: 34rpx;
			font-weight: bold;
			color: $ws-ink;
			line-height: 1.4;
		}

		&__desc {
			margin-top: 18rpx;
			font-size: 26rpx;
			color: $ws-ink-2;
			line-height: 1.55;
		}
	}

	/* ---- 结算浮层 ---- */
	.result-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: $ws-mask;
		z-index: 800;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.result-scroll {
		width: 654rpx;
		/* 高度自适应但不超过屏高的 76%，长文案可以滚 */
		max-height: 76vh;
	}

	.result {
		display: flex;
		flex-direction: column;
		padding: 44rpx;
		background-color: #FFFFFF;
		border-radius: 28rpx;

		&__label {
			font-size: 22rpx;
			color: $ws-muted;
		}

		&__deltas {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			margin-top: 24rpx;
		}

		&__chip {
			padding: 10rpx 18rpx;
			margin: 0 14rpx 14rpx 0;
			border-radius: 12rpx;
			background-color: $ws-surface-3;
		}

		&__chip-text {
			font-size: 26rpx;
			font-weight: bold;

			&.is-pos {
				color: $ws-pos;
			}

			&.is-neg {
				color: $ws-neg;
			}
		}

		&__none {
			font-size: 24rpx;
			color: $ws-muted;
		}

		&__narration {
			margin-top: 20rpx;
			font-size: 25rpx;
			line-height: 1.75;
			color: $ws-ink-2;
		}

		&__notes {
			display: flex;
			flex-direction: column;
			margin-top: 20rpx;
		}

		&__note {
			font-size: 20rpx;
			line-height: 1.7;
			color: $ws-gold;
		}

		&__action {
			margin-top: 40rpx;
		}

		&__alt {
			display: flex;
			justify-content: center;
			margin-top: 8rpx;
		}
	}
</style>
