<script>
  import { computed, h } from 'vue';
  import {useELEMENT} from '../../../src';

  export default {
    name: 'ElTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
      disableTransitions: Boolean,
      color: String,
      size: String,
      effect: {
        type: String,
        default: 'light',
        validator(val) {
          return ['dark', 'light', 'plain'].indexOf(val) !== -1;
        }
      }
    },

    setup(props, ctx) {
      const ELEMENT = useELEMENT();

      const tagSize = computed(() => {
        return props.size || (ELEMENT || {}).size;
      });

      const handleClose = (event) => {
        console.log('eee');
        event.stopPropagation();
        ctx.emit('close', event);
      };

      const handleClick = (event) => ctx.emit('click', event);

      const classes = [
        'el-tag',
        props.type ? `el-tag--${props.type}` : '',
        tagSize.value ? `el-tag--${tagSize.value}` : '',
        props.effect ? `el-tag--${props.effect}` : '',
        props.hit && 'is-hit'
      ];

      const tagEl = h('span', {
        class: classes,
        style: {backgroundColor: props.color},
        onClick: handleClick
      }, [ctx.slots.default(), props.closable && h('i', {
        class: 'el-tag__close el-icon-close',
        onClick: handleClose
      })]);

      return () => props.disableTransitions ? tagEl : h('transition', {
        name: 'el-zoom-in-center'
      }, [tagEl]);
    }
  };
</script>
