const BASE_URL = 'https://kafka.secretia.es'

const USERS = {
    sia: "PfwNJhParjfm4jOskvxsNAQYkcgxnE3DW2gmniXm",
    caf: "FEhRUnLWirUSybMk5WTLwCPqS83fucaLTwXDcvkT",
    gesfincas: "EMWyHw39e3D3E4IG3sOfQMjxTIxclCM9Ri4Zj3QA"
};

export const UserAuthPlugin = function() {
  return {
    afterLoad(system) {
      // Hook: cuando Swagger ya está montado
      const observer = new MutationObserver(() => {
        const modal = document.querySelector(".auth-container"); // modal Authorize
        if (modal && !modal.querySelector("#user-select")) {
          // Crear contenedor
          const container = document.createElement("div");
          container.style.marginTop = "15px";

          // Label
          const label = document.createElement("label");
          label.textContent = "Login rápido:";
          container.appendChild(label);

          // Select
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
          container.appendChild(select);

          // Botón
          const btn = document.createElement("button");
          btn.textContent = "Login";
          btn.style.marginLeft = "10px";
          btn.onclick = async () => {
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

              // Cerrar modal después de login
              const closeBtn = document.querySelector(".auth-btn-wrapper .btn-done");
              if (closeBtn) closeBtn.click();
            } catch (err) {
              console.error("Error en login:", err);
              alert("No se pudo autenticar");
            }
          };
          container.appendChild(btn);

          // Inyectar al modal
          modal.appendChild(container);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  };
};
