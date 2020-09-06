import {
  ref,
  computed,
  inject,
  getCurrentInstance,
  watch
} from 'vue';

export const useCheckboxGroup = () => {
  const elForm = inject('elForm', {});
  const elFormItem = inject('elFormItem', {});
  const checkboxGroup = inject('CheckboxGroup', {});

  const isGroup = computed(
    () => checkboxGroup && checkboxGroup.name === 'ElCheckboxGroup'
  );
  const elFormItemSize = computed(() => {
    return elFormItem.elFormItemSize;
  });
  return {
    isGroup,
    checkboxGroup,
    elForm,
    elFormItem,
    elFormItemSize
  };
};

const useModel = (props) => {
  let selfModel = false;
  const isLimitExceeded = ref(false);
  const { emit } = getCurrentInstance();
  const { isGroup, checkboxGroup } = useCheckboxGroup();
  const store = computed(
    () => checkboxGroup ? checkboxGroup.modelValue.value : props.modelValue
  );
  const model = computed({
    get() {
      return isGroup.value
        ? store.value : props.modelValue !== undefined
          ? props.modelValue : selfModel;
    },

    set(val) {
      if (isGroup.value && Array.isArray(val)) {
        isLimitExceeded.value = false;

        if (checkboxGroup.min !== undefined && val.length < checkboxGroup.min.value) {
          isLimitExceeded.value = true;
        }
        if (checkboxGroup.max !== undefined && val.length > checkboxGroup.max.value) {
          isLimitExceeded.value = true;
        }

        isLimitExceeded.value === false && checkboxGroup.changeEvent(val);
      } else {
        emit('update:modelValue', val);
        selfModel = val;
      }
    }
  });

  return {
    model,
    isLimitExceeded
  };
};

const useCheckboxStatus = (props, ctx) => {
  const focus = ref(false);
  const { model } = useModel(props);
  const { isGroup, checkboxGroup, elFormItemSize } = useCheckboxGroup();

  const size = computed(
    () => checkboxGroup.checkboxGroupSize.value || elFormItemSize.value || (ctx.$ELEMENT || {}).size
  );
  const isChecked = computed(() => {
    const value = model.value;
    if (typeof value === 'boolean') {
      return value;
    } else if (Array.isArray(value)) {
      return value.includes(props.label);
    } else if (value !== null && value !== undefined) {
      return value === props.trueLabel;
    }
  });
  const checkboxSize = computed(() => {
    const temCheckboxSize = props.size || elFormItemSize.value || (ctx.$ELEMENT || {}).size;
    return isGroup.value
      ? checkboxGroup.checkboxGroupSize.value || temCheckboxSize
      : temCheckboxSize;
  });

  return {
    size,
    focus,
    isChecked,
    checkboxSize
  };
};

const useDisabled = (props, ctx) => {
  const { model } = useModel(props);
  const { isChecked } = useCheckboxStatus(props, ctx);
  const { isGroup, checkboxGroup } = useCheckboxGroup();
  const isLimitDisabled = computed(() => {
    const max = checkboxGroup.max ? checkboxGroup.max.value : '';
    const min = checkboxGroup.min ? checkboxGroup.min.value : '';
    return !!(max || min) && (model.value.length >= max && !isChecked.value) ||
      (model.value.length <= min && isChecked.value);
  });
  // TODO: form disable
  const isDisabled = computed(() => {
    return isGroup.value
      ? checkboxGroup.disabled.value || props.disabled || isLimitDisabled.value
      : props.disabled;
  });

  return {
    isDisabled,
    isLimitDisabled
  };
};

const setStoreValue = (props) => {
  const { model } = useModel(props);
  function addToStore() {
    if (
      Array.isArray(model.value) &&
      !model.value.includes(props.label)
    ) {
      model.value.push(props.label);
    } else {
      model.value = props.trueLabel || true;
    }
  }
  props.checked && addToStore();
};

const useEvent = (props) => {
  const {isLimitExceeded } = useModel(props);
  const { emit } = getCurrentInstance();
  // const { elFormItem } = useCheckboxGroup();
  function handleChange(e) {
    if (isLimitExceeded.value) return;
    const target = e.target;
    const value = target.checked
      ? props.trueLabel || true
      : props.falseLabel || false;

    emit('change', value, e);
  }

  watch(() => props.modelValue, val => {
    // TODO
    // elFormItem.changeEvent(val);
  });

  return {
    handleChange
  };
};

export const useCheckbox = (props, ctx) => {
  const { model } = useModel(props);
  const { handleChange } = useEvent(props);
  const { isDisabled } = useDisabled(props, ctx);
  const { focus, size, isChecked, checkboxSize } = useCheckboxStatus(props, ctx);

  setStoreValue(props);

  return {
    size,
    focus,
    model,
    isChecked,
    isDisabled,
    checkboxSize,
    handleChange
  };
};
