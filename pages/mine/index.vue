<template>
  <div id="page-mine">
    <header>
      <img src="~/assets/img/logo.png" alt="logo" class="logo" />
      <div class="account">{{ account }}</div>
      <img
        src="~/assets/img/exit_to_app.svg"
        alt="exit"
        class="exit"
        @click="bindExit"
      />
    </header>
    <main>
      <div class="nft-title">
        <div class="title">NFT 资产</div>
        <router-link to="/record">
          <img class="icon" src="~/assets/img/ze-orders.svg" />
        </router-link>
      </div>
      <div v-if="nftList.length === 0" v-loading="loading" class="not-found">
        <img src="~/assets/img/not_found.svg" />
        <div>你的资产宝箱里空空如也</div>
      </div>
      <el-collapse v-else v-model="activeList" class="nft-list">
        <template v-for="(e, i) in nftList">
          <el-collapse-item :key="i" :class="{ checked: e.checked.length > 0 }">
            <template slot="title">
              <div :key="i" class="nft">
                <div class="left" @click.stop="bindNFT(e)">
                  <el-image
                    class="nft-image"
                    :src="e.renderer"
                    alt="bg_image_url"
                    fit="contain"
                    lazy
                  />
                  <div class="info">
                    <div class="name">
                      {{ e.name }}
                    </div>
                    <div class="user">
                      <el-image
                        class="user-avator"
                        :src="e.issuerAvatarUrl"
                        alt="user-avator"
                        fit="cover"
                        lazy
                      >
                        <template #error>
                          <div class="el-image__error" />
                        </template>
                      </el-image>
                      <div class="user-name">
                        {{ e.issuerName }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="right">
                  <div class="total">
                    {{ e.children && e.children.length }}
                  </div>
                  <div class="state" :class="e.txState">
                    {{ stateDict[e.txState] }}
                  </div>
                </div>
              </div>
            </template>
            <div class="nft-all">
              <el-checkbox
                v-model="e.checkAll"
                :indeterminate="e.isIndeterminate"
                @change="bindCheckAll($event, i)"
              >
                全选
              </el-checkbox>
            </div>
            <div class="nft-box">
              <el-checkbox-group
                v-model="e.checked"
                @change="bindCheckChange($event, i)"
              >
                <el-checkbox
                  v-for="nft in e.children"
                  :key="nft.tokenId"
                  class="nft-one"
                  :label="nft.tokenId"
                >
                  #{{ nft.tokenId }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-collapse-item>
        </template>
      </el-collapse>
    </main>
    <transition name="el-zoom-in-bottom">
      <div v-show="showCheckBox" class="check-box">
        <el-button class="gift" @click="showGift = true">发红包</el-button>
        <i class="el-icon-close" @click="bindCheckBoxClose"></i>
      </div>
    </transition>
    <mine-asset :show.sync="showAsset" :nft="nftItem" />
    <mine-gift :show.sync="showGift" :nfts="nftChecked" :provider="provider" />
  </div>
</template>
<script>
import MineGift from '~/components/mine-gift.vue'
import MineAsset from '~/components/mine-asset.vue'

export default {
  components: {
    MineAsset,
    MineGift,
  },
  data() {
    return {
      loading: false,
      nftItem: {
        children: [],
      },
      nftChecked: [],
      nftList: [],
      tokenList: [],
      activeList: [],
      stateDict: {
        pending: '接收中',
        submitting: '确认中',
        committed: '',
      },
      provider: null,
      showCheckBox: false,
      showAsset: false,
      showGift: false,
    }
  },
  computed: {
    account() {
      if (this.provider) {
        return this.provider._email
      }
      return ''
    },
  },
  mounted() {
    const provider = Sea.checkLogin()
    if (provider) {
      this.provider = provider
      this.init()
    } else {
      this.$router.replace('/')
    }
  },
  methods: {
    bindCheckBoxClose() {
      this.$confirm('退出后将清空当前的选择记录', '确定退出？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      })
        .then(() => {
          for (let i = 0; i < this.nftList.length; i++) {
            this.nftList[i].checked = []
            this.nftList[i].isIndeterminate = false
            this.nftList[i].checkAll = false
          }
          this.activeList = []
          this.checkList()
        })
        .catch(() => {})
    },
    async init() {
      // first page
      this.loading = true
      const res = await Sea.Ajax({
        url: '/ckb',
        data: {
          address: this.provider._address.addressString,
        },
      })
      this.loading = false
      if (Array.isArray(res)) {
        this.nftList = this.initList(res)
      }
    },
    initList(res) {
      const tokenList = res
      const list = Sea.set(tokenList, 'classTypeArgs')
      const arr = []
      for (const token of list) {
        const children = tokenList
          .filter(
            (e) => e.classTypeArgs && e.classTypeArgs === token.classTypeArgs,
          )
          .sort((a, b) => {
            return a.tokenId - b.tokenId
          })
        arr.push({
          ...token,
          children,
          isIndeterminate: false,
          checkAll: false,
          checked: [],
        })
      }
      return arr
    },
    bindNFT(nft) {
      this.nftItem = nft
      this.showAsset = true
    },
    bindExit() {
      Sea.localStorage('provider', '')
      this.$router.replace('/')
    },
    bindCheckAll(checkAll, i) {
      const all = this.nftList[i].children.map((e) => e.tokenId)
      this.nftList[i].checked = checkAll ? all : []
      // checkAll
      this.nftList[i].checkAll = checkAll
      // isIndeterminate
      this.nftList[i].isIndeterminate = false
      // checkList
      this.checkList()
    },
    bindCheckChange(value, i) {
      const l = value.length
      const all = this.nftList[i].children.length
      // checkAll
      this.nftList[i].checkAll = l === all
      // isIndeterminate
      this.nftList[i].isIndeterminate = l > 0 && l < all
      // checkList
      this.checkList()
    },
    checkList() {
      const list = this.nftList
      const checked = []
      for (const item of list) {
        for (const e of item.children) {
          if (item.checked.includes(e.tokenId)) {
            checked.push(e)
          }
        }
      }
      this.showCheckBox = checked.length > 0
      this.nftChecked = checked
    },
  },
}
</script>

<style lang="stylus">
#page-mine {
  >header {
    display: flex;
    align-items: center;
    background: var(--primary);
    padding: 7px 36px;
    margin: 10px;
    border-radius: 4px;

    .logo {
      width: 46px;
      height: 46px;
      user-select: none;
    }

    .account {
      margin-left: 12px;
      color: #fff;
    }

    .exit {
      cursor: pointer;
      margin-left: auto;
      width: 24px;
      height: 24px;
    }
  }

  >main {
    .nft-title {
      display: flex;
      padding: 16px 22px 8px;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
      }

      .icon {
        cursor: pointer;
        height: 20px;
        width: 20px;
      }
    }

    .nft-list {
      border: 0;
      margin-bottom: 80px;

      .checked {
        .el-collapse-item__header {
          border-bottom-color: var(--primary);
        }
      }

      .el-collapse-item__header {
        height: 100%;
        line-height: 100%;
        cursor: auto;
        border-bottom: 1px solid #F4F4F4;
        padding-right: 12px;
      }

      .el-collapse-item__wrap {
        border: 0;
      }

      .el-collapse-item__content {
        padding: 0;
      }

      .el-collapse-item__arrow {
        color: #c5c5c5;
        font-weight: bold;
      }

      .nft {
        width: 100%;
        padding: 16px 8px 16px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        >.left {
          cursor: pointer;
          display: flex;
          align-items: center;
          margin-right: 6px;

          .nft-image {
            background: #eee;
            height: 50px;
            width: 50px;
            flex-shrink: 0;
            box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.24);
            border-radius: 4px;
            overflow: hidden;
          }

          .info {
            margin-left: 10px;

            .name {
              color: rgba(16, 16, 16, 100);
              font-size: 16px;
              line-height: 16px;
            }

            .user {
              margin-top: 5px;
              display: flex;
              align-items: center;

              .user-avator {
                width: 18px;
                height: 18px;
                border-radius: 2px;
                flex-shrink: 0;
              }

              .user-name {
                font-size: 14px;
                margin-left: 6px;
                color: #aaa;
              }
            }
          }
        }

        .right {
          display: flex;
          align-items: center;

          .total {
            font-size: 18px;
            font-weight: 500;
          }

          .state {
            border-radius: 4px;
            color: white;
            padding: 2px 4px;
            margin-left: 8px;
          }

          .state.committed {
            padding: 0;
          }

          .state.pending {
            background: var(--primary);
          }

          .state.submitting {
            background: var(--success);
          }
        }
      }

      .nft-all {
        padding: 8px 22px 0;
        display: flex;
        justify-content: flex-end;
      }

      .nft-box {
        display: flex;
        flex-wrap: wrap;
        padding: 0 22px;

        .nft-one {
          margin-bottom: 14px;
          border-radius: 5px;
          background: #E6E6E6;
          margin-right: 24px;
          width: 50px;
          height: 26px;
          line-height: 26px;
          text-align: center;

          .el-checkbox__input {
            display: none;
          }

          .el-checkbox__label {
            padding-left: 0;
          }
        }

        .nft-one.is-checked {
          background: var(--primary);

          .el-checkbox__input.is-checked + .el-checkbox__label {
            color: #FFF;
          }
        }
      }
    }

    .not-found {
      text-align: center;
      font-weight: 300;
      font-size: 16px;
      margin: 10px;
    }
  }

  .check-box {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 35px 35px 0px 0px;
    box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.24);
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;

    .gift {
      border-color: #FFE2B0;
      color: #FFE2B0;
      background: #F35543;
    }

    .el-icon-close {
      cursor: pointer;
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 20px;
    }
  }

  .dialog-asset {
    .el-dialog__header {
      padding: 0;
    }

    .el-dialog__body {
      padding: 0;
    }
  }
}
</style>
