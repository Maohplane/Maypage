(() => {
    "use strict";

    const pageIds = ["inicio", "album", "constelaciones", "carro", "cumple", "secret"];
    const pages = [...document.querySelectorAll("[data-page]")];
    const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    const menuButton = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".site-nav");
    const header = document.querySelector(".site-header");
    const soundtrackWidgets = new WeakMap();

    function getSoundtrackWidget(frame) {
        if (!frame || !window.SC?.Widget) return null;
        if (!soundtrackWidgets.has(frame)) {
            soundtrackWidgets.set(frame, window.SC.Widget(frame));
        }
        return soundtrackWidgets.get(frame);
    }

    function pauseAllEmbeddedSoundtracks(exceptFrame = null) {
        document.querySelectorAll("[data-letter-soundtrack]").forEach((frame) => {
            if (frame === exceptFrame) return;
            getSoundtrackWidget(frame)?.pause();
        });
    }

    function currentPageId() {
        const requestedPage = window.location.hash.slice(1);
        return pageIds.includes(requestedPage) ? requestedPage : "cumple";
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
        pauseAllEmbeddedSoundtracks();
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
        history.replaceState(null, "", "#cumple");
    }
    showCurrentPage();

    document.querySelectorAll("[data-letter]").forEach((letter) => {
        const openButton = letter.querySelector("[data-open-letter]");
        const closeButton = letter.querySelector("[data-close-letter]");
        const paper = letter.querySelector("[data-letter-paper]");
        const audio = letter.dataset.audio ? document.getElementById(letter.dataset.audio) : null;
        const soundtrack = letter.querySelector("[data-letter-soundtrack]");
        const musicPlayButton = letter.querySelector("[data-letter-music-play]");
        const musicPauseButton = letter.querySelector("[data-letter-music-pause]");
        const soundtrackApiScript = document.querySelector("[data-soundcloud-api]");
        let soundtrackReadyBound = false;

        function bindSoundtrackReady() {
            const widget = getSoundtrackWidget(soundtrack);
            if (!widget || soundtrackReadyBound) return;
            soundtrackReadyBound = true;
            widget.bind(window.SC.Widget.Events.READY, () => {
                if (letter.classList.contains("is-open")) playSoundtrack();
            });
        }

        function playSoundtrack() {
            if (!soundtrack) return;
            pauseAllAudio();
            pauseAllEmbeddedSoundtracks(soundtrack);
            bindSoundtrackReady();
            getSoundtrackWidget(soundtrack)?.play();
        }

        function pauseSoundtrack({ rewind = false } = {}) {
            if (!soundtrack) return;
            const widget = getSoundtrackWidget(soundtrack);
            widget?.pause();
            if (rewind) widget?.seekTo(0);
        }

        function openLetter() {
            letter.classList.add("is-open");
            openButton?.setAttribute("aria-expanded", "true");
            paper?.setAttribute("aria-hidden", "false");
            closeButton?.focus({ preventScroll: true });

            if (audio) {
                pauseAllEmbeddedSoundtracks();
                pauseAllAudio(audio.id);
                audio.currentTime = 0;
                audio.play().catch(() => {
                    // Some browsers can still block playback; the letter remains usable.
                });
            }

            playSoundtrack();
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

            pauseSoundtrack({ rewind: true });
        }

        openButton?.addEventListener("click", openLetter);
        closeButton?.addEventListener("click", closeLetter);
        musicPlayButton?.addEventListener("click", playSoundtrack);
        musicPauseButton?.addEventListener("click", () => pauseSoundtrack());
        bindSoundtrackReady();
        soundtrackApiScript?.addEventListener("load", bindSoundtrackReady, { once: true });
    });

})();
