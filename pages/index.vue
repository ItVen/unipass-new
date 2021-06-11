<template>
  <div id="page-index">
    <div class="title">NFT Gift</div>
    <img class="illustration" src="~/assets/img/dolphins_in_the_ocean.svg" />
    <el-button
      class="connect"
      type="primary"
      round
      :loading="loading"
      @click="bindLogin"
    >
      连接 Unipass
    </el-button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: true,
      address: '',
      email: '',
    }
  },
  created() {
    this.address = this.$route.query.address
    this.email = this.$route.query.email
    console.log(this.address, this.$route.query)
    if (this.address) {
      Sea.SaveDataByUrl(this.address, this.email)
      this.$router.push('/create')
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      if (this.address) {
        this.$router.replace('/create')
      } else {
        const provider = Sea.checkLogin()
        if (provider) {
          this.$router.replace('/create')
        }
      }
      this.loading = false
    },
    async bindLogin() {
      this.loading = true
      const provider = await Sea.bindLogin()
      if (provider) {
        this.$router.push('/create')
      } else {
        this.$message.replace('登录不成功')
      }
      this.loading = false
    },
  },
}
</script>
<style lang="stylus">
#page-index {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding-top: 58px;
  padding-bottom: 100px;
  margin: 0 40px;

  .title {
    font-weight: 300;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .index-illustration {
    width: 80vw;
  }

  .connect {
    margin-top: 20px;
    width: 100%;
  }
}
</style>
