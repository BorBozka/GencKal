import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const PORT = process.env.A11Y_PORT || "4173";
let baseUrl = process.env.A11Y_BASE_URL || "";

const nextBin = "node_modules/next/dist/bin/next";

function startServer() {
    return spawn(process.execPath, [nextBin, "dev", "-p", PORT], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            NEXT_TELEMETRY_DISABLED: "1",
        },
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
    });
}

async function waitForServer(server) {
    const deadline = Date.now() + 30000;
    let lastError = null;

    while (Date.now() < deadline) {
        if (server.exitCode !== null) {
            throw new Error(`A11y dev server stopped with exit code ${server.exitCode}.`);
        }

        try {
            const response = await fetch(baseUrl);
            if (response.ok) return;
        } catch (error) {
            lastError = error;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(`A11y dev server did not start at ${baseUrl}. ${lastError?.message || ""}`);
}

async function findExistingServer() {
    const candidates = ["http://127.0.0.1:3000", "http://localhost:3000"];

    for (const candidate of candidates) {
        try {
            const response = await fetch(candidate);
            if (response.ok) return candidate;
        } catch {
            // Ignore unavailable candidates.
        }
    }

    return null;
}

function formatViolation(violation) {
    const nodes = violation.nodes
        .map((node) => `    - ${node.target.join(", ")}: ${node.failureSummary?.replace(/\s+/g, " ").trim() || "No summary"}`)
        .join("\n");

    return `  ${violation.id} (${violation.impact || "unknown"}): ${violation.help}\n${nodes}`;
}

function getBrowserLaunchOptions() {
    const executablePath = process.env.A11Y_BROWSER_PATH || [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ].find((candidate) => existsSync(candidate));

    return executablePath ? { executablePath } : {};
}

async function runAxe(page, label) {
    const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

    if (results.violations.length === 0) {
        console.log(`PASS ${label}`);
        return [];
    }

    console.log(`FAIL ${label}`);
    for (const violation of results.violations) {
        console.log(formatViolation(violation));
    }

    return results.violations;
}

async function main() {
    let server = null;
    let browser = null;
    const serverOutput = [];

    try {
        if (!baseUrl) {
            baseUrl = await findExistingServer() || `http://127.0.0.1:${PORT}`;
        }

        if (!await findExistingServer() && !process.env.A11Y_BASE_URL) {
            server = startServer();
            server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
            server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));
            await waitForServer(server);
        }

        browser = await chromium.launch(getBrowserLaunchOptions());
        const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
        const page = await context.newPage();
        const failures = [];

        const checks = [
            { label: "Ana sayfa", url: "/" },
            { label: "Giriş sayfası", url: "/giris" },
            { label: "İletişim sayfası", url: "/iletisim" },
            { label: "Diyet adımı", url: "/", action: async () => {
                await page.getByRole("button", { name: "Diyet" }).click();
                await page.waitForLoadState("networkidle");
            } },
        ];

        for (const check of checks) {
            await page.goto(`${baseUrl}${check.url}`, { waitUntil: "networkidle" });
            if (check.action) await check.action();
            failures.push(...await runAxe(page, check.label));
        }

        await browser.close();
        browser = null;

        if (failures.length > 0) {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        if (serverOutput.length > 0) {
            console.error(serverOutput.join("").slice(-4000));
        }
        process.exitCode = 1;
    } finally {
        await browser?.close().catch(() => undefined);
        server?.kill();
    }
}

await main();
