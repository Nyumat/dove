import { log } from "@repo/logger";
import { createServer } from "./server";

import { PrismaClient } from "database";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env.local",
});

const port = process.env.PORT || 3001;
const server = createServer();

export const dbClient = new PrismaClient();

server.listen(
  {
    port: parseInt(port as string, 10),
  },
  (err, address) => {
    if (err) {
      log(err);
      process.exit(1);
    }
    log(`server listening on ${address}`);
  },
);
