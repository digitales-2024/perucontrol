import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: "http://localhost:5233/openapi/v1.json",
    output: {
        lint: "eslint",
        path: "src/types",
    },
    plugins: ["@hey-api/client-next"],
});
