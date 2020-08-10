<template>
<div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    inputSize ? 'el-input--' + inputSize : '',
    {
      'is-disabled': inputDisabled,
      'is-exceed': inputExceed,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--append': $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'el-input--prefix': $slots.prefix || prefixIcon,
      'el-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword
    }
    ]" @mouseenter="hovering = true" @mouseleave="hovering = false">
  <template v-if="type !== 'textarea'">
    <!-- 前置元素 -->
    <div class="el-input-group__prepend" v-if="$slots.prepend">
      <slot name="prepend"></slot>
    </div>
    <input :tabindex="tabindex" v-if="type !== 'textarea'" class="el-input__inner"  :type="showPassword ? (passwordVisible ? 'text': 'password') : type" :disabled="inputDisabled" :readonly="readonly" v-bind="$attrs" :autocomplete=" 
    
    autocomplete" ref="input" @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate" @compositionend="handleCompositionEnd" @input="handleInput" @focus="handleFocus" @blur="handleBlur" @change="handleChange" :aria-label="label">
    <!-- 前置内容 -->
    <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
      <slot name="prefix"></slot>
      <i class="el-input__icon" v-if="prefixIcon" :class="prefixIcon">
      </i>
    </span>
    <!-- 后置内容 -->
    <span class="el-input__suffix" v-if="getSuffixVisible()">
      <span class="el-input__suffix-inner">
        <template v-if="!showClear || !showPwdVisible || !isWordLimitVisible">
          <slot name="suffix"></slot>
          <i class="el-input__icon" v-if="suffixIcon" :class="suffixIcon">
          </i>
        </template>
        <i v-if="showClear" class="el-input__icon el-icon-circle-close el-input__clear" @mousedown.prevent @click="clear"></i>
        <i v-if="showPwdVisible" class="el-input__icon el-icon-view el-input__clear" @click="handlePasswordVisible"></i>
        <span v-if="isWordLimitVisible" class="el-input__count">
          <span class="el-input__count-inner">
            {{ textLength }}/{{ upperLimit }}
          </span>
        </span>
      </span>
      <i class="el-input__icon" v-if="validateState" :class="['el-input__validateIcon', validateIcon]">
      </i>
    </span>
    <!-- 后置元素 -->
    <div class="el-input-group__append" v-if="$slots.append">
      <slot name="append"></slot>
    </div>
  </template>
  <textarea v-else :tabindex="tabindex" class="el-textarea__inner" @compositionstart="handleCompositionStart" @compositionupdate="handleCompositionUpdate" @compositionend="handleCompositionEnd" @input="handleInput" ref="textarea" v-bind="$attrs" :disabled="inputDisabled" :readonly="readonly" :autocomplete=" autocomplete" :style="textareaStyle" @focus="handleFocus" @blur="handleBlur" @change="handleChange" :aria-label="label">
    </textarea>
  <span v-if="isWordLimitVisible && type === 'textarea'" class="el-input__count">{{ textLength }}/{{ upperLimit }}</span>
</div>
</template>

<script>
import { reactive, ref, computed, inject, watch, nextTick, getCurrentInstance, onMounted } from 'vue';
import mitt from '../../../src/mixins/emitter';
import merge from '../../../src/utils/merge';
import calcTextareaHeight from './calcTextareaHeight';
export default {
  name: 'ElInput',
  componentName: 'ElInput',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number],
    size: String,
    resize: String,
    form: String,
    disabled: Boolean,
    readonly: Boolean,
    type: {
      type: String,
      default: 'text'
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    validateEvent: {
      type: Boolean,
      default: true
    },
    suffixIcon: String,
    prefixIcon: String,
    label: String,
    clearable: {
      type: Boolean,
      default: false
    },
    showPassword: {
      type: Boolean,
      default: false
    },
    showWordLimit: {
      type: Boolean,
      default: false
    },
    tabindex: String,
    onChange: {
      type: Function
    },
    onInput: {
      type: Function
    }
  },
  setup(props, ctx) {
    // const modelValue = useModelWrapper(props, 'modelValue');
    const elForm = inject('elForm', '');
    const elFormItem = inject('elFormItem', '');
    const instance = getCurrentInstance();
    let textareaCalcStyle = reactive({minHeight: '', height: ''});
    let hovering = ref(false);
    let focused = ref(false);
    let isComposing = ref(false);
    let passwordVisible = ref(false);
    let _elFormItemSize = computed(() => {
      return (elFormItem || {}).elFormItemSize;
    });
    let validateState = computed(() => {
      return elFormItem ? elFormItem.value.validateState : '';
    });
    let needStatusIcon = computed(() => {
      return elForm ? elForm.statusIcon : false;
    });
    let validateIcon = computed(() => {
      return {
        validating: 'el-icon-loading',
        success: 'el-icon-circle-check',
        error: 'el-icon-circle-close'
      }[validateState];
    });
    // FIXME: resize不传，会在 DOM 渲染 Object
    let textareaStyle = computed(() => {
      return merge({}, textareaCalcStyle, { resize: props.resize });
    });
    let inputSize = computed(() => {
      return props.size || _elFormItemSize.value || (instance.proxy.$ELEMENT || {}).size;
    });
    const inputDisabled = computed(() => {
      return props.disabled || (elForm || {}).disabled;
    });
    const nativeInputValue = computed(() => {
      return props.modelValue === null || props.modelValue === undefined ? '' : String(props.modelValue);
    });
    const showClear = computed(() => {
      return props.clearable &&
      !inputDisabled.value &&
      !props.readonly &&
      nativeInputValue.value &&
      (focused.value || hovering.value);
    });
    const getSuffixVisible = () => {
      return ctx.slots.suffix ||
          props.suffixIcon ||
          showClear.value ||
          props.showPassword ||
          isWordLimitVisible.value;
    };
    const clear = () => {
      ctx.emit('update:modelValue', '');
      ctx.emit('input', '');
      ctx.emit('change', '');
      ctx.emit('clear');
    };
    const showPwdVisible = computed(() => {
      return props.showPassword &&
      !inputDisabled.value &&
      !props.readonly &&
      (!!nativeInputValue.value || focused);
    });
    const isWordLimitVisible = computed(() => {
      return props.showWordLimit &&
          ctx.attrs.maxlength &&
          (props.type === 'text' || props.type === 'textarea') &&
          !props.inputDisabled &&
          !props.readonly &&
          !props.showPassword;
    });
    const textLength = computed(() => {
      if (typeof props.modelValue === 'number') {
        return String(props.modelValue).length;
      }
      return (props.modelValue || '').length;
    });
    const upperLimit = computed(() => {
      return ctx.attrs.maxlength;
    });
    const inputExceed = computed(() => {
      return isWordLimitVisible &&
      (textLength > upperLimit);
    });
    const select = () => {
      getInput().select();
    };
    mitt.emit('inputSelect', select);
    const handleInput = (event) => {
      if (isComposing.value) return;
      ctx.emit('update:modelValue', event.target.value);
      ctx.emit('input', event.target.value);
      nextTick(setNativeInputValue);
    };
    const handleFocus = (event) => {
      focused.value = true;
      ctx.emit('focus', event);
    };
    const handleBlur = (event) => {
      focused.value = false;
      ctx.emit('blur', event);
      if (props.validateEvent) {
        mitt.emit('el.form.blur', props.modelValue);
      }
    };
    const handlePasswordVisible = () => {
      passwordVisible.value = !passwordVisible.value;
      focus();
    };
    const getInput = () => {
      return instance.refs.input || instance.refs.textarea;
    };
    const focus = () => {
      getInput().focus();
    };
    const setNativeInputValue = () => {
      const input = getInput();
      if (!input) return;
      if (input.value === nativeInputValue.value) return;
      input.value = nativeInputValue.value;
    };
    const handleChange = (event) => {
      ctx.emit('change', event.target.value);
      ctx.emit('update:modelValue', event.target.value);
    };
    const calcIconOffset = (place) => {
      let elList = [].slice.call(instance.ctx.$el.querySelectorAll(`.el-input__${place}`) || []);
      if (!elList.length) return;
      let el = null;
      for (let i = 0; i < elList.length; i++) {
        if (elList[i].parentNode === instance.ctx.$el) {
          el = elList[i];
          break;
        }
      }
      if (!el) return;
      const pendantMap = {
        suffix: 'append',
        prefix: 'prepend'
      };

      const pendant = pendantMap[place];
      if (ctx.slots[pendant]) {
        el.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${instance.ctx.$el.querySelector(`.el-input-group__${pendant}`).offsetWidth}px)`;
      } else {
        el.removeAttribute('style');
      }
    };
    const updateIconOffset = () => {
      calcIconOffset('prefix');
      calcIconOffset('suffix');
    };
    const resizeTextarea = () => {
      if (ctx.isServer) return;
      const { autosize, type } = props;
      if (type !== 'textarea') return;
      if (!props.autosize) {
        textareaCalcStyle.minHeight = calcTextareaHeight(instance.refs.textarea).minHeight;
        return;
      }
      const minRows = autosize.minRows;
      const maxRows = autosize.maxRows;
      const {minHeight, height} = calcTextareaHeight(instance.refs.textarea, minRows, maxRows);
      textareaCalcStyle.height = height;
      textareaCalcStyle.minHeight = minHeight;
    };
    // TODO: 抽离 useModelWrapper 函数
    const useModelWrapper = (props, name = 'modelValue') => {
      return computed({
        get: () => props[name],
        set: (value) => ctx.emit(`update:${name}`, value)
      });
    };
    const modelValue = useModelWrapper(props, 'modelValue');
    const type = useModelWrapper(props, 'type');
    watch(modelValue, (val) => {
      nextTick(resizeTextarea);
      if (props.validateEvent) {
        mitt.emit('el.form.change', [val]);
      }
    });
    watch(type, () => {
      setNativeInputValue();
      resizeTextarea();
      updateIconOffset();
    });
    onMounted(() => {
      setNativeInputValue();
      resizeTextarea();
      updateIconOffset();
    });
    watch(nativeInputValue, () => {
      setNativeInputValue();
    });
    return {
      textareaCalcStyle,
      hovering,
      focused,
      isComposing,
      passwordVisible,
      handleInput,
      getSuffixVisible,
      handleFocus,
      handleBlur,
      handleChange,
      inputSize,
      inputDisabled,
      inputExceed,
      isWordLimitVisible,
      needStatusIcon,
      validateIcon,
      textareaStyle,
      nativeInputValue,
      showClear,
      showPwdVisible,
      validateState,
      clear,
      handlePasswordVisible,
      textLength,
      upperLimit
    };
  }
};
</script>
