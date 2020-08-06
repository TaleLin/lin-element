<template>
  <el-row class="demo-avatar demo-basic">
    <el-row>
      <el-col :span="12">
        <div class="sub-title">circle</div>
        <div class="demo-basic--circle">
          <el-avatar :size="50" :src="circleUrl"></el-avatar>
          <el-avatar v-for="size in sizeList" :key="size" :size="size" :src="circleUrl"></el-avatar>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="sub-title">square</div>
        <div class="demo-basic--circle">
          <el-avatar shape="square" :size="size" :src="squareUrl"></el-avatar>
          <el-avatar
            v-for="size in sizeList"
            :key="size"
            shape="square"
            :size="size"
            :src="squareUrl"
            fit="scale-down"
          ></el-avatar>
        </div>
      </el-col>
    </el-row>
    <div class="demo-type">
      <el-avatar icon="el-icon-user-solid"></el-avatar>
      <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
      <el-avatar>user</el-avatar>
    </div>
  </el-row>
</template>
<script>
import { ref } from 'vue'
export default {
  setup() {
    let circleUrl = ref("https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png");
    let squareUrl = ref("https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png");
    let sizeList = ref(["large", "medium", "small"]);

    return {
      circleUrl,
      squareUrl,
      sizeList
    }
  }
}
</script>

