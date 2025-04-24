module.exports = {
    locales: ["en", "ro"],
    sourceLocale: "en",
    format: "po",
    catalogs: [
        {
            path: "src/locales/{locale}/messages",
            include: ["src"],
        },
    ],
};
