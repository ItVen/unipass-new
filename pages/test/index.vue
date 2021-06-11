<template>
  <div>
    <br />
    <div>
      <input v-model="packetNumber" type="text" placeholder="packetNumber" />
    </div>
    <br />
    <div>
      <input v-model="nftNumber" type="text" placeholder="nftNumber" />
    </div>
    <br />
    <button @click="test">test</button>
    <div>
      {{
        `packetNumber is ${packetNumber} nftNumber is ${nftNumber} test result is`
      }}
    </div>

    <div>
      {{ packeData }}
    </div>
  </div>
</template>

<script>
import { getPacketRandomList } from 'assets/js/nft/utils'
export default {
  data() {
    return {
      packetNumber: '',
      nftNumber: '',
      packeData: [],
    }
  },

  methods: {
    test() {
      console.log(this.nftNumber < this.packetNumber)
      // if (parseInt(this.nftNumber) < parseInt(this.packetNumber)) return
      const ntfDatas = []
      for (let i = 0; i < this.nftNumber; i++) {
        ntfDatas[i] = i + ''
      }
      this.packeData = getPacketRandomList(this.packetNumber, ntfDatas)
    },
  },
}
</script>
