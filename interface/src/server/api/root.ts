import { graphRouter } from "~/server/api/routers/graph";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  graph: graphRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
