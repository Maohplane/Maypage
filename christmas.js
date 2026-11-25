(() => {
    "use strict";

    // Mexico City has no daylight-saving changes in 2026. Do not use the
    // visitor's device timezone for this shared countdown.
    const DECEMBER_START = Date.parse("2026-12-01T00:00:00-06:00");
    const countdown = document.querySelector(".christmas-countdown");
    const digits = [...document.querySelectorAll("[data-countdown]")];
    let decemberArrived = false;

    function updateCountdown() {
        const totalSeconds = Math.max(0, Math.ceil((DECEMBER_START - Date.now()) / 1000));
        const values = {
            days: Math.floor(totalSeconds / 86400),
            hours: Math.floor((totalSeconds % 86400) / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60
        };
        digits.forEach((digit) => {
            const value = String(values[digit.dataset.countdown]).padStart(2, "0");
            if (digit.textContent !== value) digit.textContent = value;
        });

        if (totalSeconds === 0 && !decemberArrived) {
            decemberArrived = true;
            document.querySelector("[data-season-eyebrow]").textContent = "Nuestra temporada ya comenzó";
            document.querySelector("[data-season-title]").innerHTML = "Diciembre llegó, <em>cutie.</em>";
            document.querySelector("[data-season-copy]").textContent = "Ya llegó el mes de las luces, los abrazos y las pequeñas cosas bonitas. Qué suerte vivir otra Navidad contigo, May.";
            document.querySelector("[data-season-status]").textContent = "Que empiece la magia de compartir diciembre contigo. ♡";
            countdown?.setAttribute("aria-label", "La cuenta regresiva terminó: diciembre ya está aquí");
            document.dispatchEvent(new Event("maypage:december"));
        }
        return totalSeconds;
    }

    if (updateCountdown() > 0) {
        const timer = window.setInterval(() => {
            if (updateCountdown() === 0) window.clearInterval(timer);
        }, 1000);
    }

    const audio = document.getElementById("christmas-soundtrack");
    const toggle = document.querySelector("[data-christmas-music]");
    const status = document.querySelector("[data-music-status]");
    const action = document.querySelector("[data-music-action]");
    const letterAudio = [...document.querySelectorAll("audio:not([data-seasonal-audio])")];
    // Add future songs here; the player cycles through the active tracks.
    const tracks = window.MayChristmasPlaylist || [
        { src: audio.getAttribute("src"), title: "We Wish You a Merry Christmas · Instrumental" }
    ];
    const MUSIC_PREFERENCE = "maypage-christmas-music";
    let activeTrack = 0;
    let musicWanted = true;
    let playPending = false;
    let playbackFailed = false;

    try {
        musicWanted = window.localStorage.getItem(MUSIC_PREFERENCE) !== "off";
    } catch {
        // Keep the control usable in private browsing, too.
    }
    audio.volume = 0.22;

    function isLetterPlaying() {
        return letterAudio.some((track) => !track.paused && !track.ended);
    }

    function canPlay() {
        return document.body.classList.contains("site-entered")
            && musicWanted && !document.hidden && !isLetterPlaying();
    }

    function renderMusic() {
        const letterPlaying = isLetterPlaying();
        const playing = !audio.paused;
        toggle.disabled = letterPlaying;
        toggle.setAttribute("aria-pressed", String(playing));
        toggle.setAttribute("aria-label", letterPlaying
            ? "Música navideña pausada mientras suena tu carta"
            : playing ? "Pausar música navideña" : "Reproducir música navideña");
        status.textContent = letterPlaying ? "Ahora suena la música de tu carta"
            : playing ? tracks[activeTrack].title
            : playbackFailed ? "Toca para volver a intentar"
            : musicWanted ? "Toca para escuchar" : "En pausa";
        action.textContent = letterPlaying ? "" : playing ? "Pausar" : "Escuchar";
    }

    async function syncMusic() {
        if (!canPlay()) {
            audio.pause();
            renderMusic();
            return;
        }
        if (!audio.paused || playPending) return;
        playPending = true;
        try {
            await audio.play();
            playbackFailed = false;
            // A letter or the pause button may have been used during loading.
            if (!canPlay()) audio.pause();
        } catch {
            // Autoplay policies and network failures leave a visible retry.
            playbackFailed = true;
        } finally {
            playPending = false;
            renderMusic();
        }
    }

    toggle.addEventListener("click", () => {
        musicWanted = audio.paused;
        playbackFailed = false;
        try {
            window.localStorage.setItem(MUSIC_PREFERENCE, musicWanted ? "on" : "off");
        } catch {
            // Saving a preference is optional.
        }
        syncMusic();
    });
    audio.addEventListener("play", renderMusic);
    audio.addEventListener("pause", renderMusic);
    audio.addEventListener("ended", () => {
        activeTrack = (activeTrack + 1) % tracks.length;
        audio.src = tracks[activeTrack].src;
        audio.load();
        playbackFailed = false;
        syncMusic();
    });
    audio.addEventListener("error", () => {
        playbackFailed = true;
        renderMusic();
    });
    letterAudio.forEach((track) => {
        track.addEventListener("play", () => {
            audio.pause();
            renderMusic();
        });
        ["pause", "ended", "error"].forEach((event) => {
            // Let a second letter start before deciding to resume the ambient track.
            track.addEventListener(event, () => window.setTimeout(syncMusic, 0));
        });
    });
    document.addEventListener("maypage:entered", syncMusic);
    document.addEventListener("visibilitychange", syncMusic);
    renderMusic();
    if (document.body.classList.contains("site-entered")) syncMusic();
})();
