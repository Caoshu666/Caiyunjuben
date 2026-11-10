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
		<!--
			启动加载页：应用一进来先完整展示一张启动图（/static/home.jpg），
			短暂停留后淡出，再露出隐私页 / 首页。放在这一层而不是单独注册页面，
			是为了让 H5 / 小程序 / App 三端都吃到同一套加载体验，而且不参与
			游戏状态机，不影响返回键与存档逻辑。
		-->
		<view v-if="splashVisible" class="ws-splash" :class="{ 'is-fading': splashFading }">
			<image class="ws-splash__bg" src="/static/home.jpg" mode="aspectFill" />
		</view>

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
	import { ref, onMounted } from 'vue'
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

			// 启动加载页：先显示，再淡出。留 0.75s 给首屏渲染缓冲，也不让玩家干等。
			const splashVisible = ref(true)
			const splashFading = ref(false)

			onMounted(() => {
				setTimeout(() => {
					splashFading.value = true
				}, 750)
				setTimeout(() => {
					splashVisible.value = false
				}, 1150)
			})

			return { game, splashVisible, splashFading }
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
	/* 启动加载页：盖满全屏（含安全区），淡出后从渲染树移除 */
	.ws-splash {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1000;
		background-color: #FAF7F0;
		transition: opacity 0.35s ease;

		&.is-fading {
			opacity: 0;
			pointer-events: none;
		}

		&__bg {
			width: 100%;
			height: 100%;
		}
	}

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
