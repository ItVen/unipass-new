<template>
  <el-dialog
    :visible.sync="showDialog"
    :show-close="false"
    fullscreen
    class="dialog-asset"
    :modal="false"
  >
    <div id="mine-asset">
      <back stop @click="showDialog = false" />
      <div class="image-box">
        <el-image :src="nft.renderer" fit="contain" alt="image" />
      </div>
      <div class="info-box">
        <div class="info">
          <header>
            <div class="name">{{ nft.name }}</div>
            <div class="description">{{ nft.description }}</div>
            <div class="user">
              <div class="user-name">
                <span>{{ nft.issuerName }}</span>
                <el-image
                  class="user-avator"
                  :src="nft.issuerAvatarUrl"
                  alt="user-avator"
                  fit="cover"
                >
                  <template #error>
                    <div class="el-image__error"></div>
                  </template>
                </el-image>
              </div>
              <div class="user-total">
                <div>拥有 {{ nft.children.length }}</div>
                <!-- <div>共有 {{ nft.total === 0 ? '无限' : nft.total }}</div>
                <div>已分发 {{ nft.issued }}</div>
                <div>当前 #{{ nft.tokenId }}</div> -->
              </div>
            </div>
          </header>
          <!-- <main>
          <el-button
            type="primary"
            icon="el-icon-shopping-bag-1"
            @click="bindHandsel"
          >
            赠送
          </el-button>
        </main> -->
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    show: Boolean,
    nft: {
      type: Object,
      default: () => {
        return {
          children: [],
        }
      },
    },
  },
  data() {
    return {}
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
  },
  methods: {
    bindHandsel() {},
  },
}
</script>
<style lang="stylus">
#mine-asset {
  background: #eee;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .image-box {
    display: flex;
    justify-content: center;
    height: 343px;
    align-items: center;

    .el-image {
      width: 300px;
      height: 300px;
      border-radius: 4px;
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.24);
      // will-change: transform;
      // transition: all 1000ms cubic-bezier(0.03, 0.98, 0.52, 0.99) 0s;
      // transform: perspective(1000px) rotateX(0deg) rotateY(15deg) scale3d(1, 1, 1);
    }
  }

  .info-box {
    flex: 1;
    display: flex;

    .info {
      background: rgb(250, 250, 250);
      width: 100%;
      border-radius: 25px 25px 0px 0px;
      box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.14);
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      >header {
        width: 100%;
        padding: 20px;

        .name {
          font-size: 18px;
        }

        .description {
          margin-top: 12px;
          font-size: 14px;
          line-height: 18px;
          color: #aaa;
          text-align: justify;
        }

        .user {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(0, 0, 0, 0.8);

          .user-name {
            display: flex;
            align-items: center;

            span {
              font-size: 14px;
            }

            img {
              margin-left: 4px;
              width: 18px;
              height: 18px;
            }
          }

          .user-total {
            text-align: right;
            font-size: 14px;
            color: #aaa;
          }
        }
      }

      >main {
        width: 100%;
        height: 20vh;
        background: white;
        border-radius: 35px 35px 0px 0px;
        box-shadow: 0px 0px 4px 2px rgba(0, 0, 0, 0.14);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .dialog-send {
    .i-have {
      text-align: right;
      margin-bottom: -30px;
    }

    .el-input-number {
      width: 100%;
    }
  }
}
</style>
