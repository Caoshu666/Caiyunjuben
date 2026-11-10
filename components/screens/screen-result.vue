<template>
	<view class="screen">
		<!-- 结果卡本体：Canvas 绘制，见 result-card-canvas.vue 的说明 -->
		<ResultCardCanvas
			ref="card"
			canvas-id="wsResultCard"
			:persona="persona"
			:attrs="attrs"
			:result="result"
			:pseudo-percent="pct"
			:qr-path="game.qrCodePath"
		/>

		<view class="result-actions">
			<view class="result-actions__row">
				<view class="result-actions__col">
					<WsButton
						:label="game.t('btnSaveImage')"
						variant="ghost"
						size="sm"
						:disabled="saving"
						@tap="onSave"
					/>
				</view>
				<view class="result-actions__gap" />
				<view class="result-actions__col">
					<!--
						微信小程序不允许用 API 主动拉起分享面板，必须用
						<button open-type="share">，所以这里按平台切换实现。
					-->
					<WsButton
						v-if="game.isWeixin"
						:label="game.t('btnShare')"
						size="sm"
						open-type="share"
					/>
					<WsButton
						v-else
						:label="game.t('btnShare')"
						size="sm"
						@tap="onShare"
					/>
				</view>
			</view>

			<view class="result-actions__full">
				<WsButton :label="game.t('btnReplay')" size="md" @tap="onReplay" />
			</view>

			<!-- 回首页现在由共用页脚组件提供，样式与其他界面一致 -->
			<WsHomeFoot :game="game" :stick="false" />

			<text v-if="game.isWeixin" class="result-actions__tip">
				点右上角「···」也可以把结果分享给朋友
			</text>
		</view>
	</view>
</template>

<script>
	import ResultCardCanvas from '../ui/result-card-canvas.vue'
	import WsButton from '../ui/ws-button.vue'
	import WsHomeFoot from '../ui/ws-home-foot.vue'

	export default {
		name: 'ScreenResult',
		components: { ResultCardCanvas, WsButton, WsHomeFoot },
		props: {
			game: { type: Object, required: true }
		},
		data() {
			return { saving: false }
		},
		mounted() {
			this.prepareShareImage()
		},
		computed: {
			result() {
				return this.game.state.finalResult || {}
			},
			persona() {
				return this.game.state.persona || {}
			},
			attrs() {
				return this.game.state.attrs || {}
			},
			pct() {
				return this.game.pseudoPercent(this.result.endingId || '')
			},
			/** 分享文案。页面层的 onShareAppMessage 也用同一份，保证两处一致 */
			shareText() {
				const p = this.persona
				const r = this.result
				return this.game.adapter.buildShareText(p.name, r.title, r.quality)
			}
		},
		methods: {
			/**
			 * 进结果页就先把卡片导出成图，备着当小程序分享封面。
			 *
			 * onShareAppMessage 只能【同步】返回，图片必须提前生成，所以不能等到
			 * 用户点分享时才导。只在微信端做：其它端分享走复制文案，用不到封面。
			 */
			prepareShareImage() {
				if (!this.game.isWeixin) return
				setTimeout(() => {
					const card = this.$refs.card
					if (!card) return
					card
						.exportImage()
						.then((filePath) => {
							if (filePath) this.game.shareImage = filePath
						})
						.catch(() => {})
				}, 300)
			},
			onSave() {
				if (this.saving) return
				this.saving = true
				this.game.showToast('正在生成结果卡…')

				// 等一帧再导出，确保 canvas 已完成绘制
				setTimeout(() => {
					this.$refs.card
						.exportImage()
						.then((filePath) => {
							if (!filePath) {
								this.game.showToast('生成失败，请截图保存')
								return false
							}
							return this.game.adapter.saveFile(filePath, '财富模拟器.png')
						})
						.then((ok) => {
							this.game.showToast(ok ? '结果卡已保存' : '保存失败，请截图保存')
						})
						.catch(() => {
							this.game.showToast('保存失败，请截图保存')
						})
						.finally(() => {
							this.saving = false
						})
				}, 120)
			},
			onShare() {
				this.game.adapter.share({ title: this.shareText })
				this.game.showToast('分享文案已复制，去粘贴给朋友吧')
			},
			onReplay() {
				this.game.sfx.play('tap')
				this.game.actions.replay()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 48rpx 40rpx;
	}

	.result-actions {
		width: 100%;
		margin-top: auto;
		padding-top: 40rpx;

		&__row {
			display: flex;
			flex-direction: row;
			width: 100%;
		}

		&__col {
			flex: 1;
		}

		&__gap {
			width: 24rpx;
			flex-shrink: 0;
		}

		&__full {
			margin-top: 24rpx;

			&--last {
				margin-top: 16rpx;
			}
		}

		&__tip {
			display: block;
			margin-top: 24rpx;
			font-size: 20rpx;
			color: $ws-muted;
			text-align: center;
		}
	}
</style>
