import VueRouter from 'vue-router'

export function createRouter() {
  return new VueRouter({
    mode: 'history',
    routes: [
      { path: '/', component: () => import('../views/index.vue') },
      { path: '/about', component: () => import('../views/about.vue') }
    ]
  })
}
