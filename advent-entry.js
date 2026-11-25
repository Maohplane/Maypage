(() => {
    "use strict";
    const gate = document.querySelector("[data-entry-gate]");
    const enter = document.querySelector("[data-enter-site]");
    function enterAdventure({ animate = true } = {}) {
        document.body.classList.remove("entry-pending");
        document.body.classList.add("site-entered");
        document.querySelectorAll("[data-advent-shell], [data-christmas-player]").forEach((element) => { element.inert = false; });
        gate.inert = true;
        const heading = [...document.querySelectorAll("main h1")].find((element) => element.getClientRects().length);
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
        gate.setAttribute("aria-hidden", "true"); gate.classList.add("is-leaving");
        if (animate) window.setTimeout(() => { gate.hidden = true; }, 520);
        else gate.hidden = true;
        try { sessionStorage.setItem("may-advent-entered-2026", "true"); } catch {}
        document.dispatchEvent(new Event("maypage:entered"));
        window.scrollTo({ top: 0, behavior: "instant" });
    }
    enter.addEventListener("click", () => enterAdventure());
    let remembered = false;
    try { remembered = sessionStorage.getItem("may-advent-entered-2026") === "true"; } catch {}
    if (remembered) enterAdventure({ animate: false });
    else window.requestAnimationFrame(() => enter.focus({ preventScroll: true }));
})();
