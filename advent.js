(() => {
    "use strict";
    const root = document.querySelector("[data-advent-root]");
    const content = window.MayAdventContent;
    if (!root || !content) return;
    const $ = (selector) => root.querySelector(selector);
    const preview = new URLSearchParams(location.search).get("adviento") === "preview";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const storageKey = preview ? "may-advent-preview-2026-v1" : "may-advent-2026-v1";
    const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" });
    const faces = { hello: 0, wink: 1, thinking: 2, surprised: 3, sad: 4, excited: 5, tender: 6, talking: 7 };
    const faceDescriptions = { hello: "El duende sonríe", wink: "El duende guiña un ojo", thinking: "El duende está pensando", surprised: "El duende está sorprendido", sad: "El duende te anima a volver a intentarlo", excited: "El duende está emocionado", tender: "El duende sonríe con cariño", talking: "El duende está hablando" };
    let state = { chapter: 0, clues: [false, false, false, false], claimed: [false, false, false, false], treeSolved: false, attempts: {}, welcomed: false };
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        if (saved && typeof saved === "object") {
            state.chapter = Number.isInteger(saved.chapter) && saved.chapter >= 0 && saved.chapter < 4 ? saved.chapter : 0;
            for (const key of ["clues", "claimed"]) if (Array.isArray(saved[key])) state[key] = Array.from({ length: 4 }, (_, i) => saved[key][i] === true);
            state.treeSolved = saved.treeSolved === true;
            state.welcomed = saved.welcomed === true;
            if (saved.attempts && typeof saved.attempts === "object" && !Array.isArray(saved.attempts)) state.attempts = saved.attempts;
        }
    } catch { /* The adventure also works when storage is blocked. */ }
    function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} }
    function dayKey() {
        if (preview) return $("[data-preview-date]").value || "2026-12-01";
        const parts = Object.fromEntries(dateFormatter.formatToParts(new Date()).map(({ type, value }) => [type, value]));
        return `${parts.year}-${parts.month}-${parts.day}`;
    }
    function dateFor(day) { return `2026-12-${String(day).padStart(2, "0")}`; }
    function available(chapter) { return dayKey() >= dateFor(chapter.clueDay); }
    function released(index) { return dayKey() >= dateFor(content.chapters[index].day); }
    function setFace(face) {
        const index = faces[face] ?? 0;
        const portrait = $("[data-elf-portrait]");
        portrait.style.setProperty("--face-x", `${(index % 4) * 100 / 3}%`);
        portrait.style.setProperty("--face-y", index >= 4 ? "100%" : "0%");
        portrait.dataset.expression = face;
        portrait.setAttribute("aria-label", faceDescriptions[face] || faceDescriptions.hello);
    }
    const dialog = $("[data-advent-dialog]");
    const treeDialog = $("[data-tree-dialog]");
    const giftDialog = $("[data-gift-dialog]");
    const letterDialog = $("[data-advent-letter]");
    const locationDialog = $("[data-location-dialog]");
    let conversation = [], conversationIndex = 0, finishConversation = null, typeTimer = 0, typed = "", fullText = "";
    let explicitMotion = null;
    try { const saved = localStorage.getItem("may-advent-motion-v2"); if (saved === "on" || saved === "off") explicitMotion = saved === "on"; } catch {}
    let motionEnabled = explicitMotion === null ? !reducedMotion.matches : explicitMotion;
    function stopTyping() { window.clearInterval(typeTimer); typeTimer = 0; $("[data-elf-portrait]").classList.remove("is-talking"); }
    function finishTyping() {
        stopTyping(); typed = fullText; $("[data-dialog-text]").textContent = fullText;
        $("[data-dialog-next]").textContent = conversationIndex === conversation.length - 1 ? "Hasta ahorita" : "Continuar";
    }
    function renderBeat() {
        stopTyping();
        const [face, text] = conversation[conversationIndex];
        setFace(face); fullText = text; typed = "";
        $("[data-dialog-text]").textContent = "";
        $("[data-dialog-announcement]").textContent = text;
        $("[data-dialog-progress]").textContent = `${conversationIndex + 1} de ${conversation.length}`;
        if (!motionEnabled) { finishTyping(); return; }
        $("[data-dialog-next]").textContent = "Mostrar todo";
        $("[data-elf-portrait]").classList.add("is-talking");
        const letters = Array.from(text); let index = 0;
        typeTimer = window.setInterval(() => {
            typed += letters[index++] || "";
            $("[data-dialog-text]").textContent = typed;
            if (index >= letters.length) finishTyping();
        }, 22);
    }
    function speak(beats, onFinish = null, title = "Psst… May.") {
        if (treeDialog.open) treeDialog.close();
        conversation = beats; conversationIndex = 0; finishConversation = onFinish;
        $("#advent-dialog-title").textContent = title;
        if (!dialog.open) dialog.showModal();
        renderBeat();
    }
    $("[data-dialog-next]").addEventListener("click", () => {
        if (typeTimer) { finishTyping(); return; }
        if (conversationIndex < conversation.length - 1) { conversationIndex++; renderBeat(); return; }
        dialog.close();
        const callback = finishConversation; finishConversation = null;
        if (callback) callback();
        refresh();
    });
    $("[data-dialog-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { stopTyping(); finishConversation = null; });
    // Capture the callback before closing, because close events are queued.
    // Nothing is marked as read when the conversation is dismissed early.
    function talk() {
        const chapter = content.chapters[state.chapter];
        const name = chapter.id === "forest" && state.treeSolved ? "forestClue" : chapter.id;
        speak(content.conversations[name], () => {
            if (state.chapter !== 2 || state.treeSolved) state.clues[state.chapter] = true;
            state.welcomed = true; save(); refresh();
        });
    }
    function notice(text) { $("[data-advent-notice]").textContent = text; }
    function giftPosition(element, index) {
        element.style.setProperty("--gift-x", index % 2 ? "100%" : "0%");
        element.style.setProperty("--gift-y", index >= 2 ? "100%" : "0%");
    }
    function revealGift(index) {
        const chapter = content.chapters[index];
        if (!released(index)) {
            speak([["thinking", `Este regalo se abre el ${chapter.day} de diciembre. La pista ya puede acompañarte mientras llega ese día. ♡`]]);
            return;
        }
        if (!state.clues[index]) {
            speak([["wink", index === 2 ? "Antes de abrir este regalo, hay un árbol que tenemos que encontrar. Solo una elección al día, ¿recuerdas?" : "Primero hay un pequeño secreto que quiero contarte. Ven a hablar conmigo. ♡"]]);
            return;
        }
        state.claimed[index] = true; save(); renderShelf(); renderActions();
        const art = $("[data-gift-art]"); giftPosition(art, index); art.setAttribute("aria-label", chapter.gift);
        $("#advent-gift-title").textContent = chapter.gift;
        giftDialog.showModal();
    }
    $("[data-gift-close]").addEventListener("click", () => giftDialog.close());
    $("[data-gift-done]").addEventListener("click", () => giftDialog.close());
    function renderShelf() {
        const shelf = $("[data-advent-shelf]"); shelf.replaceChildren();
        content.chapters.forEach((chapter, index) => {
            const claimed = state.claimed[index] && released(index);
            const button = document.createElement("button"); button.type = "button"; button.className = "advent-shelf-item";
            const art = document.createElement("div"); art.setAttribute("aria-hidden", "true");
            art.className = claimed ? "advent-gift-art" : "advent-closed-gift";
            if (claimed) giftPosition(art, index); else art.textContent = String(chapter.day).padStart(2, "0");
            const title = document.createElement("strong"); title.textContent = claimed ? chapter.gift : `${chapter.day} de diciembre`;
            const status = document.createElement("small"); status.textContent = claimed ? "Ya es parte de nuestra Navidad" : released(index) && state.clues[index] ? "Tu regalo ya te está esperando" : "Un pequeño secreto";
            button.append(art, title, status); button.addEventListener("click", () => revealGift(index)); shelf.append(button);
        });
        const count = `${state.claimed.filter((value, i) => value && released(i)).length} de 4`;
        $("[data-collection-count]").textContent = count;
        $("[data-shelf-count]").textContent = count;
    }
    function showStocking() {
        if (dayKey() < dateFor(25)) { speak([["tender", "Esta bota guarda algo para el 25 de diciembre. Hasta entonces, su carta se queda calentita junto a la chimenea. ♡"]]); return; }
        if (!content.finalLetter) { speak([["tender", "Tu carta todavía está de camino a esta chimenea. Tu regalo de Navidad ya puede abrirse. ♡"]]); return; }
        const copy = $("[data-advent-letter-copy]"); copy.replaceChildren();
        for (const paragraph of content.finalLetter.split(/\n\s*\n/)) { const p = document.createElement("p"); p.textContent = paragraph; copy.append(p); }
        letterDialog.showModal();
    }
    $("[data-advent-letter-close]").addEventListener("click", () => letterDialog.close());
    let candidate = null;
    function openTrees() {
        candidate = null;
        const attempted = Number.isInteger(state.attempts[dayKey()]);
        const selected = state.attempts[dayKey()];
        const field = $("[data-tree-field]"); field.replaceChildren();
        field.dataset.overview = "false";
        $("[data-tree-zoom]").textContent = "Ver campo completo";
        content.trees.forEach(([x, y, label], index) => {
            const button = document.createElement("button"); button.type = "button"; button.className = "advent-tree-option"; button.dataset.tree = String(index);
            Object.assign(button.style, { left: `${x - 6}%`, top: `${y - 11}%`, width: "12%", height: "22%" });
            button.setAttribute("aria-label", `Árbol ${index + 1}: ${label}`);
            button.setAttribute("aria-pressed", String(attempted && selected === index));
            button.disabled = attempted || state.treeSolved;
            button.addEventListener("click", () => {
                candidate = index;
                field.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
                $("[data-tree-choice]").hidden = false;
                $("[data-tree-choice-text]").textContent = `Árbol ${index + 1}: ${label}. Será tu única elección de hoy.`;
            });
            field.append(button);
        });
        const flakes = document.createElement("div"); flakes.className = "advent-tree-snow"; flakes.setAttribute("aria-hidden", "true"); field.append(flakes);
        $("[data-tree-status]").textContent = state.treeSolved ? "Ya encontramos nuestro árbol. Su pista te espera con el duende." : attempted ? "Ya elegiste un árbol hoy. Mañana, a partir de las 00:00 de Ciudad de México, podrás elegir de nuevo." : "Un campo lleno de árboles y una sola elección al día. Muchos se parecen… mira bien antes de escoger.";
        $("[data-tree-choice]").hidden = true;
        treeDialog.showModal();
    }
    $("[data-tree-confirm]").addEventListener("click", () => {
        if (candidate === null || Number.isInteger(state.attempts[dayKey()]) || state.treeSolved) return;
        const selected = candidate; state.attempts[dayKey()] = selected;
        const correct = selected === content.correctTree;
        if (correct) { state.treeSolved = true; state.clues[2] = true; }
        save(); treeDialog.close(); refresh();
        if (correct) speak(content.conversations.forestClue);
        else speak([["sad", "Este árbol está precioso, pero no es el que vine a buscar…"], ["tender", "Mañana podremos mirar otra vez. Aquí te voy a estar esperando, cutie. Una elección al día, incluso después del 15. ♡"]]);
    });
    $("[data-tree-close]").addEventListener("click", () => treeDialog.close());
    $("[data-tree-zoom]").addEventListener("click", () => {
        const field = $("[data-tree-field]");
        const overview = field.dataset.overview !== "true";
        field.dataset.overview = String(overview);
        $("[data-tree-zoom]").textContent = overview ? "Acercar para escoger" : "Ver campo completo";
    });
    function handleAction(action) {
        if (action === "elf" || action === "cookie") talk();
        if (action === "tree") openTrees();
        if (action === "gift") revealGift(state.chapter);
        if (action === "stocking") showStocking();
    }
    function makeAction(label, action, primary = false) {
        const button = document.createElement("button"); button.type = "button"; button.className = `advent-action${primary ? " primary" : ""}`;
        button.textContent = label; button.addEventListener("click", () => handleAction(action)); return button;
    }
    function renderActions() {
        const actions = $("[data-advent-actions]"); actions.replaceChildren();
        actions.append(makeAction(state.chapter === 1 ? "Las galletas de la ventana" : "Hablar con el duende", state.chapter === 1 ? "cookie" : "elf"));
        if (state.chapter === 2) actions.append(makeAction(state.treeSolved ? "Ver nuestro árbol" : "Escoger un árbol", "tree", true));
        if (state.chapter === 3) actions.append(makeAction("La bota de la chimenea", "stocking"));
        if (state.clues[state.chapter] && released(state.chapter)) actions.append(makeAction(state.claimed[state.chapter] ? "Volver a ver mi regalo" : "Descubrir mi regalo", "gift", true));
        if (state.chapter === 2 && !state.treeSolved && Number.isInteger(state.attempts[dayKey()])) notice("Ya hiciste tu elección de hoy. Mañana tendrás una nueva oportunidad. ♡");
        else if (!released(state.chapter)) notice(`Puedes seguir la pista desde ahora. Este regalo se abre el ${content.chapters[state.chapter].day} de diciembre.`);
        else notice("Toca al duende y explora los pequeños detalles. Esta Navidad está hecha para ti. ♡");
    }
    const hotspotData = {
        rooftop: [["elf", "Hablar con el duende de la azotea", 18, 7, 36, 69]],
        window: [["cookie", "Explorar las galletas de la ventana", 47, 59, 29, 17]],
        forest: [["tree", "Explorar los árboles", 0, 0, 100, 100]],
        apartment: [["elf", "Hablar con el duende junto al árbol", 40, 23, 32, 70], ["gift", "El regalo bajo el árbol", 25, 68, 17, 26], ["stocking", "La carta en la bota de la chimenea", 73, 26, 14, 34]]
    };
    const lightPositions = {
        rooftop: [[3,75],[13,79],[23,73],[33,79],[47,43],[66,28],[89,32]],
        window: [[10,18],[13,37],[10,57]],
        forest: [[1,18],[6,18],[12,17],[18,17],[25,16],[32,18],[40,17],[48,16],[56,17],[64,16],[72,16],[79,17],[86,18]],
        apartment: [[25,24],[27,34],[21,47],[32,40],[36,56],[28,67],[82,10],[87,9]]
    };
    function renderScene() {
        const chapter = content.chapters[state.chapter]; const scene = $("[data-advent-scene]");
        scene.dataset.scene = chapter.id; scene.setAttribute("aria-label", chapter.name);
        const sceneImage = $("[data-scene-image]");
        const images = { rooftop: "rooftop-full.webp", window: "window-full.webp", forest: "tree-field.webp", apartment: "apartment-full.webp" };
        sceneImage.src = `assets/advent/${images[chapter.id]}`;
        $("[data-location-date]").textContent = `Regalo del ${chapter.day} de diciembre`;
        $("[data-location-title]").textContent = chapter.name; $("[data-location-copy]").textContent = chapter.description;
        const hotspots = $("[data-advent-hotspots]"); hotspots.replaceChildren();
        for (const [action, label, left, top, width, height] of hotspotData[chapter.id]) {
            const button = document.createElement("button"); button.type = "button"; button.className = "advent-hotspot"; button.dataset.action = action; button.setAttribute("aria-label", label);
            Object.assign(button.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
            button.addEventListener("click", () => handleAction(action)); hotspots.append(button);
        }
        const lights = $("[data-scene-lights]"); lights.replaceChildren();
        lightPositions[chapter.id].forEach(([left, top], index) => { const light = document.createElement("i"); light.style.left = `${left}%`; light.style.top = `${top}%`; light.style.setProperty("--light-delay", `${-index * .7}s`); lights.append(light); });
        renderActions();
    }
    const mapPlaces = [
        { name: "Azotea", bounds: [12, 24, 18, 28] },
        { name: "Ventana", bounds: [33, 60, 15, 17] },
        { name: "Granero", bounds: [79, 43, 18, 19] },
        { name: "En casa", bounds: [55, 71, 14, 23] }
    ];
    function openChapter(index) {
        const chapter = content.chapters[index];
        if (!available(chapter)) {
            speak([["thinking", `Todavía estoy preparando este rincón. Ven a buscarme aquí a partir del ${chapter.clueDay} de diciembre. ♡`]]);
            return;
        }
        state.chapter = index; save(); renderChapters(); renderScene();
        if (!locationDialog.open) locationDialog.showModal();
        root.dispatchEvent(new Event("advent:scene"));
    }
    function renderChapters() {
        const places = $("[data-advent-chapters]"); places.replaceChildren();
        content.chapters.forEach((chapter, index) => {
            const button = document.createElement("button"); button.type = "button"; button.className = "advent-map-place"; button.dataset.chapter = chapter.id;
            const unlocked = available(chapter);
            button.dataset.locked = String(!unlocked);
            button.setAttribute("aria-haspopup", "dialog");
            button.setAttribute("aria-label", `${mapPlaces[index].name}. Regalo del ${chapter.day} de diciembre. ${unlocked ? "Entrar" : `Disponible desde el ${chapter.clueDay} de diciembre`}`);
            if (unlocked) button.classList.add(state.claimed[index] ? "is-claimed" : "is-ready");
            const [left, top, width, height] = mapPlaces[index].bounds;
            Object.assign(button.style, { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` });
            const tag = document.createElement("span"); tag.className = "advent-map-tag"; tag.setAttribute("aria-hidden", "true");
            const date = document.createElement("strong"); date.textContent = String(chapter.day).padStart(2, "0");
            const name = document.createElement("span"); name.textContent = mapPlaces[index].name; tag.append(date, name); button.append(tag);
            button.addEventListener("click", () => openChapter(index)); places.append(button);
        });
    }
    $("[data-location-close]").addEventListener("click", () => locationDialog.close());
    locationDialog.addEventListener("close", () => root.dispatchEvent(new Event("advent:scene")));
    $("[data-map-zoom]").addEventListener("click", () => {
        const viewport = $("[data-map-viewport]");
        const zoom = viewport.dataset.zoom !== "on";
        viewport.style.setProperty("--map-zoom-width", `${Math.min(1536, Math.max(1000, viewport.clientWidth * 1.35))}px`);
        viewport.dataset.zoom = zoom ? "on" : "off";
        $("[data-map-zoom]").textContent = zoom ? "Ver ciudad completa" : "Acercar ciudad";
    });
    function refresh() {
        const active = preview || dayKey() >= dateFor(1);
        const countdownShell = document.querySelector("[data-advent-countdown]");
        const moveFocus = active && countdownShell.contains(document.activeElement);
        root.hidden = !active;
        countdownShell.hidden = active;
        document.body.classList.toggle("advent-season-active", active);
        if (!active) return;
        if (!available(content.chapters[state.chapter])) state.chapter = 0;
        renderChapters(); renderScene(); renderShelf();
        root.dispatchEvent(new Event("advent:render"));
        if (moveFocus) { const heading = $("#advent-title"); heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    let weatherIndex = 0;
    const weather = ["quiet", "flurries", "quiet", "gust", "flurries", "quiet"];
    window.setInterval(() => {
        if (root.hidden || document.hidden || !motionEnabled) return;
        const current = weather[++weatherIndex % weather.length];
        root.dataset.weather = current; $("[data-advent-scene]").dataset.weather = current;
    }, 11000);
    function setMotion(enabled, remember = false) {
        motionEnabled = enabled; root.dataset.motion = enabled ? "on" : "off";
        if (remember) { explicitMotion = enabled; try { localStorage.setItem("may-advent-motion-v2", enabled ? "on" : "off"); } catch {} }
        $("[data-advent-motion]").setAttribute("aria-pressed", String(enabled)); $("[data-advent-motion]").textContent = enabled ? "Pausar movimiento" : "Activar movimiento";
        if (!enabled && typeTimer) finishTyping();
        root.dispatchEvent(new Event("advent:motion"));
    }
    $("[data-advent-motion]").addEventListener("click", () => setMotion(!motionEnabled, true));
    reducedMotion.addEventListener("change", () => { if (explicitMotion === null) setMotion(!reducedMotion.matches); });
    setMotion(motionEnabled);
    if (preview) {
        $("[data-advent-preview]").hidden = false;
        const requested = new URLSearchParams(location.search).get("fecha");
        if (requested && /^2026-12-(0[1-9]|[12][0-9]|3[01])$/.test(requested)) $("[data-preview-date]").value = requested;
        $("[data-preview-reset]").addEventListener("click", () => {
            for (const d of [dialog, treeDialog, giftDialog, letterDialog, locationDialog]) if (d.open) d.close();
            state = { chapter: 0, clues: [false, false, false, false], claimed: [false, false, false, false], treeSolved: false, attempts: {}, welcomed: false };
            save(); refresh();
        });
        $("[data-preview-date]").addEventListener("change", () => {
            lastDay = dayKey();
            for (const d of [dialog, treeDialog, giftDialog, letterDialog, locationDialog]) if (d.open) d.close();
            refresh();
        });
    }
    function greet() {
        if (state.welcomed || root.hidden || !document.body.classList.contains("site-entered")) return;
        state.welcomed = true; save();
    }
    document.addEventListener("maypage:december", () => { refresh(); greet(); });
    document.addEventListener("maypage:entered", greet);
    let lastDay = dayKey();
    window.setInterval(() => {
        const next = dayKey();
        if (next !== lastDay) {
            lastDay = next;
            const reopenField = treeDialog.open;
            if (reopenField) treeDialog.close();
            refresh();
            if (reopenField) openTrees();
            greet();
        }
    }, 1000);
    window.addEventListener("hashchange", greet);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
    refresh(); greet();
})();
