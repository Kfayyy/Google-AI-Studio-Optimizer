// ==UserScript==
// @name         Google AI Studio - Ultimate Optimizer UI
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Collapse code + reduce lag + restore messages with stable UI
// @match        https://aistudio.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==============================
    // ⚙️ CONFIG
    // ==============================

    let BASE_MAX_VISIBLE = 35;
    let MAX_VISIBLE = BASE_MAX_VISIBLE;
    let MAX_CACHE = 50;
    let RESTORE_COUNT = 10;
    let enabled = true;

    // Messages masqués
    let hiddenMessages = [];

    // ==============================
    // 📦 MESSAGE HANDLING
    // ==============================

    function getMessages() {
        return Array.from(document.querySelectorAll('ms-chat-turn'));
    }

    function optimizeDOM() {

        if (!enabled) return;

        const messages = getMessages();

        if (messages.length <= MAX_VISIBLE) return;

        const toHide = messages.length - MAX_VISIBLE;

        hiddenMessages = [];

        messages.forEach((el, index) => {

            if (index < toHide) {

                el.style.display = 'none';

                hiddenMessages.push(el);

            } else {

                el.style.display = '';
            }
        });

        // limite du cache mémoire
        if (hiddenMessages.length > MAX_CACHE) {

            const excess = hiddenMessages.length - MAX_CACHE;

            hiddenMessages
                .slice(0, excess)
                .forEach(el => {

                // suppression réelle du DOM
                el.remove();
            });

            hiddenMessages = hiddenMessages.slice(excess);

            console.log(`[Optimizer] Purged ${excess} cached messages`);
        }

        console.log(`[Optimizer] Hidden ${toHide} messages`);
    }

    function restoreMessages() {

        if (hiddenMessages.length === 0) return;

        const count = Math.min(RESTORE_COUNT, hiddenMessages.length);

        const items = hiddenMessages.slice(-count);

        items.forEach(el => {
            el.style.display = '';
        });

        hiddenMessages.splice(-count);

        // ✅ FIX IMPORTANT :
        // on augmente la fenêtre visible
        MAX_VISIBLE += count;

        console.log(`[Optimizer] Restored ${count} messages`);
        console.log(`[Optimizer] MAX_VISIBLE is now ${MAX_VISIBLE}`);
    }

    function cleanAgain() {

        // remet la limite normale
        MAX_VISIBLE = BASE_MAX_VISIBLE;

        optimizeDOM();
    }

    // ==============================
    // 👀 OBSERVER
    // ==============================

    let optimizeScheduled = false;

    const observer = new MutationObserver(() => {

        if (optimizeScheduled) return;

        optimizeScheduled = true;

        requestAnimationFrame(() => {

            optimizeDOM();

            optimizeScheduled = false;
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setTimeout(optimizeDOM, 2000);

    // ==============================
    // 📉 COLLAPSE CODE
    // ==============================

    let autoMode = true;

    function collapseAll() {

        const openButtons = document.querySelectorAll(
            'ms-code-block button[data-test-id="expand-icon-button"] span'
        );

        let collapsed = 0;

        openButtons.forEach(span => {

            if (span.textContent.trim() === 'expand_less') {

                const btn = span.closest('button');

                if (btn) {
                    btn.click();
                    collapsed++;
                }
            }
        });

        return collapsed;
    }

    function stopAutoMode() {
        autoMode = false;
        collapseObserver.disconnect();
    }

    const collapseObserver = new MutationObserver(() => {

        if (!autoMode) return;

        const changed = collapseAll();

        if (changed === 0) stopAutoMode();
    });

    collapseObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    setTimeout(() => {

        const changed = collapseAll();

        if (changed === 0) stopAutoMode();

    }, 1200);

    // ==============================
    // 🎨 UI
    // ==============================

    const collapseBtn = document.createElement('button');
    collapseBtn.innerText = '▼';

    const optimizerBtn = document.createElement('button');
    optimizerBtn.innerText = '⚡';

    const baseStyle = {
        position: 'fixed',
        bottom: '25px',
        zIndex: 99999,
        padding: '10px 12px',
        background: '#333',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontSize: '13px'
    };

    Object.assign(collapseBtn.style, baseStyle, {
        right: 'calc(50% - 10px)',
        transform: 'translateX(50%)'
    });

    Object.assign(optimizerBtn.style, baseStyle, {
        right: 'calc(50% - 60px)',
        transform: 'translateX(50%)'
    });

    collapseBtn.onclick = () => {
        autoMode = false;
        collapseAll();
    };

    // ==============================
    // 🪟 PANEL
    // ==============================

    const panel = document.createElement('div');

    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '70px',
        right: '50%',
        transform: 'translateX(50%)',
        zIndex: 99999,
        background: '#2b2b2b',
        padding: '12px',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '12px',
        display: 'none',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '220px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    });

    function createRow(labelText, inputEl) {

        const row = document.createElement('div');

        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';

        const label = document.createElement('span');
        label.innerText = labelText;

        row.appendChild(label);
        row.appendChild(inputEl);

        return row;
    }

    const maxInput = document.createElement('input');

    maxInput.type = 'number';
    maxInput.value = BASE_MAX_VISIBLE;
    maxInput.style.width = '60px';

    maxInput.onchange = () => {

        BASE_MAX_VISIBLE = parseInt(maxInput.value) || 35;
        MAX_VISIBLE = BASE_MAX_VISIBLE;

        optimizeDOM();
    };

    const restoreInput = document.createElement('input');

    restoreInput.type = 'number';
    restoreInput.value = RESTORE_COUNT;
    restoreInput.style.width = '60px';

    restoreInput.onchange = () => {
        RESTORE_COUNT = parseInt(restoreInput.value) || 10;
    };

    const cacheInput = document.createElement('input');

    cacheInput.type = 'number';
    cacheInput.value = MAX_CACHE;
    cacheInput.style.width = '60px';

    cacheInput.onchange = () => {

        MAX_CACHE = parseInt(cacheInput.value) || 50;
    };

    function makeBtn(text, action) {

        const b = document.createElement('button');

        b.innerText = text;

        Object.assign(b.style, {
            background: '#3c3c3c',
            color: '#fff',
            border: 'none',
            padding: '6px',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%'
        });

        b.onclick = action;

        return b;
    }

    const toggleBtn = makeBtn('⚡ Optimizer ON', () => {

        enabled = !enabled;

        toggleBtn.innerText =
            enabled ? '⚡ Optimizer ON' : '⛔ Optimizer OFF';

        if (enabled) {
            optimizeDOM();
        } else {

            // tout réafficher
            getMessages().forEach(el => {
                el.style.display = '';
            });
        }
    });

    const restoreBtn = makeBtn('⬆ Restore', restoreMessages);

    const cleanBtn = makeBtn('⬇ Clean', cleanAgain);

    panel.appendChild(createRow('Max visible', maxInput));
    panel.appendChild(createRow('Restore count', restoreInput));
    panel.appendChild(createRow('Cache size', cacheInput));

    panel.appendChild(toggleBtn);
    panel.appendChild(restoreBtn);
    panel.appendChild(cleanBtn);

    optimizerBtn.onclick = () => {

        panel.style.display =
            panel.style.display === 'none'
                ? 'flex'
                : 'none';
    };

    document.addEventListener('click', (e) => {

        if (!panel.contains(e.target) && e.target !== optimizerBtn) {
            panel.style.display = 'none';
        }
    });

    [collapseBtn, optimizerBtn].forEach(btn => {

        btn.onmouseover = () => btn.style.opacity = '0.85';
        btn.onmouseout = () => btn.style.opacity = '1';
    });

    function waitForBody() {

        if (!document.body) {
            requestAnimationFrame(waitForBody);
            return;
        }

        document.body.appendChild(collapseBtn);
        document.body.appendChild(optimizerBtn);
        document.body.appendChild(panel);
    }

    waitForBody();

})();
