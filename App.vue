<script>
	export default {
		onLaunch: function () {
			// 引擎的初始化放在 composables/useGame.js 里按需触发，
			// 这里只留生命周期日志，避免启动时做重活拖慢首屏。
			if (typeof console !== 'undefined') {
				console.log('[WS] App Launch')
			}
		},
		onShow: function () {
			// 回到前台时无需特殊处理：游戏状态全在内存 + 本地存档里
		},
		onHide: function () {
			// 退到后台时引擎已经在每次抉择后写过存档，这里不用再存一次
		}
	}
</script>

<style lang="scss">
	/*
		全局样式。注意这里【不用】scoped —— uni-app 的 App.vue 全局样式
		会作用到所有页面，正好用来统一底色与字体。
		（各界面自己的样式都写在组件内且带 scoped，不会互相污染。）

		$ws-* 变量来自 uni.scss —— uni-app 会把它自动注入每个组件的
		<style lang="scss"> 块，所以这里不需要 import。
	*/

	page {
		background-color: $ws-bg;
		/* 与 utils/canvas-kit.js 里的 FONT_FAMILY 保持一致 */
		font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
		color: $ws-ink;
	}

	/* 关闭小程序端长按选中文字，避免像「网页」而不像「游戏」 */
	text {
		user-select: none;
		-webkit-user-select: none;
	}
</style>

<!--
	按压反馈的统一入口。

	为什么这些类要放在全局而不是各自的组件里：
	它们通过 hover-class 在运行时动态添加，而 scoped 样式靠 [data-v-xxx]
	属性选择器匹配，动态加上的类名在部分小程序端匹配不稳。
	集中放在这里，也不必给每个用到的地方重复写一遍。
-->
<style>
	.ws-tap--hover,
	.ws-btn--hover {
		opacity: 0.82;
		transform: scale(0.985);
	}
</style>
