
<template>
  <div>
    <p>The visited URL is: {{ url }}</p>
    <p>
      <button @click="sayHello">Hello</button>
    </p>
    <router-link to="/about">About page</router-link>
  </div>
</template>
<script>
export default {
  metaInfo: {
    title: "index Page"
  },
  data() {
    return {
      url: this.$store.path
    };
  },
  methods: {
    sayHello() {
      window.alert("Hello!");
    }
  }
};
</script>
