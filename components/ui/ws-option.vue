<template>
	<!--
		选项卡：答题页与阶段抉择页共用同一个组件。

		为什么抽成组件而不是两边各写一份：
		这两处的交互语义完全相同（点一下就是选了），但「选过之后长什么样」
		必须一致 —— 玩家在测试里学会的视觉语言，进阶段要能直接复用。
		各写一份的结果一定是慢慢跑偏：改了金色描边忘了改徽标，改了徽标忘了改勾。

		视觉上的三层信号（都指向「这一条是你上次选的」）：
		  ① 底色转暖金 + 描边变金   —— 余光就能扫到
		  ② 左侧字母徽标由灰描边变金色实心 —— 位置固定，扫视时最先看到
		  ③ 右侧出现勾选记号         —— 给一个明确的「确认过了」手势
		只有一层的话，色弱玩家或阳光下的屏幕都可能看漏。
	-->
	<view
		class="ws-opt ws-opt--anim"
		:class="{ 'is-picked': picked }"
		hover-class="ws-tap--hover"
		:hover-stay-time="60"
		:style="delayStyle"
	>
		<view class="ws-opt__badge">
			<text class="ws-opt__badge-text">{{ letter }}</text>
		</view>

		<text class="ws-opt__text">{{ text }}</text>

		<!--
			勾选记号用两条边框拼出来，而不是用「✓」字符：
			U+2713 在 iOS / 安卓 / 微信小程序三端的字体回退各不相同，
			有的字体里它是窄体、有的带基线偏移，对不齐卡片中线。
		-->
		<view v-if="picked" class="ws-opt__check" />
	</view>
</template>

<script>
	const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

	export default {
		name: 'WsOption',
		/*
		 * 这个组件【刻意】不声明 emits、也不处理点击：
		 * 点选事件由调用方在外面包一层 <view @tap="...">。
		 *
		 * 原因是一个跨端差异很大的坑：在自定义组件上绑 @tap，
		 * H5 端「组件 $emit 的同名事件」与「原生 DOM 事件的冒泡」可能同时命中父级监听，
		 * 一次点击跑两遍 —— 放在答题页就是连跳两题，非常隐蔽（点得快时看不出）。
		 * 小程序端没有 DOM 事件模型，反而不会重复。
		 * 直接把监听挂在普通 view 上，两端都只有「原生冒泡」这一条路径，行为一致。
		 *
		 * hover-class 仍然留在组件内部：它作用于被按到的那个元素本身，
		 * 不依赖任何事件绑定，谁包了一层都不影响按压反馈。
		 */
		props: {
			text: { type: String, default: '' },
			/** 选项序号（从 0 开始），用来显示 A / B / C 徽标 */
			index: { type: Number, default: 0 },
			/** 是否是「上次的选择」—— 从上一题退回来时高亮 */
			picked: { type: Boolean, default: false }
		},
		computed: {
			letter() {
				return LETTERS[this.index] || String(this.index + 1)
			},
			/**
			 * 逐条延迟入场，四条选项会依次浮起而不是整体闪现。
			 * 延迟上限压在 135ms：再长就会被感知成「点了没反应」，
			 * 而这里只是装饰，不能拖慢可点性。
			 */
			delayStyle() {
				return { animationDelay: Math.min(this.index, 3) * 45 + 'ms' }
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ws-opt {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		min-height: 116rpx;
		padding: 28rpx 30rpx;
		margin-bottom: 22rpx;
		box-sizing: border-box;
		background-color: #FFFFFF;
		border: 2rpx solid $ws-line;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(90, 74, 40, 0.04);

		&.is-picked {
			background-color: $ws-gold-soft;
			border-color: $ws-gold-line;
			box-shadow: 0 6rpx 22rpx rgba(184, 134, 11, 0.14);
		}

		&__badge {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 56rpx;
			height: 56rpx;
			margin-right: 22rpx;
			border-radius: 50%;
			background-color: $ws-surface-3;
			border: 2rpx solid $ws-line;
		}

		&__badge-text {
			font-size: 24rpx;
			font-weight: bold;
			color: $ws-muted;
			line-height: 1;
		}

		&__text {
			flex: 1;
			font-size: 29rpx;
			color: $ws-ink;
			line-height: 1.5;
		}

		&__check {
			flex-shrink: 0;
			width: 26rpx;
			height: 14rpx;
			margin-left: 20rpx;
			/* 视觉重心补偿：勾在几何中心会显得偏上，往下压一点 */
			margin-bottom: 8rpx;
			border-left: 5rpx solid $ws-gold;
			border-bottom: 5rpx solid $ws-gold;
			transform: rotate(-45deg);
		}

		&.is-picked {
			.ws-opt__badge {
				background-color: $ws-gold;
				border-color: $ws-gold;
			}

			.ws-opt__badge-text {
				color: #FFFFFF;
			}
		}
	}
</style>

<!--
	入场动画单独放在非 scoped 块里。

	原因和 ws-button.vue 的按压态一样：scoped 样式靠 [data-v-xxx] 属性选择器
	匹配，各端编译器对 @keyframes 名字的改写并不一致 —— 一旦动画名被改写、
	而 animation 声明没有，动画会静默失效。放全局最稳。
	（即使真的失效也只是没有入场动效，选项本身照常显示，不会影响可用性。）
-->
<style lang="scss">
	.ws-opt--anim {
		animation: ws-opt-in 300ms ease both;
	}

	@keyframes ws-opt-in {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
