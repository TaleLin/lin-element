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
      :modelValue="displayValue"
      :placeholder="placeholder"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :max="max"
      :min="min"
      :name="name"
      :label="label"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @change="handleInputChange">
    </el-input>
</div>
</template>

<script>
import {
  computed, getCurrentInstance, inject, ref, reactive, watch
} from 'vue';
import ElInput from 'element-ui/packages/input';
import RepeatClick from 'element-ui/src/directives/repeat-click';

export default {
  name: 'ElInputNumber',
  components: {
    ElInput
  },
  props: {
    step: {
      type: Number,
      default: 1
    },
    stepStrictly: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: -Infinity
    },
    modelValue: {},
    disabled: Boolean,
    size: String,
    controls: {
      type: Boolean,
      default: true
    },
    controlsPosition: {
      type: String,
      default: ''
    },
    name: String,
    label: String,
    placeholder: String,
    precision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10);
      }
    },
    onChange: {
      type: Function
    },
    onInput: {
      type: Function
    }
  },
  directives: {
    repeatClick: RepeatClick
  },
  setup(props, ctx) {
    const elForm = inject('elForm', {});
    const elFormItem = inject('elFormItem', {});
    const instance = getCurrentInstance();
    let currentValue = ref(0);
    let userInputObj = reactive({'userInput': null});
    const _decrease = (val, step) => {
      if (typeof val !== 'number' && val !== undefined) return currentValue;
      const precisionFactor = Math.pow(10, numPrecision.value);
      return toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
    };
    const toPrecision = (num, precision) => {
      if (precision === undefined) precision = numPrecision.value;
      return parseFloat(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
    };
    const decrease = () => {
      if (inputNumberDisabled.value || minDisabled.value) return;
      const value = props.modelValue || 0;
      const newVal = _decrease(value, props.step);
      setCurrentValue(newVal);
    };
    const setCurrentValue = (newVal) => {
      const oldVal = currentValue.value;
      if (typeof newVal === 'number' && props.precision !== undefined) {
        newVal = toPrecision(newVal, props.precision);
      }
      if (newVal >= props.max) newVal = props.max;
      if (newVal <= props.min) newVal = props.min;
      if (oldVal === newVal) return;
      userInputObj.userInput = null;
      ctx.emit('update:modelValue', newVal);
      ctx.emit('input', newVal);
      ctx.emit('change', newVal, oldVal);
      currentValue.value = newVal;
    };
    let displayValue = computed(() => {
      if (userInputObj.userInput !== null) {
        return userInputObj.userInput;
      }
      let Value = currentValue.value;
      if (typeof Value === 'number') {
        if (props.stepStrictly) {
          const stepPrecision = getPrecision(props.step);
          const precisionFactor = Math.pow(10, stepPrecision);
          Value = Math.round(Value / props.step) * precisionFactor * props.step / precisionFactor;
        }
        if (props.precision !== undefined) {
          Value = Value.toFixed(props.precision);
        }
      }
      return Value;
    });
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
      return _decrease(props.modelValue, props.step) < props.min;
    });
    const maxDisabled = computed(() => {
      return _increase(props.modelValue, props.step) > props.max;
    });
    const _increase = (val, step) => {
      if (typeof val !== 'number' && val !== undefined) return currentValue;
      const precisionFactor = Math.pow(10, numPrecision.value);
      // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
      return toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
    };
    const increase = () => {
      if (inputNumberDisabled.value || maxDisabled.value) return;
      const value = props.modelValue || 0;
      const newVal = _increase(value, props.step);
      setCurrentValue(newVal);
    };
    const useModelWrapper = (props, name = 'modelValue') => {
      return computed({
        get: () => props[name],
        set: (value) => ctx.emit(`update:${name}`, value)
      });
    };
    const value = useModelWrapper(props, 'modelValue');
    watch(value, (value) => {
      let newVal = value === undefined ? value : Number(value);
      if (newVal !== undefined) {
        if (isNaN(newVal)) {
          return;
        }
        if (props.stepStrictly) {
          const stepPrecision = getPrecision(props.step);
          const precisionFactor = Math.pow(10, stepPrecision);
          newVal = Math.round(newVal / props.step) * precisionFactor * props.step / precisionFactor;
        }

        if (props.precision !== undefined) {
          newVal = toPrecision(newVal, props.precision);
        }
      }
      if (newVal >= props.max) newVal = props.max;
      if (newVal <= props.min) newVal = props.min;
      currentValue.value = newVal;
      userInputObj.userInput = null;
      ctx.emit('input', value);
    }, {immediate: true});
    const handleInput = (value) => {
      ctx.emit('input', value);
      userInputObj.userInput = value;
    };
    const handleBlur = (event) => {
      ctx.emit('blur', event);
    };
    const handleFocus = (event) => {
      ctx.emit('focus', event);
    };
    const handleInputChange = (value) => {
      const newVal = value === '' ? undefined : Number(value);
      if (!isNaN(newVal) || value === '') {
        setCurrentValue(newVal);
      }
      userInputObj.userInput = null;
    };
    return {
      inputNumberSize,
      inputNumberDisabled,
      controlsAtRight,
      minDisabled,
      maxDisabled,
      increase,
      decrease,
      userInputObj,
      displayValue,
      handleInput,
      handleBlur,
      handleFocus,
      handleInputChange
    };
  }
};
</script>