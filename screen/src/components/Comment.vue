<script setup lang="ts">
import { ref, onMounted, onUnmounted, onUpdated } from "vue";
// import "../style.css";

const textMessage = ref("");
const isBroadcast = ref(false);
const color = ref("green");
const messages = ref<string[]>([]);
const ws = ref<null | WebSocket>(null);

// WebSocket
async function websocket(url: URL) {
  await connectWebsocket(url);

  if (!ws.value) {
    throw new Error("Connect failed.");
  }

  ws.value.addEventListener("open", () => {
    console.log("Opened websocket");
  });

  ws.value.addEventListener("message", ({ data }) => {
    console.log("Receive message", data);
    const { error, message } = JSON.parse(data);
    if (error) {
    } else {
      messages.value.push(message);
    }
  });

  ws.value.addEventListener("close", () => {
    console.log("Closed websocket");
    websocket(url);
    console.log("Reconnect");
  });
}

async function connectWebsocket(url: URL) {
  ws.value = new WebSocket(url);

  if (!ws.value) {
    throw new Error("server didn't accept ws");
  }
}

onMounted(() => {
  const location: any = window.location;
  const windowUrl = new URL(location);
  const colorQuery = windowUrl.searchParams.get("color");
  if (colorQuery) {
    isBroadcast.value = true;
    color.value = colorQuery;
  }
  const url = new URL("https://comment.tkk.workers.dev/");
  url.protocol = "wss";
  url.pathname = "/ws";
  console.debug(url);
  websocket(url);
});

onUnmounted(() => {
  ws.value?.close();
});

async function clickSend() {
  if (!ws.value) {
    throw new Error("WebSocket not open");
  }
  ws.value.send(
    JSON.stringify({ type: "MESSAGE", message: textMessage.value })
  );
  textMessage.value = "";
}

async function scrollToBottom() {
  const container = document.querySelector("#messages");
  if (container) {
    const height = container.scrollHeight;
    container.scrollTo({
      top: height,
      behavior: "smooth",
    });
    console.log("Found comments", height);
  } else {
    console.log("Not found comments");
  }
}

onUpdated(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="messages-wrapper">
    <div
      id="messages"
      :class="isBroadcast ? 'messages-broadcast' : 'messages-client'"
    >
      <div v-for="message in messages" class="message">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
  <div v-if="!isBroadcast" class="send">
    <input v-model="textMessage" :style="{ padding: '10px' }" />
    <button @click="clickSend" :style="{ marginLeft: '10px' }">Send</button>
  </div>
</template>

<style scoped>
.send {
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.messages-wrapper {
  display: flex;
  justify-content: center;
}

#messages {
  display: flex;
  flex-direction: column;
  text-align: center;
  overflow: scroll;
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
  padding: 15px;
}

.messages-client {
  height: 85dvh;
  width: 70dvw;
}

.messages-broadcast {
  height: 94dvh;
  width: 70vw;
  margin: 15px;
}

.message {
  border: solid 1px;
  border-radius: 10px;
  margin-top: 10px;
  margin-left: 10px;
  padding-left: 15px;
  padding-right: 15px;
  background-color: white;
  word-wrap: break-word;
}

#messages::-webkit-scrollbar {
  display: none;
}
</style>
