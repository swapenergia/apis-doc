import { UserAuthPlugin } from "./auth-plugin.js";

window.onload = function () {
  const ui = SwaggerUIBundle({
    urls: [
      { url: "docs/kafka.yaml", name: "API Kafka" },
      { url: "docs/kafka.yaml", name: "API Pedidos" }
    ],
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [UserAuthPlugin],
    layout: "StandaloneLayout"
  });
};