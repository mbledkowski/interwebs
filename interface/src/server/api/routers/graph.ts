// import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { Database } from "~/server/api/db"

const db = new Database();
await db.build();

export const graphRouter = createTRPCRouter({
  nodes: publicProcedure
    .query(async () => { const nodes = await db.getNodes(); return nodes; }),
  edges: publicProcedure
    .query(async () => { const nodes = await db.getEdges(); return nodes; })
});
