import { formatter } from "@lingui/format-po";
import { defineConfig } from "@lingui/conf";

export default defineConfig({
    locales: ["en", "ro"],
    sourceLocale: "en",
    format: formatter(),
    catalogs: [
        {
            path: "src/locales/{locale}/messages",
            include: ["src"],
        },
    ],
});
