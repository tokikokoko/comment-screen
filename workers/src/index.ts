import { Hono, Context } from "hono";
import { Bindings } from "./bindings";

const app = new Hono<{ Bindings: Bindings }>();

type Sessions = { webSocket: WebSocket; createdAt: Date }[];
export class Session {
  value: Sessions;
  state: DurableObjectState;
  app: Hono = new Hono();

  constructor(state: DurableObjectState) {
    this.value = [];
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<Sessions>("value");
      this.value = stored || [];
    });

    this.app.get("/ws", (c) => this.websocketHandler(c));
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }

  async websocketHandler(context: Context) {
    console.log("Receive request init.", context.req);
    const upgradeHeader = context.req.header("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected websocket", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    await this.handleSession(context, server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(context: Context, websocket: WebSocket) {
    const uuid = self.crypto.randomUUID();
    websocket.accept();
    this.addSession(uuid, context, websocket);
    websocket.addEventListener("message", async ({ data }) => {
      const parsedData = JSON.parse(data);
      if (parsedData.type === "MESSAGE") {
        this.boradcast(uuid, context, parsedData.message);
      } else {
        console.log("Receive unknown message.", data);
      }
    });

    websocket.addEventListener("close", async (evt) => {
      // Handle when a client closes the WebSocket connection
      console.log(evt);
      this.deleteSession(uuid, context, websocket);
    });
  }

  async addSession(uuid: string, context: Context, webSocket: WebSocket) {
    try {
      this.value.push({ webSocket, createdAt: new Date() });
    } catch (e: Error) {
      console.log(JSON.stringify({ type: "ERROR", e: e.stack }));
    }
  }

  async deleteSession(uuid: string, context: Context, webSocket: WebSocket) {
    try {
    } catch (e: Error) {
      console.log(JSON.stringify({ type: "ERROR", e: e.stack }));
    }
  }

  async boradcast(uuid: string, context: Context, message: string) {
    try {
      if (!message) {
        return;
      }
      this.value.forEach((session) => {
        try {
          session.webSocket.send(
            JSON.stringify({
              type: "BROADCAST",
              tz: new Date(),
              connections: this.value.length,
              message,
            })
          );
        } catch (e) {
          console.log(JSON.stringify({ type: "ERROR", e: e.stack }));
        }
      });
    } catch (e: Error) {
      console.log(JSON.stringify({ type: "ERROR", e: e.stack }));
    }
  }
}

app.get("*", async (c) => {
  const id = c.env.SESSIONS.idFromName("MAIN");
  const obj = c.env.SESSIONS.get(id);
  const resp = await obj.fetch(c.req.url, {
    headers: c.req.headers,
  });

  if (resp.status === 404) {
    return c.text("404 Not Found", 404);
  }

  return resp;
});

export default app;
