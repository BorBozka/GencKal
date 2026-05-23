export async function resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
        return nextResolve("next/server.js", context);
    }

    try {
        return await nextResolve(specifier, context);
    } catch (error) {
        const canRetryWithTsExtension =
            (error?.code === "ERR_MODULE_NOT_FOUND" || error?.code === "ERR_UNSUPPORTED_DIR_IMPORT") &&
            (specifier.startsWith("./") || specifier.startsWith("../")) &&
            !/\.[cm]?[jt]sx?$/.test(specifier);

        if (!canRetryWithTsExtension) throw error;

        if (error?.code === "ERR_UNSUPPORTED_DIR_IMPORT") {
            return nextResolve(`${specifier}/index.ts`, context);
        }

        return nextResolve(`${specifier}.ts`, context);
    }
}
