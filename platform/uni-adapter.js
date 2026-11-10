/**
 * uni-adapter.js —— 【平台适配层】uni-app 实现
 *
 * 这是整个项目里【唯一】直接调用 uni.* 的文件。逻辑层只认下面这份接口契约，
 * 所以换平台（H5 / 微信小程序 / App / 支付宝小程序）不需要动任何玩法代码。
 *
 * PlatformAdapter 接口契约（core/game-engine.js 实际只用到前三项）：
 *   name                          : string
 *   storage.get(key)              -> string | null
 *   storage.set(key, val)         -> void
 *   storage.remove(key)           -> void
 *   vibrate(type)                 -> void   type: 'positive' | 'negative' | 'strong'
 *   showRewardedVideo(place)      -> Promise<boolean>
 *   share(opts)                   -> Promise<boolean>
 *   saveFile(filePath, filename)  -> Promise<boolean>
 *   getJSON(url, cb)              -> void   cb(err, json)
 *   now()                         -> number
 *
 * 与上游（微信小游戏）版本的差异，以及为什么：
 *   - 上游 wx-adapter / web-adapter 两个文件合并成这一个 —— uni.* 本身就是跨端 API，
 *     再按平台拆文件就退回平台特化了。
 *   - saveImage（截取整块画布）拆成了两步：canvas→文件 归组件
 *     （因为 canvasToTempFilePath 需要组件实例），文件→相册 归这里。
 */
import { platform, hasRewardedVideo } from './env.js';

const AD_UNIT_PLACEHOLDER = ''; // ← 上线前填微信后台申请到的激励视频广告位 ID

function UniAdapter(opts) {
  opts = opts || {};
  this.name = 'uni:' + platform();
  this.platform = platform();
  this.adUnitId = opts.adUnitId || AD_UNIT_PLACEHOLDER;
  this._ad = null;
  this._adLoading = false;
}

/* ------------------------------------------------------------------ */
/* 本地存储                                                            */
/* ------------------------------------------------------------------ */

UniAdapter.prototype.storage = {
  get: function (key) {
    try {
      const v = uni.getStorageSync(key);
      // uni 在键不存在时返回 ''，而逻辑层按 null 判断「没有」
      return v === '' || v === undefined || v === null ? null : v;
    } catch (e) {
      return null;
    }
  },
  set: function (key, val) {
    try {
      uni.setStorageSync(key, val);
    } catch (e) {
      /* 存储写满 / 隐私模式：静默失败，不阻断游戏 */
    }
  },
  remove: function (key) {
    try {
      uni.removeStorageSync(key);
    } catch (e) {
      /* 同上 */
    }
  }
};

/* ------------------------------------------------------------------ */
/* 触觉反馈                                                            */
/* ------------------------------------------------------------------ */

UniAdapter.prototype.vibrate = function (type) {
  // 负向反馈震得重一点，正向轻一点 —— 用触感区分好坏结果
  const style = type === 'negative' ? 'heavy' : type === 'strong' ? 'medium' : 'light';
  try {
    // 部分平台不支持 type 参数，传了会被忽略，不会报错
    uni.vibrateShort({ type: style, fail: function () {} });
  } catch (e) {
    /* 不支持震动就静默跳过 */
  }
};

/* ------------------------------------------------------------------ */
/* 激励视频 —— 【广告暂时下线】                                          */
/* ------------------------------------------------------------------ */

/*
 * ⚠️ 广告功能暂时下线，等访客多了再植入。
 * 恢复步骤：
 *   1) 取消下面 _ensureAd 整段的注释；
 *   2) 删掉 showRewardedVideo 里那行 `return Promise.resolve(true);`，
 *      并取消其后整段注释。
 *
 * 现阶段 showRewardedVideo 一律【直接放行】（返回 true），
 * 不创建、不播放任何激励视频，也没有任何「模拟广告」流程。

UniAdapter.prototype._ensureAd = function () {
  if (this._ad) return this._ad;
  if (!this.adUnitId) return null;
  if (typeof uni === 'undefined' || typeof uni.createRewardedVideoAd !== 'function') return null;
  try {
    this._ad = uni.createRewardedVideoAd({ adUnitId: this.adUnitId });
  } catch (e) {
    this._ad = null;
  }
  return this._ad;
};
*/

/**
 * 播放激励视频
 * @returns {Promise<boolean>} 是否完整看完（true 才允许发放奖励）
 *
 * 【广告暂时下线】直接返回 true，不做任何广告相关动作。
 */
UniAdapter.prototype.showRewardedVideo = function (place) {
  return Promise.resolve(true);

  /* 恢复广告时删除上面这行 return，并取消下面整段注释：
  const self = this;

  if (!hasRewardedVideo() || !this.adUnitId) {
    return Promise.resolve(true);
  }

  return new Promise(function (resolve) {
    const ad = self._ensureAd();
    if (!ad) {
      resolve(false);
      return;
    }

    let settled = false;
    function finish(ok) {
      if (settled) return;
      settled = true;
      ad.offClose(onClose);
      ad.offError(onError);
      resolve(ok);
    }

    function onClose(res) {
      // 基础库 2.1.0 之前不返回 res，视为看完
      const ended = !res || res.isEnded === undefined ? true : !!res.isEnded;
      finish(ended);
    }
    function onError() {
      finish(false);
    }

    ad.onClose(onClose);
    ad.onError(onError);

    ad.show().catch(function () {
      // 首次 show 失败很常见，先 load 再 show（官方推荐姿势）
      return ad.load().then(function () {
        return ad.show();
      });
    }).catch(function () {
      finish(false);
    });
  });
  */
};

/* ------------------------------------------------------------------ */
/* 分享                                                                */
/* ------------------------------------------------------------------ */

/**
 * 拉起分享
 * @returns {Promise<boolean>}
 *
 * ⚠️ 微信小程序【不允许用 API 主动拉起分享面板】，必须由用户点击
 *    <button open-type="share"> 或右上角菜单触发。所以本方法在小程序端
 *    返回 false，页面据此显示「点右上角分享」指引；H5 / App 端则把
 *    结果文案复制到剪贴板，同样返回 false 但会顺带给出提示。
 */
UniAdapter.prototype.share = function (opts) {
  opts = opts || {};
  const p = this.platform;

  if (p === 'app' && typeof uni.share === 'function') {
    return new Promise(function (resolve) {
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: opts.href || '',
        title: opts.title || '',
        summary: opts.summary || '',
        success: function () { resolve(true); },
        fail: function () { resolve(false); }
      });
    });
  }

  // H5 / 小程序：退化为复制文案
  return new Promise(function (resolve) {
    uni.setClipboardData({
      data: opts.title || '',
      success: function () { resolve(false); },
      fail: function () { resolve(false); }
    });
  });
};

/** 小程序端分享内容由页面 onShareAppMessage 决定，这里提供统一文案 */
UniAdapter.prototype.buildShareText = function (personaName, endingTitle, quality) {
  return '我的财运人格是「' + (personaName || '未知') + '」，结局【' +
    (endingTitle || '') + '】' + (quality ? ' ' + quality + ' 级' : '') +
    '。你的财运剧本是什么？';
};

/* ------------------------------------------------------------------ */
/* 保存结果卡                                                          */
/* ------------------------------------------------------------------ */

/**
 * 把一张本地临时文件存到相册（小程序 / App）或触发下载（H5）
 * @param {string} filePath 临时文件路径 / dataURL
 * @param {string} filename H5 下载时的文件名
 * @returns {Promise<boolean>}
 *
 * 分工说明：canvas → 临时图片这一步【不在这里】，而是放在
 * components/ui/result-card-canvas.vue 里。原因是微信小程序的
 * wx.canvasToTempFilePath 在「canvas 位于自定义组件内」时必须传入组件实例，
 * 只有在组件内部才拿得到；平台层拿不到那个实例，硬做会失败。
 * 所以平台层的职责收窄为「拿到文件路径之后怎么落地」，边界更清楚。
 */
UniAdapter.prototype.saveFile = function (filePath, filename) {
  const p = this.platform;

  return new Promise(function (resolve) {
    if (!filePath) {
      resolve(false);
      return;
    }

    // H5：直接触发浏览器下载
    if (p === 'h5') {
      try {
        const a = document.createElement('a');
        a.href = filePath;
        a.download = filename || 'result-card.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        resolve(true);
      } catch (e) {
        resolve(false);
      }
      return;
    }

    // 小程序 / App：存到相册
    uni.saveImageToPhotosAlbum({
      filePath: filePath,
      success: function () {
        resolve(true);
      },
      fail: function (err) {
        // 用户拒过权限后系统不会再弹窗，必须引导去设置页，否则就是静默失败
        const msg = (err && err.errMsg) || '';
        if (msg.indexOf('auth deny') >= 0 || msg.indexOf('authorize') >= 0) {
          uni.showModal({
            title: '需要相册权限',
            content: '保存结果卡需要你授权访问相册，去设置里打开？',
            confirmText: '去设置',
            success: function (m) {
              if (m.confirm) uni.openSetting({});
            }
          });
        }
        resolve(false);
      }
    });
  });
};

/* ------------------------------------------------------------------ */
/* 远程配置（弱网 / 断网静默降级）                                      */
/* ------------------------------------------------------------------ */

UniAdapter.prototype.getJSON = function (url, cb) {
  try {
    uni.request({
      url: url,
      method: 'GET',
      timeout: 3000,
      success: function (res) {
        // 只接受纯数据 JSON —— 小程序禁止下发可执行代码
        if (res.statusCode === 200 && res.data) cb(null, res.data);
        else cb(new Error('HTTP ' + res.statusCode));
      },
      fail: function (err) {
        cb(err || new Error('request failed'));
      }
    });
  } catch (e) {
    cb(e);
  }
};

/* ------------------------------------------------------------------ */
/* 杂项                                                                */
/* ------------------------------------------------------------------ */

UniAdapter.prototype.now = function () {
  return Date.now();
};

/** 系统信息（安全区、状态栏高度），用于顶部留白 */
UniAdapter.prototype.getSystemInfo = function () {
  try {
    const info = uni.getSystemInfoSync();
    return {
      width: info.windowWidth,
      height: info.windowHeight,
      dpr: info.pixelRatio || 1,
      statusBarHeight: info.statusBarHeight || 0,
      safeAreaBottom: info.safeArea ? info.screenHeight - info.safeArea.bottom : 0
    };
  } catch (e) {
    return { width: 375, height: 667, dpr: 2, statusBarHeight: 0, safeAreaBottom: 0 };
  }
};

export default UniAdapter;
export { UniAdapter };
