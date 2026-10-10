(() => {

    /* =====================================================
       ELEMENTOS PRINCIPALES
    ===================================================== */

    const root =
        document.documentElement;

    const theme =
        document.getElementById("themeToggle");

    const menu =
        document.getElementById("mainMenu");

    const menuBtn =
        document.getElementById("menuButton");


    /* =====================================================
       MODO NOCHE
    ===================================================== */

    const saved =
        localStorage.getItem("portfolio-theme");


    /*
     * Si el usuario guardó modo oscuro
     * o su sistema usa modo oscuro por defecto,
     * activamos dark mode.
     */

    if (
        saved === "dark" ||
        (
            !saved &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
        )
    ) {

        root.classList.add("dark");

    }


    /* =====================================================
       ACTUALIZAR ICONO DEL TEMA
    ===================================================== */

    const icon = () => {

        if (!theme) {
            return;
        }

        theme.innerHTML =
            root.classList.contains("dark")
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';

    };


    /*
     * Mostrar icono correcto al cargar.
     */

    icon();


    /* =====================================================
       CAMBIAR MODO CLARO / OSCURO
    ===================================================== */

    theme?.addEventListener(
        "click",
        () => {

            /*
             * Alternar clase dark
             */

            root.classList.toggle("dark");


            /*
             * Guardar preferencia
             */

            localStorage.setItem(

                "portfolio-theme",

                root.classList.contains("dark")
                    ? "dark"
                    : "light"

            );


            /*
             * Actualizar icono
             */

            icon();

        }
    );


    /* =====================================================
       MENÚ RESPONSIVE
    ===================================================== */

    menuBtn?.addEventListener(
        "click",
        () => {

            menu?.classList.toggle("open");

        }
    );


    /* =====================================================
       MARCAR PÁGINA ACTIVA EN EL MENÚ
    ===================================================== */

    const current =
        location.pathname
            .split("/")
            .pop() || "index.html";


    document
        .querySelectorAll(".main-menu a")
        .forEach(link => {

            if (
                link.getAttribute("href") === current
            ) {

                link.classList.add("active");

            }

        });


    /* =====================================================
       CARRUSELES
    ===================================================== */

    document
        .querySelectorAll("[data-carousel]")
        .forEach(carousel => {

            /*
             * Elemento que contiene
             * todas las diapositivas.
             */

            const track =
                carousel.querySelector(
                    "[data-track]"
                );


            if (!track) {
                return;
            }


            /*
             * Obtener diapositivas.
             */

            const slides =
                [...track.children];


            if (slides.length === 0) {
                return;
            }


            /*
             * Índice actual.
             */

            let index = 0;


            /* =============================================
               CAMBIAR SLIDE
            ============================================= */

            const go = newIndex => {

                /*
                 * Mantener índice dentro
                 * del número de slides.
                 */

                index =
                    (
                        newIndex +
                        slides.length
                    ) %
                    slides.length;


                /*
                 * Desplazar track.
                 */

                track.style.transform =
                    `translateX(-${index * 100}%)`;

            };


            /* =============================================
               BOTÓN ANTERIOR
            ============================================= */

            carousel
                .querySelector("[data-prev]")
                ?.addEventListener(
                    "click",
                    () => {

                        go(index - 1);

                    }
                );


            /* =============================================
               BOTÓN SIGUIENTE
            ============================================= */

            carousel
                .querySelector("[data-next]")
                ?.addEventListener(
                    "click",
                    () => {

                        go(index + 1);

                    }
                );


            /* =============================================
               REPRODUCCIÓN AUTOMÁTICA
            ============================================= */

            let timer =
                setInterval(
                    () => {

                        go(index + 1);

                    },
                    6000
                );


            /* =============================================
               PAUSAR AL PASAR EL MOUSE
            ============================================= */

            carousel.addEventListener(
                "mouseenter",
                () => {

                    clearInterval(timer);

                }
            );


            /* =============================================
               REANUDAR AL SALIR
            ============================================= */

            carousel.addEventListener(
                "mouseleave",
                () => {

                    clearInterval(timer);

                    timer =
                        setInterval(
                            () => {

                                go(index + 1);

                            },
                            6000
                        );

                }
            );

        });


    /* =====================================================
       FORMULARIO DE CONTACTO
    ===================================================== */

    document
        .getElementById("contactForm")
        ?.addEventListener(
            "submit",
            event => {

                /*
                 * Evitar recargar la página.
                 */

                event.preventDefault();


                /* =========================================
                   OBTENER DATOS
                ========================================= */

                const name =
                    document
                        .getElementById(
                            "contactName"
                        )
                        ?.value
                        .trim() || "";


                const email =
                    document
                        .getElementById(
                            "contactEmail"
                        )
                        ?.value
                        .trim() || "";


                const subject =
                    document
                        .getElementById(
                            "contactSubject"
                        )
                        ?.value
                        .trim() || "";


                const message =
                    document
                        .getElementById(
                            "contactMessage"
                        )
                        ?.value
                        .trim() || "";


                /* =========================================
                   VALIDACIÓN SIMPLE
                ========================================= */

                if (
                    !name ||
                    !email ||
                    !subject ||
                    !message
                ) {

                    alert(
                        "Por favor completa todos los campos."
                    );

                    return;

                }


                /* =========================================
                   CONTENIDO DEL CORREO
                ========================================= */

                const body =
                    `Nombre: ${name}\n` +
                    `Correo: ${email}\n\n` +
                    `${message}`;


                /* =========================================
                   ABRIR CLIENTE DE CORREO
                ========================================= */

                location.href =
                    "mailto:eduin.may95@hotmail.com" +

                    "?subject=" +
                    encodeURIComponent(
                        subject
                    ) +

                    "&body=" +
                    encodeURIComponent(
                        body
                    );

            }
        );

})();