const BASE_URL = 'https://kafka.secretia.es'

const getApiToken = async (username, password) => {
  if (!username || !password) {
    alert("Por favor ingresa usuario y contraseña");
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.toLowerCase(),
        password: password
      })
    });

    if (!resp.ok) {
      alert("Error en login: Usuario o contraseña incorrectos");
      return;
    }

    const data = await resp.json();
    const token = data.token;

    return token;
  } catch (err) {
    console.error("Error en login:", err);
    alert("No se pudo autenticar");
  }
};


const constructAuthWrapper = (system) => {
  const authButtonId = "custom-auth-button"
  const usernameInputId = "username-input"
  const passwordInputId = "password-input"

  // Crear el contenedor principal
  const dom = document.createElement('div')
  dom.classList.add('md-quick-auth')
  dom.innerHTML = `
    <h4 class="text-white">Login rápido:</h4>
    <div class="md-form-group">
      <input type="text" id="${usernameInputId}" class="md-text-field" placeholder="Usuario" />
    </div>
    <div class="md-form-group">
      <input type="password" id="${passwordInputId}" class="md-text-field" placeholder="Contraseña" />
    </div>
    <div class="md-auth-controls justify-content-end">
      <button id="${authButtonId}" class="md-button md-ripple">Login</button>
    </div>
  `

  const button = dom.querySelector(`#${authButtonId}`)
  const usernameInput = dom.querySelector(`#${usernameInputId}`)
  const passwordInput = dom.querySelector(`#${passwordInputId}`)

  button.addEventListener('click', async (e) => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const token = await getApiToken(username, password)

    if (!token) return; // Si no hay token, salir

    // Insertar token en Swagger
    system.authActions.authorize({
      BearerAuth: {
        name: "BearerAuth",
        schema: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        value: token
      }
    });

    // Cerrar modal después de login exitoso
    const closeBtn = document.querySelector(".auth-btn-wrapper .btn-done");
    if (closeBtn) closeBtn.click();

    // Cambiar el spec según el usuario
    if (window.updateSwaggerSpec) {
      window.updateSwaggerSpec(username);
    }

    // Guardar el usuario actual para mostrar indicador
    window.currentKafkaUser = username;
    updateUserIndicator(username);

    // Limpiar los campos después del login exitoso
    usernameInput.value = '';
    passwordInput.value = '';
  })
  return dom
}

const updateUserIndicator = (user) => {
  // Remover indicador anterior si existe
  const existingIndicator = document.querySelector('.kafka-user-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  if (!user) return;

  // Crear nuevo indicador
  const indicator = document.createElement('div');
  indicator.className = 'kafka-user-indicator';
  indicator.innerHTML = `
    <span class="user-label">Usuario activo:</span>
    <span class="user-name">${user.toUpperCase()}</span>
    <span class="user-role">${getUserRole(user)}</span>
  `;

  // Agregar estilos inline para el indicador
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  // Estilos para los elementos internos
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .kafka-user-indicator .user-label {
      font-size: 12px;
      opacity: 0.9;
    }
    .kafka-user-indicator .user-name {
      font-size: 14px;
      font-weight: bold;
    }
    .kafka-user-indicator .user-role {
      font-size: 11px;
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 10px;
    }
  `;

  if (!document.querySelector('#kafka-indicator-styles')) {
    styleSheet.id = 'kafka-indicator-styles';
    document.head.appendChild(styleSheet);
  }

  document.body.appendChild(indicator);
};

const getUserRole = (user) => {
  const roles = {
    sia: 'Administrador',
    caf: 'CAF - Acceso limitado',
    gesfincas: 'GESFINCAS - Acceso limitado'
  };
  return roles[user.toLowerCase()] || 'Usuario';
};

export const UserAuthPlugin = function () {
  return {
    afterLoad(system) {
      // Hook: cuando Swagger ya está montado
      const observer = new MutationObserver((mutations, obs) => {
        const modal = document.querySelector(".auth-container"); // modal Authorize
        if (modal && !modal.querySelector("#username-input")) {
          // Desconectar temporalmente para evitar bucle infinito
          obs.disconnect();

          const container = constructAuthWrapper(system)
          modal.insertBefore(container, modal.firstChild)

          // Reconectar el observer después de insertar
          setTimeout(() => {
            obs.observe(document.body, { childList: true, subtree: true });
          }, 100);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
};
