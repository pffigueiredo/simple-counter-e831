import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createCounterInputSchema, 
  counterOperationInputSchema 
} from './schema';

// Import handlers
import { createCounter } from './handlers/create_counter';
import { getCounter } from './handlers/get_counter';
import { getCounters } from './handlers/get_counters';
import { incrementCounter } from './handlers/increment_counter';
import { decrementCounter } from './handlers/decrement_counter';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new counter
  createCounter: publicProcedure
    .input(createCounterInputSchema)
    .mutation(({ input }) => createCounter(input)),
  
  // Get a specific counter by ID
  getCounter: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getCounter(input.id)),
  
  // Get all counters
  getCounters: publicProcedure
    .query(() => getCounters()),
  
  // Increment counter value
  incrementCounter: publicProcedure
    .input(counterOperationInputSchema)
    .mutation(({ input }) => incrementCounter(input)),
  
  // Decrement counter value
  decrementCounter: publicProcedure
    .input(counterOperationInputSchema)
    .mutation(({ input }) => decrementCounter(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();