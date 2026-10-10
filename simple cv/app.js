/* =========================================================
   CONFIGURACIÓN
========================================================= */

const DB_NAME = "CV_Eduin_DB";
const DB_VERSION = 1;
const STORE_NAME = "cv";

let db;
let currentIconTarget = null;
let saveTimeout;


/* =========================================================
   INDEXED DB
========================================================= */

function abrirDB() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(event) {

            const database =
                event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id"
                    }
                );

            }

        };

        request.onsuccess = function(event) {

            db = event.target.result;

            resolve(db);

        };

        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* =========================================================
   SERIALIZAR CV
========================================================= */

function obtenerCV() {

    const cv =
        document.getElementById("cv");

    const photo =
        document.getElementById("profilePhoto");

    const photoContainer =
        document.getElementById(
            "profilePhotoContainer"
        );

    return {

        id: 1,

        html: cv.innerHTML,

        colors: {

            navy:
                getComputedStyle(
                    document.documentElement
                )
                .getPropertyValue("--navy")
                .trim(),

            navy2:
                getComputedStyle(
                    document.documentElement
                )
                .getPropertyValue("--navy2")
                .trim(),

            blue:
                getComputedStyle(
                    document.documentElement
                )
                .getPropertyValue("--blue")
                .trim(),

            green:
                getComputedStyle(
                    document.documentElement
                )
                .getPropertyValue("--green")
                .trim()

        },

        photo: {

            src:
                photo
                    ? photo.src
                    : "",

            visible:
                photoContainer
                    ? photoContainer.style.display !== "none"
                    : false

        }

    };

}


/* =========================================================
   GUARDAR
========================================================= */

async function guardarCV(silent = false) {

    try {

        if (!db) {

            await abrirDB();

        }

        const data =
            obtenerCV();

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        store.put(data);

        transaction.oncomplete =
            function() {

                if (!silent) {

                    Swal.fire({

                        icon: "success",

                        title: "CV guardado",

                        text:
                            "Los cambios se guardaron correctamente.",

                        timer: 1500,

                        showConfirmButton: false

                    });

                }

            };

    } catch(error) {

        console.error(error);

        Swal.fire(
            "Error",
            "No se pudo guardar el CV.",
            "error"
        );

    }

}


/* =========================================================
   CARGAR CV
========================================================= */

async function cargarCV() {

    try {

        if (!db) {

            await abrirDB();

        }

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(
                STORE_NAME
            );

        const request =
            store.get(1);

        request.onsuccess =
            function() {

                if (!request.result) {

                    return;

                }

                const data =
                    request.result;

                document.getElementById(
                    "cv"
                ).innerHTML =
                    data.html;

                if (data.colors) {

                    document.documentElement.style
                        .setProperty(
                            "--navy",
                            data.colors.navy
                        );

                    document.documentElement.style
                        .setProperty(
                            "--navy2",
                            data.colors.navy2
                        );

                    document.documentElement.style
                        .setProperty(
                            "--blue",
                            data.colors.blue
                        );

                    document.documentElement.style
                        .setProperty(
                            "--green",
                            data.colors.green
                        );

                }

                if (data.photo) {

                    const img =
                        document.getElementById(
                            "profilePhoto"
                        );

                    const container =
                        document.getElementById(
                            "profilePhotoContainer"
                        );

                    if (img) {

                        img.src =
                            data.photo.src || "";

                    }

                    if (container) {

                        container.style.display =
                            data.photo.visible
                                ? "block"
                                : "none";

                    }

                }

                activarEventos();

            };

    } catch(error) {

        console.error(error);

    }

}


/* =========================================================
   GUARDADO AUTOMÁTICO
========================================================= */

function programarGuardado() {

    clearTimeout(saveTimeout);

    saveTimeout =
        setTimeout(
            () => {

                let timerInterval;
                Swal.fire({
                  title: "¡Aviso de cierre automático!",
                  html: "Me acercaré <b></b> milisegundos.",
                  timer: 2000,
                  timerProgressBar: true,
                  didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getPopup().querySelector("b");
                    timerInterval = setInterval(() => {
                      timer.textContent = `${Swal.getTimerLeft()}`;
                    }, 100);
                  },
                  willClose: () => {
                    clearInterval(timerInterval);
                    guardarCV(true);
                  }
                }).then((result) => {
                  if (result.dismiss === Swal.DismissReason.timer) console.log("El temporizador cerró mi sesión.");
                });
            },
            700
        );

}


/* =========================================================
   EVENTOS
========================================================= */

function activarEventos() {

    document
        .querySelectorAll(
            '[contenteditable="true"]'
        )
        .forEach(element => {

            if (
                element.dataset.eventoInput
            ) {
                return;
            }

            element.dataset.eventoInput =
                "true";

            element.addEventListener(
                "input",
                function() {

                    programarGuardado();

                }
            );

        });

}


/* =========================================================
   CONTACTOS
========================================================= */

function agregarContacto() {

    const lista =
        document.getElementById(
            "contactos"
        );

    if (!lista) return;

    const li =
        document.createElement("li");

    li.innerHTML = `

        <i class="fa-solid fa-circle-info"></i>

        <span
            contenteditable="true"
            data-save>
            Nuevo contacto
        </span>

        <button
            class="delete-side no-export"
            onclick="eliminarContacto(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    lista.appendChild(li);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR CONTACTO
========================================================= */

async function eliminarContacto(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar contacto?",

            text:
                "Esta acción no se puede deshacer.",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest("li")
        .remove();

    programarGuardado();

}


/* =========================================================
   EDUCACIÓN
========================================================= */

function agregarEducacion() {

    const container =
        document.getElementById(
            "educacion"
        );

    if (!container) return;

    const div =
        document.createElement("div");

    div.className =
        "education editable-side-card";

    div.innerHTML = `

        <strong
            contenteditable="true"
            data-save>
            Nueva institución
        </strong>

        <span
            contenteditable="true"
            data-save>
            Nueva carrera
        </span>

        <small
            contenteditable="true"
            data-save>

            <i class="fa-regular fa-calendar"></i>

            2026 - 2027

        </small>

        <button
            class="delete-side no-export"
            onclick="eliminarEducacion(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    container.appendChild(div);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR EDUCACIÓN
========================================================= */

async function eliminarEducacion(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar educación?",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest(".education")
        .remove();

    programarGuardado();

}


/* =========================================================
   CERTIFICACIONES
========================================================= */

function agregarCertificacion() {

    const lista =
        document.getElementById(
            "certificaciones"
        );

    if (!lista) return;

    const li =
        document.createElement("li");

    li.innerHTML = `

        <span
            contenteditable="true"
            data-save>
            Nueva certificación
        </span>

        <button
            class="delete-side no-export"
            onclick="eliminarCertificacion(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    lista.appendChild(li);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR CERTIFICACIÓN
========================================================= */

async function eliminarCertificacion(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar certificación?",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest("li")
        .remove();

    programarGuardado();

}


/* =========================================================
   HABILIDADES
========================================================= */

function agregarHabilidad() {

    const grupo =
        document.querySelector(
            "#habilidades .skill-group"
        );

    if (!grupo) return;

    const row =
        document.createElement("div");

    row.className =
        "skill-row";

    row.innerHTML = `

        <span
            contenteditable="true"
            data-save>
            Nueva habilidad
        </span>

        <span class="dots">

            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>

            <b></b>
            <b></b>

        </span>

        <button
            class="delete-side no-export"
            onclick="eliminarHabilidad(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    grupo.appendChild(row);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR HABILIDAD
========================================================= */

async function eliminarHabilidad(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar habilidad?",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest(".skill-row")
        .remove();

    programarGuardado();

}


/* =========================================================
   CLOUD
========================================================= */

function agregarCloud() {

    const container =
        document.getElementById(
            "cloudItems"
        );

    if (!container) return;

    const div =
        document.createElement("div");

    div.className =
        "cloud-item";

    div.innerHTML = `

        <i class="fa-solid fa-cloud"></i>

        <span
            contenteditable="true"
            data-save>
            Nueva tecnología Cloud
        </span>

        <button
            class="delete-side no-export"
            onclick="eliminarCloud(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    container.appendChild(div);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR CLOUD
========================================================= */

async function eliminarCloud(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar tecnología Cloud?",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest(".cloud-item")
        .remove();

    programarGuardado();

}


/* =========================================================
   EXPERIENCIAS
========================================================= */

function agregarExperiencia() {

    const container =
        document.getElementById(
            "experiencias"
        );

    if (!container) return;

    const article =
        document.createElement("article");

    article.className =
        "job editable-item";

    article.innerHTML = `

        <span class="timeline-dot"></span>

        <div class="job-header">

            <div>

                <h3
                    contenteditable="true"
                    data-save>
                    NUEVO PUESTO
                </h3>

                <h4
                    contenteditable="true"
                    data-save>
                    NUEVA EMPRESA
                </h4>

            </div>

            <time
                contenteditable="true"
                data-save>
                2026 – ACTUAL
            </time>

        </div>

        <ul class="job-list">

            <li
                contenteditable="true"
                data-save>

                Nuevo logro profesional.

                <button
                    class="bullet-delete no-export"
                    onclick="eliminarBullet(this)">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </li>

        </ul>

        <div class="item-actions no-export">

            <button
                onclick="agregarBullet(this)"
                class="btn btn-sm btn-success">

                <i class="fa-solid fa-plus"></i>

                Agregar punto

            </button>

        </div>

    `;

    container.appendChild(article);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   AGREGAR BULLET
========================================================= */

function agregarBullet(button) {

    const job =
        button.closest(".job");

    if (!job) return;

    const lista =
        job.querySelector(".job-list");

    const li =
        document.createElement("li");

    li.setAttribute(
        "contenteditable",
        "true"
    );

    li.setAttribute(
        "data-save",
        ""
    );

    li.innerHTML = `

        Nuevo logro profesional.

        <button
            class="bullet-delete no-export"
            onclick="eliminarBullet(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    lista.appendChild(li);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR BULLET
========================================================= */

async function eliminarBullet(button) {

    const li =
        button.closest("li");

    const result =
        await Swal.fire({

            title:
                "¿Eliminar este punto?",

            text:
                "La experiencia se conservará.",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    li.remove();

    programarGuardado();

}


/* =========================================================
   COMPETENCIAS
========================================================= */

function agregarCompetencia() {

    const container =
        document.getElementById(
            "competencias"
        );

    if (!container) return;

    const div =
        document.createElement("div");

    div.className =
        "competency editable-card";

    div.innerHTML = `

        <i class="fa-solid fa-code"></i>

        <span
            contenteditable="true"
            data-save>

            Nueva competencia
            <br>
            profesional

        </span>

        <button
            class="no-export"
            onclick="eliminarCompetencia(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    container.appendChild(div);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR COMPETENCIA
========================================================= */

async function eliminarCompetencia(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar competencia?",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest(".competency")
        .remove();

    programarGuardado();

}


/* =========================================================
   STACK
========================================================= */

function agregarTecnologia() {

    const container =
        document.getElementById(
            "stack"
        );

    if (!container) return;

    const div =
        document.createElement("div");

    div.className =
        "stack-item editable-card";

    div.innerHTML = `

        <i class="fa-solid fa-code"></i>

        <span
            contenteditable="true"
            data-save>

            Nueva tecnología

        </span>

        <button
            class="no-export"
            onclick="eliminarStack(this)">

            <i class="fa-solid fa-xmark"></i>

        </button>

    `;

    container.appendChild(div);

    activarEventos();

    programarGuardado();

}


/* =========================================================
   ELIMINAR STACK
========================================================= */

async function eliminarStack(button) {

    const result =
        await Swal.fire({

            title:
                "¿Eliminar tecnología?",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonColor:
                "#dc3545",

            confirmButtonText:
                "Eliminar",

            cancelButtonText:
                "Cancelar"

        });

    if (!result.isConfirmed) return;

    button
        .closest(".stack-item")
        .remove();

    programarGuardado();

}


/* =========================================================
   COLORES
========================================================= */

function abrirColores() {

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "colorModal"
            )
        );

    modal.show();

}


function aplicarColores() {

    document.documentElement.style
        .setProperty(
            "--navy",
            document.getElementById(
                "colorNavy"
            ).value
        );

    document.documentElement.style
        .setProperty(
            "--navy2",
            document.getElementById(
                "colorNavy2"
            ).value
        );

    document.documentElement.style
        .setProperty(
            "--blue",
            document.getElementById(
                "colorBlue"
            ).value
        );

    document.documentElement.style
        .setProperty(
            "--green",
            document.getElementById(
                "colorGreen"
            ).value
        );

    bootstrap.Modal
        .getInstance(
            document.getElementById(
                "colorModal"
            )
        )
        .hide();

    programarGuardado();

}


/* =========================================================
   FOTO
========================================================= */

function abrirFoto() {

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "photoModal"
            )
        );

    const container =
        document.getElementById(
            "profilePhotoContainer"
        );

    const checkbox =
        document.getElementById(
            "showPhoto"
        );

    if (checkbox && container) {

        checkbox.checked =
            container.style.display !== "none";

    }

    modal.show();

}


function guardarFoto() {

    const input =
        document.getElementById(
            "photoInput"
        );

    const mostrar =
        document.getElementById(
            "showPhoto"
        ).checked;

    if (
        input &&
        input.files.length > 0
    ) {

        const file =
            input.files[0];

        const reader =
            new FileReader();

        reader.onload =
            function(event) {

                document.getElementById(
                    "profilePhoto"
                ).src =
                    event.target.result;

                document.getElementById(
                    "profilePhotoContainer"
                ).style.display =
                    mostrar
                        ? "block"
                        : "none";

                programarGuardado();

            };

        reader.readAsDataURL(file);

    } else {

        document.getElementById(
            "profilePhotoContainer"
        ).style.display =
            mostrar
                ? "block"
                : "none";

        programarGuardado();

    }

    bootstrap.Modal
        .getInstance(
            document.getElementById(
                "photoModal"
            )
        )
        .hide();

}


function eliminarFoto() {

    Swal.fire({

        title:
            "¿Eliminar foto?",

        icon:
            "warning",

        showCancelButton:
            true,

        confirmButtonColor:
            "#dc3545",

        confirmButtonText:
            "Eliminar",

        cancelButtonText:
            "Cancelar"

    }).then(result => {

        if (!result.isConfirmed) return;

        const image =
            document.getElementById(
                "profilePhoto"
            );

        const container =
            document.getElementById(
                "profilePhotoContainer"
            );

        const input =
            document.getElementById(
                "photoInput"
            );

        const checkbox =
            document.getElementById(
                "showPhoto"
            );

        if (image) {

            image.src = "";

        }

        if (container) {

            container.style.display =
                "none";

        }

        if (input) {

            input.value = "";

        }

        if (checkbox) {

            checkbox.checked =
                false;

        }

        programarGuardado();

    });

}


/* =========================================================
   ICONOS
========================================================= */

const iconos = [

    "fa-code",
    "fa-server",
    "fa-database",
    "fa-cloud",
    "fa-cloud-arrow-up",
    "fa-cloud-arrow-down",
    "fa-laptop-code",
    "fa-mobile-screen",
    "fa-globe",
    "fa-bolt",
    "fa-fire",
    "fa-gears",
    "fa-cogs",
    "fa-terminal",
    "fa-code-branch",
    "fa-github",
    "fa-git-alt",
    "fa-docker",
    "fa-node-js",
    "fa-js",
    "fa-php",
    "fa-laravel",
    "fa-bootstrap",
    "fa-aws",
    "fa-microsoft",
    "fa-java",
    "fa-python",
    "fa-react",
    "fa-angular",
    "fa-vuejs",
    "fa-leaf",
    "fa-envelope",
    "fa-phone",
    "fa-user",
    "fa-users",
    "fa-graduation-cap",
    "fa-award",
    "fa-bullseye",
    "fa-lightbulb",
    "fa-puzzle-piece",
    "fa-chart-line",
    "fa-arrow-trend-up",
    "fa-arrows-rotate",
    "fa-layer-group",
    "fa-diagram-project",
    "fa-box",
    "fa-box-archive",
    "fa-shield",
    "fa-lock",
    "fa-key",
    "fa-wrench",
    "fa-screwdriver-wrench",
    "fa-list-check",
    "fa-check",
    "fa-star",
    "fa-heart",
    "fa-circle-check",
    "fa-microchip",
    "fa-network-wired",
    "fa-sitemap",
    "fa-table",
    "fa-chart-pie",
    "fa-chart-bar",
    "fa-briefcase",
    "fa-building",
    "fa-address-book"

];


function abrirIconos(element) {

    currentIconTarget =
        element;

    const container =
        document.getElementById(
            "iconPicker"
        );

    if (!container) return;

    container.innerHTML =
        "";

    iconos.forEach(
        icon => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "icon-option";

            button.innerHTML =
                `<i class="fa-solid ${icon}"></i>`;

            button.onclick =
                function() {

                    cambiarIcono(
                        icon
                    );

                };

            container.appendChild(
                button
            );

        }
    );

    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "iconModal"
            )
        );

    modal.show();

}


function cambiarIcono(icon) {

    if (!currentIconTarget) {
        return;
    }

    currentIconTarget.className =
        "";

    currentIconTarget.classList.add(
        "fa-solid"
    );

    currentIconTarget.classList.add(
        icon
    );

    bootstrap.Modal
        .getInstance(
            document.getElementById(
                "iconModal"
            )
        )
        .hide();

    currentIconTarget =
        null;

    programarGuardado();

}


/* =========================================================
   CLICK DERECHO = CAMBIAR ICONO
========================================================= */

document.addEventListener(
    "contextmenu",
    function(event) {

        const icon =
            event.target.closest(
                ".competency > i, " +
                ".stack-item > i, " +
                ".cloud-item > i, " +
                ".circle-icon > i"
            );

        if (!icon) return;

        event.preventDefault();

        abrirIconos(icon);

    }
);


/* =========================================================
   BUSCADOR DE ICONOS
========================================================= */

const iconSearch =
    document.getElementById(
        "iconSearch"
    );

if (iconSearch) {

    iconSearch.addEventListener(
        "input",
        function() {

            const search =
                this.value.toLowerCase();

            document
                .querySelectorAll(
                    ".icon-option"
                )
                .forEach(
                    button => {

                        button.style.display =
                            button.innerText
                                .toLowerCase()
                                .includes(search)
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


/* =========================================================
   CAMBIO DE COLOR DE TEXTO
========================================================= */

document.addEventListener(
    "dblclick",
    function(event) {

        const target =
            event.target.closest(
                "[contenteditable='true']"
            );

        if (!target) return;

        const input =
            document.createElement(
                "input"
            );

        input.type =
            "color";

        input.value =
            rgbToHex(
                getComputedStyle(
                    target
                ).color
            );

        input.style.position =
            "fixed";

        input.style.left =
            event.clientX + "px";

        input.style.top =
            event.clientY + "px";

        input.style.zIndex =
            "99999";

        document.body.appendChild(
            input
        );

        input.click();

        input.addEventListener(
            "input",
            function() {

                target.style.color =
                    input.value;

                programarGuardado();

            }
        );

        input.addEventListener(
            "change",
            function() {

                input.remove();

            }
        );

    }
);


/* =========================================================
   RGB → HEX
========================================================= */

function rgbToHex(rgb) {

    const result =
        rgb.match(/\d+/g);

    if (!result) {

        return "#000000";

    }

    return "#" +
        result
            .slice(0, 3)
            .map(
                x =>
                    Number(x)
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");

}


/* =========================================================
   PREPARAR EXPORTACIÓN
========================================================= */

function prepararExportacion() {

    const cv =
        document.getElementById(
            "cv"
        );

    if (!cv) {

        throw new Error(
            "No se encontró el elemento #cv"
        );

    }

    cv.classList.add(
        "exportando"
    );

    return cv;

}


/* =========================================================
   FINALIZAR EXPORTACIÓN
========================================================= */

function finalizarExportacion() {

    const cv =
        document.getElementById(
            "cv"
        );

    if (cv) {

        cv.classList.remove(
            "exportando"
        );

    }

}


/* =========================================================
   PNG
========================================================= */

async function descargarPNG() {

    const cv =
        prepararExportacion();

    Swal.fire({

        title:
            "Generando PNG...",

        text:
            "Tomando el tamaño real del CV.",

        allowOutsideClick:
            false,

        didOpen: () => {

            Swal.showLoading();

        }

    });

    try {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    150
                )
        );

        /*
        =====================================================
        OBTENER TAMAÑO REAL DE LA WEB
        =====================================================
        */

        const rect =
            cv.getBoundingClientRect();

        const width =
            Math.ceil(
                rect.width
            );

        const height =
            Math.ceil(
                rect.height
            );

        /*
        =====================================================
        CREAR CANVAS
        =====================================================
        */

        const canvas =
            await html2canvas(
                cv,
                {

                    scale: 2,

                    width:
                        width,

                    height:
                        height,

                    windowWidth:
                        width,

                    windowHeight:
                        height,

                    useCORS:
                        true,

                    allowTaint:
                        false,

                    backgroundColor:
                        "#ffffff",

                    logging:
                        false,

                    scrollX:
                        0,

                    scrollY:
                        0

                }
            );

        /*
        =====================================================
        DESCARGAR
        =====================================================
        */

        const link =
            document.createElement(
                "a"
            );

        link.download =
            "CV-Eduin-Amilcar-May-Uc.png";

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.click();

        finalizarExportacion();

        Swal.close();

    } catch(error) {

        console.error(error);

        finalizarExportacion();

        Swal.fire({

            icon:
                "error",

            title:
                "Error",

            text:
                "No se pudo generar el PNG."

        });

    }

}


/* =========================================================
   PDF
   SE AJUSTA AL TAMAÑO REAL DE LA WEB
========================================================= */

async function descargarPDF() {

    const cv =
        prepararExportacion();

    Swal.fire({

        title:
            "Generando PDF...",

        text:
            "Ajustando el PDF al tamaño real del CV.",

        allowOutsideClick:
            false,

        didOpen: () => {

            Swal.showLoading();

        }

    });

    try {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    150
                )
        );

        /*
        =====================================================
        TAMAÑO REAL DEL CV EN PANTALLA
        =====================================================
        */

        const rect =
            cv.getBoundingClientRect();

        const webWidth =
            Math.ceil(
                rect.width
            );

        const webHeight =
            Math.ceil(
                rect.height
            );

        /*
        =====================================================
        HTML → CANVAS
        =====================================================
        */

        const canvas =
            await html2canvas(
                cv,
                {

                    scale: 2,

                    width:
                        webWidth,

                    height:
                        webHeight,

                    windowWidth:
                        webWidth,

                    windowHeight:
                        webHeight,

                    useCORS:
                        true,

                    allowTaint:
                        false,

                    backgroundColor:
                        "#ffffff",

                    logging:
                        false,

                    scrollX:
                        0,

                    scrollY:
                        0

                }
            );

        /*
        =====================================================
        CONVERSIÓN PIXELES → MM
        =====================================================
        */

        const pxToMm =
            0.264583;

        const pdfWidth =
            (canvas.width / 2) *
            pxToMm;

        const pdfHeight =
            (canvas.height / 2) *
            pxToMm;

        /*
        =====================================================
        CREAR PDF DEL MISMO TAMAÑO
        =====================================================
        */

        const {
            jsPDF
        } =
            window.jspdf;

        const orientation =
            pdfWidth > pdfHeight
                ? "landscape"
                : "portrait";

        const pdf =
            new jsPDF({

                orientation:
                    orientation,

                unit:
                    "mm",

                format:
                    [
                        pdfWidth,
                        pdfHeight
                    ],

                compress:
                    true

            });

        /*
        =====================================================
        INSERTAR EXACTAMENTE EN LA PÁGINA
        =====================================================
        */

        const imgData =
            canvas.toDataURL(
                "image/png"
            );

        pdf.addImage(

            imgData,

            "PNG",

            0,

            0,

            pdfWidth,

            pdfHeight,

            undefined,

            "FAST"

        );

        /*
        =====================================================
        GUARDAR
        =====================================================
        */

        pdf.save(
            "CV-Eduin-Amilcar-May-Uc.pdf"
        );

        finalizarExportacion();

        Swal.close();

    } catch(error) {

        console.error(error);

        finalizarExportacion();

        Swal.fire({

            icon:
                "error",

            title:
                "Error",

            text:
                "No se pudo generar el PDF."

        });

    }

}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        try {

            await abrirDB();

            await cargarCV();

            activarEventos();

        } catch(error) {

            console.error(
                "Error inicializando CV:",
                error
            );

        }

    }
);