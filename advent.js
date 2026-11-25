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
    let conversation = [], conversationIndex = 0, finishConversation = null, typeTimer = 0, typed = "", fullText = "";
    let motionEnabled = !reducedMotion.matches;
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
        if (!motionEnabled || reducedMotion.matches) { finishTyping(); return; }
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
        $("[data-collection-count]").textContent = `${state.claimed.filter((value, i) => value && released(i)).length} de 4`;
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
        rooftop: [["elf", "Hablar con el duende de la azotea", 18, 5, 35, 65]],
        window: [["cookie", "Explorar las galletas de la ventana", 49, 53, 28, 19]],
        forest: [["elf", "Hablar con el duende del campo", 24, 47, 24, 50], ["tree", "Explorar los árboles", 50, 16, 43, 64]],
        apartment: [["elf", "Hablar con el duende junto al árbol", 47, 27, 27, 70], ["gift", "El regalo bajo el árbol", 25, 70, 24, 29], ["stocking", "La carta en la bota de la chimenea", 76, 28, 20, 37]]
    };
    const lightPositions = {
        rooftop: [[3,75],[13,79],[23,73],[33,79],[47,43],[66,28],[89,32]],
        window: [[10,18],[13,37],[10,57]],
        forest: [[1,18],[6,18],[12,17],[18,17],[25,16],[32,18],[40,17],[48,16],[56,17],[64,16],[72,16],[79,17],[86,18]],
        apartment: [[25,24],[27,34],[21,47],[32,40],[36,56],[28,67],[82,10],[87,9]]
    };
    function renderScene() {
        const chapter = content.chapters[state.chapter]; const scene = $("[data-advent-scene]");
        scene.dataset.scene = chapter.id; scene.style.setProperty("--scene-x", `${chapter.scene[0]}%`); scene.style.setProperty("--scene-y", `${chapter.scene[1]}%`); scene.setAttribute("aria-label", chapter.name);
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
    function renderChapters() {
        const chapters = $("[data-advent-chapters]"); chapters.replaceChildren();
        content.chapters.forEach((chapter, index) => {
            const button = document.createElement("button"); button.type = "button"; button.className = "advent-chapter"; button.dataset.chapter = chapter.id;
            button.setAttribute("aria-pressed", String(index === state.chapter)); button.disabled = !available(chapter);
            const day = document.createElement("strong"); day.textContent = String(chapter.day).padStart(2, "0");
            const copy = document.createElement("span"); copy.textContent = chapter.name;
            const date = document.createElement("small"); date.textContent = available(chapter) ? "Regalo de diciembre" : `Pistas desde el ${chapter.clueDay} de dic.`; copy.append(date); button.append(day, copy);
            button.addEventListener("click", () => { state.chapter = index; save(); renderChapters(); renderScene(); }); chapters.append(button);
        });
    }
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
        if (moveFocus) { const heading = $("#advent-title"); heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    const snow = $("[data-advent-snow]");
    for (let i = 0; i < 54; i++) {
        const flake = document.createElement("i");
        flake.className = i < 24 ? "far" : i > 43 ? "near" : "middle";
        flake.style.setProperty("--flake-x", `${(i * 61.79) % 108 - 6}%`);
        flake.style.setProperty("--flake-size", `${i < 24 ? 1.5 : i > 43 ? 4 : 2.5}px`);
        flake.style.setProperty("--flake-time", `${9 + (i * 7.3) % 14}s`);
        flake.style.setProperty("--flake-delay", `${-(i * 3.7) % 24}s`); snow.append(flake);
    }
    new ResizeObserver((entries) => { $("[data-advent-scene]").style.setProperty("--snow-distance", `${entries[0].contentRect.height + 42}px`); }).observe($("[data-advent-scene]"));
    let weatherIndex = 0;
    const weather = ["quiet", "quiet", "flurries", "gust", "quiet", "flurries"];
    const weatherLabels = { quiet: "Nieve suave", flurries: "Copos que van y vienen", gust: "Una pequeña ráfaga" };
    window.setInterval(() => {
        if (root.hidden || document.hidden || location.hash !== "#inicio" || !motionEnabled) return;
        const current = weather[++weatherIndex % weather.length];
        $("[data-advent-scene]").dataset.weather = current; $("[data-weather-label]").textContent = weatherLabels[current];
    }, 11000);
    function setMotion(enabled) {
        motionEnabled = enabled; root.dataset.motion = enabled ? "on" : "off";
        $("[data-advent-motion]").setAttribute("aria-pressed", String(enabled)); $("[data-advent-motion]").textContent = enabled ? "Pausar movimiento" : "Activar movimiento";
        if (!enabled && typeTimer) finishTyping();
    }
    $("[data-advent-motion]").addEventListener("click", () => setMotion(!motionEnabled));
    reducedMotion.addEventListener("change", () => setMotion(!reducedMotion.matches));
    setMotion(motionEnabled);
    if (preview) {
        $("[data-advent-preview]").hidden = false;
        $("[data-preview-date]").addEventListener("change", () => { for (const d of [dialog, treeDialog, giftDialog, letterDialog]) if (d.open) d.close(); refresh(); });
    }
    function greet() {
        if (preview || state.welcomed || root.hidden || location.hash !== "#inicio" || !document.body.classList.contains("site-entered")) return;
        state.welcomed = true; save();
        window.setTimeout(() => { if (!root.hidden && location.hash === "#inicio" && !document.querySelector("dialog[open]")) speak([["hello", "Bienvenida a nuestro pequeño rincón de Navidad, May. Aquí cada lugar guarda algo para ti."], ["wink", "Cuando quieras, ven a buscarme a la azotea. Tengo el primer secreto de tu Navidad. ♡"]]); }, 850);
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
