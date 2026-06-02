import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export interface UserRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: string;
}

export interface DietPlanRow {
    id: string;
    user_id: string;
    title: string;
    target_calories: number;
    diet_type: string;
    meals_per_day: number;
    allergies: string;
    macros_json: string;
    meals_json: string;
    created_at: string;
}

declare global {
    var __genckalDb: DatabaseSync | undefined;
}

function getDatabasePath(): string {
    const dataDir = process.env.GENCKAL_DB_DIR || path.join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });
    return path.join(dataDir, "genckal.sqlite");
}

function initializeDatabase(database: DatabaseSync): void {
    database.exec(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS diet_plans (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            target_calories INTEGER NOT NULL,
            diet_type TEXT NOT NULL,
            meals_per_day INTEGER NOT NULL,
            allergies TEXT NOT NULL DEFAULT '',
            macros_json TEXT NOT NULL,
            meals_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_diet_plans_user_created
            ON diet_plans(user_id, created_at DESC);
    `);
}

export function getDb(): DatabaseSync {
    if (!globalThis.__genckalDb) {
        const database = new DatabaseSync(getDatabasePath());
        initializeDatabase(database);
        globalThis.__genckalDb = database;
    }

    return globalThis.__genckalDb;
}
