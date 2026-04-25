let carteras = JSON.parse(localStorage.getItem("carteras")) || {};
let carteraActiva = localStorage.getItem("carteraActiva") || "";

/* GUARDAR */
function guardar() {
    localStorage.setItem("carteras", JSON.stringify(carteras));
    localStorage.setItem("carteraActiva", carteraActiva);
}

/* INIT */
if (!carteraActiva && Object.keys(carteras).length > 0) {
    carteraActiva = Object.keys(carteras)[0];
}

if (carteraActiva && !carteras[carteraActiva]) {
    carteras[carteraActiva] = [];
}

actualizarSelector();
mostrarGastos();
calcularBalance();

/* CARTERAS */
function crearCartera() {
    let nombre = document.getElementById("nuevaCartera").value.trim();
    if (!nombre) return;

    if (!carteras[nombre]) {
        carteras[nombre] = [];
    }

    carteraActiva = nombre;

    guardar();
    actualizarSelector();
    mostrarGastos();
    calcularBalance();
}

function cambiarCartera() {
    carteraActiva = document.getElementById("selectorCartera").value;

    guardar();
    mostrarGastos();
    calcularBalance();
}

function editarCartera() {
    let nuevo = prompt("Nuevo nombre:", carteraActiva);
    if (!nuevo || nuevo === carteraActiva) return;

    carteras[nuevo] = carteras[carteraActiva];
    delete carteras[carteraActiva];

    carteraActiva = nuevo;

    guardar();
    actualizarSelector();
}

function borrarCartera() {
    if (!confirm("¿Borrar esta cartera?")) return;

    delete carteras[carteraActiva];

    carteraActiva = Object.keys(carteras)[0] || "";

    guardar();
    actualizarSelector();
    mostrarGastos();
    calcularBalance();
}

function actualizarSelector() {
    let sel = document.getElementById("selectorCartera");
    sel.innerHTML = "";

    Object.keys(carteras).forEach(nombre => {
        let opt = document.createElement("option");
        opt.value = nombre;
        opt.textContent = nombre;

        if (nombre === carteraActiva) opt.selected = true;

        sel.appendChild(opt);
    });
}

/* GASTOS */
function agregarGasto() {
    let d = document.getElementById("descripcion");
    let c = document.getElementById("cantidad");
    let p = document.getElementById("pagador");

    if (!carteraActiva) return;

    carteras[carteraActiva].push({
        descripcion: d.value,
        cantidad: parseFloat(c.value),
        pagador: p.value
    });

    guardar();
    mostrarGastos();
    calcularBalance();

    // LIMPIAR FORMULARIO
    d.value = "";
    c.value = "";
    p.value = "";
}

function mostrarGastos() {
    let lista = document.getElementById("listaGastos");
    lista.innerHTML = "";

    let gastos = carteras[carteraActiva] || [];

    gastos.forEach((g, i) => {
        let li = document.createElement("li");

        li.innerHTML = `
            ${g.descripcion} - ${g.cantidad}€ (${g.pagador})
            <div>
                <button onclick="editarGasto(${i})">✏️</button>
                <button class="borrar" onclick="borrarGasto(${i})">X</button>
            </div>
        `;

        lista.appendChild(li);
    });
}

function borrarGasto(i) {
    carteras[carteraActiva].splice(i, 1);

    guardar();
    mostrarGastos();
    calcularBalance();
}

function editarGasto(i) {
    let g = carteras[carteraActiva][i];

    let d = prompt("Descripción:", g.descripcion);
    let c = prompt("Cantidad:", g.cantidad);
    let p = prompt("Pagador:", g.pagador);

    if (d && c && p) {
        carteras[carteraActiva][i] = {
            descripcion: d,
            cantidad: parseFloat(c),
            pagador: p
        };

        guardar();
        mostrarGastos();
        calcularBalance();
    }
}

/* RESET CARTERA */
function resetear() {
    if (!confirm("¿Borrar gastos de esta cartera?")) return;

    carteras[carteraActiva] = [];

    guardar();
    mostrarGastos();
    calcularBalance();
}

/* RESET GENERAL */
function resetGeneral() {
    if (!confirm("¿Seguro? Se borrará TODO")) return;

    carteras = {};
    carteraActiva = "";

    guardar();
    actualizarSelector();
    mostrarGastos();
    calcularBalance();
}

/* BALANCE */
function calcularBalance() {
    let gastos = carteras[carteraActiva] || [];

    let personas = {};
    let total = 0;

    gastos.forEach(g => {
        total += g.cantidad;

        if (!personas[g.pagador]) {
            personas[g.pagador] = 0;
        }

        personas[g.pagador] += g.cantidad;
    });

    let n = Object.keys(personas).length;

    if (n === 0) {
        document.getElementById("balance").innerHTML = "";
        return;
    }

    let media = total / n;
    let res = "";

    for (let p in personas) {
        let d = personas[p] - media;

        if (d > 0) {
            res += `${p} recibe ${d.toFixed(2)}€<br>`;
        } else {
            res += `${p} paga ${Math.abs(d).toFixed(2)}€<br>`;
        }
    }

    document.getElementById("balance").innerHTML = res;
}