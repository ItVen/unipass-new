<template>
  <div id="page-share">
    <back />
    <div id="red-box" ref="red-box" v-loading="loading">
      <img class="top-bg" src="~/assets/img/top-bg.png" @load="bindLoad" />
      <div class="t1">NFT 红包</div>
      <div class="t2">- 输入口令，抢 NFT 红包 -</div>
      <div v-if="password" class="password">「{{ password }}」</div>
      <div class="qrcode-box" :class="{ password: password }">
        <!-- <img class="rectangle" src="~/assets/img/red-rectangle.png" alt="" /> -->
        <img v-if="QRCode" class="qrcode" :src="QRCode" alt="qrcode" />
      </div>
      <div class="t3">长按领取至钱包</div>
      <div class="t4">抢 NFT 红包，玩加密新社交</div>
      <img v-if="png" class="share" :src="png" alt="share" />
    </div>
    <div class="red-tip">长按图片分享给朋友</div>
    <el-button class="red-share" type="primary" round @click="bindShare">
      分 享 链 接
    </el-button>
  </div>
</template>
<script>
// https://segmentfault.com/a/1190000011478657
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
export default {
  data() {
    return {
      QRCode: '',
      png: '',
      loading: true,
      shareUrl: '',
      password: this.$route.query.p || '',
    }
  },
  mounted() {
    this.shareUrl = `${window.location.origin}/gift/${this.$route.params.id}`
    this.initQRCode()
  },
  methods: {
    bindLoad() {
      this.$nextTick(() => {
        const redBox = this.$refs['red-box']
        html2canvas(redBox, {
          useCORS: true,
        }).then((canvas) => {
          if (canvas && canvas.getContext) {
            const png = canvas.toDataURL('image/png')
            this.png = png
          }
        })
      })
    },
    bindShare() {
      let v = `打开链接，输入口令，抢NFT红包，玩转加密新社交，${this.shareUrl}`
      if (this.password) {
        v += `\n红包口令：${this.password}`
      }
      this.$clipboard(v)
      const password = this.password ? `<br>红包口令：${this.password}` : ''
      this.$alert(
        `已复制分享链接，快去粘贴<br>${this.shareUrl}${password}`,
        '复制成功',
        {
          showConfirmButton: false,
          closeOnClickModal: true,
          closeOnPressEscape: true,
          dangerouslyUseHTMLString: true,
          type: 'info',
        },
      ).catch(() => {})
    },
    async initQRCode() {
      // https://www.npmjs.com/package/qrcode#example-1
      const url = await QRCode.toDataURL(this.shareUrl, {
        type: 'image/png',
        width: 260,
        margin: 1,
        color: {
          dark: '#F35543FF',
          light: '#FFE2B0FF',
        },
      })
      this.QRCode = url
      this.loading = false
    },
  },
}
</script>
<style lang="stylus">
#page-share {
  --red: #F35543;
  --yellow: #FFE2B0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  #red-box {
    background: var(--red);
    width: 320px;
    height: 467px;
    // border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .canvas {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
    }

    .share {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }

    .top-bg {
      width: 320px;
      height: 111.51px;
    }

    .t1 {
      margin-top: 8px;
      font-size: 24px;
      color: rgb(250, 250, 250);
    }

    .t2 {
      margin-top: 12px;
      color: var(--yellow);
    }

    .password {
      margin-top: 8px;
      font-weight: bold;
      color: #fff;
      font-size: 20px;
    }

    .qrcode-box {
      position: relative;
      margin-top: 31px;
      padding: 8px;
      width: 150px;
      height: 150px;
      border: 2px solid var(--yellow);

      .rectangle {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      .qrcode {
        width: 100%;
        height: 100%;
        // box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.4);
        // border: 2px dashed #ffe2b0;
      }
    }

    .qrcode-box.password {
      margin-top: 12px;
    }

    .t3 {
      margin-top: 4px;
      color: #ffbbbb;
    }

    .t4 {
      margin-top: auto;
      margin-bottom: 31px;
      color: var(--yellow);
    }
  }

  .red-tip {
    margin-top: 8px;
    font-size: 14px;
  }

  .red-share {
    margin-top: 28px;
    width: 320px;
    background: var(--red);
    border-color: var(--red);
    color: var(--yellow);
  }
}
</style>
