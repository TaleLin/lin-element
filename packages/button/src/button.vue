<template>
  <button
    class="el-button"
    :disabled="buttonDisabled || loading"
    :autofocus="autofocus"
    :type="nativeType"
    :class="[
      type ? 'el-button--' + type : '',
      buttonSize ? 'el-button--' + buttonSize : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]"
  >
    <i class="el-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>
<script>
  import { inject, computed } from 'vue';
  import { useELEMENT } from '../../../src/index';

  export default {
    name: 'ElButton',

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      type: {
        type: String,
        default: 'default'
      },
      size: String,
      icon: {
        type: String,
        default: ''
      },
      nativeType: {
        type: String,
        default: 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean,
      round: Boolean,
      circle: Boolean
    },

    setup(props, ctx) {
      const ELEMENT = useELEMENT();
      const elForm = inject('elForm', '');
      const elFormItem = inject('elFormItem', '');

      const _elFormItemSize = computed(() => {
        return (elFormItem || {}).elFormItemSize;
      });
      const buttonSize = computed(() => {
        return props.size || _elFormItemSize.value || (ELEMENT || {}).size;
      });
      const buttonDisabled = computed(() => {
        return props.disabled || (elForm || {}).disabled;
      });

      return {
        buttonSize,
        buttonDisabled
      };
    }

  };
</script>
