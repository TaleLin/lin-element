import {
  PopupManager
} from 'element-ui/src/utils/popup';

const PopperJS = require('../utils/popper');
const stop = e => e.stopPropagation();

import { ref, watch, onBeforeUnmount, getCurrentInstance } from 'vue';

export default function(props, ctx) {
  const vm = getCurrentInstance();
  const showPopper = ref(false);
  const currentPlacement = ref('');
  const popperRef = ref(null);
  let popperJS;
  let appended;
  let popperElm;

  // TODO: for some missing cases

  // watch: {
  //     value: {
  //         immediate: true,
  //             handler(val) {
  //             this.showPopper = val;
  //             this.$emit('input', val);
  //         }
  //     },

  watch(showPopper,
    (val) => {
      showPopper.value = val;
      if (props.disabled) return;
      val ? updatePopper() : destroyPopper();
      // ctx.$emit('input', val);
    });

  function createPopper() {
    // if (this.$isServer) return;
    currentPlacement.value = currentPlacement.value || (props.placement > '' ? props.placement : 'bottom');
    if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(currentPlacement.value)) {
      return;
    }

    const options = props.popperOptions;
    const _popper = popperElm = popperElm || (popperRef.value > '' ? popperRef.value : null);
    let reference = vm.subTree.children[0].children[0].el;

    if (!_popper || !reference) return;
    if (props.visibleArrow) appendArrow(_popper);
    if (popperJS && popperJS.destroy) {
      popperJS.destroy();
    }

    options.placement = currentPlacement.value;
    options.offset = props.offset;
    options.arrowOffset = props.arrowOffset;
    popperJS = new PopperJS(reference, _popper, options);
    popperJS.onCreate(_ => {
      resetTransformOrigin();
      vm.ctx.$nextTick(updatePopper);
    });
    if (typeof options.onUpdate === 'function') {
      popperJS.onUpdate(options.onUpdate);
    }
    popperJS._popper.style.zIndex = PopupManager.nextZIndex();
    popperElm.addEventListener('click', stop);
  }

  function updatePopper() {
    const _popperJS = popperJS;
    if (_popperJS) {
      popperElm.style.display = '';
      _popperJS.update();
      if (_popperJS._popper) {
        _popperJS._popper.style.zIndex = PopupManager.nextZIndex();
      }
    } else {
      createPopper();
    }
  }

  function doDestroy(forceDestroy) {
    /* istanbul ignore if */
    if (!popperJS || (showPopper.value && !forceDestroy)) return;
    popperJS.destroy();
    popperJS = null;
  }

  function destroyPopper() {
    if (popperJS) {
      resetTransformOrigin();
      popperElm.style.display = 'none';
    }
  }

  function resetTransformOrigin() {
    if (!props.transformOrigin) return;
    let placementMap = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left'
    };
    let placement = popperJS._popper.getAttribute('x-placement').split('-')[0];
    let origin = placementMap[placement];
    popperJS._popper.style.transformOrigin = typeof props.transformOrigin === 'string'
      ? props.transformOrigin
      : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${origin}` : `${origin} center`;
  }

  function appendArrow(element) {
    let hash;
    if (appended) {
      return;
    }

    appended = true;

    for (let item in element.attributes) {
      if (/^_v-/.test(element.attributes[item].name)) {
        hash = element.attributes[item].name;
        break;
      }
    }

    const arrow = document.createElement('div');

    if (hash) {
      arrow.setAttribute(hash, '');
    }
    arrow.setAttribute('x-arrow', '');
    arrow.className = 'popper__arrow';
    element.appendChild(arrow);
  }

  onBeforeUnmount(() => {
    doDestroy(true);
    if (popperElm && popperElm.parentNode === document.body) {
      popperElm.removeEventListener('click', stop);
      document.body.removeChild(popperElm);
    }
  });

  // call destroy in keep-alive mode
  // onDeactivated(() => {
  //   vm.ctx.$options.beforeDestroy[0].call(vm);
  // });

  return {
    updatePopper,
    doDestroy,
    destroyPopper,
    showPopper,
    currentPlacement,
    popperRef
  };
}
