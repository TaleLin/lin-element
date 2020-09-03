<template>
  <div>
        <el-tooltip content="Top center" placement="right"><el-button>123</el-button></el-tooltip>
  </div>
</template>
<script>
export default {
  data() {
    return {
        ok: false
    }
  },
  methods: {
    click() {
      this.ok = !this.ok
    }
  }
}
</script>