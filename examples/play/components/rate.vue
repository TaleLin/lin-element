<template>
  <div>
    <div class="block">
      <span class="demonstration">默认不区分颜色</span>
      <el-rate v-model="state.value1"></el-rate>
    </div>
    <div class="block">
      <span class="demonstration">区分颜色</span>
      <el-rate
        v-model="state.value2"
        :colors="state.colors">
      </el-rate>
    </div>

    <div class="block">
      <span class="demonstration">用辅助文字直接地表达对应分数</span>
      <el-rate
        v-model="state.value3"
        show-text>
      </el-rate>
    </div>
    <div class="block">
      <span class="demonstration">其它 icon</span>
      <el-rate
        v-model="state.value4"
        :icon-classes="state.iconClasses"
        void-icon-class="el-icon-eleme"
        :colors="['#99A9BF', '#F7BA2A', '#FF9900']">
      </el-rate>
    </div>

    <div class="block">
      <span class="demonstration">只读</span>
      <el-rate
        v-model="state.value5"
        disabled
        show-score
        text-color="#ff9900"
        score-template="{modelValue}">
      </el-rate>
    </div>
  </div>

</template>

<script>
import { reactive, ref } from 'vue'
export default {
  setup() {
    const state = reactive({
      value1: 2,
      value2: 0,
      value3: 0,
      value4: 0,
      value5: 3.6,
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      iconClasses: ['el-icon-delete', 'el-icon-edit', 'el-icon-share'] 
    })

    return {
      state
    }
  }
}
</script>

<style>

</style>