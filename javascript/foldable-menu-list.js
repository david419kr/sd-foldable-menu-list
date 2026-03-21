(function () {
    // Prevent duplicate init in case scripts are reloaded.
    if (window.__sdFoldableMenuListLoaded) return;
    window.__sdFoldableMenuListLoaded = true;

    const SCRIPT_ID = "script_list";
    const STYLE_ID = "sd-foldable-menu-style";
    const CONTEXTS = [
        {
            rootId: "txt2img_script_container",
            toggleId: "txt2img-bottom-menu-toggle",
            storageKey: "txt2img_bottom_menu_open",
        },
        {
            rootId: "img2img_script_container",
            toggleId: "img2img-bottom-menu-toggle",
            storageKey: "img2img_bottom_menu_open",
        },
    ];
    const initializedContexts = new Set();

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            .sd-foldable-menu-toggle {
                margin: 0 0 8px 0;
                padding: 10px 12px;
                border: 1px solid var(--border-color-primary, #444);
                border-radius: 8px;
                background: var(--block-background-fill, rgba(255,255,255,0.03));
                cursor: pointer;
                user-select: none;
                font-weight: 600;
            }
            .sd-foldable-menu-toggle:hover {
                filter: brightness(1.05);
            }
        `;
        document.head.appendChild(style);
    }

    function getRoot(context) {
        return document.getElementById(context.rootId);
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

    function getMenuBlocks(context, anchorNode) {
        if (!anchorNode || !anchorNode.parentElement) return [];

        const result = [];
        let cur = anchorNode.previousElementSibling;

        while (cur) {
            if (cur.id !== context.toggleId) {
                result.push(cur);
            }
            cur = cur.previousElementSibling;
        }

        result.reverse();
        return result;
    }

    function getInsertTarget(context, anchorNode) {
        const menuBlocks = getMenuBlocks(context, anchorNode);
        return menuBlocks.length > 0 ? menuBlocks[0] : anchorNode;
    }

    function getSavedOpenState(context) {
        return localStorage.getItem(context.storageKey) === "1";
    }

    function setSavedOpenState(context, isOpen) {
        localStorage.setItem(context.storageKey, isOpen ? "1" : "0");
    }

    function applyVisibility(context, anchorNode, isOpen) {
        const menuBlocks = getMenuBlocks(context, anchorNode);

        for (const el of menuBlocks) {
            el.style.display = isOpen ? "" : "none";
        }

        const toggle = document.getElementById(context.toggleId);
        if (toggle) {
            toggle.textContent = isOpen ? "▼ Menu List" : "▶ Menu List";
            toggle.dataset.open = isOpen ? "1" : "0";
        }
    }

    function ensureToggle(context, anchorNode) {
        if (!anchorNode || !anchorNode.parentElement) return;

        const parent = anchorNode.parentElement;
        const insertTarget = getInsertTarget(context, anchorNode);
        let toggle = document.getElementById(context.toggleId);

        if (!toggle) {
            toggle = document.createElement("div");
            toggle.id = context.toggleId;
            toggle.className = "sd-foldable-menu-toggle";

            toggle.addEventListener("click", () => {
                const rootNow = getRoot(context);
                const scriptNow = getScriptElement(rootNow);
                const anchorNow = getAnchorNode(rootNow, scriptNow);
                if (!anchorNow) return;

                const next = toggle.dataset.open !== "1";
                setSavedOpenState(context, next);
                applyVisibility(context, anchorNow, next);
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

        applyVisibility(context, anchorNode, getSavedOpenState(context));
    }

    function initContextOnce(context) {
        if (initializedContexts.has(context.rootId)) return true;

        const root = getRoot(context);
        if (!root) return false;

        const scriptEl = getScriptElement(root);
        if (!scriptEl) return false;

        const anchorNode = getAnchorNode(root, scriptEl);
        if (!anchorNode) return false;

        addStyle();
        ensureToggle(context, anchorNode);
        initializedContexts.add(context.rootId);
        return true;
    }

    function initAllContexts() {
        for (const context of CONTEXTS) {
            initContextOnce(context);
        }
        return initializedContexts.size === CONTEXTS.length;
    }

    function boot() {
        let tries = 0;
        const maxTries = 40;

        function stopInteractionHooks() {
            document.removeEventListener("click", onInteraction, true);
            document.removeEventListener("change", onInteraction, true);
        }

        function onInteraction() {
            if (initAllContexts()) {
                stopInteractionHooks();
            }
        }

        function tick() {
            if (initAllContexts()) {
                stopInteractionHooks();
                return;
            }

            tries += 1;
            if (tries < maxTries) {
                setTimeout(tick, 300);
            }
        }

        tick();
        document.addEventListener("click", onInteraction, true);
        document.addEventListener("change", onInteraction, true);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
