<template>
  <el-dialog
    :visible.sync="showDialog"
    class="dialog-gift"
    title="创建 NFT 红包"
    width="90%"
    top="5vh"
  >
    <div id="mine-gift">
      <div class="gift-title">塞 NFT 进红包</div>
      <div class="nfts">
        <div v-for="(e, i) in list" :key="i" class="nft">
          <template v-if="e.children && e.children.length">
            <div class="nft-title">
              <div class="title">{{ e.name }}</div>
              <i class="el-icon-close" @click="e.children = []"></i>
            </div>
            <div class="nft-box">
              <el-tag
                v-for="(nft, i2) in e.children"
                :key="nft.tokenId"
                class="nft-one"
                closable
                @close="e.children.splice(i2, 1)"
              >
                #{{ nft.tokenId }}
              </el-tag>
            </div>
          </template>
        </div>
      </div>
      <div class="total">总计：{{ total }} 个</div>
      <div class="passowrd">
        <div class="title">红包口令</div>
        <el-input
          v-model="redPassword"
          class="input"
          placeholder="抢NFT红包，玩加密新社交"
        ></el-input>
        <div class="tip">注：每个红包一个地址仅可领取一次</div>
      </div>
      <div class="button">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="total === 0"
          :loading="loading"
          @click="bindNext"
        >
          下一步
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    show: Boolean,
    nfts: {
      type: Array,
      default: () => {
        return []
      },
    },
    provider: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      list: [],
      redPassword: '',
      loading: false,
    }
  },
  computed: {
    showDialog: {
      get() {
        return this.$props.show
      },
      set(val) {
        this.$emit('update:show', val)
      },
    },
    total() {
      let n = 0
      for (const item of this.list) {
        n += item.children.length
      }
      return n
    },
    password() {
      return this.redPassword || 'unipass'
    },
  },
  watch: {
    showDialog(nv) {
      if (nv === true) {
        this.init()
      }
    },
  },
  methods: {
    init() {
      this.list = this.$parent.initList(this.nfts)
    },
    async bindNext() {
      this.loading = true
      const nfts = []
      for (const item of this.list) {
        nfts.push(...item.children)
      }
      const sign = await Sea.bindSign({
        nfts,
        password: this.password,
        address: this.provider._address.addressString,
      })
      if (sign.authorization) {
        const res = await Sea.Ajax({
          url: '/nft',
          method: 'post',
          data: sign,
        })
        if (res.short) {
          this.showDialog = false
          this.$router.push(`/share/${res.short}?p=${this.password}`)
        } else {
          this.$message.error('请求失败')
        }
      }
      this.loading = false
    },
  },
}
</script>
<style lang="stylus">
#mine-gift {
  .gift-title {
    font-size: 16px;
  }

  .nfts {
    margin-top: 8px;
    border-top: 1px dashed #bbb;
    border-bottom: 1px dashed #bbb;
    padding: 10px 0;
    max-height: 32vh;
    overflow-y: auto;

    .nft {
      padding-top: 6px;

      .nft-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 400;
        font-size: 16px;
        color: #101010;

        .el-icon-close {
          cursor: pointer;
          margin: 0 6px;
          padding: 2px;
        }

        .el-icon-close:hover {
          background: var(--primary);
          border-radius: 50%;
          color: #fff;
        }
      }

      .nft-box {
        margin-top: 14px;
        margin-bottom: 6px;
        display: flex;
        flex-wrap: wrap;

        .nft-one {
          margin-right: 14px;
          margin-bottom: 8px;
        }
      }
    }

    .nft + .nft {
      border-top: 1px solid #f4f4f4;
    }
  }

  .total {
    margin-top: 16px;
    font-size: 16px;
  }

  .passowrd {
    .title {
      margin-top: 32px;
      font-size: 16px;
    }

    .input {
      margin-top: 4px;
    }

    .tip {
      margin-top: 4px;
    }
  }

  .button {
    margin-top: 23px;
    display: flex;
    justify-content: space-between;

    .el-button {
      width: 48%;
    }
  }
}
</style>
