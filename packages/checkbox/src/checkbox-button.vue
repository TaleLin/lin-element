<template>
  <label
    class="el-checkbox-button"
      :class="[
        size ? 'el-checkbox-button--' + size : '',
        { 'is-disabled': isDisabled },
        { 'is-checked': isChecked },
        { 'is-focus': focus },
      ]"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    >
    <input
      v-if="trueLabel || falseLabel"
      class="el-checkbox-button__original"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
      :true-value="trueLabel"
      :false-value="falseLabel"
      v-model="model"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false">
    <input
      v-else
      class="el-checkbox-button__original"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
      :value="label"
      v-model="model"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false">

    <span class="el-checkbox-button__inner"
      v-if="$slots.default || label"
      :style="isChecked ? activeStyle : null">
      <slot>{{label}}</slot>
    </span>

  </label>
</template>
<script>
  import { useCheckbox, useCheckboxGroup } from './useCheckbox';
  import { computed } from 'vue';

  export default {
    name: 'ElCheckboxButton',

    emits: ['update:modelValue', 'change'],

    props: {
      modelValue: {},
      label: {},
      disabled: Boolean,
      checked: Boolean,
      name: String,
      trueLabel: [String, Number],
      falseLabel: [String, Number]
    },
    setup(props) {
      const {
        focus,
        isChecked,
        isDisabled,
        size,
        model,
        handleChange } = useCheckbox(props);
      const { checkboxGroup } = useCheckboxGroup();

      const activeStyle = computed(() => {
        return {
          backgroundColor: checkboxGroup.fill.value || '',
          borderColor: checkboxGroup.fill.value || '',
          color: checkboxGroup.textColor.value || '',
          boxShadow: '-1px 0 0 0 ' + checkboxGroup.fill.value || ''
        };
      });
  
      return {
        size,
        focus,
        model,
        isChecked,
        isDisabled,
        activeStyle,
        handleChange
      };
    }

  };
</script>
