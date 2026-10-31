/**
 * sfx.js —— 零素材音效（WebAudio 现场合成）
 *
 * 上游版本跑在微信小游戏里，WebAudio 可用；挪到 uni-app 后情况变了：
 *   - H5 / App（WebView 内核）→ 有 AudioContext，合成音效照常可用
 *   - 微信小程序            → 没有 WebAudio，这里静默降级
 *
 * 小程序的反馈交给 uni.vibrateShort（由 platform/uni-adapter.js 的 vibrate 提供，
 * 引擎在每次抉择结算后会自动调用）。也就是说「有声音就出声、没声音就震动」，
 * 不会出现两端都没反馈的哑巴局。
 *
 * 之所以坚持合成而不是放 mp3：省掉素材文件，主包体积几乎不变。
 * 以后若要给小程序配真音效，把 play() 换成 uni.createInnerAudioContext 即可，
 * 调用方（组件）不需要改。
 */
import { platform } from './env.js';

const MUTE_KEY = 'ws_mute_v1';

function audioContextCtor() {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

function Sfx() {
  this.platform = platform();
  this.supported = !!audioContextCtor();
  this._ctx = null;
  this._muted = this._readMute();
}

Sfx.prototype._readMute = function () {
  try {
    return uni.getStorageSync(MUTE_KEY) === '1';
  } catch (e) {
    return false;
  }
};

Sfx.prototype.setMuted = function (muted) {
  this._muted = !!muted;
  try {
    uni.setStorageSync(MUTE_KEY, this._muted ? '1' : '0');
  } catch (e) {
    /* ignore */
  }
};

Sfx.prototype.isMuted = function () {
  return this._muted;
};

Sfx.prototype._ac = function () {
  if (this._ctx !== null) return this._ctx;
  const AC = audioContextCtor();
  if (!AC) {
    this._ctx = false;
    return false;
  }
  try {
    this._ctx = new AC();
  } catch (e) {
    this._ctx = false;
  }
  return this._ctx;
};

Sfx.prototype._tone = function (freq, dur, type, gainVal, delay) {
  const ac = this._ac();
  if (!ac) return;
  try {
    // 移动端浏览器要求首次交互后才能出声，这里顺手 resume
    if (ac.state === 'suspended' && ac.resume) ac.resume();
    const t0 = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainVal || 0.06, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (e) {
    /* 音频上下文被系统回收等情况，静默忽略 */
  }
};

/** @param {string} name tap | positive | negative | strong | ending */
Sfx.prototype.play = function (name) {
  if (this._muted || !this.supported) return;
  switch (name) {
    case 'tap':
      this._tone(660, 0.06, 'triangle', 0.035);
      break;
    case 'positive':
      this._tone(784, 0.11, 'sine', 0.05);
      this._tone(1046, 0.13, 'sine', 0.04, 0.07);
      break;
    case 'negative':
      this._tone(220, 0.16, 'sine', 0.05);
      this._tone(165, 0.2, 'sine', 0.04, 0.08);
      break;
    case 'strong':
      this._tone(659, 0.1, 'triangle', 0.05);
      this._tone(880, 0.1, 'triangle', 0.05, 0.09);
      this._tone(1318, 0.22, 'triangle', 0.05, 0.18);
      break;
    case 'ending':
      this._tone(523, 0.3, 'sine', 0.05);
      this._tone(659, 0.3, 'sine', 0.045, 0.16);
      this._tone(784, 0.5, 'sine', 0.05, 0.32);
      break;
    default:
      this._tone(520, 0.05, 'triangle', 0.03);
  }
};

export default Sfx;
export { Sfx };
