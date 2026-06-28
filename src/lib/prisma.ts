import { PrismaClient } from "@prisma/client";
import { offlineDb, OfflineSchema } from "./offline-db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawPrisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = rawPrisma;
}

const MODEL_MAPPING: Record<string, keyof OfflineSchema> = {
  user: "users",
  profile: "profiles",
  skillPassport: "skillPassports",
  jobListing: "jobListings",
  application: "applications",
  matchResult: "matchResults",
  interviewSession: "interviewSessions",
};

function isDbOfflineError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  return (
    msg.includes("p1001") ||
    msg.includes("p1002") ||
    msg.includes("p1003") ||
    msg.includes("p1008") ||
    msg.includes("p1017") ||
    msg.includes("can't reach database") ||
    msg.includes("connection") ||
    msg.includes("timed out") ||
    msg.includes("connect") ||
    msg.includes("unreachable") ||
    msg.includes("failed to lookup") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused")
  );
}

// Wrap prisma client with a proxy to support graceful offline fallback
export const prisma = new Proxy(rawPrisma, {
  get(target, modelKey: string) {
    // If it's a Prisma property/method (like $connect, $disconnect, etc)
    if (modelKey.startsWith("$")) {
      return async (...args: any[]) => {
        try {
          return await (target as any)[modelKey](...args);
        } catch (err) {
          if (isDbOfflineError(err)) {
            console.warn(`Prisma call ${modelKey} failed (DB offline), falling back gracefully.`);
            if (modelKey === "$disconnect" || modelKey === "$connect") {
              return;
            }
            throw err;
          }
          throw err;
        }
      };
    }

    const modelName = modelKey;
    const offlineTable = MODEL_MAPPING[modelName];

    // If it's not a database model we mock, forward directly
    if (!offlineTable) {
      return (target as any)[modelKey];
    }

    // Return a Proxy for the model itself (e.g. prisma.user)
    return new Proxy((target as any)[modelKey] || {}, {
      get(modelTarget, methodKey: string) {
        return async (...args: any[]) => {
          try {
            // Attempt the real database operation
            return await (target as any)[modelName][methodKey](...args);
          } catch (err) {
            if (isDbOfflineError(err)) {
              console.warn(`Database offline: Prisma.${modelName}.${methodKey} failed. Falling back to offline local JSON database.`);
              
              if (methodKey === "findUnique") {
                return await offlineDb.findUnique(offlineTable, args[0]);
              } else if (methodKey === "findMany") {
                return await offlineDb.findMany(offlineTable, args[0]);
              } else if (methodKey === "create") {
                return await offlineDb.create(offlineTable, args[0]);
              } else if (methodKey === "update") {
                return await offlineDb.update(offlineTable, args[0]);
              } else if (methodKey === "upsert") {
                return await offlineDb.upsert(offlineTable, args[0]);
              } else if (methodKey === "deleteMany") {
                return await offlineDb.deleteMany(offlineTable, args[0]);
              }
              
              console.error(`Offline fallback for method ${methodKey} on model ${modelName} is not implemented.`);
            }
            throw err;
          }
        };
      }
    });
  }
});