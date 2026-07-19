(() => {
    "use strict";

    const ANNIVERSARY_DATE = new Date("2026-07-26T00:00:00-06:00");

    function readStorage(key, fallback = null) {
        try {
            return window.localStorage.getItem(key) ?? fallback;
        } catch {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // The page remains usable when private browsing blocks storage.
        }
    }

    function readSession(key) {
        try {
            return window.sessionStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function writeSession(key, value) {
        try {
            window.sessionStorage.setItem(key, value);
        } catch {
            // The welcome remains harmless if session storage is unavailable.
        }
    }

    const entryGate = document.querySelector("[data-entry-gate]");
    const enterButton = document.querySelector("[data-enter-site]");

    function enterSite({ remember = true } = {}) {
        document.body.classList.remove("entry-pending");
        document.body.classList.add("site-entered");
        entryGate?.setAttribute("aria-hidden", "true");
        entryGate?.classList.add("is-leaving");
        if (remember) writeSession("maypage-entered", "true");
        window.setTimeout(() => entryGate?.setAttribute("hidden", ""), 520);
    }

    if (readSession("maypage-entered") === "true") {
        enterSite({ remember: false });
    } else {
        window.requestAnimationFrame(() => enterButton?.focus({ preventScroll: true }));
        enterButton?.addEventListener("click", () => enterSite());
    }

    const memories = [
        { id: "F01", date: "13 de septiembre de 2024", title: "Cuando no nos llevábamos", image: "assets/memories/f01.webp", x: 17 },
        { id: "F02", date: "28 de noviembre de 2024", title: "Primera vez matching", image: "assets/memories/f02.webp", x: 44 },
        { id: "F03", date: "19 de diciembre de 2024", title: "Alguien ya era muy especial", image: "assets/memories/f03.webp", x: 72 },
        { id: "F04", date: "28 de junio de 2025", title: "Nos dimos cuenta de que nos queríamos más que amigos", image: "assets/memories/f04.webp", x: 30 },
        { id: "F05", date: "17 de diciembre de 2025", title: "Vamos a Santa Fe", image: "assets/memories/f05.webp", x: 61 },
        { id: "F06", date: "12 de enero de 2026", title: "¿Y el shy?", image: "assets/memories/f06.webp", x: 82 },
        { id: "F07", date: "31 de enero de 2026", title: "Turror y primera vez en Guadalajara", image: "assets/memories/f07.webp", x: 54 },
        { id: "F08", date: "31 de enero de 2026", title: "Lengüitas", image: "assets/memories/f08.webp", x: 22 },
        { id: "F09", date: "2 de abril de 2026", title: "Juntitos en el cochecito", image: "assets/memories/f09.webp", x: 38 },
        { id: "F10", date: "2 de abril de 2026", title: "Callejón del Beso sin beso porque alguien no quiso", image: "assets/memories/f10.webp", x: 75 },
        { id: "F11", date: "3 de abril de 2026", title: "No estaba dormido", image: "assets/memories/f11.webp", x: 64 },
        { id: "F12", date: "3 de abril de 2026", title: "Fuimos por agüita en familia", image: "assets/memories/f12.webp", x: 31 },
        { id: "F13", date: "3 de abril de 2026", title: "Los ojitos más lindos del mundo", image: "assets/memories/f13.webp", x: 14 },
        { id: "F14", date: "30 de abril de 2026", title: "F1 Wuuuu", image: "assets/memories/f14.webp", x: 48 },
        { id: "F15", date: "30 de abril de 2026", title: "Super cuties", image: "assets/memories/f15.webp", x: 80 },
        { id: "F16", date: "1 de mayo de 2026", title: "No me invitó al concierto (bromi)", image: "assets/memories/f16.webp", x: 66 },
        { id: "F17", date: "2 de julio de 2026", title: "Primer Gandhi", image: "assets/memories/f17.webp", x: 36 },
        { id: "F18", date: "4 de julio de 2026", title: "Frutitas acostaditos", image: "assets/memories/f18.webp", x: 18 },
        { id: "F19", date: "5 de julio de 2026", title: "Pijamada real", image: "assets/memories/f19.webp", x: 52 },
        { id: "F20", date: "5 de julio de 2026", title: "¿Y si no?", image: "assets/memories/f20.webp", x: 83 },
        { id: "F21", date: "7 de julio de 2026", title: "Flautitas verdes", image: "assets/memories/f21.webp", x: 70 },
        { id: "F22", date: "8 de julio de 2026", title: "Ubeeeeeeeeeee", image: "assets/memories/f22.webp", x: 43 },
        { id: "F23", date: "8 de julio de 2026", title: "Último día Andares", image: "assets/memories/f23.webp", x: 20 },
        { id: "F24", date: "9 de julio de 2026", title: "TE AMO", image: "assets/memories/f24.webp", x: 39 },
        { id: "F25", date: "9 de julio de 2026", title: "Alguien tiene un cachete muy deli", image: "assets/memories/f25.webp", x: 72 },
        { id: "F26", date: "9 de julio de 2026", title: "Mi novia, mi familia", image: "assets/memories/f26.webp", x: 54 }
    ].map((memory, index, all) => ({
        ...memory,
        y: 4 + (index * 92) / (all.length - 1)
    }));

    const albumGate = document.querySelector("[data-album-gate]");
    const albumWait = document.querySelector("[data-album-wait]");
    const anniversaryQuiz = document.querySelector("[data-anniversary-quiz]");
    const quizFeedback = document.querySelector("[data-quiz-feedback]");
    const memoryExperience = document.querySelector("[data-memory-experience]");
    const memoryStars = document.querySelector("[data-memory-stars]");
    const memoryPath = document.querySelector("[data-memory-path]");
    const memoryDialog = document.getElementById("memory-dialog");
    const memoryImage = document.querySelector("[data-memory-image]");
    const memoryDate = document.querySelector("[data-memory-date]");
    const memoryTitle = document.querySelector("[data-memory-title]");
    const memoryPosition = document.querySelector("[data-memory-position]");
    let activeMemoryIndex = 0;
    let memoriesRendered = false;

    function renderMemories() {
        if (memoriesRendered || !memoryStars || !memoryPath) return;

        memoryPath.setAttribute("points", memories.map(({ x, y }) => `${x},${y}`).join(" "));

        memories.forEach((memory, index) => {
            const button = document.createElement("button");
            const star = document.createElement("span");
            const id = document.createElement("strong");
            const date = document.createElement("small");

            button.type = "button";
            button.className = "memory-star";
            button.style.setProperty("--star-x", `${memory.x}%`);
            button.style.setProperty("--star-y", `${memory.y}%`);
            button.style.setProperty("--star-delay", `${(index % 7) * -0.35}s`);
            button.setAttribute("aria-label", `${memory.title}, ${memory.date}`);

            star.className = "memory-star-shape";
            star.setAttribute("aria-hidden", "true");
            star.textContent = index % 3 === 0 ? "✦" : "✧";
            id.textContent = memory.id;
            date.textContent = memory.date.replace(" de 202", " · 202");

            button.append(star, id, date);
            button.addEventListener("click", () => openMemory(index));
            memoryStars.append(button);
        });

        memoriesRendered = true;
    }

    function openMemory(index) {
        const safeIndex = (index + memories.length) % memories.length;
        const memory = memories[safeIndex];
        activeMemoryIndex = safeIndex;

        if (memoryImage) {
            memoryImage.src = memory.image;
            memoryImage.alt = memory.title;
        }
        if (memoryDate) memoryDate.textContent = memory.date;
        if (memoryTitle) memoryTitle.textContent = memory.title;
        if (memoryPosition) memoryPosition.textContent = `Recuerdo ${safeIndex + 1} de ${memories.length}`;

        if (typeof memoryDialog?.showModal === "function") memoryDialog.showModal();
        else memoryDialog?.setAttribute("open", "");
    }

    function closeMemory() {
        if (typeof memoryDialog?.close === "function") memoryDialog.close();
        else memoryDialog?.removeAttribute("open");
    }

    document.querySelector("[data-close-memory]")?.addEventListener("click", closeMemory);
    document.querySelector("[data-memory-previous]")?.addEventListener("click", () => openMemory(activeMemoryIndex - 1));
    document.querySelector("[data-memory-next]")?.addEventListener("click", () => openMemory(activeMemoryIndex + 1));

    memoryDialog?.addEventListener("click", (event) => {
        if (event.target === memoryDialog) closeMemory();
    });

    memoryDialog?.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") openMemory(activeMemoryIndex - 1);
        if (event.key === "ArrowRight") openMemory(activeMemoryIndex + 1);
    });

    function normalizeAnswer(value) {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9ñ\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function isCorrectAnniversaryAnswer(value) {
        const answer = normalizeAnswer(value);
        const mentionsNovios = answer.includes("novios") || answer.includes("novia") || answer.includes("novio");
        const mentionsBeginning = ["hicimos", "empezamos", "pediste", "preguntaste", "convertimos", "comenzamos"].some((word) => answer.includes(word));
        return mentionsNovios && mentionsBeginning;
    }

    function revealMemorySky() {
        albumGate?.setAttribute("hidden", "");
        memoryExperience?.removeAttribute("hidden");
        renderMemories();
    }

    function updateAlbumAccess() {
        if (!albumGate || !albumWait || !anniversaryQuiz || !memoryExperience) return;

        if (Date.now() < ANNIVERSARY_DATE.getTime()) {
            albumGate.removeAttribute("hidden");
            albumWait.removeAttribute("hidden");
            anniversaryQuiz.setAttribute("hidden", "");
            memoryExperience.setAttribute("hidden", "");
            return;
        }

        if (readStorage("maypage-album-unlocked") === "true") {
            revealMemorySky();
            return;
        }

        albumGate.removeAttribute("hidden");
        albumWait.setAttribute("hidden", "");
        anniversaryQuiz.removeAttribute("hidden");
        memoryExperience.setAttribute("hidden", "");
    }

    anniversaryQuiz?.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = anniversaryQuiz.elements.namedItem("answer");
        const answer = typeof input?.value === "string" ? input.value : "";

        if (!isCorrectAnniversaryAnswer(answer)) {
            if (quizFeedback) quizFeedback.textContent = "Casi, cutie. Piensa en lo que empezamos a ser ese día. ✦";
            input?.focus();
            return;
        }

        writeStorage("maypage-album-unlocked", "true");
        if (quizFeedback) quizFeedback.textContent = "Sí. Ese día empezó nuestro universo. ✨";
        anniversaryQuiz.classList.add("is-correct");
        window.setTimeout(revealMemorySky, 700);
    });

    updateAlbumAccess();
    const albumAccessInterval = window.setInterval(() => {
        if (Date.now() >= ANNIVERSARY_DATE.getTime()) {
            updateAlbumAccess();
            window.clearInterval(albumAccessInterval);
        }
    }, 60000);

    const SIZE = 4;
    const GAME_KEY = "maypage-constelaciones-v1";
    const STAR_NAMES = {
        2: "Destello",
        4: "Estrellita",
        8: "Lucero azul",
        16: "Estrella celeste",
        32: "Estrella dorada",
        64: "Estrella doble",
        128: "Estrella cósmica",
        256: "Gigante azul",
        512: "Estrella de los deseos",
        1024: "Supernova",
        2048: "Estrella de May",
        4096: "Nuestro universo"
    };
    const CUPCAKE_NAMES = {
        2: "Vanilla Birthday",
        4: "Bubblegum Pink",
        8: "Sunshine Vanilla",
        16: "Valrhona Blonde Ganache",
        32: "Chocolate Peanut Butter Cheesecake",
        64: "Chocolate Mint Fudge",
        128: "Chocolate Spider Web",
        256: "Toasted Marshmallow",
        512: "Cookies and Creme",
        1024: "Chocolate Sundae",
        2048: "White Chocolate Peppermint",
        4096: "2017 Confetti Vanilla",
        8192: "Rainbow"
    };
    const CLUES = [
        { id: "clue-1", score: 10000, label: "Primera pista", requirement: "Consigue 10,000 puntos" },
        { id: "clue-2", score: 20000, label: "Segunda pista", requirement: "Consigue 20,000 puntos" },
        { id: "clue-3", score: 36000, label: "Tercera pista", requirement: "Consigue 36,000 puntos" },
        { id: "clue-4", tile: 2048, label: "Pista estelar", requirement: "Crea la Estrella de May" }
    ];

    const gameBoard = document.querySelector("[data-game-board]");
    const gameGrid = document.querySelector("[data-game-grid]");
    const gamePanel = document.querySelector("[data-game-panel]");
    const scoreDisplay = document.querySelector("[data-game-score]");
    const bestDisplay = document.querySelector("[data-game-best]");
    const gameOverPanel = document.querySelector("[data-game-over]");
    const gamePageDescription = document.querySelector("[data-game-page-description]");
    const gameEyebrow = document.querySelector("[data-game-eyebrow]");
    const gameTitle = document.querySelector("[data-game-title]");
    const gameOverIcon = document.querySelector("[data-game-over-icon]");
    const gameOverTitle = document.querySelector("[data-game-over-title]");
    const gameOverCopy = document.querySelector("[data-game-over-copy]");
    const restartGameButton = document.querySelector("[data-restart-game]");
    const gameModeButtons = [...document.querySelectorAll("[data-game-mode-option]")];
    const soundToggle = document.querySelector("[data-game-sound]");
    const cupcakeLegend = document.querySelector("[data-cupcake-legend]");
    const cupcakeLegendGrid = document.querySelector("[data-cupcake-legend-grid]");
    const clueList = document.querySelector("[data-clue-list]");
    const numberFormat = new Intl.NumberFormat("es-MX");
    let board = Array(SIZE * SIZE).fill(0);
    let score = 0;
    let bestScore = 0;
    let highestEver = 0;
    let gameOver = false;
    let gameMode = readStorage("maypage-game-mode", "stars") === "cupcakes" ? "cupcakes" : "stars";
    let soundEnabled = readStorage("maypage-game-sound", "true") !== "false";
    let audioContext = null;
    let pointerStart = null;
    let previousUnlockedClues = 0;
    let cupcakeLegendRendered = false;
    let lastClueSignature = "";

    function isPowerOfTwo(value) {
        return value === 0 || (Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0);
    }

    function loadGame() {
        try {
            const saved = JSON.parse(readStorage(GAME_KEY, "null"));
            const validBoard = Array.isArray(saved?.board)
                && saved.board.length === SIZE * SIZE
                && saved.board.every(isPowerOfTwo);

            if (validBoard) board = saved.board;
            if (Number.isFinite(saved?.score) && saved.score >= 0) score = saved.score;
            if (Number.isFinite(saved?.bestScore) && saved.bestScore >= 0) bestScore = saved.bestScore;
            if (Number.isFinite(saved?.highestEver) && saved.highestEver >= 0) highestEver = saved.highestEver;
        } catch {
            // A malformed save starts a fresh, valid game.
        }

        if (!board.some(Boolean)) {
            addRandomStar();
            addRandomStar();
        }

        gameOver = !canMove();
    }

    function saveGame() {
        writeStorage(GAME_KEY, JSON.stringify({ board, score, bestScore, highestEver, gameOver }));
    }

    function addRandomStar() {
        const empty = board.reduce((indices, value, index) => {
            if (value === 0) indices.push(index);
            return indices;
        }, []);
        if (!empty.length) return;
        const index = empty[Math.floor(Math.random() * empty.length)];
        board[index] = Math.random() < 0.9 ? 2 : 4;
    }

    function mergeLine(values) {
        const compact = values.filter(Boolean);
        const merged = [];
        let gained = 0;
        let merges = 0;

        for (let index = 0; index < compact.length; index += 1) {
            if (compact[index] === compact[index + 1]) {
                const combined = compact[index] * 2;
                merged.push(combined);
                gained += combined;
                merges += 1;
                index += 1;
            } else {
                merged.push(compact[index]);
            }
        }

        while (merged.length < SIZE) merged.push(0);
        return { values: merged, gained, merges };
    }

    function lineIndices(line, direction) {
        if (direction === "left") return Array.from({ length: SIZE }, (_, column) => line * SIZE + column);
        if (direction === "right") return Array.from({ length: SIZE }, (_, column) => line * SIZE + (SIZE - 1 - column));
        if (direction === "up") return Array.from({ length: SIZE }, (_, row) => row * SIZE + line);
        return Array.from({ length: SIZE }, (_, row) => (SIZE - 1 - row) * SIZE + line);
    }

    function canMove() {
        if (board.includes(0)) return true;

        for (let row = 0; row < SIZE; row += 1) {
            for (let column = 0; column < SIZE; column += 1) {
                const index = row * SIZE + column;
                if (column < SIZE - 1 && board[index] === board[index + 1]) return true;
                if (row < SIZE - 1 && board[index] === board[index + SIZE]) return true;
            }
        }
        return false;
    }

    function move(direction) {
        if (gameOver) {
            renderGame();
            return false;
        }
        const before = [...board];
        let gained = 0;
        let merges = 0;

        for (let line = 0; line < SIZE; line += 1) {
            const indices = lineIndices(line, direction);
            const result = mergeLine(indices.map((index) => board[index]));
            result.values.forEach((value, position) => {
                board[indices[position]] = value;
            });
            gained += result.gained;
            merges += result.merges;
        }

        const changed = board.some((value, index) => value !== before[index]);
        if (!changed) {
            gameOver = !canMove();
            renderGame();
            saveGame();
            return false;
        }

        score += gained;
        bestScore = Math.max(bestScore, score);
        addRandomStar();
        highestEver = Math.max(highestEver, ...board);
        gameOver = !canMove();
        renderGame();
        saveGame();
        if (merges > 0) playMergeSound(gained, merges);
        return true;
    }

    function tileLevel(value) {
        return Math.min(12, Math.max(1, Math.log2(value)));
    }

    function playMergeSound(gained, merges) {
        if (!soundEnabled) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        try {
            audioContext ??= new AudioContextClass();
            if (audioContext.state === "suspended") audioContext.resume().catch(() => {});

            const now = audioContext.currentTime;
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const pitch = 390 + Math.min(260, Math.log2(Math.max(4, gained)) * 28) + Math.min(60, merges * 8);

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(pitch, now);
            oscillator.frequency.exponentialRampToValueAtTime(pitch * 1.12, now + 0.09);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.018, now + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(now);
            oscillator.stop(now + 0.14);
        } catch {
            // El juego sigue funcionando si el navegador bloquea el audio.
        }
    }

    function renderCupcakeLegend() {
        if (cupcakeLegendRendered || !cupcakeLegendGrid) return;

        Object.entries(CUPCAKE_NAMES).forEach(([value, name]) => {
            const item = document.createElement("article");
            const image = document.createElement("img");
            const copy = document.createElement("span");
            const title = document.createElement("strong");
            const number = document.createElement("small");

            image.src = `assets/cupcakes/${value}.jpg`;
            image.alt = "";
            image.loading = "lazy";
            image.decoding = "async";
            title.textContent = name;
            number.textContent = value;
            copy.append(title, number);
            item.append(image, copy);
            cupcakeLegendGrid.append(item);
        });

        cupcakeLegendRendered = true;
    }

    function updateSoundButton() {
        if (!soundToggle) return;
        soundToggle.setAttribute("aria-pressed", String(soundEnabled));
        soundToggle.setAttribute("aria-label", soundEnabled
            ? "Desactivar sonido de las fusiones"
            : "Activar sonido de las fusiones");
        soundToggle.innerHTML = `<span aria-hidden="true">${soundEnabled ? "♪" : "×"}</span> ${soundEnabled ? "Sonido suave" : "Sin sonido"}`;
    }

    function updateGameModeUi() {
        const cupcakes = gameMode === "cupcakes";

        if (gamePanel) gamePanel.dataset.gameMode = gameMode;
        if (gamePageDescription) gamePageDescription.textContent = cupcakes
            ? "Une dos cupcakes iguales para descubrir el siguiente sabor."
            : "Une dos estrellas iguales para crear una cada vez más brillante.";
        if (gameEyebrow) gameEyebrow.textContent = cupcakes ? "La pastelería de May" : "El cielo de May";
        if (gameTitle) gameTitle.textContent = cupcakes ? "Junta los cupcakes" : "Haz crecer las estrellas";
        if (gameBoard) gameBoard.setAttribute("aria-label", cupcakes
            ? "Tablero de Cupcakes. Usa las flechas, WASD o desliza con el dedo."
            : "Tablero de Constelaciones. Usa las flechas, WASD o desliza con el dedo.");
        if (gameOverIcon) gameOverIcon.textContent = cupcakes ? "🧁" : "☄";
        if (gameOverTitle) gameOverTitle.textContent = cupcakes ? "Se acabaron los movimientos" : "Este cielo se llenó";
        if (gameOverCopy) gameOverCopy.textContent = cupcakes
            ? "Ya no puedes juntar más cupcakes. ¿Jugamos otra vez?"
            : "Ya no quedan movimientos. Tu constelación puede comenzar de nuevo.";
        if (restartGameButton) restartGameButton.textContent = cupcakes ? "Jugar de nuevo" : "Nuevo cielo";

        gameModeButtons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.gameModeOption === gameMode));
        });

        if (cupcakeLegend) {
            cupcakeLegend.hidden = !cupcakes;
            if (cupcakes) renderCupcakeLegend();
        }
    }

    function renderClues({ announce = false } = {}) {
        if (!clueList) return;
        const unlocked = CLUES.filter((clue) =>
            (clue.score && bestScore >= clue.score) || (clue.tile && highestEver >= clue.tile)
        );
        const signature = CLUES.map((clue) => unlocked.includes(clue) ? "1" : "0").join("");

        if (signature === lastClueSignature) return;

        const fragment = document.createDocumentFragment();
        CLUES.forEach((clue, index) => {
            const isUnlocked = unlocked.includes(clue);
            const item = document.createElement("article");
            const icon = document.createElement("span");
            const copy = document.createElement("div");
            const title = document.createElement("strong");
            const description = document.createElement("p");

            item.className = `clue-item${isUnlocked ? " is-unlocked" : ""}`;
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = isUnlocked ? "✦" : "◈";
            title.textContent = clue.label;
            description.textContent = isUnlocked
                ? "Las pistas todavía no están listas, hermosa. Vuelve pronto. ✦"
                : clue.requirement;
            copy.append(title, description);
            item.append(icon, copy);
            fragment.append(item);

            if (isUnlocked) item.style.setProperty("--clue-delay", `${index * 80}ms`);
        });

        clueList.replaceChildren(fragment);

        if (announce && unlocked.length > previousUnlockedClues) showGameToast("¡Desbloqueaste un nuevo espacio para pistas! ✦");
        previousUnlockedClues = unlocked.length;
        lastClueSignature = signature;
    }

    function showGameToast(message) {
        const toast = document.createElement("div");
        toast.className = "game-toast";
        toast.setAttribute("role", "status");
        toast.textContent = message;
        document.body.append(toast);
        window.requestAnimationFrame(() => toast.classList.add("is-visible"));
        window.setTimeout(() => {
            toast.classList.remove("is-visible");
            window.setTimeout(() => toast.remove(), 260);
        }, 2600);
    }

    function renderGame({ announceClues = false } = {}) {
        if (!gameGrid) return;
        const fragment = document.createDocumentFragment();

        board.forEach((value) => {
            const cell = document.createElement("div");
            cell.className = "game-cell";

            if (value) {
                const tile = document.createElement("div");
                const star = document.createElement("span");
                const number = document.createElement("small");
                const cupcakeAssetValue = CUPCAKE_NAMES[value] ? value : 8192;
                const name = gameMode === "cupcakes"
                    ? (CUPCAKE_NAMES[value] || `${CUPCAKE_NAMES[8192]} ${value}`)
                    : (STAR_NAMES[value] || `Estrella ${value}`);

                tile.className = `star-tile tile-level-${tileLevel(value)}`;
                tile.setAttribute("aria-label", `${name}, valor ${value}`);
                tile.title = name;
                number.textContent = String(value);

                if (gameMode === "cupcakes") {
                    const image = document.createElement("img");
                    tile.classList.add("is-cupcake");
                    image.src = `assets/cupcakes/${cupcakeAssetValue}.jpg`;
                    image.alt = "";
                    image.decoding = "async";
                    image.draggable = false;
                    number.className = "sr-only";
                    tile.append(image, number);
                } else {
                    star.setAttribute("aria-hidden", "true");
                    star.textContent = value >= 1024 ? "✷" : value >= 128 ? "✦" : "✧";
                    tile.append(star, number);
                }
                cell.append(tile);
            }

            fragment.append(cell);
        });

        gameGrid.replaceChildren(fragment);

        if (scoreDisplay) scoreDisplay.textContent = numberFormat.format(score);
        if (bestDisplay) bestDisplay.textContent = numberFormat.format(bestScore);
        if (gameOver) gameOverPanel?.removeAttribute("hidden");
        else gameOverPanel?.setAttribute("hidden", "");
        renderClues({ announce: announceClues });
    }

    function newGame() {
        board = Array(SIZE * SIZE).fill(0);
        score = 0;
        gameOver = false;
        addRandomStar();
        addRandomStar();
        renderGame();
        saveGame();
        gameBoard?.focus({ preventScroll: true });
    }

    const keyDirections = {
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down"
    };

    document.addEventListener("keydown", (event) => {
        if (window.location.hash !== "#constelaciones") return;
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
        const direction = keyDirections[event.key];
        if (!direction) return;
        event.preventDefault();
        move(direction);
    });

    gameBoard?.addEventListener("pointerdown", (event) => {
        pointerStart = { x: event.clientX, y: event.clientY };
    });

    gameBoard?.addEventListener("pointerup", (event) => {
        if (!pointerStart) return;
        const deltaX = event.clientX - pointerStart.x;
        const deltaY = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 28) return;
        move(Math.abs(deltaX) > Math.abs(deltaY)
            ? (deltaX > 0 ? "right" : "left")
            : (deltaY > 0 ? "down" : "up"));
    });

    gameBoard?.addEventListener("pointercancel", () => {
        pointerStart = null;
    });

    document.querySelector("[data-new-game]")?.addEventListener("click", newGame);
    document.querySelector("[data-restart-game]")?.addEventListener("click", newGame);

    gameModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextMode = button.dataset.gameModeOption;
            if (!nextMode || nextMode === gameMode) return;
            gameMode = nextMode;
            writeStorage("maypage-game-mode", gameMode);
            updateGameModeUi();
            renderGame();
            gameBoard?.focus({ preventScroll: true });
        });
    });

    soundToggle?.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        writeStorage("maypage-game-sound", String(soundEnabled));
        updateSoundButton();
    });

    updateGameModeUi();
    updateSoundButton();
    loadGame();
    highestEver = Math.max(highestEver, ...board);
    renderGame();
    saveGame();
})();
