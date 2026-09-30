/* =========================================================
   HASTA ENTONCES 2.0 - LÓGICA DE AUDIO NATIVA Y NAVEGACIÓN
   ========================================================= */

let historialPantallas = ["inicio"];

/* =========================
   CONTROL DE AUDIO NATIVO
========================= */

function iniciarApp() {
    const audio = document.getElementById("musicaFondo");
    if (audio) {
        audio.play().then(() => {
            actualizarBotonAudio(true);
        }).catch(err => {
            console.warn("Autoplay bloqueado o archivo no encontrado:", err);
            actualizarBotonAudio(false);
        });
    }
    mostrarPantalla("cuenta");
}

function alternarAudio() {
    const audio = document.getElementById("musicaFondo");
    if (!audio) return;

    if (audio.paused) {
        audio.play().then(() => {
            actualizarBotonAudio(true);
        }).catch(err => {
            console.error("Error al reproducir audio:", err);
            actualizarBotonAudio(false);
        });
    } else {
        audio.pause();
        actualizarBotonAudio(false);
    }
}

function actualizarBotonAudio(reproduciendo) {
    const btn = document.getElementById("btnAudio");
    if (btn) {
        btn.textContent = reproduciendo ? "🔊" : "🔇";
    }
}

function pausarMusicaFondo() {
    const audio = document.getElementById("musicaFondo");
    if (audio && !audio.paused) {
        audio.pause();
        actualizarBotonAudio(false);
    }
}

/* =========================
   NAVEGACIÓN ENTRE PANTALLAS
========================= */

function mostrarPantalla(id) {
    const pantallaActual = document.querySelector(".pantalla.activa");

    if (pantallaActual && pantallaActual.id !== id) {
        historialPantallas.push(pantallaActual.id);
    }

    document.querySelectorAll(".pantalla").forEach(function(pantalla) {
        pantalla.classList.remove("activa");
    });

    const nuevaPantalla = document.getElementById(id);
    if (nuevaPantalla) {
        nuevaPantalla.classList.add("activa");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

/* =========================
   DETECCIÓN DE CAMBIO DE PESTAÑA
========================= */

document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        pausarMusicaFondo();
    }
});

/* =========================
   CUENTAS REGRESIVAS (ESPAÑA Y LOCAL)
   Apunta al mismo instante exacto: 00:00 AM en España del 1 de octubre
========================= */

const objetivoEspanaStr = "2026-10-01T00:00:00+02:00"; // 00:00 AM en España (1 de oct)
const objetivoEcuadorStr = "2026-09-30T17:00:00-05:00"; // 17:00 PM en Ecuador (30 de sep)

function calcularTiempoRestanteZona(isoStringObjetivo) {
    const objetivoMs = new Date(isoStringObjetivo).getTime();
    const ahoraMs = Date.now();

    const diferencia = objetivoMs - ahoraMs;

    if (diferencia <= 0) {
        return { dias: "00", horas: "00", minutos: "00", segundos: "00", finalizado: true };
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    return {
        dias: String(dias).padStart(2, "0"),
        horas: String(horas).padStart(2, "0"),
        minutos: String(minutos).padStart(2, "0"),
        segundos: String(segundos).padStart(2, "0"),
        finalizado: false
    };
}

let espanaTerminada = false;
let localTerminada = false;
let sorpresaDesbloqueada = false;

function actualizarContadores() {
    // 1. Reloj de España (Pantalla 2)
    const tEspana = calcularTiempoRestanteZona(objetivoEspanaStr);
    espanaTerminada = tEspana.finalizado;

    const elD = document.getElementById("dias");
    const elH = document.getElementById("horas");
    const elM = document.getElementById("minutos");
    const elS = document.getElementById("segundos");

    if (elD) elD.textContent = tEspana.dias;
    if (elH) elH.textContent = tEspana.horas;
    if (elM) elM.textContent = tEspana.minutos;
    if (elS) elS.textContent = tEspana.segundos;

    // 2. Reloj Local / Ecuador (Pantalla 7)
    const tLocal = calcularTiempoRestanteZona(objetivoEcuadorStr);
    localTerminada = tLocal.finalizado;

    const elD2 = document.getElementById("dias2");
    const elH2 = document.getElementById("horas2");
    const elM2 = document.getElementById("minutos2");
    const elS2 = document.getElementById("segundos2");

    if (elD2) elD2.textContent = tLocal.dias;
    if (elH2) elH2.textContent = tLocal.horas;
    if (elM2) elM2.textContent = tLocal.minutos;
    if (elS2) elS2.textContent = tLocal.segundos;

    // Verificar si se ha llegado a la hora objetivo para desbloquear el botón
    verificarDesbloqueoSorpresa();
}

function verificarDesbloqueoSorpresa() {
    if (espanaTerminada || localTerminada) {
        sorpresaDesbloqueada = true;

        // Habilita visualmente el botón de sorpresa en la pantalla final
        const btnSorpresa = document.getElementById("btnSorpresa");
        if (btnSorpresa) {
            btnSorpresa.style.opacity = "1";
            btnSorpresa.style.pointerEvents = "auto";
            btnSorpresa.removeAttribute("disabled");
        }
    }
}

actualizarContadores();
setInterval(actualizarContadores, 1000);

/* =========================
   HORARIOS (ECUADOR Y ESPAÑA)
========================= */

function actualizarHoras() {
    const ahora = new Date();

    const horaEcuador = ahora.toLocaleTimeString("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    const horaEspana = ahora.toLocaleTimeString("es-ES", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });

    const elementoEcuador = document.getElementById("horaEcuador");
    const elementoEspana = document.getElementById("horaEspana");

    if (elementoEcuador) elementoEcuador.textContent = horaEcuador;
    if (elementoEspana) elementoEspana.textContent = horaEspana;
}

actualizarHoras();
setInterval(actualizarHoras, 1000);

/* =========================
   SPOTIFY, SORPRESA Y MODAL
========================= */

function abrirSpotify() {
    pausarMusicaFondo();
    const linkSpotify = "https://open.spotify.com/track/7zoVtzzASRtacCvgQKLFaS?si=gvbWaoWIS6yoz5q9p9QOfw&utm_source=copy-link";
    window.open(linkSpotify, "_blank");
}

function abrirSorpresa() {
    pausarMusicaFondo();

    if (sorpresaDesbloqueada) {
        const linkSorpresa = "https://fernandatayupanda11.github.io/01.10.26/";
        window.open(linkSorpresa, "_blank");
    } else {
        alert("Aún tienes que esperar un poquito... La sorpresa se abrirá cuando sean las 00:00 en España del 1 de octubre. ♡");
    }
}

function confirmarSalida() {
    const modal = document.getElementById("modalSalir");
    if (modal) modal.classList.add("activo");
}

function cancelarSalida() {
    const modal = document.getElementById("modalSalir");
    if (modal) modal.classList.remove("activo");
}

function ejecutarSalida() {
    cancelarSalida();

    const audio = document.getElementById("musicaFondo");
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        actualizarBotonAudio(false);
    }

    mostrarPantalla("pantallaCierre");
}