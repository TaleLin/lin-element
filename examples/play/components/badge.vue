<template>
    <el-badge :value="12" class="item">
        <el-button size="small">评论</el-button>
    </el-badge>
    <el-badge :value="3" class="item">
        <el-button size="small">回复</el-button>
    </el-badge>
    <el-badge :value="1" class="item" type="primary">
        <el-button size="small">评论</el-button>
    </el-badge>
    <el-badge :value="2" class="item" type="warning">
        <el-button size="small">回复</el-button>
    </el-badge>

    <el-badge :value="200" :max="99" class="item">
        <el-button size="small">评论</el-button>
    </el-badge>
    <el-badge :value="100" :max="10" class="item">
        <el-button size="small">回复</el-button>
    </el-badge>

    <el-badge value="new" class="item">
        <el-button size="small">评论</el-button>
    </el-badge>
    <el-badge value="hot" class="item">
        <el-button size="small">回复</el-button>
    </el-badge>
</template>

<script>
  export default {
    name: 'badge'
  };
</script>

<style scoped>
    .item {
        margin-top: 10px;
        margin-right: 40px;
    }
</style>
