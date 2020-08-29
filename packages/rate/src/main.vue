<template>
  <div
    class="el-rate"
    @keydown="handleKey"
    role="slider"
    :aria-valuenow="currentValue"
    :aria-valuetext="text"
    aria-valuemin="0"
    :aria-valuemax="max"
    tabindex="0">
    <span
      v-for="(item, key) in max"
      class="el-rate__item"
      @mousemove="setCurrentValue(item, $event)"
      @mouseleave="resetCurrentValue"
      @click="selectValue(item)"
      :style="{ cursor: rateDisabled ? 'auto' : 'pointer' }"
      :key="key">
      <i
        :class="[classes[item - 1], { 'hover': hoverIndex === item }]"
        class="el-rate__icon"
        :style="getIconStyle(item)">
        <i
          v-if="showDecimalIcon(item)"
          :class="decimalIconClass"
          :style="decimalStyle"
          class="el-rate__decimal">
        </i>
      </i>
    </span>
    <span v-if="showText || showScore" class="el-rate__text" :style="{ color: textColor }">{{ text }}</span>
  </div>
</template>

<script>
  import { hasClass } from 'element-ui/src/utils/dom';
  import { isObject } from 'element-ui/src/utils/types';
  import { inject, reactive, computed, watch } from 'vue';

  export default {
    name: 'ElRate',

    inject: {
      elForm: {
        default: ''
      }
    },

    props: {
      modelValue: {
        type: Number,
        default: 0
      },
      lowThreshold: {
        type: Number,
        default: 2
      },
      highThreshold: {
        type: Number,
        default: 4
      },
      max: {
        type: Number,
        default: 5
      },
      colors: {
        type: [Array, Object],
        default() {
          return ['#F7BA2A', '#F7BA2A', '#F7BA2A'];
        }
      },
      voidColor: {
        type: String,
        default: '#C6D1DE'
      },
      disabledVoidColor: {
        type: String,
        default: '#EFF2F7'
      },
      iconClasses: {
        type: [Array, Object],
        default() {
          return ['el-icon-star-on', 'el-icon-star-on', 'el-icon-star-on'];
        }
      },
      voidIconClass: {
        type: String,
        default: 'el-icon-star-off'
      },
      disabledVoidIconClass: {
        type: String,
        default: 'el-icon-star-on'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      allowHalf: {
        type: Boolean,
        default: false
      },
      showText: {
        type: Boolean,
        default: false
      },
      showScore: {
        type: Boolean,
        default: false
      },
      textColor: {
        type: String,
        default: '#1f2d3d'
      },
      texts: {
        type: Array,
        default() {
          return ['极差', '失望', '一般', '满意', '惊喜'];
        }
      },
      scoreTemplate: {
        type: String,
        default: '{modelValue}'
      }
    },
    setup(props, ctx) {

      if (!props.modelValue) {
        ctx.emit('update:modelValue', 0);
      }

      const elForm = inject('elForm', '');

      const state = reactive({
        pointerAtLeftHalf: true,
        currentValue: props.modelValue,
        hoverIndex: -1
      });
      const text = computed(() => {
        let result = '';
        if (props.showScore) {
          result = props.scoreTemplate.replace(/\{\s*modelValue\s*\}/, rateDisabled.value
            ? props.modelValue
            : state.currentValue);
        } else if (props.showText) {
          result = props.texts[Math.ceil(state.currentValue) - 1];
        }
        return result;
      });

      const rateDisabled = computed(() => {
        return !!(props.disabled || (elForm || {}).disabled);
      });

      const valueDecimal = computed(() => {
        return props.modelValue * 100 - Math.floor(props.modelValue) * 100;
      });
      const decimalStyle = computed(() => {
        let width = '';
        if (rateDisabled.value) {
          width = `${ valueDecimal.value }%`;
        } else if (props.allowHalf) {
          width = '50%';
        }
        return {
          color: activeColor.value,
          width
        };
      });

      const activeColor = computed(() => {
        return getValueFromMap(state.currentValue, colorMap.value);
      });

      const colorMap = computed(() => {
        return Array.isArray(props.colors)
          ? {
            [props.lowThreshold]: props.colors[0],
            [props.highThreshold]: { value: props.colors[1], excluded: true },
            [props.max]: props.colors[2]
          } : props.colors;
      });

      const classMap = computed(() => {
        return Array.isArray(props.iconClasses)
          ? {
            [props.lowThreshold]: props.iconClasses[0],
            [props.highThreshold]: { value: props.iconClasses[1], excluded: true },
            [props.max]: props.iconClasses[2]
          } : props.iconClasses;
      });

      const decimalIconClass = computed(() => {
        return getValueFromMap(props.modelValue, classMap.value);
      });

      const voidClass = computed(() => {
        return rateDisabled.value ? props.disabledVoidIconClass : props.voidIconClass;
      });

      const activeClass = computed(() => {
        return getValueFromMap(state.currentValue, classMap.value);
      });

      const classes = computed(() => {
        let result = [];
        let i = 0;
        let threshold = state.currentValue;
        if (props.allowHalf && state.currentValue !== Math.floor(state.currentValue)) {
          threshold--;
        }
        for (; i < threshold; i++) {
          result.push(activeClass.value);
        }
        for (; i < props.max; i++) {
          result.push(voidClass.value);
        }
        return result;
      });

      const getValueFromMap = (value, map) => {
        const matchedKeys = Object.keys(map)
          .filter(key => {
            const val = map[key];
            const excluded = isObject(val) ? val.excluded : false;
            return excluded ? value < key : value <= key;
          })
          .sort((a, b) => a - b);
        const matchedValue = map[matchedKeys[0]];
        return isObject(matchedValue) ? matchedValue.value : (matchedValue || '');
      };

      const getIconStyle = (item) => {
        const voidColor = rateDisabled.value ? props.disabledVoidColor : props.voidColor;
        return {
          color: item <= state.currentValue ? activeColor.value : voidColor
        };
      };

      const showDecimalIcon = (item) => {
        let showWhenDisabled = rateDisabled.value && valueDecimal.value > 0 && item - 1 < props.modelValue && item > props.modelValue;
        /* istanbul ignore next */
        let showWhenAllowHalf = props.allowHalf &&
          state.pointerAtLeftHalf &&
          item - 0.5 <= props.currentValue &&
          item > props.currentValue;
        return showWhenDisabled || showWhenAllowHalf;
      };

      const selectValue = (value) => {
        if (rateDisabled.value) {
          return;
        }
        if (props.allowHalf && state.pointerAtLeftHalf) {
          ctx.emit('update:modelValue', state.currentValue);
          ctx.emit('change', state.currentValue);
        } else {
          ctx.emit('update:modelValue', value);
          ctx.emit('change', value);
        }
      };

      const handleKey = (e) => {
        if (rateDisabled.value) {
          return;
        }
        let currentValue = state.currentValue;
        const keyCode = e.keyCode;
        if (keyCode === 38 || keyCode === 39) { // left / down
          if (props.allowHalf) {
            currentValue += 0.5;
          } else {
            currentValue += 1;
          }
          e.stopPropagation();
          e.preventDefault();
        } else if (keyCode === 37 || keyCode === 40) {
          if (props.allowHalf) {
            currentValue -= 0.5;
          } else {
            currentValue -= 1;
          }
          e.stopPropagation();
          e.preventDefault();
        }
        currentValue = currentValue < 0 ? 0 : currentValue;
        currentValue = currentValue > props.max ? props.max : currentValue;

        ctx.emit('update:modelValue', currentValue);
        ctx.emit('change', currentValue);
      };

      const setCurrentValue = (value, event) =>{
        if (rateDisabled.value) {
          return;
        }
        /* istanbul ignore if */
        if (props.allowHalf) {
          let target = event.target;
          if (hasClass(target, 'el-rate__item')) {
            target = target.querySelector('.el-rate__icon');
          }
          if (hasClass(target, 'el-rate__decimal')) {
            target = target.parentNode;
          }
          state.pointerAtLeftHalf = event.offsetX * 2 <= target.clientWidth;
          state.currentValue = state.pointerAtLeftHalf ? value - 0.5 : value;
        } else {
          state.currentValue = value;
        }
        state.hoverIndex = value;
      };

      const resetCurrentValue = () => {
        if (rateDisabled.value) {
          return;
        }
        if (props.allowHalf) {
          state.pointerAtLeftHalf = props.modelValue !== Math.floor(props.modelValue);
        }
        state.currentValue = props.modelValue;
        state.hoverIndex = -1;
      };

      watch(() => props.modelValue, () => {
        state.currentValue = props.modelValue;
        state.pointerAtLeftHalf = props.modelValue !== Math.floor(props.modelValue);
      });

      return {
        ...state,
        text,
        rateDisabled,
        decimalStyle,
        decimalIconClass,
        classes,
        getIconStyle,
        showDecimalIcon,
        selectValue,
        handleKey,
        setCurrentValue,
        resetCurrentValue
      };
    }

  };
</script>
