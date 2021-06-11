<template>
  <el-dialog
    :visible.sync="showDialog"
    :show-close="false"
    fullscreen
    class="dialog-select"
    :modal="false"
  >
    <div id="create-select">
      <back stop @click="showDialog = false" />
      <div class="page-title">选择您要赠送的 NFT</div>
      <main>
        <div class="search">
          <el-input
            v-model="filter"
            placeholder="搜索 NFT 名称 / 创作者"
            clearable
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <div v-if="nftList.length === 0" v-loading="loading" class="not-found">
          <img src="~/assets/img/not_found.svg" />
          <div>你的资产宝箱里空空如也</div>
        </div>
        <div v-else class="nft-list">
          <template v-for="(e, i) in nftListFilter">
            <div :key="i" class="nft">
              <div class="nft-info">
                <el-image
                  class="nft-image"
                  :src="e.renderer"
                  alt="bg_image_url"
                  fit="cover"
                  lazy
                />
                <div class="info">
                  <div class="name">
                    {{ e.name }}
                  </div>
                  <div class="user">
                    <div class="user-name">
                      {{ e.issuerName }}
                    </div>
                  </div>
                </div>
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
            </div>
          </template>
        </div>
      </main>
      <transition name="el-zoom-in-bottom">
        <div class="check-box" :class="{ checked: showCheckBox }">
          <div class="has">总计 {{ nftChecked.length }} 个</div>
          <div class="ok" @click="bindRight">选好了</div>
        </div>
      </transition>
      <mine-asset :show.sync="showAsset" :nft="nftItem" />
      <mine-gift
        :show.sync="showGift"
        :nfts="nftChecked"
        :provider="provider"
      />
    </div>
  </el-dialog>
</template>
<script>
import MineGift from '~/components/mine-gift.vue'
import MineAsset from '~/components/mine-asset.vue'

export default {
  components: {
    MineAsset,
    MineGift,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filter: '',
      loading: false,
      nftItem: {
        children: [],
      },
      nftChecked: [],
      nftList: [],
      tokenList: [],
      activeList: [],
      provider: null,
      showCheckBox: false,
      showAsset: false,
      showGift: false,
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
    nftListFilter() {
      const filter = this.filter.toLowerCase()
      return this.nftList.filter((nft) => {
        const name = nft.name.toLowerCase()
        const issuerName = nft.issuerName.toLowerCase()
        if (name.includes(filter)) {
          return true
        } else if (issuerName.includes(filter)) {
          return true
        } else {
          return false
        }
      })
    },
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
    bindRight() {
      this.showDialog = false
      this.$emit('select', this.nftList, this.nftChecked)
    },
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
.dialog-select {
  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 0;
  }
}

#create-select {
  .page-title {
    margin-top: 8px;
    font-size: 16px;
    text-align: center;
    color: rgba(16, 16, 16, 100);
    height: 35px;
    line-height: 35px;
  }

  >main {
    .search {
      padding: 6px 11px;
      background: #F6F6F6;
    }

    .nft-list {
      border: 0;
      margin-bottom: 50px;

      .nft {
        .nft-info {
          width: 100%;
          padding: 16px 8px 16px 22px;
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
            margin-top: 4px;
            margin-left: 10px;

            .name {
              color: rgba(16, 16, 16, 100);
              font-size: 16px;
              line-height: 16px;
              font-weight: bold;
            }

            .user {
              margin-top: 5px;
              display: flex;
              align-items: center;

              .user-name {
                font-size: 14px;
                color: #aaa;
              }
            }
          }
        }

        .nft-box {
          display: flex;
          flex-wrap: wrap;
          margin: 0 22px;
          border-bottom: 1px solid #f4f4f4;

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
            background: #F35543;

            .el-checkbox__input.is-checked + .el-checkbox__label {
              color: #FFF;
            }
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
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 46px;
    text-align: center;
    color: #fff;

    .has {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 29%;
      background: #AAA0A0;
    }

    .ok {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      background: #FFA1A1;
    }
  }

  .check-box.checked {
    .has {
      background: #9b8888;
    }

    .ok {
      background: #F35543;
    }
  }
}
</style>
