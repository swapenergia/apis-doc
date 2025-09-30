import { UserAuthPlugin } from "./auth-plugin.js";

window.onload = function () {
  // Mapeo de usuarios a sus archivos YAML correspondientes
  const userSpecs = {
    sia: "docs/kafka-sia.yaml",
    caf: "docs/kafka-caf.yaml",
    gesfincas: "docs/kafka-gesfincas.yaml"
  };

  // Inicializar con un spec básico (puede ser el genérico o ninguno)
  const ui = SwaggerUIBundle({
    url: "docs/kafka.yaml", // Spec por defecto (genérico sin topics específicos)
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [UserAuthPlugin],
    layout: "StandaloneLayout"
  });

  // Guardar la instancia UI globalmente
  window.swaggerUi = ui;

  // Función para actualizar el spec según el usuario
  window.updateSwaggerSpec = function(user) {
    if (!user) return;

    const specUrl = userSpecs[user.toLowerCase()];
    if (!specUrl) {
      console.error(`No se encontró spec para el usuario: ${user}`);
      return;
    }

    // Actualizar el spec de Swagger UI
    ui.specActions.updateUrl(specUrl);
    ui.specActions.download();

    // Actualizar el título de la página (opcional)
    setTimeout(() => {
      const titleElement = document.querySelector('.info .title');
      if (titleElement && !titleElement.textContent.includes(user.toUpperCase())) {
        const originalTitle = titleElement.textContent.replace(/ - Usuario .+$/, '');
        titleElement.textContent = `${originalTitle} - Usuario ${user.toUpperCase()}`;
      }
    }, 500);
  };

  // Función para limpiar el estado al cerrar sesión
  window.clearKafkaSession = function() {
    // Volver al spec por defecto
    ui.specActions.updateUrl("docs/kafka.yaml");
    ui.specActions.download();

    // Limpiar autorizaciones
    ui.authActions.logout();

    // Remover indicador visual
    const indicator = document.querySelector('.kafka-user-indicator');
    if (indicator) {
      indicator.remove();
    }

    // Limpiar variable global
    window.currentKafkaUser = null;
  };
};