
<template>
  <div>
    <h1>About page</h1>
    <p>Counter: {{ $store.state.counter }}</p>
    <p>
      <button @click="$store.commit('INCREMENT')">+</button>
    </p>
    <router-link to="/">Home Page</router-link>
  </div>
</template>
<script>
export default {
  metaInfo: {
    title: "About Page"
  },
  asyncData({ store }) {
    store.commit("INCREMENT");
  }
};
</script>
