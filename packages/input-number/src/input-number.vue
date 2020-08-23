<template>
<div @dragstart.prevent :class="[
      'el-input-number',
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]">
    <span
      class="el-input-number__decrease"
      role="button"
      v-if="controls"
      :class="{'is-disabled': minDisabled}"
      v-repeat-click="decrease"
      @keydown.enter="decrease">
      <i :class="`el-icon-${controlsAtRight ? 'arrow-down' : 'minus'}`"></i>
    </span>
    <span
      class="el-input-number__increase"
      role="button"
      v-if="controls"
      v-repeat-click="increase"
      :class="{'is-disabled': maxDisabled}"
      @keydown.enter="increase">
      <i :class="`el-icon-${controlsAtRight ? 'arrow-up' : 'plus'}`"></i>
    </span>
    <el-input
      ref="input"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize">
    </el-input>
</div>
</template>

<script>
import {
  computed, getCurrentInstance, inject, ref, reactive
} from 'vue';
import ElInput from 'element-ui/packages/input';
import RepeatClick from 'element-ui/src/directives/repeat-click';

export default {
  name: 'ElInputNumber',
  components: {
    ElInput
  },
  props: {
    size: String,
    disabled: Boolean,
    controls: {
      type: Boolean,
      default: true
    },
    controlsPosition: {
      type: String,
      default: ''
    },
    min: {
      type: Number,
      default: -Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    value: {},
    precision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10);
      }
    }
  },
  directives: {
    repeatClick: RepeatClick
  },
  setup(props, ctx) {
    const elForm = inject('elForm', '');
    const elFormItem = inject('elFormItem', '');
    const instance = getCurrentInstance();
    let currentValue = ref(0);
    let userInput = reactive({});
    const _decrease = (val, step) => {
      if (typeof val !== 'number' && val !== undefined) return currentValue;
      const precisionFactor = Math.pow(10, numPrecision);
      return toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
    };
    const toPrecision = (num, precision) => {
      if (precision === undefined) precision = numPrecision;
      return parseFloat(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
    };
    const decrease = () => {
      if (inputNumberDisabled || minDisabled) return;
      const value = props.value || 0;
      const newVal = _decrease(value, props.step);
      setCurrentValue(newVal);
    };
    const setCurrentValue = (newVal) => {
      const oldVal = currentValue.value;
      if (typeof newVal === 'number' && props.precision !== undefined) {
        newVal = props.toPrecision(newVal, props.precision);
      }
      if (newVal >= props.max) newVal = props.max;
      if (newVal <= props.min) newVal = props.min;
      if (oldVal === newVal) return;
      userInput = null;
      ctx.emit('input', newVal);
      ctx.emit('change', newVal, oldVal);
      currentValue.value = newVal;
    };
    let _elFormItemSize = computed(() => {
      return (elFormItem || {}).elFormItemSize;
    });
    const numPrecision = computed(() => {

      // const { value, step, getPrecision, precision } = this;
      const stepPrecision = getPrecision(props.step);
      if (props.precision !== undefined) {
        if (stepPrecision > props.precision) {
          console.warn('[Element Warn][InputNumber]precision should not be less than the decimal places of step');
        }
        return props.precision;
      } else {
        return Math.max(getPrecision(props.value), stepPrecision);
      }
    });
    const getPrecision = (value) => {
      if (value === undefined) return 0;
      const valueString = value.toString();
      const dotPosition = valueString.indexOf('.');
      let precision = 0;
      if (dotPosition !== -1) {
        precision = valueString.length - dotPosition - 1;
      }
      return precision;
    };
    const inputNumberSize = computed(() => {
      return props.size || _elFormItemSize.value || (instance.proxy.$ELEMENT || {}).size;
    });
    const inputNumberDisabled = computed(() => {
      return props.disabled || !!(elForm || {}).disabled;
    });
    // TODO: 这个属性文档中没有提到
    const controlsAtRight = computed(() => {
      return props.controls && props.controlsPosition === 'right';
    });
    const minDisabled = computed(() => {
      return _decrease(props.value, props.step) < props.min;
    });
    const maxDisabled = computed(() => {
      return _increase(props.value, props.step) > props.max;
    });
    const _increase = (val, step) => {
      if (typeof val !== 'number' && val !== undefined) return currentValue;
      const precisionFactor = Math.pow(10, numPrecision);
      // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
      return toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
    };
    const increase = () => {
      if (inputNumberDisabled || maxDisabled) return;
      const value = props.value || 0;
      const newVal = _increase(value, this.step);
      setCurrentValue(newVal);
    };
    return {
      inputNumberSize,
      inputNumberDisabled,
      controlsAtRight,
      minDisabled,
      maxDisabled,
      increase,
      decrease,
      userInput
    };
  }
};
</script>
