/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CV_ELEMENT = document.getElementById("cv");

const NOMBRE_ARCHIVO = "CV_Eduin_Amilcar_May_Uc";


/* =========================================================
   ESPERAR A QUE TODO CARGUE
========================================================= */

async function prepararCV() {

    // Esperar fuentes
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    // Esperar un momento para Font Awesome
    await new Promise(resolve => setTimeout(resolve, 500));
}


/* =========================================================
   CONFIGURACIÓN DE HTML2CANVAS
========================================================= */

function obtenerCanvas() {

    return html2canvas(CV_ELEMENT, {

        /*
         * Escala alta para obtener una imagen
         * de buena calidad.
         */
        scale: 3,

        /*
         * Evita que el canvas se contamine
         * con recursos externos.
         */
        useCORS: true,

        allowTaint: false,

        /*
         * Fondo blanco.
         */
        backgroundColor: "#ffffff",

        /*
         * Respeta el tamaño real del elemento.
         */
        width: CV_ELEMENT.scrollWidth,

        height: CV_ELEMENT.scrollHeight,

        /*
         * Ignorar botones flotantes.
         */
        ignoreElements: function (element) {

            return element.hasAttribute(
                "data-html2canvas-ignore"
            );

        },

        /*
         * Mejor renderizado.
         */
        logging: false,

        /*
         * No utilizar caché de recursos problemáticos.
         */
        imageTimeout: 15000
    });
}


/* =========================================================
   DESCARGAR PNG
========================================================= */

async function descargarPNG() {

    try {

        mostrarCargando("Generando PNG...");

        await prepararCV();

        const canvas = await obtenerCanvas();

        /*
         * Convertir canvas a PNG.
         */
        const imagen = canvas.toDataURL(
            "image/png",
            1.0
        );

        /*
         * Crear enlace temporal.
         */
        const enlace = document.createElement("a");

        enlace.href = imagen;

        enlace.download =
            NOMBRE_ARCHIVO + ".png";

        document.body.appendChild(enlace);

        enlace.click();

        document.body.removeChild(enlace);

        ocultarCargando();

    } catch (error) {

        ocultarCargando();

        console.error(
            "Error generando PNG:",
            error
        );

        alert(
            "No se pudo generar el PNG.\n\n" +
            "Revisa la consola del navegador."
        );
    }
}


/* =========================================================
   DESCARGAR PDF
========================================================= */

async function descargarPDF() {

    try {

        mostrarCargando("Generando PDF...");

        await prepararCV();

        const canvas = await obtenerCanvas();


        /*
         * Obtener imagen.
         */
        const imagen = canvas.toDataURL(
            "image/png",
            1.0
        );


        /*
         * jsPDF.
         */
        const {
            jsPDF
        } = window.jspdf;


        /*
         * Crear documento A4.
         *
         * width  = 210 mm
         * height = 297 mm
         */
        const pdf = new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4",

            compress: true
        });


        /*
         * Dimensiones A4.
         */
        const anchoPDF = 210;

        const altoPDF = 297;


        /*
         * El CV se coloca exactamente
         * sobre toda la hoja A4.
         */
        pdf.addImage(

            imagen,

            "PNG",

            0,

            0,

            anchoPDF,

            altoPDF,

            undefined,

            "FAST"

        );


        /*
         * Descargar.
         */
        pdf.save(
            NOMBRE_ARCHIVO + ".pdf"
        );


        ocultarCargando();

    } catch (error) {

        ocultarCargando();

        console.error(
            "Error generando PDF:",
            error
        );

        alert(
            "No se pudo generar el PDF.\n\n" +
            "Revisa la consola del navegador."
        );
    }
}


/* =========================================================
   INDICADOR DE CARGA
========================================================= */

function mostrarCargando(texto) {

    let loading =
        document.getElementById(
            "export-loading"
        );


    if (!loading) {

        loading =
            document.createElement("div");

        loading.id =
            "export-loading";

        loading.innerHTML = `
            <div class="export-loading-box">

                <div class="export-spinner"></div>

                <div>
                    ${texto}
                </div>

            </div>
        `;


        document.body.appendChild(
            loading
        );


        const style =
            document.createElement("style");


        style.innerHTML = `

            #export-loading {

                position: fixed;

                inset: 0;

                z-index: 999999;

                background:
                    rgba(0,0,0,.55);

                display: flex;

                align-items: center;

                justify-content: center;

                font-family:
                    Arial, sans-serif;

            }


            .export-loading-box {

                background: white;

                padding: 25px 35px;

                border-radius: 12px;

                display: flex;

                align-items: center;

                gap: 15px;

                font-weight: 600;

                color: #18233b;

                box-shadow:
                    0 15px 50px
                    rgba(0,0,0,.3);

            }


            .export-spinner {

                width: 28px;

                height: 28px;

                border: 4px solid #ddd;

                border-top-color:
                    #1c5fa8;

                border-radius: 50%;

                animation:
                    export-spin
                    .8s linear infinite;

            }


            @keyframes export-spin {

                to {
                    transform: rotate(360deg);
                }

            }

        `;


        document.head.appendChild(
            style
        );
    }
}


/* =========================================================
   OCULTAR CARGA
========================================================= */

function ocultarCargando() {

    const loading =
        document.getElementById(
            "export-loading"
        );


    if (loading) {

        loading.remove();

    }
}