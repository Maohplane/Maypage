(() => {
    "use strict";
    const params = new URLSearchParams(location.search);
    // Earlier preview links now open the real calendar without date overrides.
    if (params.get("adviento") === "preview") {
        const target = new URL("advent.html", location.href);
        location.replace(target.href);
        return;
    }
    const opening = Date.parse("2026-12-01T00:00:00-06:00");
    function reveal() {
        if (Date.now() < opening) return;
        const countdown = document.querySelector("[data-advent-countdown]");
        const moveFocus = countdown.contains(document.activeElement);
        countdown.hidden = true;
        const portal = document.querySelector("[data-calendar-portal]");
        portal.hidden = false;
        if (moveFocus) { const heading = portal.querySelector("h1"); heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    document.addEventListener("maypage:december", reveal);
    reveal();
})();
