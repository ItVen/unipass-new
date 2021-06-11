<template>
  <div id="page-record">
    <back>
      <span v-if="activeList.length > 3" @click="activeList = []">
        全部折叠
      </span>
    </back>
    <div class="page-title">红包记录</div>
    <div v-if="records.length === 0" v-loading="loading" class="not-found">
      <img src="~/assets/img/not_found.svg" />
      <div>您还没有发出或接收过红包</div>
    </div>
    <el-collapse v-model="activeList" v-loading="loading" class="records">
      <el-collapse-item
        v-for="(e, i) in records"
        :key="i"
        :name="i"
        class="record"
        :class="e.direction"
      >
        <div slot="title" class="record-title">
          <template v-if="e.direction === 'in'">
            <img src="~/assets/img/record-in.svg" alt="in" />
            <div class="text">收到</div>
            <div class="red">{{ e.nftNum }} NFT</div>
          </template>
          <template v-else>
            <img src="~/assets/img/record-out.svg" alt="out" />
            <div class="text">发出</div>
            <div class="red">{{ e.packetNum }} 红包 {{ e.nftNum }} NFT</div>
          </template>
          <div class="date">
            {{ dayjs(e.createdAt).format('M月D日 HH:mm') }}
          </div>
          <div class="state">
            {{
              e.direction === 'in'
                ? statusDictSmall[e.status]
                : statusDictBig[e.status] || e.status
            }}
          </div>
        </div>
        <div class="record-box" :class="e.direction">
          <div class="status">
            <template v-if="e.direction === 'in'">
              <div class="left">
                <div class="line">
                  <span>
                    红包状态：<span class="black">{{
                      statusDictSmall[e.status]
                    }}</span>
                  </span>
                </div>
                <div class="line">
                  发起时间：<span>{{
                    dayjs(e.createdAt).format('YYYY年M月D日 HH:mm')
                  }}</span>
                </div>
              </div>
              <div class="right">
                <template v-if="e.status === 'committed'">
                  <div class="btn">
                    <el-button
                      size="mini"
                      icon="el-icon-search"
                      @click="bindOpen(e)"
                    >
                      浏览器中查看交易
                    </el-button>
                  </div>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="left">
                <div class="line">
                  <span>
                    红包状态：<span class="black">{{
                      statusDictBig[e.status]
                    }}</span>
                  </span>
                </div>
                <div
                  v-if="['create', 'pending'].includes(e.status)"
                  class="line"
                >
                  <span>
                    未被领取：<span class="red"
                      >{{ e.packetNum - e.picked }} 个红包
                    </span>
                  </span>
                </div>
                <div
                  v-if="['create', 'pending'].includes(e.status)"
                  class="line"
                >
                  <span>
                    已被领取：<span>{{ e.picked }} 个红包</span>
                  </span>
                </div>
                <div class="line">
                  发起时间：<span>{{
                    dayjs(e.createdAt).format('YYYY年M月D日 HH:mm')
                  }}</span>
                </div>
              </div>
              <div class="right">
                <template v-if="['create', 'pending'].includes(e.status)">
                  <div class="btn">
                    <el-button
                      size="mini"
                      icon="el-icon-share"
                      @click="bindShare(e)"
                    >
                      分享
                    </el-button>
                  </div>
                  <div class="btn">
                    <el-button
                      size="mini"
                      icon="el-icon-refresh-left"
                      @click="bindCancel(e)"
                    >
                      撤回
                    </el-button>
                  </div>
                </template>
              </div>
            </template>
          </div>

          <div v-if="e.packets" class="pactets">
            <div
              v-for="(packet, index) in e.packets"
              :key="index"
              class="packet"
            >
              <div class="nfts">
                <div v-for="nft in packet.nfts" :key="nft.tokenId" class="nft">
                  <img :src="nft.renderer" alt="renderer" />
                  <div class="nft-title" :title="nft.name">
                    {{ nft.name }}
                  </div>
                  <div class="token-id">#{{ nft.tokenId }}</div>
                </div>
              </div>
              <div
                class="packet-state"
                :class="{ red: packet.status === 'create' }"
              >
                {{ statusDictSmall[packet.status] }}
              </div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { AddressType, Address } from '@lay2/pw-core'
export default {
  components: {},
  data() {
    return {
      loading: false,
      address: '',
      records: [],
      activeList: [],
      statusDictBig: {
        create: '进行中',
        pending: '进行中',
        committed: '已完成',
        cancel: '已撤回',
      },
      statusDictSmall: {
        create: '未领取',
        init: '领取中',
        pending: '确认中',
        committed: '已领取',
        cancel: '已撤回',
        fail: '领取失败',
      },
    }
  },
  async mounted() {
    const provider = await Sea.bindLogin()
    if (provider) {
      this.address = provider._address.addressString
      this.$socket.emit('login', {
        type: 'address',
        value: new Address(this.address, AddressType.ckb).toLockScript().args,
      })
      this.init()
    } else {
      this.$router.replace('/')
    }
  },
  methods: {
    dayjs,
    bindOpen(e) {
      const packet = e.packets[0]
      const host = process.env.NERVOS_EXPLORER
      Sea.open(`${host}${packet.txHash}`)
    },
    async init(showLoading = true) {
      if (showLoading) this.loading = true
      const res = await Sea.Ajax({
        url: '/nft/history',
        method: 'post',
        data: {
          address: this.address,
          limit: 1000,
          page: 0,
        },
      })
      this.records = res
      if (showLoading) this.loading = false
    },
    bindShare(e) {
      this.$router.push(`/share/${e.short}`)
    },
    async bindCancel(e) {
      this.loading = true
      const packet = e.packets[0]
      const res = await Sea.Ajax({
        url: '/nft/cancel',
        method: 'post',
        data: {
          id: packet.packetId,
          fromAddress: this.address,
        },
      })
      if (res.success) {
        await this.init()
        this.$message.success('撤销成功')
      } else {
        this.loading = false
        this.$message.error('撤销失败')
      }
    },
  },
  sockets: {
    connect() {
      console.log('sockets', 'connect')
      // this.$socket.emit('login', {
      //   type: 'address',
      //   value: new Address(this.address, AddressType.ckb).toLockScript().args,
      // })
    },
    newBlock() {
      console.log('sockets-newBlock-')
      this.init(false)
    },
    newTx(data) {
      console.log('sockets-newTx-')
      this.init(false)
      setTimeout(() => {
        this.init(false)
      }, 10 * 1000)
      console.log(data)
    },
    disconnect() {
      console.log('sockets-disconnect：', '已经断开 socket 链接')
    },
    reconnect() {
      this.$socket.emit('connect')
    },
  },
}
</script>

<style lang="stylus">
#page-record {
  .page-title {
    margin-top: 8px;
    font-size: 16px;
    text-align: center;
    color: rgba(16, 16, 16, 100);
    height: 35px;
    line-height: 35px;
  }

  .not-found {
    text-align: center;
    font-weight: 300;
    font-size: 16px;
    margin: 10px;
  }

  .records {
    margin-top: 31px;
    margin-bottom: 31px;
    border: 0;

    .el-collapse-item__header {
      background: transparent;
      height: 40px;
      line-height: 40px;
      border: 0;
      padding-left: 14px;
    }

    .el-collapse-item__wrap {
      border: 0;
      background: transparent;
    }

    .el-collapse-item__content {
      padding: 0;
    }

    .el-collapse-item__arrow {
      color: #000;
      font-weight: bold;
      font-size: 18px;
    }

    .record {
      margin: 0 10px 10px;
      border-radius: 5px;
      color: rgba(16, 16, 16, 1);
      font-size: 16px;
      background-color: rgba(128, 128, 128, 0.09);

      .record-title {
        display: flex;
        align-items: center;
        width: 100%;
        color: #aaa;

        img {
          width: 16px;
          height: 16px;
        }

        .text {
          margin-left: 4px;
          color: rgba(16, 16, 16, 100);
          font-size: 16px;
          flex-shrink: 0;
        }

        .red {
          font-size: 14px;
          background: #FF8577;
          color: #fff;
          padding: 1px 8px;
          line-height: initial;
          border-radius: 4px;
          margin-left: 7px;
          flex-shrink: 0;
        }

        .date {
          margin-left: auto;
          flex-shrink: 0;
        }

        .state {
          min-width: 54px;
          margin-left: 6px;
          margin-right: 6px;
          color: #999;
        }
      }

      .record-box {
        margin-top: 8px;
        min-height: 20px;

        .red {
          color: #FF8577 !important;
        }

        .black {
          color: #000 !important;
        }

        .status {
          display: flex;
          width: 100%;
          justify-content: space-between;
          padding: 0 10px;
          color: #AAA;

          .left {
            .line {
              margin-bottom: 8px;
            }
          }

          .right {
            display: flex;
            flex-direction: column;

            .btn {
              margin-bottom: 4px;
            }
          }
        }

        .pactets {
          // border-top: 1px solid #e6e6e6;
          .packet {
            border-top: 1px solid #e6e6e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10px;

            .nfts {
              display: flex;
              flex-direction: column;
              margin-bottom: 8px;

              .nft {
                margin-top: 8px;
                display: flex;
                align-items: center;

                img {
                  width: 24px;
                  height: 24px;
                  border-radius: 4px;
                  object-fit: cover;
                }

                .nft-title {
                  width: 164px;
                  padding: 0 5px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }

                .token-id {
                  background: #E6E6E6;
                  min-width: 50px;
                  height: 24px;
                  text-align: center;
                  line-height: 24px;
                  border-radius: 5px;
                }
              }
            }

            .packet-state {
              color: #aaa;
            }
          }
        }
      }

      .record-box.in {
        .pactets {
          border: 0;
        }

        .packet {
          border: 0;
        }
      }
    }
  }
}
</style>
