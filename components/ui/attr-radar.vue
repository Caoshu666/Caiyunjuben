<template>
	<!--
		5 维雷达图。全项目仅剩的两处 Canvas 之一（另一处是结果卡），
		原因见 utils/canvas-kit.js 顶部注释：五边形数据面用纯 CSS 在部分小程序端
		兼容性不稳，Canvas 反而最可靠。

		★ 同结果卡：用 type="2d" 新版接口。旧的 canvas-id 接口在抖音小程序里
		  整块 canvas 不渲染（一片空白），改用新版接口后微信 / 抖音 / H5 一致。
	-->
	<view class="radar-wrap" :style="{ width: size + 'rpx', height: size + 'rpx' }">
		<canvas
			class="radar"
			type="2d"
			:id="cid"
			:style="{ width: size + 'rpx', height: size + 'rpx' }"
		/>
	</view>
</template>

<script>
	import { radar, ATTRS, ATTR_LABEL } from '../../utils/canvas-kit.js'

	// canvas id 必须在页面内唯一，否则多个雷达图会互相覆盖
	let uidSeq = 0

	export default {
		name: 'AttrRadar',
		props: {
			attrs: { type: Object, default: () => ({}) },
			// 设计尺寸（rpx）。750rpx = 一个屏宽，所以 1 设计单位 = 1rpx
			size: { type: Number, default: 340 }
		},
		data() {
			uidSeq += 1
			return { cid: 'wsRadar' + uidSeq }
		},
		watch: {
			attrs: {
				deep: true,
				handler() {
					this.draw()
				}
			}
		},
		mounted() {
			// 等一帧，确保 canvas 已经完成布局，否则量不到尺寸
			this.$nextTick(() => {
				setTimeout(() => this.draw(), 30)
			})
		},
		methods: {
			/** rpx → css px 的换算系数。rpx 是屏幕相对单位，所以这个换算与容器宽度无关 */
			pxPerRpx() {
				try {
					const info = uni.getSystemInfoSync()
					const w = info && info.windowWidth ? info.windowWidth : 375
					return w / 750
				} catch (e) {
					return 0.5
				}
			},
			draw() {
				const self = this
				uni.createSelectorQuery()
					.in(this)
					.select('#' + this.cid)
					.fields({ node: true, size: true })
					.exec(function (res) {
						const info = res && res[0]
						if (!info || !info.node) {
							self.drawLegacy()
							return
						}
						try {
							const canvas = info.node
							let dpr = 1
							try {
								dpr = uni.getSystemInfoSync().pixelRatio || 1
							} catch (e) {
								/* ignore */
							}
							const wpx = info.width || self.size * self.pxPerRpx()
							const hpx = info.height || wpx
							canvas.width = Math.round(wpx * dpr)
							canvas.height = Math.round(hpx * dpr)
							const ctx = canvas.getContext('2d')
							// 设计单位 → 设备像素，一次到位的变换。
							// ★ 缩放必须由「实测画布宽度」推导，不能用 windowWidth/750：
							//   H5 宽屏时 rpx 会被 maxDeviceWidth(默认960) 封顶，而
							//   windowWidth 未封顶，二者不一致会把图形放大到画布之外
							//   （表现为雷达图只显示一部分 / 位置空一块）。
							const k = wpx / self.size
							ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0)
							self.paint(ctx)
						} catch (e) {
							if (typeof console !== 'undefined') {
								console.warn('[AttrRadar] 绘制失败，已降级为仅显示属性条', e)
							}
						}
					})
			},
			paint(ctx) {
				const size = this.size
				const entries = ATTRS.map((k) => ({
					label: ATTR_LABEL[k] || k,
					value: (this.attrs && this.attrs[k]) || 0
				}))
				radar(ctx, size / 2, size / 2, size * 0.30, entries, { labelSize: 22 })
			},
			/** 拿不到 2d 节点时回退旧接口（仅个别环境） */
			drawLegacy() {
				const size = this.size
				const entries = ATTRS.map((k) => ({
					label: ATTR_LABEL[k] || k,
					value: (this.attrs && this.attrs[k]) || 0
				}))
				try {
					const ctx = uni.createCanvasContext(this.cid, this)
					const scale = this.pxPerRpx()
					ctx.scale(scale, scale)
					radar(ctx, size / 2, size / 2, size * 0.30, entries, { labelSize: 22 })
					ctx.draw()
				} catch (e) {
					// 雷达图只是锦上添花：画不出来也不能让整个页面挂掉，
					// 属性条（AttrBars）已经承载了同样的信息
					if (typeof console !== 'undefined') {
						console.warn('[AttrRadar] 绘制失败，已降级为仅显示属性条', e)
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.radar-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.radar {
		display: block;
	}
</style>
