import type { IncomingMessage, ServerResponse } from "http";
import { fastify } from "../src/server";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await fastify.ready();
  fastify.server.emit("request", req, res);
}
