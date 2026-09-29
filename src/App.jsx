import { useEffect, useState } from "react";
import { authApi, api } from "./services/api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nombreComun, setNombreComun] = useState("");
  const [nombreCientifico, setNombreCientifico] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [token, setToken] = useState(
    sessionStorage.getItem("token")
  );

  const [especies, setEspecies] = useState([]);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authApi.post("/login", {
        username,
        password,
      });

      const nuevoToken = response.data.access_token;

      sessionStorage.setItem("token", nuevoToken);
      setToken(nuevoToken);

      console.log("Login exitoso");
      console.log("JWT recibido correctamente");

    } catch (error) {
      console.error(error);

      if (error.response) {
        setError(
          error.response.data.detail ||
          "Usuario o contraseña incorrectos"
        );
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarEspecie = async (event) => {
  event.preventDefault();

  setGuardando(true);

  try {
    const response = await api.post("/api/especies", {
      nombreComun,
      nombreCientifico,
      categoria,
      descripcion,
      imagen,
    });

    console.log("Especie agregada:", response.data);

    setEspecies((especiesActuales) => [
      ...especiesActuales,
      response.data.especie,
    ]);

    setNombreComun("");
    setNombreCientifico("");
    setCategoria("");
    setDescripcion("");
    setImagen("");

    const modalElement = document.getElementById("modalNuevaEspecie");

    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);

      if (modal) {
        modal.hide();
      }
    }

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((element) => {
        element.remove();
      });

      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }, 500);

  } catch (error) {
    console.error(error);
    alert(
      error.response?.data?.message ||
      "No se pudo agregar la especie"
    );
  } finally {
    setGuardando(false);
  }
};

  useEffect(() => {
    if (!token) {
      return;
    }

    const cargarEspecies = async () => {
      try {
        const response = await api.get("/api/especies");

        setEspecies(response.data);

        console.log("Especies cargadas:", response.data);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          sessionStorage.removeItem("token");
          setToken(null);
          setError("La sesión expiró. Inicia sesión nuevamente.");
        }
      }
    };

    cargarEspecies();
  }, [token]);

  if (token) {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-dark bg-success">
          <div className="container">
            <span className="navbar-brand fw-bold">
              Fungi Atlas
            </span>

            <button
              className="btn btn-light btn-sm"
              onClick={() => {
                sessionStorage.removeItem("token");
                setToken(null);
                setEspecies([]);
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </nav>

        <main className="container py-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-bold mb-1">
                Catálogo de especies
              </h1>

              <p className="text-muted mb-0">
                Bienvenido, {username || "usuario"}.
              </p>
            </div>

            <button
              className="btn btn-success"
              data-bs-toggle="modal"
              data-bs-target="#modalNuevaEspecie"
            >
              + Nueva especie
            </button>
          </div>

          <div className="row g-4">
            {especies.map((especie) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={especie.id}
              >
                <div className="card h-100 shadow-sm border-0">

                  {especie.imagen && (
                    <img
                      src={especie.imagen}
                      className="card-img-top"
                      alt={especie.nombreComun}
                      style={{
                        height: "220px",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <div className="card-body">
                    <h2 className="h5 fw-bold">
                      {especie.nombreComun}
                    </h2>

                    <p className="text-muted fst-italic">
                      {especie.nombreCientifico}
                    </p>

                    <span className="badge text-bg-success mb-3">
                      {especie.categoria}
                    </span>

                    <p className="card-text">
                      {especie.descripcion}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>
                </main>

        <div
          className="modal fade"
          id="modalNuevaEspecie"
          tabIndex="-1"
          aria-labelledby="modalNuevaEspecieLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h2
                  className="modal-title fs-5"
                  id="modalNuevaEspecieLabel"
                >
                  Nueva especie
                </h2>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Cerrar"
                ></button>
              </div>

              <div className="modal-body">
                <p className="text-muted">
                  Completa la información de la nueva especie.
                </p>

                <form id="formNuevaEspecie" onSubmit={handleAgregarEspecie}>
                  <div className="row">

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Nombre común
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Champiñón"
                        value={nombreComun}
                        onChange={(event) => setNombreComun(event.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Nombre científico
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Agaricus bisporus"
                        value={nombreCientifico}
                        onChange={(event) => setNombreCientifico(event.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Categoría
                      </label>

                      <select
                        className="form-select"
                        value={categoria}
                        onChange={(event) => setCategoria(event.target.value)}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="Comestible">Comestible</option>
                        <option value="Tóxico">Tóxico</option>
                        <option value="Medicinal">Medicinal</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>  

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        URL de imagen
                      </label>

                      <input
                          type="url"
                          className="form-control"
                          placeholder="https://..."
                          value={imagen}
                          onChange={(event) => setImagen(event.target.value)}
                        />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        Descripción
                      </label>

                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Describe la especie..."
                        value={descripcion}
                        onChange={(event) => setDescripcion(event.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  form="formNuevaEspecie"
                  className="btn btn-success"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar especie"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-6 col-lg-4">

            <div className="card shadow border-0">
              <div className="card-body p-4">

                <div className="text-center mb-4">
                  <h1 className="fw-bold">
                    Fungi Atlas
                  </h1>

                  <p className="text-muted mb-0">
                    Catálogo de especies de hongos
                  </p>
                </div>

                <h2 className="h5 mb-3">
                  Iniciar sesión
                </h2>

                <form onSubmit={handleLogin}>

                  <div className="mb-3">
                    <label className="form-label">
                      Usuario
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                      placeholder="Ingresa tu usuario"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Contraseña
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "Iniciando sesión..."
                      : "Iniciar sesión"}
                  </button>

                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;