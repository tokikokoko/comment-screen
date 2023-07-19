<script setup lang="ts">
import { onMounted, ref } from "vue";
import Comment from "./components/Comment.vue";

const isBroadcast = ref(false);
const bColor = ref("white");

onMounted(() => {
  const location: any = window.location;
  const windowUrl = new URL(location);
  const colorQuery = windowUrl.searchParams.get("color");
  if (colorQuery) {
    console.log("isBroadcast mode.", colorQuery);
    isBroadcast.value = true;
    bColor.value = colorQuery;
  }
});
</script>

<template>
  <div class="root">
    <div
      class="main"
      :class="isBroadcast ? 'main-broadcast' : 'main-client'"
      :style="{
        fontSize: isBroadcast ? '2.7em' : undefined,
        fontWeight: isBroadcast ? 1000 : undefined,
      }"
    >
      <Comment />
    </div>
  </div>
</template>

<style>
.root {
  display: flex;
  min-width: 30vw;
  min-height: 50vh;
  justify-content: center;
  background-color: v-bind(bColor);
}

.main {
  background-color: v-bind(bColor);
}

.root-client {
  width: 100dvw;
  height: 100dvh;
}

.root-broadcast {
  width: 100dvw;
  height: 100dvw;
}

.main:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
