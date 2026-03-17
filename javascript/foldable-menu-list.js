(function () {
    // Prevent duplicate init in case scripts are reloaded.
    if (window.__sdFoldableMenuListLoaded) return;
    window.__sdFoldableMenuListLoaded = true;

    const ROOT_ID = "txt2img_script_container";
    const SCRIPT_ID = "script_list";
    const TOGGLE_ID = "txt2img-bottom-menu-toggle";
    const STYLE_ID = "txt2img-bottom-menu-style";
    const STORAGE_KEY = "txt2img_bottom_menu_open";

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            #${TOGGLE_ID} {
                margin: 0 0 8px 0;
                padding: 10px 12px;
                border: 1px solid var(--border-color-primary, #444);
                border-radius: 8px;
                background: var(--block-background-fill, rgba(255,255,255,0.03));
                cursor: pointer;
                user-select: none;
                font-weight: 600;
            }
            #${TOGGLE_ID}:hover {
                filter: brightness(1.05);
            }
        `;
        document.head.appendChild(style);
    }

    function getRoot() {
        return document.getElementById(ROOT_ID);
    }

    function getScriptElement(root) {
        return root ? root.querySelector(`#${SCRIPT_ID}`) : null;
    }

    function getAnchorNode(root, scriptEl) {
        if (!root || !scriptEl) return null;

        let node = scriptEl;
        while (node && node !== root) {
            if (node.previousElementSibling) {
                return node;
            }
            node = node.parentElement;
        }

        return null;
    }

    function getMenuBlocks(anchorNode) {
        if (!anchorNode || !anchorNode.parentElement) return [];

        const result = [];
        let cur = anchorNode.previousElementSibling;

        while (cur) {
            if (cur.id !== TOGGLE_ID) {
                result.push(cur);
            }
            cur = cur.previousElementSibling;
        }

        result.reverse();
        return result;
    }

    function getInsertTarget(anchorNode) {
        const menuBlocks = getMenuBlocks(anchorNode);
        return menuBlocks.length > 0 ? menuBlocks[0] : anchorNode;
    }

    function getSavedOpenState() {
        return localStorage.getItem(STORAGE_KEY) === "1";
    }

    function setSavedOpenState(isOpen) {
        localStorage.setItem(STORAGE_KEY, isOpen ? "1" : "0");
    }

    function applyVisibility(anchorNode, isOpen) {
        const menuBlocks = getMenuBlocks(anchorNode);

        for (const el of menuBlocks) {
            el.style.display = isOpen ? "" : "none";
        }

        const toggle = document.getElementById(TOGGLE_ID);
        if (toggle) {
            toggle.textContent = isOpen ? "▼ Menu List" : "▶ Menu List";
            toggle.dataset.open = isOpen ? "1" : "0";
        }
    }

    function ensureToggle(anchorNode) {
        if (!anchorNode || !anchorNode.parentElement) return;

        const parent = anchorNode.parentElement;
        const insertTarget = getInsertTarget(anchorNode);
        let toggle = document.getElementById(TOGGLE_ID);

        if (!toggle) {
            toggle = document.createElement("div");
            toggle.id = TOGGLE_ID;

            toggle.addEventListener("click", () => {
                const rootNow = getRoot();
                const scriptNow = getScriptElement(rootNow);
                const anchorNow = getAnchorNode(rootNow, scriptNow);
                if (!anchorNow) return;

                const next = toggle.dataset.open !== "1";
                setSavedOpenState(next);
                applyVisibility(anchorNow, next);
            });
        }

        const alreadyCorrect =
            toggle.parentElement === parent &&
            toggle.nextElementSibling === insertTarget;

        if (!alreadyCorrect) {
            if (toggle.parentElement) {
                toggle.parentElement.removeChild(toggle);
            }
            parent.insertBefore(toggle, insertTarget);
        }

        applyVisibility(anchorNode, getSavedOpenState());
    }

    function initOnce() {
        const root = getRoot();
        if (!root) return false;

        const scriptEl = getScriptElement(root);
        if (!scriptEl) return false;

        const anchorNode = getAnchorNode(root, scriptEl);
        if (!anchorNode) return false;

        addStyle();
        ensureToggle(anchorNode);
        return true;
    }

    function boot() {
        let tries = 0;
        const maxTries = 40;

        function tick() {
            const ok = initOnce();
            if (ok) return;

            tries += 1;
            if (tries < maxTries) {
                setTimeout(tick, 300);
            }
        }

        tick();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
