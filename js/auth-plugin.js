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

    // Cerrar modal después de login
    const closeBtn = document.querySelector(".auth-btn-wrapper .btn-done");
    if (closeBtn) closeBtn.click();
  } catch (err) {
    console.error("Error en login:", err);
    alert("No se pudo autenticar");
  }
};

const constuctAuthSelector = () => {
  const select = document.createElement("select");
  select.id = "user-select";
  select.style.marginLeft = "10px";
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
  const template = `/* html */
    <div>
      <p>Login rápido:</p>
      ${selectWrapperDom}
      <button id="${authButtonId}">Login</button>
    </div>
  `
  const tmp = document.createElement('div')
  tmp.innerHTML = template
  const dom = tmp.children[0]
  const button = dom.querySelector(`#${authButtonId}`)
  // button.addEventListener('click', (e) => {
  //   getApiToken(system, selectWrapperDom)
  // })
  console.log(dom)
  return dom
}


export const UserAuthPlugin = function () {
  return {
    afterLoad(system) {
      // Hook: cuando Swager gya está montado
      const observer = new MutationObserver(() => {
        const modal = document.querySelector(".auth-container"); // modal Authorize
        if (modal && !modal.querySelector("#user-select")) {
          const container = constructAuthWrapper(system)
          modal.insertBefore(container, modal.firstChild)
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
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
};
