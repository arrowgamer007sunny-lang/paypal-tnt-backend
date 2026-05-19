import express from "express";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
const clients = new Set();
let lastSuperchat = null;

app.post("/paypal-webhook", (req, res) => {
  const r = req.body.resource;
  if (req.body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const amount = parseFloat(r.amount.value);
    const username = `${r.payer.name.given_name} ${r.payer.name.surname || ""}`.trim();
    const payload = { username, amount, time: Date.now() };
    lastSuperchat = payload;
    clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify(payload)));
    console.log("Superchat:", payload);
  }
  res.sendStatus(200);
});

app.get("/last", (_, res) => res.json(lastSuperchat || {}));
app.get("/", (_, res) => res.send("OK"));

const server = app.listen(process.env.PORT || 3000);
const wss = new WebSocketServer({ server });
wss.on("connection", ws => {
  clients.add(ws);
  if (lastSuperchat) ws.send(JSON.stringify(lastSuperchat));
  ws.on("close", () => clients.delete(ws));
});
