import dns from "dns";
import mongoose from "mongoose";

// Create a custom DNS resolver that specifically uses Google DNS to bypass ISP blockages
const resolver = new dns.promises.Resolver();
resolver.setServers(["8.8.8.8", "8.8.4.4"]);

interface Cached {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: Cached;
}

const cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function resolveDirectConnectionString(uri: string): Promise<string> {
    // Only intercept mongodb+srv:// URIs
    if (!uri.startsWith("mongodb+srv://")) return uri;

    try {
        // Parse the SRV connection string: mongodb+srv://user:pass@host/db?params
        const match = uri.match(/^mongodb\+srv:\/\/(?:([^:]+):([^@]+)@)?([^\/]+)(?:\/([^?]*)(?:\?(.*))?)?$/);
        if (!match) return uri;

        const username = match[1];
        const password = match[2];
        const hostname = match[3];
        const database = match[4] || "";
        const queries = match[5] || "";

        // Manually resolve the SRV record via Google DNS (bypassing Windows OS DNS or ISP blocks)
        console.log(`Bypassing OS DNS — Resolving SRV for _mongodb._tcp.${hostname} via 8.8.8.8...`);
        const records = await resolver.resolveSrv(`_mongodb._tcp.${hostname}`);

        let txtOptions = "ssl=true&authSource=admin&retryWrites=true&w=majority";
        try {
            const txtRecords = await resolver.resolveTxt(`${hostname}`);
            if (txtRecords && txtRecords.length > 0) {
                // txtRecords[0] usually contains an array of strings like ["authSource=admin&replicaSet=atlas-o1fmjd-shard-0"]
                txtOptions = txtRecords[0].join("");
                if (!txtOptions.includes("ssl=")) txtOptions += "&ssl=true";
            }
        } catch (txtErr) {
            console.warn("Failed to resolve TXT record, using default options");
        }

        if (records && records.length > 0) {
            // Build a standard mongodb:// connection string using the exact seedlist hostnames
            const hosts = records.map(r => `${r.name}:${r.port}`).join(",");
            let newUri = `mongodb://${username}:${password}@${hosts}/${database}?${txtOptions}`;
            if (queries) newUri += `&${queries}`;

            console.log("Successfully bypassed ISP DNS block. Connecting directly to Atlas nodes.");
            return newUri;
        }
    } catch (e) {
        console.warn("Custom SRV resolver failed or timed out, falling back to original URI", e);
    }

    return uri;
}

export async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error(
            "MONGODB_URI is not set in .env.local. Please add it and restart the dev server."
        );
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            family: 4,                      // Force IPv4 — fixes querySrv ECONNREFUSED on Windows
            serverSelectionTimeoutMS: 5000, // Fail fast in dev instead of hanging
        };

        cached.promise = resolveDirectConnectionString(MONGODB_URI).then((resolvedUri) => {
            return mongoose.connect(resolvedUri, opts).then((mongoose) => {
                return mongoose;
            });
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
