<template>
	<!--
		结果卡。全项目仅剩的两处 Canvas 之一。

		为什么这张卡不像其他界面那样用 Vue + CSS 画：
		它的最终用途是「变成一张图片」发给朋友，所以它天然就该是一张画布 ——
		这样「保存到相册」就是所见即所得，不必再引 html2canvas 之类的库，
		也避免了「屏幕上好看、导出后错位」的经典问题。
	-->
	<view class="card-wrap">
		<canvas
			class="card"
			:canvas-id="canvasId"
			:id="canvasId"
			:style="canvasStyle"
		/>
	</view>
</template>

<script>
	import { drawResultCard, CARD_SIZE } from '../../utils/canvas-kit.js'

	export default {
		name: 'ResultCardCanvas',
		props: {
			// 由父组件指定，父组件后续要用它来调用 canvasToTempFilePath
			canvasId: { type: String, default: 'wsResultCard' },
			persona: { type: Object, default: () => ({}) },
			attrs: { type: Object, default: () => ({}) },
			result: { type: Object, default: () => ({}) },
			pseudoPercent: { type: String, default: '0.0' }
		},
		computed: {
			canvasStyle() {
				return {
					width: CARD_SIZE.width + 'rpx',
					height: CARD_SIZE.height + 'rpx'
				}
			}
		},
		watch: {
			persona: { deep: true, handler() { this.redraw() } },
			attrs: { deep: true, handler() { this.redraw() } },
			result: { deep: true, handler() { this.redraw() } }
		},
		mounted() {
			// 等布局稳定再画，否则首帧可能量不到尺寸
			this.$nextTick(() => {
				setTimeout(() => this.draw(), 40)
			})
		},
		methods: {
			pxPerRpx() {
				try {
					const info = uni.getSystemInfoSync()
					const w = info && info.windowWidth ? info.windowWidth : 375
					return w / 750
				} catch (e) {
					return 0.5
				}
			},
			redraw() {
				this.$nextTick(() => setTimeout(() => this.draw(), 20))
			},
			draw() {
				try {
					const ctx = uni.createCanvasContext(this.canvasId, this)
					// 设计单位 → 实际画布坐标（css px）
					const k = this.pxPerRpx()

					// 清底，避免重绘时叠影
					ctx.setTransform(1, 0, 0, 1, 0, 0)
					ctx.clearRect(0, 0, CARD_SIZE.width * k, CARD_SIZE.height * k)
					ctx.scale(k, k)

					drawResultCard(ctx, {
						persona: this.persona,
						attrs: this.attrs,
						result: this.result,
						pseudoPercent: this.pseudoPercent
					})

					ctx.draw()
				} catch (e) {
					if (typeof console !== 'undefined') {
						console.error('[ResultCardCanvas] 绘制失败', e)
					}
				}
			},
			/**
			 * 把画布导成图片，返回临时文件路径（失败返回空串）
			 *
			 * ★ 必须在组件内部调用：微信小程序的 canvasToTempFilePath 在
			 *   canvas 位于自定义组件内时，第二个参数必须传组件实例。
			 *   所以这一步没法下推到平台适配层。
			 */
			exportImage() {
				const self = this
				return new Promise(function (resolve) {
					const k = self.pxPerRpx()
					try {
						uni.canvasToTempFilePath(
							{
								canvasId: self.canvasId,
								// 源区域：canvas 自身的坐标空间（css px）
								width: CARD_SIZE.width * k,
								height: CARD_SIZE.height * k,
								// 输出：2 倍图，分享出去不发虚
								destWidth: CARD_SIZE.width * 2,
								destHeight: CARD_SIZE.height * 2,
								fileType: 'png',
								success(res) {
									resolve(res.tempFilePath || '')
								},
								fail() {
									resolve('')
								}
							},
							self // ← 组件实例
						)
					} catch (e) {
						resolve('')
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.card-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 20rpx 0 10rpx;
	}

	.card {
		display: block;
	}
</style>
