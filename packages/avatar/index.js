import ElAvatar from './src/main';

/* istanbul ignore next */
ElAvatar.install = function(Vue) {
  Vue.component(ElAvatar.name, ElAvatar);
};

export default ElAvatar;
