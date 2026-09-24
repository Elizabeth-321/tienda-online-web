
/*  LOGICA COMPARTIDA: SESION,CATALOGO DE PRODUCTOS Y CARRITO DE COMPRA  */


const KEY_SESION = "inv_sesion";
const KEY_PRODUCTOS = "inv_productos";
const KEY_CARRITO = "inv_carrito";
const KEY_INTENTOS = "inv_intentos";

/* ============ SEED DE PRODUCTOS (TOYWORLD) ============ */
/* Siembra localStorage la primera vez que se abre cualquier página */

const SEED_PRODUCTOS = [
  { id: 1, codigo: "JW-001", nombre: "Oso de Peluche Gigante 1m",   categoria: "Peluches",     precio: 19990, stock: 12, activo: true,
    img: "./img/oso de peluche gigante.webp" },
  { id: 2, codigo: "JW-002", nombre: "Auto Ferrari Control Remoto", categoria: "Vehículos",    precio: 24990, stock: 30, activo: true,
    img: "./img/Auto a control remoto.avif" },
  { id: 3, codigo: "JW-003", nombre: "Set Lego Star Wars X-Wing",   categoria: "Construcción", precio: 45990, stock: 15, activo: true,
    img: "./img/set lego.jpg" },
  { id: 4, codigo: "JW-004", nombre: "Muñeca Articulada Barbie",    categoria: "Muñecas",      precio: 12990, stock: 45, activo: true,
    img: "./img/muñeca barbie.webp" },
  { id: 5, codigo: "JW-005", nombre: "Juego de Mesa Monopoly",      categoria: "Juegos Mesa",   precio: 18990, stock: 8,  activo: true,
    img: "./img/monopoly.jpg" },
  { id: 6, codigo: "JW-006", nombre: "Pistola de Agua Nerf Super",  categoria: "Aire Libre",    precio: 15990, stock: 0,  activo: false,
    img:"./img/pistola de agua.webp" },
  { id: 7, codigo: "JW-007", nombre: "Pista de Autos Hot Wheels",   categoria: "Vehículos",     precio: 29990, stock: 20, activo: true,
    img: "./img/pista.jpg"},
  { id: 8, codigo: "JW-008", nombre: "Rompecabezas 1000 Piezas",    categoria: "Juegos Mesa",   precio: 9990,  stock: 0,  activo: true,
    img: "./img/rompecabezas.webp" },
];

function leerSesion() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY_SESION));
    if (!s || !s.usuario || !s.rol) return null;
    if (s.expira && Date.now() > s.expira) {
      sessionStorage.removeItem(KEY_SESION);
      return null;
    }
    return s;
  } catch (e) {
    return null;
  }
}

/**
 * Exige sesión activa para ver la página actual.
 * Si no hay sesión -> redirige a login.
 * Si se pasan roles permitidos y el rol de la sesión no está incluido -> redirige a index (acceso denegado).
 * Devuelve el objeto de sesión si todo está OK.
 */
function exigirSesion(rolesPermitidos) {
  const sesion = leerSesion();
  if (!sesion) {
    window.location.replace("login.html");
    return null;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(sesion.rol)) {
    window.location.replace("index.html");
    return null;
  }
  return sesion;
}

function cerrarSesion() {
  sessionStorage.removeItem(KEY_SESION);
  window.location.replace("login.html");
}


/* ---------------- PRODUCTOS ---------------- */

function cargarProductos() {
  const guardados = localStorage.getItem(KEY_PRODUCTOS);
  if (guardados) {
    try { return JSON.parse(guardados); } catch (e) { /* cae al seed */ }
  }
  localStorage.setItem(KEY_PRODUCTOS, JSON.stringify(SEED_PRODUCTOS));
  return SEED_PRODUCTOS;
}

function guardarProductos(productos) {
  localStorage.setItem(KEY_PRODUCTOS, JSON.stringify(productos));
}


/* ---------------- CARRITO ---------------- */

function cargarCarrito() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CARRITO)) || [];
  } catch (e) {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(KEY_CARRITO, JSON.stringify(carrito));
  actualizarBadgeCarrito();
}


/** Agrega 1 unidad de un producto al carrito (respetando el stock disponible) */
function agregarAlCarrito(idProducto) {
  const productos = cargarProductos();
  const producto = productos.find(p => p.id === idProducto);
  if (!producto || !producto.activo || producto.stock <= 0) return false;

  const carrito = cargarCarrito();
  const item = carrito.find(i => i.id === idProducto);
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual + 1 > producto.stock) return false;

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: producto.id, cantidad: 1 });
  }
  guardarCarrito(carrito);
  return true;
}

function totalUnidadesCarrito() {
  return cargarCarrito().reduce((acc, i) => acc + i.cantidad, 0);
}

/** Actualiza el contador del carrito en el navbar, si existe en la página */
function actualizarBadgeCarrito() {
  const badge = document.getElementById("badgeCarrito");
  if (!badge) return;
  const total = totalUnidadesCarrito();
  badge.textContent = total;
  badge.classList.toggle("d-none", total === 0);
}


/* ---------------- UTILIDADES ---------------- */

function formatoCLP(numero) {
  return numero.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

/** Pinta nombre/rol en el navbar y engancha el botón de cerrar sesión, en las páginas que los tengan */
function pintarSesionEnNav(sesion) {
  const elUsuario = document.getElementById("navUsuario");
  const elRol     = document.getElementById("badgeRol");
  const elNombre  = document.getElementById("nombreUsuario");
  if (elUsuario) elUsuario.textContent = sesion.usuario;
  if (elRol)     elRol.textContent     = sesion.rol === "admin" ? "Administrador" : "Usuario";
  if (elNombre)  elNombre.textContent  = sesion.nombre;

  const linkMantenedor = document.getElementById("navMantenedor");
  if (linkMantenedor) linkMantenedor.classList.toggle("d-none", sesion.rol !== "admin");

  const btnSalir = document.getElementById("btnSalir");
  if (btnSalir) btnSalir.addEventListener("click", cerrarSesion);

  actualizarBadgeCarrito();
}
