
import debounce from 'throttle-debounce/debounce';
import { addClass, removeClass, on, off } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';
import { h, ref, Transition, getCurrentInstance, watch, onMounted, onBeforeUnmount, onUnmounted, Fragment, Teleport } from 'vue';
import usePopper from 'element-ui/src/composables/popper';

export default {
  name: 'ElTooltip',

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

    placement: String,
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
    transformOrigin: {
      type: [Boolean, String],
      default: true
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
    },
    offset: {
      type: Number,
      default: 0
    }
  },

  setup(props, ctx) {
    const vm = getCurrentInstance();
    const tooltipId = ref(`el-tooltip-${generateId()}`);
    const timeoutPending = ref(null);
    const focusing = ref(false);
    let expectedState;
    let timeout;
    let referenceElm;
    const { popperRef, showPopper, doDestroy } = usePopper(props, ctx);
    const debounceClose = debounce(200, () => handleClosePopper());

    onMounted(() => {
      referenceElm = vm.subTree.children[0].children[0].el;
      if (referenceElm) {
        referenceElm.setAttribute('aria-describedby', tooltipId.value);
        referenceElm.setAttribute('tabindex', props.tabindex);
        on(referenceElm, 'mouseenter', show);
        on(referenceElm, 'mouseleave', hide);
        on(referenceElm, 'focus', () => {
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
      if (!expectedState || props.manual) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        showPopper.value = true;
      }, props.openDelay);

      if (props.hideAfter > 0) {
        timeoutPending.value = setTimeout(() => {
          showPopper.value = false;
        }, props.hideAfter);
      }
    }

    function handleClosePopper() {
      if (expectedState || props.manual) return;
      clearTimeout(timeout);

      if (timeoutPending.value) {
        clearTimeout(timeoutPending.value);
      }

      showPopper.value = false;

      if (props.disabled) {
        doDestroy();
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

    onBeforeUnmount(() => document.body.removeChild(popperRef.value));

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
    return {
      showPopper,
      popperRef,
      tooltipId,
      setExpectedState,
      debounceClose,
      doDestroy
    };
  },
  render() {
    return h(
      Fragment,
      null,
      [
        this.$slots.default(),
        h(
          Teleport,
          {
            to: 'body'
          },
          h(
            Transition,
            {
              name: this.transition,
              onAfterLeave: this.doDestroy
            },
            [
              h(
                'div',
                {
                  onmouseenter: () => {
                    this.setExpectedState(false);
                    this.debounceClose();
                  },
                  onmouseleave: () => { this.setExpectedState(true); },
                  ref: 'popperRef',
                  class: ['el-tooltip__popper', 'is-' + this.effect, this.popperClass],
                  role: 'tooltip',
                  id: this.tooltipId,
                  ariaHidden: this.disabled || !this.showPopper ? 'true' : 'false',
                  style: { display: 'none' }
                },
                [this.$slots.content || this.content]
              )
            ]
          )
        )
      ]
    );
  }
};
