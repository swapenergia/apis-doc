export const TopbarPlugin = function () {
  return {
    afterLoad(system) {
      // Definir la estructura de APIs y organizaciones
      const apiStructure = {
        kafka: {
          general: "docs/kafka.yaml",
          sia: "docs/kafka-sia.yaml",
          caf: "docs/kafka-caf.yaml",
          gesfincas: "docs/kafka-gesfincas.yaml"
        }
        // Aquí se pueden agregar más APIs en el futuro
        // ejemplo: {
        //   otherApi: {
        //     general: "docs/other-api.yaml",
        //     ...
        //   }
        // }
      };

      // Guardar la estructura globalmente para acceso desde otros lugares
      window.apiStructure = apiStructure;

      // Función para crear los selectores personalizados
      const createCustomSelectors = () => {
        const apiSelectorId = "api-selector";
        const orgSelectorId = "org-selector";

        // Crear contenedor para los selectores
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'custom-spec-selectors';
        selectorContainer.innerHTML = `
          <div class="selector-group">
            <label for="${apiSelectorId}" class="selector-label">API:</label>
            <select id="${apiSelectorId}" class="md-select custom-selector">
              <option value="kafka">Kafka</option>
            </select>
          </div>
          <div class="selector-group">
            <label for="${orgSelectorId}" class="selector-label">Organización:</label>
            <select id="${orgSelectorId}" class="md-select custom-selector">
              <option value="general">General</option>
              <option value="sia">SIA</option>
              <option value="caf">CAF</option>
              <option value="gesfincas">GESFINCAS</option>
            </select>
          </div>
        `;

        return selectorContainer;
      };

      // Función para cambiar el spec según la selección
      const updateSpec = (api, org) => {
        if (!apiStructure[api] || !apiStructure[api][org]) {
          console.error(`No se encontró spec para API: ${api}, Org: ${org}`);
          return;
        }

        const specUrl = apiStructure[api][org];

        // Actualizar el spec de Swagger UI
        system.specActions.updateUrl(specUrl);
        system.specActions.download();

        // Guardar la selección actual
        window.currentApiSelection = { api, org };

        // Actualizar el título si es necesario
        setTimeout(() => {
          const titleElement = document.querySelector('.info .title');
          if (titleElement) {
            const baseTitle = titleElement.textContent.replace(/ - .+$/, '');
            if (org !== 'general') {
              titleElement.textContent = `${baseTitle} - ${org.toUpperCase()}`;
            } else {
              titleElement.textContent = baseTitle;
            }
          }
        }, 500);
      };

      // Observador para insertar los selectores cuando el topbar esté listo
      const observer = new MutationObserver((mutations, obs) => {
        const topbar = document.querySelector('.topbar');
        const downloadWrapper = document.querySelector('.download-url-wrapper');

        if (topbar && downloadWrapper && !document.querySelector('.custom-spec-selectors')) {
          // Crear e insertar los selectores personalizados
          const customSelectors = createCustomSelectors();

          // Insertar los selectores antes del download-url-wrapper
          downloadWrapper.parentNode.insertBefore(customSelectors, downloadWrapper);

          // Configurar event listeners
          const apiSelector = document.getElementById('api-selector');
          const orgSelector = document.getElementById('org-selector');

          const handleSelectionChange = () => {
            const selectedApi = apiSelector.value;
            const selectedOrg = orgSelector.value;
            updateSpec(selectedApi, selectedOrg);
          };

          apiSelector.addEventListener('change', handleSelectionChange);
          orgSelector.addEventListener('change', handleSelectionChange);

          // Desconectar el observer una vez que los selectores están insertados
          obs.disconnect();
        }
      });

      // Iniciar el observer
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
};