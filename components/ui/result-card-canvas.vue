<template>
	<!--
		结果卡。全项目仅剩的两处 Canvas 之一。

		为什么这张卡不像其他界面那样用 Vue + CSS 画：
		它的最终用途是「变成一张图片」发给朋友，所以它天然就该是一张画布 ——
		这样「保存到相册」就是所见即所得，不必再引 html2canvas 之类的库，
		也避免了「屏幕上好看、导出后错位」的经典问题。

		★ 用 type="2d"（新版 Canvas 2D 接口），不用旧的 canvas-id 接口。
		  旧接口在抖音小程序里渲染不出来：卡片的 canvas 是一片空白，
		  雷达图那处 canvas 同样不显示。新版接口在微信(2.7.0+)/抖音(1.78.0+)/
		  H5 都是标准实现，因此统一改用它。拿不到 canvas 节点时再回退旧接口，
		  以保证极端环境至少不会白屏报错。
	-->
	<view class="card-wrap">
		<canvas
			class="card"
			type="2d"
			:id="canvasId"
			:style="canvasStyle"
		/>
	</view>
</template>

<script>
	import { drawResultCard, CARD_SIZE } from '../../utils/canvas-kit.js'
	import { WX_QR_DATA_URL } from '../../utils/qr-asset.js'

	export default {
		name: 'ResultCardCanvas',
		props: {
			// 由父组件指定，同时用作 canvas 的 id（selector 查询用）
			canvasId: { type: String, default: 'wsResultCard' },
			persona: { type: Object, default: () => ({}) },
			attrs: { type: Object, default: () => ({}) },
			result: { type: Object, default: () => ({}) },
			pseudoPercent: { type: String, default: '0.0' },
			// 底部二维码图片路径（按平台给微信 / 抖音各自的小程序码），空则不画码
			qrPath: { type: String, default: '' }
		},
		data() {
			return { canvasNode: null, cssWidth: 0, cssHeight: 0 }
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
			result: { deep: true, handler() { this.redraw() } },
			qrPath() { this.redraw() }
		},
		mounted() {
			// 等布局稳定再画，否则首帧可能量不到尺寸
			this.$nextTick(() => {
				setTimeout(() => this.draw(), 50)
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
			/** 取 2d canvas 节点；拿不到则回调 null，由调用方回退旧接口 */
			prepare(cb) {
				uni.createSelectorQuery()
					.in(this)
					.select('#' + this.canvasId)
					.fields({ node: true, size: true })
					.exec(function (res) {
						const info = res && res[0]
						if (!info || !info.node) {
							cb(null, null)
							return
						}
						cb(info.node, info)
					})
			},
			draw() {
				const self = this
				this.prepare(function (canvas, info) {
					if (!canvas) {
						// 极少数环境拿不到节点（旧基础库 / 个别 H5），退回旧接口
						self.drawLegacy()
						return
					}
					self.canvasNode = canvas
					let dpr = 1
					try {
						dpr = uni.getSystemInfoSync().pixelRatio || 1
					} catch (e) {
						/* ignore */
					}
					const wpx = info.width || CARD_SIZE.width * self.pxPerRpx()
					const hpx = info.height || CARD_SIZE.height * self.pxPerRpx()
					self.cssWidth = wpx
					self.cssHeight = hpx
					// 物理像素画布 + 一次到位的变换（设计像素 → 设备像素）
					canvas.width = Math.round(wpx * dpr)
					canvas.height = Math.round(hpx * dpr)
					const ctx = canvas.getContext('2d')
					// ★ 缩放由「实测画布宽度」推导，不能用 windowWidth/750：
					//   H5 宽屏时 rpx 会被 maxDeviceWidth 封顶，windowWidth 未封顶，
					//   两者不一致会把卡片内容放大到画布之外（只显示一部分）。
					const k = wpx / CARD_SIZE.width
					ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0)
					self.paint(ctx, canvas)
				})
			},
			paint(ctx, canvas) {
				const self = this
				// 当前端没有小程序码（H5 / App 等）时，直接画「无码」版，不加载图片
				if (!this.qrPath && !WX_QR_DATA_URL) {
					this.paintSync(ctx, null)
					return
				}
				if (canvas && canvas.createImage) {
					// 2d 接口必须先 createImage 再画，不能直接把路径交给 drawImage
					const img = canvas.createImage()
					img.onload = function () { self.paintSync(ctx, img) }
					img.onerror = function () { self.paintSync(ctx, null) }
					// 微信端优先用 base64：2d canvas 的 createImage 对本地 static 路径支持不稳定，
					// 常出现 onload 不触发 / 报错，导致二维码区空白；base64 则稳定可加载。
					// 抖音端没有 base64 时回退用 static 路径（/static/qrcode/tt.png）。
					img.src = WX_QR_DATA_URL || this.qrPath
				} else {
					this.paintSync(ctx, null)
				}
			},
			paintSync(ctx, qrImage) {
				ctx.clearRect(0, 0, CARD_SIZE.width, CARD_SIZE.height)
				drawResultCard(ctx, {
					persona: this.persona,
					attrs: this.attrs,
					result: this.result,
					pseudoPercent: this.pseudoPercent,
					qrImage: qrImage
				})
			},
			drawLegacy() {
				try {
					const ctx = uni.createCanvasContext(this.canvasId, this)
					const k = this.pxPerRpx()
					ctx.setTransform(1, 0, 0, 1, 0, 0)
					ctx.clearRect(0, 0, CARD_SIZE.width * k, CARD_SIZE.height * k)
					ctx.scale(k, k)
					drawResultCard(ctx, {
						persona: this.persona,
						attrs: this.attrs,
						result: this.result,
						pseudoPercent: this.pseudoPercent,
						qrPath: this.qrPath
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
			 * ★ 2d 接口用 canvas 节点导出，不再依赖 canvas-id。
			 * ★ 若拿不到 2d 节点（极少数环境回退到了旧接口），改用 canvas-id 导出，
			 *   避免「画布明明画出来了、导出却是空」导致保存失败。
			 */
			exportImage() {
				const self = this
				return new Promise(function (resolve) {
					// 2d 节点可用：走新版导出
					if (self.canvasNode) {
						try {
							uni.canvasToTempFilePath(
								{
									canvas: self.canvasNode,
									fileType: 'png',
									// 输出：2 倍图，分享出去不发虚
									destWidth: CARD_SIZE.width * 2,
									destHeight: CARD_SIZE.height * 2,
									success(res) {
										resolve(res.tempFilePath || '')
									},
									fail() {
										// 新版失败再试旧接口，绝不直接判死
										self.exportLegacy(resolve)
									}
								},
								self
							)
						} catch (e) {
							self.exportLegacy(resolve)
						}
						return
					}
					// 没有 2d 节点：走旧接口导出
					self.exportLegacy(resolve)
				})
			},
			/** 旧接口（canvas-id）导出，作为 2d 导出失败 / 节点缺失时的兜底 */
			exportLegacy(resolve) {
				const self = this
				try {
					uni.canvasToTempFilePath(
						{
							canvasId: self.canvasId,
							fileType: 'png',
							destWidth: CARD_SIZE.width * 2,
							destHeight: CARD_SIZE.height * 2,
							success(res) {
								resolve(res.tempFilePath || '')
							},
							fail() {
								resolve('')
							}
						},
						self
					)
				} catch (e) {
					resolve('')
				}
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
