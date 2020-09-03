

<script>
import Popper from 'element-ui/src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';
import { on, off, addClass, removeClass } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';
import { createApp, h, ref, onMounted, computed, getCurrentInstance, render } from 'vue';

export default {
  name: 'ElTooltip',

  mixin: [Popper],
  props: {
    openDelay: {
      type: Number,
      default: 100
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
    const popperClassList = ref([]);
    const ifShowPopper = ref(true);
    let showPopper = true;
    const debounceClose = debounce(200, () => handleClosePopper());
    let firstElement;
    let expectedState;
    let timeout;
    let referenceElm;
    // const tooltip = document.createElement('div');
    // tooltip.setAttribute('id', vm.data.tooltipId);
    // document.body.insertBefore(tooltip, document.getElementById('app'));
    // vm.popperVM = createApp({
    //   data() {
    //     return {
    //       node: h('div', {}, '11')
    //     };
    //   },
    //   render() {
    //     // eslint-disable-next-line no-debugger
    //     debugger;

    //     return h('div', {}, [getCurrentInstance().data.node]);
    //   }
    // }).mount(`#${vm.data.tooltipId}`);

    onMounted(function () {
      firstElement = getFirstElement();
      if (!firstElement) return null;
      const data = firstElement.data = firstElement.data || {};
      data.staticClass = addTooltipClass(data.staticClass);
      referenceElm = vm.root.vnode.el;
      if (referenceElm.nodeType === 1) {
        referenceElm.setAttribute('aria-describedby', tooltipId);
        referenceElm.setAttribute('tabindex', props.tabindex);
        on(referenceElm, 'mouseenter', show);
        on(referenceElm, 'mouseleave', hide);
        on(referenceElm, 'focus', () => {
          if (!ctx.slots.default() || !ctx.slots.default().length) {
            handleFocus();
            return;
          }
          const instance = ctx.slots.default()[0].componentInstance;
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

    popperClassList.value = computed(() => ['el-tooltip__popper', 'is-' + props.effect, props.popperClass]);

    ifShowPopper.value = computed(() => !props.disabled && showPopper);

    vm.ctx.$watch('focusing', (val) => {
      if (val) {
        addClass(referenceElm, 'focusing');
      } else {
        removeClass(referenceElm, 'focusing');
      }
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
        showPopper = true;
      }, props.openDelay);

      if (props.hideAfter > 0) {
        timeoutPending.value = setTimeout(() => {
          showPopper = false;
        }, props.hideAfter);
      }
    }

    function handleClosePopper() {
      if (props.enterable && expectedState || props.manual) return;
      clearTimeout(timeout);

      if (timeoutPending.value) {
        clearTimeout(timeoutPending.value);
      }
      showPopper = false;

      if (props.disabled) {
        vm.doDestroy();
      }
    }

    function setExpectedState(state = true) {
      // eslint-disable-next-line no-debugger
      debugger;
      if (state === false) {
        clearTimeout(timeoutPending.value);
      }
      expectedState = state;
    }

    function getFirstElement() {
      const slots = ctx.slots.default();
      if (!Array.isArray(slots)) return null;
      let element = null;
      for (let index = 0; index < slots.length; {
        if(slots[index] && slots[index].shapeFlag) {
        element = slots[index];
      }
    }
    return element;
  }
      function beforeDestroy() {
  vm && vm.$destroy();
}

function destroyed() {
  const reference = this.referenceElm;
  if (reference.nodeType === 1) {
    off(reference, 'mouseenter', show);
    off(reference, 'mouseleave', hide);
    off(reference, 'focus', handleFocus);
    off(reference, 'blur', handleBlur);
    off(reference, 'click', removeFocusing);
  }
}

function onMouseLeaveCallback() {
  setExpectedState(false);
  debounceClose();
}
  }
}

</script>
