
import Vuex from 'vuex'

export function createStore() {
  return new Vuex.Store({
    state: {
      counter: 0
    },
    mutations: {
      INCREMENT(state) {
        state.counter++
      }
    }
  })
}
