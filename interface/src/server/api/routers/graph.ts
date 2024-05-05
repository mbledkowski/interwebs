import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { Database } from "~/server/api/db";

import ColorHash from "color-hash";
import stringHash from "string-hash";
import { formatHex } from "culori";

const db = new Database();
await db.build();
const colorhash = new ColorHash({ lightness: 0.5 })
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
  nodesAndEdgesColour: publicProcedure.query(async () => {
    const nodes = await db.getNodes();
    const rawEdges = await db.getEdges();
    const edges = rawEdges.map((edge) => {
      return {
        ...edge,
        source: edge.start_id,
        target: edge.end_id,
        color: colorhash.hex(nodes.find((node) => node.id === edge.start_id)!.url)
      }
    });
    return { nodes, edges }
  }),
  nodesAndEdgesColourDomainBased: publicProcedure.query(async () => {
    const nodes = await db.getNodes();
    const rawEdges = await db.getEdges();
    const edges = rawEdges.map((edge) => {
      const startUrl = new URL(nodes.find((node) => node.id === edge.start_id)!.url)
      const hostname = startUrl.hostname
      const domainArray = hostname.split('.').reverse()
      const domainArrayHash = domainArray.map((domain) => stringHash(domain))

      let hue = 0;
      for (let i = 0; i < domainArrayHash.length; i++) {
        hue += 360 / Math.pow(16, i + 1) * (domainArrayHash[i]! % 16)
      }

      return {
        ...edge,
        source: edge.start_id,
        target: edge.end_id,
        color: formatHex({ mode: "okhsl", h: hue, s: 1, l: 0.5 })
      }
    });
    return { nodes, edges }
  })
});
