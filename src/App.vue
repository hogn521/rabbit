<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useCounterStore } from './stores/counter.js';

const counter = useCounterStore();


</script>

<template>
  <header></header>
  <RouterView />

</template>

<style scoped lang="scss">

</style>
