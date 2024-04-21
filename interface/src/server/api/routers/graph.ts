import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { Database } from "~/server/api/db";

const db = new Database();
await db.build();

export const graphRouter = createTRPCRouter({
  nodes: publicProcedure.query(async () => {
    const nodes = await db.getNodes();
    return nodes;
  }),
  edges: publicProcedure.query(async () => {
    const edges = await db.getEdges();
    const res = edges.map((edge) => ({
      ...edge,
      source: edge.start_id,
      target: edge.end_id,
    }));
    return res;
  }),
});
