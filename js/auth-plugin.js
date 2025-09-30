const BASE_URL = 'https://kafka.secretia.es'

const USERS = {
  sia: "PfwNJhParjfm4jOskvxsNAQYkcgxnE3DW2gmniXm",
  caf: "FEhRUnLWirUSybMk5WTLwCPqS83fucaLTwXDcvkT",
  gesfincas: "EMWyHw39e3D3E4IG3sOfQMjxTIxclCM9Ri4Zj3QA"
};

const getApiToken = async (system, select) => {
  const user = select.value;
  if (!user) return alert("Selecciona un usuario");

  try {
    const resp = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.toLowerCase(),
        password: USERS[user]
      })
    });

    if (!resp.ok) {
      alert("Error en login");
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

const constuctAuthSelector = () => {
  const select = document.createElement("select");
  select.id = "user-select";
  select.innerHTML = `<option value="">--Seleccionar--</option>`;
  Object.keys(USERS).forEach(u => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    select.appendChild(opt);
  });
  return select
}

const constructAuthWrapper = (system) => {
  const authButtonId = "custom-auth-button"
  const selectWrapperDom = constuctAuthSelector()
  selectWrapperDom.classList.add('md-select')

  // Crear el contenedor principal
  const dom = document.createElement('div')
  dom.classList.add('md-quick-auth')
  dom.innerHTML = `
    <h4 class="text-white">Login rápido:</h4>
    <div class="md-auth-controls">
      <button id="${authButtonId}" class="md-button md-ripple">Login</button>
    </div>
  `

  // Insertar el select antes del botón
  const controlsDiv = dom.querySelector('.md-auth-controls')
  const button = dom.querySelector(`#${authButtonId}`)
  controlsDiv.insertBefore(selectWrapperDom, button)

  button.addEventListener('click', async (e) => {
    const token = await getApiToken(system, selectWrapperDom)

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
  })
  return dom
}

export const UserAuthPlugin = function () {
  return {
    afterLoad(system) {
      // Hook: cuando Swagger ya está montado
      const observer = new MutationObserver((mutations, obs) => {
        const modal = document.querySelector(".auth-container"); // modal Authorize
        if (modal && !modal.querySelector("#user-select")) {
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
