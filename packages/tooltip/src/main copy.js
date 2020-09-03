// import Popper from 'element-ui/src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';
import { addClass, removeClass, on, off } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';
import { createApp, h, ref, Transition, getCurrentInstance, watch, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import usePopper from 'element-ui/src/composables/popper';

export default {
  name: 'ElTooltip',

  // mixin: [Popper],

  props: {
    openDelay: {
      type: Number,
      default: 0
    },
    disabled: Boolean,
    manual: Boolean,
    effect: {
      type: String,
      default: 'dark'
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
    popperClass: String,
    content: String,
    visibleArrow: {
      default: true
    },
    transition: {
      type: String,
      default: 'el-fade-in-linear'
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false
        };
      }
    },
    enterable: {
      type: Boolean,
      default: true
    },
    hideAfter: {
      type: Number,
      default: 0
    },
    tabindex: {
      type: Number,
      default: 0
    }
  },

  setup(props, ctx) {
    const vm = getCurrentInstance();
    const tooltipId = ref(`el-tooltip-${generateId()}`);
    const timeoutPending = ref(null);
    const focusing = ref(false);
    const tooltip = document.createElement('div');
    let referenceElm;
    let disabled;
    let showPopper;
    let expectedState;
    let manual;
    let timeout;
    const { updatePopper } = usePopper(vm);

    tooltip.setAttribute('id', tooltipId.value);
    document.body.insertBefore(tooltip, document.getElementById('app'));
    let popperVM = createApp({
      data() {
        return {
          node: h('div', {}, '')
        };
      },
      render() {
        return this.node;
      }
    });
    const debounceClose = debounce(200, () => handleClosePopper());

    onMounted(() => {
      popperVM = popperVM.mount(`#${tooltipId.value}`);
      if (popperVM) {
        popperVM.node =
          h(Transition, {
            name: props.transition
            // onAfterLeave: this.doDestroy
          }, [
            h(
              'div',
              {
                onmouseenter: () => {
                  setExpectedState(false);
                  debounceClose();
                },
                onmouseleave: () => { setExpectedState(true); },
                ref: 'popperRef',
                class: ['el-tooltip__popper', 'is-' + props.effect, props.popperClass],
                role: 'tooltip',
                id: tooltipId.value,
                ariaHidden: disabled || !showPopper ? 'true' : 'false'
              },
              vm.slots.content || props.content
            )
          ]);
        vm.popperVM = popperVM;
      }

      referenceElm = vm.vnode.el;
      if (referenceElm) {
        referenceElm.setAttribute('aria-describedby', tooltipId.value);
        referenceElm.setAttribute('tabindex', props.tabindex);
        on(referenceElm, 'mouseenter', show);
        on(referenceElm, 'mouseleave', hide);
        on(referenceElm, 'focus', () => {
          // eslint-disable-next-line no-debugger
          debugger;
          if (!vm.slots.default || !vm.slots.default.length) {
            handleFocus();
            return;
          }
          const instance = vm.slots.default[0].componentInstance;
          if (instance && instance.focus) {
            instance.focus();
          } else {
            handleFocus();
          }
        });
        on(referenceElm, 'blur', handleBlur);
        on(referenceElm, 'click', removeFocusing);
      }
      // fix issue https://github.com/ElemeFE/element/issues/14424
      // if (this.value && this.popperVM) {
      //   this.popperVM.$nextTick(() => {
      //     if (this.value) {
      //       this.updatePopper();
      //     }
      //   });
      // }
      // eslint-disable-next-line no-debugger
      debugger;
      updatePopper();
    });

    function show() {
      setExpectedState(true);
      handleShowPopper();
    }

    function hide() {
      setExpectedState(false);
      debounceClose();
    }
    function handleFocus() {
      focusing.value = true;
      show();
    }
    function handleBlur() {
      focusing.value = false;
      hide();
    }
    function removeFocusing() {
      focusing.value = false;
    }

    function addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip';
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '');
      }
    }

    function handleShowPopper() {
      // eslint-disable-next-line no-debugger
      debugger;
      if (!expectedState || manual) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        showPopper = true;
      }, props.openDelay);

      if (props.hideAfter > 0) {
        timeoutPending.value = setTimeout(() => {
          showPopper = false;
        }, props.hideAfter);
      }
    }

    function handleClosePopper() {
      // this.enterable &&
      if (expectedState || manual) return;
      clearTimeout(timeout);

      if (timeoutPending.value) {
        clearTimeout(timeoutPending.value);
      }
      showPopper = false;

      if (disabled) {
        // doDestroy();
      }
    }

    function setExpectedState(state) {
      if (expectedState === false) {
        clearTimeout(timeoutPending.value);
      }
      expectedState = state;
    }

    function getFirstElement() {
      const slots = vm.slots.default();
      if (!Array.isArray(slots)) return null;
      let element = null;
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] && slots[index].shapeFlag) {
          element = slots[index];
        };
      }
      return element;
    }

    watch(
      focusing,
      (val) => {
        if (val) {
          addClass(referenceElm, 'focusing');
        } else {
          removeClass(referenceElm, 'focusing');
        }
      }
    );

    onBeforeUnmount(() => popperVM && popperVM.$destroy());

    onUnmounted(() => {
      const reference = referenceElm;
      if (reference.nodeType === 1) {
        off(reference, 'mouseenter', show);
        off(reference, 'mouseleave', hide);
        off(reference, 'focus', handleFocus);
        off(reference, 'blur', handleBlur);
        off(reference, 'click', removeFocusing);
      }
    }
    );

    const firstElement = getFirstElement();
    if (!firstElement) return null;

    const data = firstElement.data = firstElement.data || {};
    data.staticClass = addTooltipClass(data.staticClass);
    return () => {
      return firstElement;
    };
  },
  render() {
    return h('123');
  }
};
