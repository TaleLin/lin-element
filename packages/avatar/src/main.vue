<template>
  <span :class="avatarClass" :style="sizeStyle">
    <img
      v-if="isImageExist && src"
      :src="src"
      :onError="handleError"
      :alt="alt"
      :srcSet="srcSet"
      :style="imgStyle"
    />
    <i v-else-if="icon" :class="icon" />
    <slot v-else></slot>
  </span>
</template>
 <script>
import {
  ref, computed
} from 'vue';

export default {
  name: 'ElAvatar',
  props: {
    size: {
      type: [Number, String],
      validator(val) {
        if (typeof val === 'string') {
          return ['large', 'medium', 'small'].includes(val);
        }
        return typeof val === 'number';
      }
    },
    shape: {
      type: String,
      default: 'circle',
      validator(val) {
        return ['circle', 'square'].includes(val);
      }
    },
    icon: String,
    src: String,
    alt: String,
    srcSet: String,
    error: Function,
    fit: {
      type: String,
      default: 'cover'
    }
  },
  setup(props) {
    let isImageExist = ref(true);
    let sizeStyle = ref({});
    let imgStyle = ref({});

    function handleError() {
      const { error } = props;
      const errorFlag = error ? error() : undefined;
      if (errorFlag !== false) {
        isImageExist = false;
      }
    }

    sizeStyle = computed(
      () => {
        const { size } = props;
        return typeof size === 'number' ? {
          height: `${size}px`,
          width: `${size}px`,
          lineHeight: `${size}px`
        } : {};
      }
    );

    imgStyle = computed(() => {
      return { 'object-fit': props.fit };
    });

    const avatarClass = computed(() => {
      const { size, icon, shape } = props;
      let classList = ['el-avatar'];

      if (size && typeof size === 'string') {
        classList.push(`el-avatar--${size}`);
      }

      if (icon) {
        classList.push('el-avatar--icon');
      }

      if (shape) {
        classList.push(`el-avatar--${shape}`);
      }

      return classList.join(' ');
    });
    return {
      isImageExist,
      handleError,
      sizeStyle,
      avatarClass,
      imgStyle
    };
  }
};

</script>

