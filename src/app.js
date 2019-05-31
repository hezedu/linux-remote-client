
import './css/style.scss';

import './lib/vue-prototype';
import './lib/vue-filter';

import store from './store/index.js';
import router from './router';
import Root from './page/root.vue';
const dom = document.getElementById('lr-app');
let preLoadHtml = `<div id="lr-pre-load" class="lr-pre-load"><div class="progress-ring progress-large">`;
for(let i = 0; i < 5; i++){
  preLoadHtml += `<div class="progress-circle"></div>`;
}
preLoadHtml += `</div></div>`
dom.innerHTML = preLoadHtml;

const preLoad = document.getElementById('lr-pre-load');
var app = new window.Vue({
  store,
  router,
  render: h => h(Root)
});

router.onReady(() => {

  app.request({
    url: '/touch',
    success(data){
      preLoad.remove();
      store.commit('set', data);
      app.$mount(dom);
    },
    error(xhr){
      preLoad.innerHTML = `<span>Error# ${xhr.status}: ${xhr.responseText}</span>`;
    }
  })
  
})
