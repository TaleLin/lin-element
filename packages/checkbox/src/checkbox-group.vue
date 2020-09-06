<template>
  <div class="el-checkbox-group" role="group" aria-label="checkbox-group">
    <slot></slot>
  </div>
</template>


<script>
  import { computed, watch, provide, nextTick, toRefs } from 'vue';
  import { useCheckboxGroup } from './useCheckbox';
  export default {
    name: 'ElCheckboxGroup',

    componentName: 'ElCheckboxGroup',

    props: {
      modelValue: {},
      disabled: Boolean,
      min: Number,
      max: Number,
      size: String,
      fill: String,
      textColor: String
    },
    emits: ['update:modelValue', 'change'],
    setup(props, ctx) {
      const { elFormItemSize } = useCheckboxGroup();
  
      const checkboxGroupSize = computed(
        () => props.size || elFormItemSize.value || (ctx.$ELEMENT || {})
      );

      const changeEvent = value => {
        ctx.emit('update:modelValue', value);
        nextTick(() => {
          ctx.emit('change', value);
        });
      };

      const modelValue = computed({
        get() {
          return props.modelValue;
        },
        set(val) {
          changeEvent(val);
        }
      });

      provide('CheckboxGroup', {
        name: 'ElCheckboxGroup',
        modelValue,
        ...toRefs(props),
        checkboxGroupSize,
        changeEvent
      });

      watch(() => props.modelValue, val => {
        // TODO
        // elFormItem.changeEvent(val);
      });
    }
  };
</script>

