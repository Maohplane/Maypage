(() => {
    "use strict";

    const pageIds = ["inicio", "album", "constelaciones", "carro", "cumple", "secret"];
    const pages = [...document.querySelectorAll("[data-page]")];
    const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    const menuButton = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".site-nav");
    const header = document.querySelector(".site-header");

    function currentPageId() {
        const requestedPage = window.location.hash.slice(1);
        return pageIds.includes(requestedPage) ? requestedPage : "inicio";
    }

    function closeMenu() {
        menu?.classList.remove("is-open");
        menuButton?.setAttribute("aria-expanded", "false");
    }

    function pauseAllAudio(exceptId = "") {
        document.querySelectorAll("audio").forEach((audio) => {
            if (audio.id === exceptId) return;
            audio.pause();
            audio.currentTime = 0;
        });
    }

    function showCurrentPage({ moveFocus = false } = {}) {
        const activeId = currentPageId();

        pages.forEach((page) => {
            page.hidden = page.id !== activeId;
        });

        navLinks.forEach((link) => {
            const isActive = link.hash === `#${activeId}`;
            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        document.title = activeId === "inicio"
            ? "Para May"
            : `${document.querySelector(`#${activeId} h1`)?.textContent.trim() || "Para May"} · Para May`;

        pauseAllAudio();
        closeMenu();
        window.scrollTo({ top: 0, behavior: "auto" });

        if (moveFocus) {
            const heading = document.querySelector(`#${activeId} h1`);
            if (heading) {
                heading.tabIndex = -1;
                heading.focus({ preventScroll: true });
            }
        }
    }

    menuButton?.addEventListener("click", () => {
        const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
        menuButton.setAttribute("aria-expanded", String(willOpen));
        menu?.classList.toggle("is-open", willOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        if (!menu?.classList.contains("is-open")) return;
        if (menu.contains(event.target) || menuButton?.contains(event.target)) return;
        closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("hashchange", () => showCurrentPage({ moveFocus: true }));
    window.addEventListener("scroll", () => {
        header?.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });

    if (!window.location.hash || !pageIds.includes(window.location.hash.slice(1))) {
        history.replaceState(null, "", "#inicio");
    }
    showCurrentPage();

    const anniversaryCountdown = document.querySelector("[data-countdown]");

    if (anniversaryCountdown) {
        const targetDate = new Date(anniversaryCountdown.dataset.targetDate);
        const timer = anniversaryCountdown.querySelector('[role="timer"]');
        const message = anniversaryCountdown.querySelector("[data-countdown-message]");
        const fields = {
            days: anniversaryCountdown.querySelector("[data-countdown-days]"),
            hours: anniversaryCountdown.querySelector("[data-countdown-hours]"),
            minutes: anniversaryCountdown.querySelector("[data-countdown-minutes]"),
            seconds: anniversaryCountdown.querySelector("[data-countdown-seconds]")
        };

        function updateAnniversaryCountdown() {
            const remaining = Math.max(0, targetDate.getTime() - Date.now());
            const totalSeconds = Math.floor(remaining / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            fields.days.textContent = String(days).padStart(2, "0");
            fields.hours.textContent = String(hours).padStart(2, "0");
            fields.minutes.textContent = String(minutes).padStart(2, "0");
            fields.seconds.textContent = String(seconds).padStart(2, "0");
            timer?.setAttribute("aria-label", `${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos para nuestro primer aniversario`);

            if (remaining === 0) {
                anniversaryCountdown.classList.add("is-complete");
                if (message) message.textContent = "¡Ya llegó nuestro primer aniversario! ✨";
                return false;
            }

            return true;
        }

        updateAnniversaryCountdown();
        const countdownInterval = window.setInterval(() => {
            if (!updateAnniversaryCountdown()) window.clearInterval(countdownInterval);
        }, 1000);
    }

    document.querySelectorAll("[data-letter]").forEach((letter) => {
        const openButton = letter.querySelector("[data-open-letter]");
        const closeButton = letter.querySelector("[data-close-letter]");
        const paper = letter.querySelector("[data-letter-paper]");
        const audio = letter.dataset.audio ? document.getElementById(letter.dataset.audio) : null;

        function openLetter() {
            letter.classList.add("is-open");
            openButton?.setAttribute("aria-expanded", "true");
            paper?.setAttribute("aria-hidden", "false");
            closeButton?.focus({ preventScroll: true });

            if (audio) {
                pauseAllAudio(audio.id);
                audio.currentTime = 0;
                audio.play().catch(() => {
                    // Some browsers can still block playback; the letter remains usable.
                });
            }
        }

        function closeLetter() {
            letter.classList.remove("is-open");
            openButton?.setAttribute("aria-expanded", "false");
            paper?.setAttribute("aria-hidden", "true");
            openButton?.focus({ preventScroll: true });

            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        }

        openButton?.addEventListener("click", openLetter);
        closeButton?.addEventListener("click", closeLetter);
    });

    const giftMessages = [
        "¡Oh! ¿Un regalo? 🤔",
        "¿Qué será? Seguro te gustará, pero tú me gustas más. 🎁",
        "Me gusta mucho pasar tiempo contigo, aunque sea en llamada. ¿Será una pista? 😋",
        "El tiempo parece no existir cuando estoy contigo. ⏳",
        "Vales muchísimo para mí; por eso intento demostrártelo con cada detalle. 💗",
        "¿Ya te cansaste? Todavía quedan algunas pistas. 😏",
        "¡Qué emoción! ¿Estás lista? 😍",
        "¿Te imaginas qué es? 🤭",
        "Maybe una pista molaría… toca de nuevo y te doy una. 💝",
        "Es algo que podrás usar todos los días. Creo que ya sabes. 😚",
        "¡Ya casi! Solo unos toques más. 🥳",
        "¿Te está gustando la sorpresa? 😁",
        "A mí me gusta más sorprenderme cada vez que veo lo linda que eres. 💖",
        "¿Lista para descubrirlo? 😱",
        "¡Qué nervios! 😬",
        "¡Últimas pistas! 🎈",
        "Tal vez este regalo te haga millonaria, pero yo ya lo soy porque te tengo. 🚀",
        "¡Ahora sí! Descubre tu regalo y recuerda lo mucho que te amo. 🎁"
    ];

    const giftButton = document.getElementById("gift-button");
    const giftMessage = document.getElementById("gift-message");
    const giftProgress = document.getElementById("gift-progress");
    const giftProgressBar = document.getElementById("gift-progress-bar");
    const giftReveal = document.getElementById("gift-reveal");
    const giftCard = document.getElementById("gift-card");
    const finishGiftButton = document.getElementById("finish-gift");
    const finalDialog = document.getElementById("final-dialog");
    const giftAudio = document.getElementById("gift-audio");
    let giftClicks = 0;

    function updateGift() {
        const total = giftMessages.length;
        const percent = Math.round((giftClicks / total) * 100);

        if (giftMessage && giftClicks > 0) {
            giftMessage.textContent = giftMessages[giftClicks - 1];
        }
        if (giftProgress) giftProgress.textContent = `${giftClicks} de ${total} pistas`;
        if (giftProgressBar) giftProgressBar.style.width = `${percent}%`;

        if (giftClicks >= total) {
            giftButton?.setAttribute("hidden", "");
            giftReveal?.removeAttribute("hidden");
            giftCard?.focus({ preventScroll: true });
        }
    }

    function resetGift() {
        giftClicks = 0;
        giftButton?.removeAttribute("hidden");
        giftReveal?.setAttribute("hidden", "");
        giftCard?.classList.remove("is-flipped");
        giftCard?.setAttribute("aria-pressed", "false");
        if (giftMessage) giftMessage.textContent = "Hay algo esperando por ti. Toca el regalo para comenzar.";
        updateGift();

        if (giftAudio) {
            giftAudio.pause();
            giftAudio.currentTime = 0;
        }
    }

    giftButton?.addEventListener("click", () => {
        if (giftClicks >= giftMessages.length) return;
        giftClicks += 1;

        if (giftClicks === giftMessages.length - 3 && giftAudio) {
            pauseAllAudio(giftAudio.id);
            giftAudio.currentTime = 0;
            giftAudio.play().catch(() => {
                // The surprise remains fully functional without autoplay.
            });
        }

        updateGift();
    });

    giftCard?.addEventListener("click", () => {
        const isFlipped = giftCard.classList.toggle("is-flipped");
        giftCard.setAttribute("aria-pressed", String(isFlipped));
    });

    finishGiftButton?.addEventListener("click", () => {
        if (typeof finalDialog?.showModal === "function") {
            finalDialog.showModal();
        } else {
            finalDialog?.setAttribute("open", "");
        }
    });

    finalDialog?.querySelector("[data-close-dialog]")?.addEventListener("click", () => {
        if (typeof finalDialog.close === "function") finalDialog.close();
        else finalDialog.removeAttribute("open");
        resetGift();
    });

    finalDialog?.addEventListener("click", (event) => {
        if (event.target !== finalDialog) return;
        finalDialog.close();
        resetGift();
    });

    finalDialog?.addEventListener("cancel", resetGift);
})();
