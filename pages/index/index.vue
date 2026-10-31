<template>
	<!--
		唯一页面。整个游戏是一个状态机（boot→privacy→home→quiz→build→stage⇄summary
		→ending→result），所以不拆成多个 uni-app 页面，而是在这一页里按 phase 切换
		组件。好处：页面间不丢状态、没有跳转闪烁，返回键行为也完全可控。

		为什么用 v-if / v-else-if 链而不是 <component :is>：
		动态组件在微信小程序端对组件注册方式有额外限制，v-if 链会被直接编译成
		wxml 的条件渲染，各端行为完全一致。
	-->
	<view class="ws-root">
		<ScreenPrivacy v-if="game.screen === 'privacy'" :game="game" />
		<ScreenHome v-else-if="game.screen === 'home'" :game="game" />
		<ScreenCodex v-else-if="game.screen === 'codex'" :game="game" />
		<ScreenQuiz v-else-if="game.screen === 'quiz'" :game="game" />
		<ScreenBuild v-else-if="game.screen === 'build'" :game="game" />
		<ScreenStage v-else-if="game.screen === 'stage'" :game="game" />
		<ScreenSummary v-else-if="game.screen === 'summary'" :game="game" />
		<ScreenEnding v-else-if="game.screen === 'ending'" :game="game" />
		<ScreenResult v-else-if="game.screen === 'result'" :game="game" />

		<WsOverlay :toast="game.toastMsg" :busy="game.busy" :busy-text="game.busyText" />
	</view>
</template>

<script>
	import { useGame } from '../../composables/useGame.js'

	import ScreenPrivacy from '../../components/screens/screen-privacy.vue'
	import ScreenHome from '../../components/screens/screen-home.vue'
	import ScreenCodex from '../../components/screens/screen-codex.vue'
	import ScreenQuiz from '../../components/screens/screen-quiz.vue'
	import ScreenBuild from '../../components/screens/screen-build.vue'
	import ScreenStage from '../../components/screens/screen-stage.vue'
	import ScreenSummary from '../../components/screens/screen-summary.vue'
	import ScreenEnding from '../../components/screens/screen-ending.vue'
	import ScreenResult from '../../components/screens/screen-result.vue'
	import WsOverlay from '../../components/ui/ws-overlay.vue'

	export default {
		components: {
			ScreenPrivacy,
			ScreenHome,
			ScreenCodex,
			ScreenQuiz,
			ScreenBuild,
			ScreenStage,
			ScreenSummary,
			ScreenEnding,
			ScreenResult,
			WsOverlay
		},
		setup() {
			// 单例，页面与所有子组件共享同一个引擎实例
			const game = useGame()
			return { game }
		},
		/**
		 * 小程序端的分享内容必须在页面层声明，子组件里写不生效。
		 * 文案与结果页的「分享给朋友」按钮共用同一个构造函数，保证两处一致。
		 */
		onShareAppMessage() {
			const g = useGame()
			const r = g.state.finalResult
			const p = g.state.persona
			const ret = {
				title: g.adapter.buildShareText(
					p && p.name,
					r && r.title,
					r && r.quality
				),
				path: '/pages/index/index'
			}
			// 结果卡导出图作为分享封面；还没备好就退回微信默认截图
			if (g.shareImage) ret.imageUrl = g.shareImage
			return ret
		},
		/** 分享到朋友圈（仅安卓端在部分场景可用） */
		onShareTimeline() {
			const g = useGame()
			const r = g.state.finalResult
			const p = g.state.persona
			const ret = {
				title: g.adapter.buildShareText(
					p && p.name,
					r && r.title,
					r && r.quality
				)
			}
			if (g.shareImage) ret.imageUrl = g.shareImage
			return ret
		}
	}
</script>

<style lang="scss" scoped>
	.ws-root {
		/*
			min-height: 100vh + 子级 flex:1，让每个界面都能「撑满一屏但不被裁切」：
			—— 内容少时按钮能被 margin-top:auto 推到底部；
			—— 内容多时页面自然滚动，而不是被挤扁。
			刻意不用 scroll-view：它要求显式高度，在 rpx + 百分比混合时各端表现不一致，
			交给页面自身滚动更稳。
		*/
		box-sizing: border-box;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #FAF7F0;
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
