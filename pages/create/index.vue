<template>
  <div id="page-create">
    <back>
      <router-link to="/record">红包记录</router-link>
    </back>
    <img class="bg" src="~/assets/img/bg.png" alt="backgorund" />
    <main>
      <div class="title">NFT 红包</div>
      <div class="subtitle">抢 NFT 红包，玩加密新社交</div>
      <div
        v-if="nfts.length > 0"
        class="box checked"
        @click="showSelect = true"
      >
        <div class="top">
          <img src="~/assets/img/create_giftcard.svg" alt="create_giftcard" />
          <div class="text">
            <div class="t1">选择 NFT</div>
            <div class="t2">好友打开红包，即可领 NFT</div>
          </div>
          <i class="el-icon-arrow-right"></i>
        </div>
        <div class="nft-list">
          <template v-for="(e, i) in nfts">
            <div v-if="e.checked.length" :key="i" class="nft">
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
                <el-checkbox-group v-model="e.checked">
                  <template v-for="nft in e.children">
                    <el-checkbox
                      v-if="e.checked.includes(nft.tokenId)"
                      :key="nft.tokenId"
                      class="nft-one"
                      :label="nft.tokenId"
                    >
                      #{{ nft.tokenId }}
                    </el-checkbox>
                  </template>
                </el-checkbox-group>
              </div>
            </div>
          </template>
        </div>
        <div class="nft-total">NFT总计：{{ nftChecked.length }} 个</div>
      </div>
      <div v-else class="box select" @click="showSelect = true">
        <img src="~/assets/img/create_giftcard.svg" alt="create_giftcard" />
        <div class="text">
          <div class="t1">选择 NFT</div>
          <div class="t2">好友打开红包，即可领 NFT</div>
        </div>
        <i class="el-icon-arrow-right"></i>
      </div>
      <div class="box number">
        <div class="left">
          <span>红包个数</span>
        </div>
        <div class="right">
          <input
            ref="number"
            v-model="number"
            type="tel"
            placeholder="填写个数"
            @input="bindNumber"
            @focus="$refs.number.select()"
            @blur="bindNumberBlur"
          />
          <span>个</span>
        </div>
      </div>
      <div class="box password">
        <span>红包口令</span>
        <input
          ref="password"
          v-model="password"
          type="text"
          placeholder="恭喜发财"
          @focus="$refs.password.select()"
        />
        <div class="tip">对方输入口令，即可领取红包</div>
      </div>
      <el-button class="btn-create" @click="bindCreate">
        生成 NFT 红包
      </el-button>
    </main>
    <create-select :show.sync="showSelect" @select="bindSelect" />
  </div>
</template>
<script>
import CreateSelect from '~/components/create-select.vue'
export default {
  components: { CreateSelect },
  data() {
    return {
      number: '',
      password: '',
      showSelect: false,
      nfts: [],
      nftChecked: [],
    }
  },
  methods: {
    bindNumber(event) {
      this.number = event.target.value.replace(/[^\d]/g, '')
    },
    bindNumberBlur(event) {
      const v = Number(event.target.value)
      const l = this.nftChecked.length
      if (v > l) {
        this.number = l
        this.$message.warning('不能超过 NFT 总数')
      }
    },
    bindSelect(nfts, checked) {
      this.nfts = Sea.deepCopy(nfts)
      this.nftChecked = Sea.deepCopy(checked)
    },
    bindCreate() {
      if (this.nftChecked <= 0) {
        this.$message('请选择 NFT')
        this.showSelect = true
        return
      }
      if (!this.number) {
        this.$message('请填写红包个数')
        this.$refs.number.focus()
        return
      }
      if (!this.password) {
        this.$message('请填写红包口令')
        this.$refs.password.focus()
        return
      }
      this.bindNext()
    },
    async bindNext() {
      console.log('[create-bindNext] start')
      const nfts = this.nftChecked
      const provider = await Sea.bindLogin()
      const sign = await Sea.bindSign({
        nfts,
        password: this.password,
        address: provider._address.addressString,
        redPackeNumber: this.number,
      })
      console.log('[create-bindNext] sign', sign)
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
    },
  },
}
</script>

<style lang="stylus">
#page-create {
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }

  >main {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 43px 10px 0;

    .title {
      margin-top: 10px;
      color: rgba(255, 189, 132, 1);
      font-size: 20px;
      font-weight: bold;
    }

    .subtitle {
      margin-top: 21px;
      color: rgba(255, 189, 132, 0.68);
      font-size: 16px;
    }

    .box {
      width: 100%;
      line-height: 20px;
      background: rgba(255, 255, 255, 0.84);
      border-radius: 10px;
      color: rgba(16, 16, 16, 1);
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.44);
      border: 1px solid rgba(255, 255, 255, 1);
      display: flex;
      align-items: center;
      font-size: 16px;
    }

    .box.select {
      background: rgba(255, 255, 255, 0.94);
      cursor: pointer;
      padding: 16px 8px;
      margin-top: 23px;

      .text {
        margin-left: 5px;

        .t1 {
          color: rgba(16, 16, 16, 1);
          font-size: 18px;
        }

        .t2 {
          margin-top: 7px;
          left: 63px;
          color: #AAA0A0;
          font-size: 12px;
        }
      }

      .el-icon-arrow-right {
        margin-left: auto;
        color: #000;
        font-size: 20px;
      }
    }

    .box.checked {
      background: rgba(255, 255, 255, 0.94);
      cursor: pointer;
      padding: 16px 8px;
      margin-top: 23px;
      flex-direction: column;

      .top {
        width: 100%;
        display: flex;

        img {
          width: 28px;
          height: 28px;
        }

        .text {
          margin-top: 4px;
          margin-left: 5px;

          .t1 {
            color: rgba(16, 16, 16, 1);
            font-size: 18px;
          }

          .t2 {
            margin-top: 7px;
            left: 63px;
            color: #AAA0A0;
            font-size: 12px;
          }
        }

        .el-icon-arrow-right {
          margin-top: 4px;
          margin-left: auto;
          color: #000;
          font-size: 20px;
        }
      }

      .nft-list {
        width: 100%;
        border: 0;

        .nft {
          .nft-info {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 16px 0;
            cursor: pointer;
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

      .nft-total {
        margin-top: 10px;
        align-self: flex-end;
        color: #F35543;
        font-size: 14px;
      }
    }

    .box.number {
      padding: 14px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      padding-bottom: 14px;
      margin-top: 11px;

      input {
        background: transparent;
        border: 0;
        outline: 0;
        text-align: right;
        font-size: 16px;
      }
    }

    .box.password {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: column;
      padding: 14px 12px;
      margin-top: 31px;

      span {
        align-self: flex-start;
      }

      input {
        margin: 12px 0;
        border: 0;
        outline: rgba(255, 189, 132, 1);
        width: 100%;
        height: 38px;
        border-radius: 4px;
        background-color: rgba(255, 189, 132, 0.24);
        text-align: center;
        color: rgba(210, 123, 48, 1);
        font-size: 16px;
      }

      /* Chrome/Opera/Safari */
      input::-webkit-input-placeholder {
        color: rgba(210, 123, 48, 0.6);
      }

      /* Firefox 19+ */
      input::-moz-placeholder {
        color: rgba(210, 123, 48, 0.6);
      }

      /* IE 10+ */
      input:-ms-input-placeholder {
        color: rgba(210, 123, 48, 0.6);
      }

      /* Firefox 18- */
      input:-moz-placeholder {
        color: rgba(210, 123, 48, 0.6);
      }

      .tip {
        font-size: 12px;
      }
    }

    .btn-create {
      margin: 31px 0;
      width: 173px;
      height: 40px;
      border-radius: 30px;
      background-color: rgba(255, 189, 132, 0.94);
      color: #ff4333;
      border: 1px solid rgba(255, 189, 132, 1);
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.44);
      font-weight: bold;
    }

    .btn-create:hover {
      background-color: rgba(255, 189, 132, 0.84);
    }

    .btn-create:active {
      background-color: rgba(255, 189, 132, 1);
    }
  }
}
</style>
