async function esperarRender() {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise(resolve =>
    requestAnimationFrame(() =>
      requestAnimationFrame(resolve)
    )
  );
}


function prepararExportacion() {
  const cv = document.getElementById("cv");

  if (!cv) {
    throw new Error("No se encontró el elemento #cv");
  }

  cv.classList.add("exportando");

  return cv;
}


function finalizarExportacion() {
  document
    .getElementById("cv")
    ?.classList.remove("exportando");
}


async function crearCanvasCV() {
  const cv = prepararExportacion();

  try {
    await esperarRender();

    const rect = cv.getBoundingClientRect();

    const width = Math.ceil(
      Math.max(rect.width, cv.scrollWidth)
    );

    const height = Math.ceil(
      Math.max(rect.height, cv.scrollHeight)
    );

    return await html2canvas(cv, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      imageTimeout: 15000,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,

      onclone: clonedDocument => {
        const clonedCV =
          clonedDocument.getElementById("cv");

        if (clonedCV) {
          clonedCV.classList.add("exportando");
          clonedCV.style.margin = "0";
          clonedCV.style.transform = "none";
          clonedCV.style.boxShadow = "none";
        }

        clonedDocument
          .querySelectorAll(".no-export, button")
          .forEach(el => {
            el.style.display = "none";
          });
      }
    });

  } finally {
    finalizarExportacion();
  }
}


async function descargarPNG() {
  try {
    const canvas = await crearCanvasCV();

    const link = document.createElement("a");

    link.download = "CV-Eduin-Amilcar-May-Uc.png";
    link.href = canvas.toDataURL("image/png", 1);

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("Error generando PNG:", error);
    alert("No se pudo generar el PNG.");
  }
}


async function descargarPDF() {
  try {
    const canvas = await crearCanvasCV();

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const ratio = Math.min(
      pageWidth / canvas.width,
      pageHeight / canvas.height
    );

    const width = canvas.width * ratio;
    const height = canvas.height * ratio;

    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;

    const imgData = canvas.toDataURL("image/png", 1);

    pdf.addImage(
      imgData,
      "PNG",
      x,
      y,
      width,
      height,
      undefined,
      "FAST"
    );

    pdf.save("CV-Eduin-Amilcar-May-Uc.pdf");

  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("No se pudo generar el PDF.");
  }
}
