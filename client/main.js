
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Meta from 'vue-meta'
import App from './App.vue'
import { sync } from 'vuex-router-sync'
import { createStore } from './stores'
import { createRouter } from './routes'

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(Meta)

export function createApp(context) {
  const store = createStore()
  const router = createRouter()
  sync(store, router)
  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })
  return { app, store, router }
}
