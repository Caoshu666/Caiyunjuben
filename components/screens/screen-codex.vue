<template>
	<view class="screen">
		<!-- 头部：返回 + 标题 + 总进度 -->
		<view class="head">
			<view class="head__back" hover-class="ws-tap--hover" :hover-stay-time="60" @tap="onBack">
				<text class="head__back-text">‹ {{ game.t('btnBack') }}</text>
			</view>
			<text class="head__title">{{ game.t('codexTitle') }}</text>
			<view class="head__pad" />
		</view>

		<!-- 双 Tab。用数字直接写在按钮上，玩家一眼就知道还差几个 -->
		<view class="tabs">
			<view
				class="tabs__item"
				:class="{ 'is-active': tab === 'persona' }"
				hover-class="ws-tap--hover"
				:hover-stay-time="60"
				@tap="onTab('persona')"
			>
				<text class="tabs__label" :class="{ 'is-active': tab === 'persona' }">
					{{ game.t('codexTabPersona') }}
				</text>
				<text class="tabs__count" :class="{ 'is-active': tab === 'persona' }">
					{{ d.personaDone }} / {{ d.personaTotal }}
				</text>
			</view>
			<view
				class="tabs__item"
				:class="{ 'is-active': tab === 'ending' }"
				hover-class="ws-tap--hover"
				:hover-stay-time="60"
				@tap="onTab('ending')"
			>
				<text class="tabs__label" :class="{ 'is-active': tab === 'ending' }">
					{{ game.t('codexTabEnding') }}
				</text>
				<text class="tabs__count" :class="{ 'is-active': tab === 'ending' }">
					{{ d.endingDone }} / {{ d.endingTotal }}
				</text>
			</view>
		</view>

		<!-- ============ 人格图鉴 ============ -->
		<view v-if="tab === 'persona'" class="grid">
			<view
				v-for="p in d.personas"
				:key="p.id"
				class="pcard"
				:class="{ 'is-locked': !p.unlocked }"
				hover-class="ws-tap--hover"
				:hover-stay-time="60"
				@tap="onTapPersona(p)"
			>
				<view
					class="pcard__badge"
					:style="p.unlocked
						? { backgroundColor: p.color || '#B8860B' }
						: { backgroundColor: '#DED7C8' }"
				>
					<text class="pcard__badge-text">{{ p.unlocked ? p.badge : '?' }}</text>
				</view>
				<text class="pcard__name">{{ p.unlocked ? p.name : game.t('codexLockedName') }}</text>
				<text class="pcard__desc">
					{{ p.unlocked ? p.desc : game.t('codexLockedDesc') }}
				</text>
			</view>
		</view>

		<!-- ============ 结局图鉴 ============ -->
		<view v-else class="endings">
			<text class="section__hint">{{ game.t('codexEndingHint') }}</text>

			<view v-for="e in d.endings" :key="e.id" class="erow" @tap="onTapEnding(e)">
				<view
					class="erow__badge"
					:style="{
						backgroundColor: (owner(e.personaId) && owner(e.personaId).unlocked)
							? (owner(e.personaId).color || '#B8860B')
							: '#DED7C8'
					}"
				>
					<text class="erow__badge-text">
						{{ (owner(e.personaId) && owner(e.personaId).unlocked)
							? owner(e.personaId).badge
							: '?' }}
					</text>
				</view>

				<view class="erow__main">
					<view class="erow__top">
						<text class="erow__title" :class="{ 'is-locked': e.unlockedCount === 0 }">
							{{ e.unlockedCount > 0 ? e.title : game.t('codexEndingLockedTitle') }}
						</text>
						<text class="erow__sum">{{ e.unlockedCount }} / 4</text>
					</view>

					<view class="erow__grades">
						<view
							v-for="g in e.grades"
							:key="g.grade"
							class="gchip"
							:class="{ 'is-on': g.unlocked }"
							:style="g.unlocked
								? { backgroundColor: quality(g.grade).bg, borderColor: quality(g.grade).border }
								: {}"
						>
							<text
								class="gchip__text"
								:style="{ color: g.unlocked ? quality(g.grade).color : '#BDB4A4' }"
							>{{ g.grade }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 隐藏结局单列一区：它们的解锁条件最特殊，值得被单独对待 -->
			<text class="section__cap">{{ game.t('codexHiddenSection') }}</text>
			<text class="section__hint">{{ game.t('codexHiddenHint') }}</text>

			<view v-for="h in d.hidden" :key="h.id" class="hrow" @tap="onTapHidden(h)">
				<view class="hrow__mark" :class="{ 'is-on': h.unlocked }">
					<text class="hrow__mark-text">{{ h.unlocked ? 'S' : '?' }}</text>
				</view>
				<view class="hrow__main">
					<text class="hrow__title" :class="{ 'is-locked': !h.unlocked }">
						{{ h.unlocked ? h.title : game.t('codexEndingLockedTitle') }}
					</text>
					<text class="hrow__sub">
						{{ h.unlocked ? game.t('hiddenTag') : game.t('codexLockedDesc') }}
					</text>
				</view>
			</view>
		</view>

		<text class="foot">{{ game.t('codexTip') }}</text>

		<!--
			顶栏左上角已经有「‹ 返回」了，这里再放一个回首页并不重复：
			返回是「回到我刚来的地方」，回首页是「直接回家」——
			从结局页点「去图鉴看看」进来的玩家，心里想回的是首页。
		-->
		<WsHomeFoot :game="game" />

		<!-- ============ 详情弹层 ============ -->
		<!--
			结构沿用 screen-stage.vue 的结算浮层：mask 直接套一个 scroll-view，
			由它承担滚动。刻意不用「sheet + overflow-y:auto」的写法 ——
			小程序的 view 对 overflow 滚动的支持并不统一，而 scroll-view 是各端都稳的。
			结局详情最多要放 4 段旁白，一定会超过一屏。
		-->
		<view v-if="focus" class="mask" @tap="onCloseFocus">
			<scroll-view class="sheet-scroll" scroll-y @tap.stop>
				<view class="sheet">
					<!-- 人格详情 -->
					<block v-if="focus.kind === 'persona'">
						<view class="sheet__head">
							<view class="sheet__badge" :style="{ backgroundColor: focus.color || '#B8860B' }">
								<text class="sheet__badge-text">{{ focus.badge }}</text>
							</view>
							<text class="sheet__title">{{ focus.name }}</text>
							<text class="sheet__sub">{{ focus.desc }}</text>
						</view>

						<text class="sheet__cap">{{ game.t('codexPersonaHint') }}</text>
						<view class="bias">
							<view v-for="b in focus.bias" :key="b.key" class="bias__item">
								<text class="bias__key">{{ game.LABEL[b.key] || b.key }}</text>
								<text class="bias__val" :class="b.value > 0 ? 'is-pos' : 'is-neg'">
									{{ b.value > 0 ? '+' : '' }}{{ b.value }}
								</text>
							</view>
							<text v-if="focus.bias.length === 0" class="bias__none">均衡开局，没有特别偏向</text>
						</view>
					</block>

					<!-- 结局详情 -->
					<block v-else>
						<text class="sheet__cap">
							{{ focus.hidden ? game.t('hiddenTag') : game.t('codexTabEnding') }}
						</text>
						<text class="sheet__title sheet__title--lg">
							{{ focus.unlockedAny ? focus.title : game.t('codexEndingLockedTitle') }}
						</text>

						<view class="sheet__grades">
							<view
								v-for="g in focus.grades"
								:key="g.grade"
								class="gchip gchip--lg"
								:class="{ 'is-on': g.unlocked }"
								:style="g.unlocked
									? { backgroundColor: quality(g.grade).bg, borderColor: quality(g.grade).border }
									: {}"
							>
								<text
									class="gchip__text gchip__text--lg"
									:style="{ color: g.unlocked ? quality(g.grade).color : '#BDB4A4' }"
								>{{ g.grade }}</text>
							</view>
						</view>

						<view class="sheet__body">
							<view v-for="g in focus.grades" :key="g.grade" class="para">
								<text class="para__cap">{{ g.grade }} 级 · {{ gradeLabel(g.grade) }}</text>
								<text class="para__text" :class="{ 'is-locked': !g.unlocked }">
									{{ g.unlocked ? g.narration : game.t('codexEndingLockedBody') }}
								</text>
							</view>
						</view>
					</block>

					<view class="sheet__action">
						<WsButton :label="game.t('codexFocusClose')" variant="ghost" size="sm" @tap="onCloseFocus" />
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import WsButton from '../ui/ws-button.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'
	import { QUALITY } from '../../utils/canvas-kit.js'

	export default {
		name: 'ScreenCodex',
		components: { WsButton, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		computed: {
			d() {
				return this.game.codexData
			},
			tab() {
				return this.game.state.codexTab || 'persona'
			},
			focus() {
				const id = this.game.state.codexFocus
				if (!id) return null

				// id 形如 'p:lucky' / 'e:END_STEADY' / 'h:END_HIDDEN_1'
				const cut = String(id).indexOf(':')
				if (cut < 0) return null
				const kind = id.slice(0, cut)
				const key = id.slice(cut + 1)

				if (kind === 'p') {
					const p = this.d.personas.filter((x) => x.id === key)[0]
					if (!p) return null
					return {
						kind: 'persona',
						name: p.name,
						badge: p.badge,
						color: p.color,
						desc: p.desc,
						bias: Object.keys(p.bias).map((k) => ({ key: k, value: p.bias[k] }))
					}
				}

				if (kind === 'e') {
					const e = this.d.endings.filter((x) => x.id === key)[0]
					if (!e) return null
					return {
						kind: 'ending',
						hidden: false,
						title: e.title,
						grades: e.grades,
						unlockedAny: e.unlockedCount > 0
					}
				}

				if (kind === 'h') {
					const h = this.d.hidden.filter((x) => x.id === key)[0]
					if (!h) return null
					// 隐藏结局固定 S 级：只为复用同一套渲染，把它包成一条 S 级记录
					return {
						kind: 'ending',
						hidden: true,
						title: h.title,
						unlockedAny: h.unlocked,
						grades: [
							{
								grade: 'S',
								unlocked: h.unlocked,
								narration: h.narration
							}
						]
					}
				}

				return null
			}
		},
		methods: {
			quality(g) {
				return QUALITY[g] || QUALITY.B
			},
			/**
			 * 等级的一句话说明。文案表键名规则为 grade + 等级字母；
			 * 隐藏结局被包成一条 S 级记录复用渲染，所以这里要单独认出来，
			 * 否则会显示成「S 级 · 天时地利人和」，不如「隐藏结局」贴切。
			 */
			gradeLabel(g) {
				if (this.focus && this.focus.hidden) return this.game.t('hiddenTag')
				return this.game.t('grade' + g)
			},
			/** 结局行左侧显示所属人格的徽章；未解锁的人格显示灰色问号 */
			owner(personaId) {
				return this.d.personas.filter((p) => p.id === personaId)[0] || null
			},
			onBack() {
				this.game.sfx.play('tap')
				this.game.actions.closeCodex()
			},
			onTab(t) {
				if (t === this.tab) return
				this.game.sfx.play('tap')
				this.game.actions.setCodexTab(t)
			},
			onTapPersona(p) {
				if (!p.unlocked) {
					this.game.showToast('这个人格还没解锁，再玩几局试试')
					return
				}
				this.game.sfx.play('tap')
				this.game.actions.setCodexFocus('p:' + p.id)
			},
			onTapEnding(e) {
				this.game.sfx.play('tap')
				this.game.actions.setCodexFocus('e:' + e.id)
			},
			onTapHidden(h) {
				this.game.sfx.play('tap')
				this.game.actions.setCodexFocus('h:' + h.id)
			},
			onCloseFocus() {
				this.game.actions.setCodexFocus(null)
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
		padding: 40rpx 40rpx 60rpx;
	}

	/* ---- 头部 ---- */
	.head {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		&__back {
			width: 180rpx;
			padding: 12rpx 0;
		}

		&__back-text {
			font-size: 28rpx;
			color: $ws-ink-2;
		}

		&__title {
			font-size: 34rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__pad {
			width: 180rpx;
		}
	}

	/* ---- Tabs ---- */
	.tabs {
		display: flex;
		flex-direction: row;
		margin-top: 34rpx;
		padding: 8rpx;
		border-radius: 22rpx;
		background-color: $ws-surface-3;

		&__item {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 18rpx 0;
			border-radius: 18rpx;

			&.is-active {
				background-color: #FFFFFF;
			}
		}

		&__label {
			font-size: 27rpx;
			color: $ws-muted;

			&.is-active {
				color: $ws-ink;
				font-weight: bold;
			}
		}

		&__count {
			margin-top: 8rpx;
			font-size: 20rpx;
			color: $ws-muted;

			&.is-active {
				color: $ws-gold;
				font-weight: bold;
			}
		}
	}

	/* ---- 人格网格 ---- */
	.grid {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
		margin-top: 30rpx;
	}

	.pcard {
		width: 48.5%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 32rpx 18rpx 28rpx;
		margin-bottom: 22rpx;
		background-color: #FFFFFF;
		border: 2rpx solid $ws-line;
		border-radius: 24rpx;

		/* 未解锁：整卡降饱和 + 虚线边，一眼就能区分「还没拿到」 */
		&.is-locked {
			background-color: $ws-surface-2;
			border-style: dashed;

			.pcard__name {
				color: $ws-muted;
			}
		}

		&__badge {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 104rpx;
			height: 104rpx;
			border-radius: 50%;
		}

		&__badge-text {
			font-size: 44rpx;
			font-weight: bold;
			color: #FFFFFF;
			line-height: 1;
		}

		&__name {
			margin-top: 22rpx;
			font-size: 27rpx;
			font-weight: bold;
			color: $ws-ink;
			text-align: center;
		}

		&__desc {
			margin-top: 12rpx;
			font-size: 20rpx;
			color: $ws-muted;
			line-height: 1.45;
			text-align: center;
		}
	}

	/* ---- 结局列表 ---- */
	.endings {
		margin-top: 30rpx;
	}

	.section {
		&__cap {
			display: block;
			margin-top: 44rpx;
			font-size: 26rpx;
			font-weight: bold;
			color: $ws-ink;
		}

		&__hint {
			display: block;
			margin-top: 10rpx;
			font-size: 20rpx;
			color: $ws-muted;
			line-height: 1.5;
		}
	}

	.erow {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 26rpx 26rpx;
		margin-top: 20rpx;
		background-color: #FFFFFF;
		border: 2rpx solid $ws-line;
		border-radius: 24rpx;

		&__badge {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 76rpx;
			height: 76rpx;
			border-radius: 50%;
			flex-shrink: 0;
		}

		&__badge-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #FFFFFF;
			line-height: 1;
		}

		&__main {
			flex: 1;
			margin-left: 24rpx;
		}

		&__top {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
		}

		&__title {
			font-size: 28rpx;
			font-weight: bold;
			color: $ws-ink;

			&.is-locked {
				color: $ws-muted;
				font-weight: normal;
			}
		}

		&__sum {
			font-size: 20rpx;
			color: $ws-muted;
		}

		&__grades {
			display: flex;
			flex-direction: row;
			margin-top: 16rpx;
		}
	}

	.gchip {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52rpx;
		height: 42rpx;
		margin-right: 12rpx;
		border-radius: 12rpx;
		border: 2rpx solid $ws-line;
		background-color: $ws-surface-3;
		box-sizing: border-box;

		&--lg {
			width: 72rpx;
			height: 56rpx;
			margin-right: 16rpx;
		}

		&__text {
			font-size: 24rpx;
			font-weight: bold;

			&--lg {
				font-size: 30rpx;
			}
		}
	}

	/* ---- 隐藏结局 ---- */
	.hrow {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 26rpx;
		margin-top: 20rpx;
		background-color: $ws-surface-2;
		border: 2rpx dashed $ws-line;
		border-radius: 24rpx;

		&__mark {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 68rpx;
			height: 68rpx;
			border-radius: 18rpx;
			background-color: #DED7C8;
			flex-shrink: 0;

			&.is-on {
				background-color: $ws-gold;
			}
		}

		&__mark-text {
			font-size: 32rpx;
			font-weight: bold;
			color: #FFFFFF;
			line-height: 1;
		}

		&__main {
			flex: 1;
			display: flex;
			flex-direction: column;
			margin-left: 24rpx;
		}

		&__title {
			font-size: 28rpx;
			font-weight: bold;
			color: $ws-ink;

			&.is-locked {
				color: $ws-muted;
				font-weight: normal;
			}
		}

		&__sub {
			margin-top: 10rpx;
			font-size: 20rpx;
			color: $ws-muted;
		}
	}

	.foot {
		display: block;
		margin-top: 48rpx;
		font-size: 20rpx;
		color: $ws-muted;
		text-align: center;
		line-height: 1.6;
	}

	/* ---- 详情弹层 ---- */
	.mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 820;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $ws-mask;
		padding: 0 44rpx;
		box-sizing: border-box;
	}

	.sheet-scroll {
		width: 100%;
		/* 内容自适应，但不超过屏高的 78%，超过就由 scroll-view 接管滚动 */
		max-height: 78vh;
	}

	.sheet {
		width: 100%;
		box-sizing: border-box;
		padding: 48rpx 40rpx 36rpx;
		background-color: #FFFFFF;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;

		&__head {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		&__badge {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 128rpx;
			height: 128rpx;
			border-radius: 50%;
		}

		&__badge-text {
			font-size: 54rpx;
			font-weight: bold;
			color: #FFFFFF;
			line-height: 1;
		}

		&__cap {
			display: block;
			margin-top: 34rpx;
			font-size: 21rpx;
			color: $ws-muted;
		}

		&__title {
			margin-top: 22rpx;
			font-size: 40rpx;
			font-weight: bold;
			color: $ws-ink;

			&--lg {
				margin-top: 10rpx;
			}
		}

		&__sub {
			margin-top: 12rpx;
			font-size: 24rpx;
			color: $ws-muted;
		}

		&__grades {
			display: flex;
			flex-direction: row;
			margin-top: 26rpx;
		}

		&__body {
			margin-top: 28rpx;
		}

		&__action {
			margin-top: 40rpx;
		}
	}

	.bias {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		margin-top: 18rpx;

		&__item {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			padding: 10rpx 20rpx;
			margin: 0 14rpx 14rpx 0;
			border-radius: 12rpx;
			background-color: $ws-surface-3;
		}

		&__key {
			font-size: 23rpx;
			color: $ws-ink-2;
		}

		&__val {
			margin-left: 10rpx;
			font-size: 23rpx;
			font-weight: bold;

			&.is-pos {
				color: $ws-pos;
			}

			&.is-neg {
				color: $ws-neg;
			}
		}

		&__none {
			font-size: 23rpx;
			color: $ws-muted;
		}
	}

	.para {
		display: flex;
		flex-direction: column;
		padding: 20rpx 0;
		border-top: 2rpx solid $ws-line;

		&__cap {
			font-size: 21rpx;
			color: $ws-gold;
			font-weight: bold;
		}

		&__text {
			margin-top: 12rpx;
			font-size: 24rpx;
			line-height: 1.75;
			color: $ws-ink-2;

			&.is-locked {
				color: $ws-muted;
			}
		}
	}
</style>
