<template>
  <div style="margin: 20px;">
    <play-button v-if="route.value === '#button'"></play-button>
    <play-icon v-if="route.value === '#icon'"></play-icon>
    <play-link v-if="route.value === '#link'"></play-link>
    <play-layout v-if="route.value === '#layout'"></play-layout>
    <play-container v-if="route.value === '#containter'"></play-container>
    <play-radio v-if="route.value === '#radio'"></play-radio>
    <play-switch v-if="route.value === '#switch'"></play-switch>
    <play-avatar v-if="route.value === '#avatar'"></play-avatar>
    <play-select v-if="route.value === '#select'"></play-select>
    <play-tag v-if="route.value === '#tag'"></play-tag>
    <play-alert v-if="route.value === '#alert'"></play-alert>
    <play-badge v-if="route.value === '#badge'"></play-badge>
    <play-scrollbar v-if="route.value === '#scrollbar'"></play-scrollbar>
    <play-rate v-if="route.value === '#rate'"></play-rate>
    <play-badge v-if="route.value"></play-badge>
    <play-tool-tip ></play-tool-tip>
  </div>
</template>

<script>
  import PlayButton from './components/button'
  import PlayIcon from './components/icon'
  import PlayLink from './components/link'
  import PlayContainer from './components/container'
  import PlayLayout from './components/layout'
  import PlayRadio from './components/radio'
  import PlaySwitch from './components/switch'
  import PlayAvatar from './components/atvatar'
  import PlaySelect from './components/select'
  import PlayTag from './components/tag'
  import PlayAlert from './components/alert'
  import PlayBadge from './components/badge'
  import PlayScrollbar from './components/scrollbar'
  import PlayRate from './components/rate'
  import PlayToolTip from './components/tooltip'

  import useRoute from './route'

  export default {
    components: {
      PlayButton,
      PlayIcon,
      PlayLink,
      PlayContainer,
      PlayLayout,
      PlayRadio,
      PlaySwitch,
      PlayAvatar,
      PlaySelect,
      PlayTag,
      PlayAlert,
      PlayBadge,
      PlayScrollbar,
      PlayRate,
      PlayToolTip
    },
    data() {
      return {
        route: useRoute()
      };
    },
  };
</script>
