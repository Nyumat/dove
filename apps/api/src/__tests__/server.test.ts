import * as fastify from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { createServer } from "../server";

describe("server", () => {
  let server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>;

  beforeAll(() => {
    server = createServer();
  });

  afterAll(() => {
    server.close();
  });

  it("health check returns 200", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/healthz",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it("message endpoint says hello", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/message/jared",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: "hello jared" });
  });
});
