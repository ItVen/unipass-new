<template>
  <div id="page-gift">
    <div class="email">{{ provider && provider._email }}</div>
    <img class="top-bg" src="~/assets/img/top-bg.png" />
    <template v-if="status === 'success'">
      <div class="success">
        <div class="t1">恭喜您</div>
        <div class="t2">成功领取到一个NFT红包</div>
      </div>
      <div class="balance" @click="bindSuccess">
        <img :src="require('~/assets/img/ze-balance-pay.svg')" />
        <div>打开钱包</div>
      </div>
    </template>
    <template v-else-if="status === 'fail'">
      <div class="fail">
        <template v-if="statusCode === -3">
          <div class="t1">抱歉</div>
          <div class="t2">你已经领过这个红包了</div>
        </template>
        <template v-else-if="statusCode === -2">
          <div class="t1">404</div>
          <div class="t2">NFT红包地址有误</div>
        </template>
        <template v-else>
          <div class="t1">抱歉</div>
          <div class="t2">NFT红包已经被抢完了</div>
        </template>
      </div>
      <router-link to="/record">
        <div class="balance">
          <img :src="require('~/assets/img/ze-balance-pay.svg')" />
          <div>打开钱包</div>
        </div>
      </router-link>
    </template>
    <template v-else>
      <div class="get">
        <div class="t1">您有一个待领取的</div>
        <div class="t2">NFT 红包</div>
        <div class="password">
          <el-input
            v-model="password"
            placeholder="输口令，领NFT"
            @keyup.enter="bindGet"
          ></el-input>
        </div>
        <div class="receive-box" @click="bindGet">
          <el-button class="receive" :loading="loading">立 即 领 取</el-button>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { getKeyPassword, decryptMasterKey } from '~/assets/js/nft/utils'
import { redPacketTransfer } from '~/assets/js/nft/transfer'

export default {
  data() {
    return {
      status: '',
      statusCode: null,
      password: '',
      provider: null,
      loading: false,
    }
  },
  computed: {
    giftPassword() {
      return this.password || 'unipass'
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    bindSuccess() {
      this.$router.push('/record')
    },
    init() {
      if (!this.provider) {
        this.bindLogin(true)
        return
      }
      this.$nextTick(() => {
        this.getStatus({
          address: 'do_not_need_address',
          password: getKeyPassword('do_not_need_password'),
        })
      })
    },
    bindGet() {
      this.loading = true
      if (!this.provider) {
        this.bindLogin()
        return
      }
      this.getRedPacketData({
        address: this.provider._address.addressString,
        password: getKeyPassword(this.giftPassword),
      })
    },
    async getStatus({ address, password }) {
      const id = this.$route.params.id || 'null'
      const res = await Sea.Ajax({
        url: `/nft/${id}`,
        method: 'get',
        data: {
          password,
          address,
        },
      })
      this.statusCode = res.status
      if (res.status < 0) {
        this.status = 'fail'
      }
      return res
    },
    async getRedPacketData({ address, password }) {
      let res
      res = await this.getStatus({ address, password })
      if (res.success) {
        const resData = res.data
        const toAddress = this.provider._address.addressString
        const data = {
          authorization: resData.authorization, //
          localKeySig: resData.localKeySig,
          localKeyPubkey: resData.localKeyPubkey,
          masterKeyPubkey: resData.masterKeyPubkey,
          localAuthInfo: resData.localAuthInfo,
          encrypt: resData.encrypt,
          keyPubkey: resData.keyPubkey,
          outpointSize: resData.outpointSize,
          outpoints: JSON.parse(resData.outpoints),
        }
        const key = await decryptMasterKey(
          data.encrypt,
          'generateKey',
          this.giftPassword,
        )
        const tx = await redPacketTransfer(
          data.masterKeyPubkey,
          data.authorization,
          data.localKeySig,
          key,
          data.keyPubkey,
          data.localAuthInfo,
          address,
          data.outpoints,
        )
        res = await Sea.Ajax({
          url: `/nft/tx`,
          method: 'post',
          data: {
            txHash: tx || '0x',
            toAddress,
            id: resData.id,
          },
        })
        console.log('tx', tx)
        if (tx) {
          this.status = 'success'
        } else {
          this.status = 'fail'
          this.$message.error('交易无效')
        }
      } else if (res.status === 0) {
        this.$message.error('红包口令错误')
      }
      this.loading = false
    },
    async bindLogin(init) {
      this.loading = true
      const provider = await Sea.bindLogin()
      if (provider) {
        this.provider = provider
        if (init) {
          this.init()
        }
      } else {
        this.$message.warning('登录不成功')
      }
      this.loading = false
    },
  },
}
</script>
<style lang="stylus">
#page-gift {
  margin: 0 auto;
  max-width: 475px;
  position: relative;
  background: #F35543;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  .email {
    position: absolute;
    top: 16px;
    text-align: center;
    color: #f88d6e;
  }

  .top-bg {
    width: 100%;
  }

  .success, .fail {
    color: #ffe2b0;
    letter-spacing: 6px;
    padding-left: 6px;
    font-size: 20px;
    text-align: center;

    .t1 {
      margin-top: 107px;
    }

    .t2 {
      margin-top: 28px;
      margin-bottom: 106px;
    }
  }

  .balance {
    img {
      width: 83px;
      height: 83px;
    }

    text-align: center;
    color: #000;
  }

  .get {
    .t1, .t2 {
      color: #fff;
      font-size: 28px;
      font-weight: bold;
      text-align: center;
    }

    .t1 {
      margin-top: 49px;
    }

    .t2 {
      margin-top: 16px;
    }

    .password {
      margin: 49px 56px 96px;

      .el-input__inner {
        text-align: center;
      }
    }

    .receive-box {
      display: flex;
      justify-content: center;

      .receive {
        cursor: pointer;
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 154px;
        height: 59px;
        border: 2px solid #FFE2B0;
        border-radius: 2px;
        color: #FFE2B0;
        background: transparent;
        font-size: 18px;
      }

      .receive:active {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
