// ==UserScript==
// @name         Google AI Studio - Ultimate Optimizer UI
// @namespace    http://tampermonkey.net/
// @version      5.3
// @description  Collapse code + Infinite Restore (Bug fixed) + Persistent Config + Reduce lag
// @match        https://aistudio.google.com/*
// @author       Kfayyy
// @downloadURL  https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js
// @updateURL    https://raw.githubusercontent.com/Kfayyy/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js
// @license      MIT
// @icon         https://aistudio.google.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==============================
    // ⚙️ CONFIGURATION PERSISTANTE
    // ==============================
    const CONFIG_KEY = 'ai_studio_optimizer_config';

    let BASE_MAX_VISIBLE = 35;
    let MAX_VISIBLE = 35;
    let MAX_CACHE = 50;
    let RESTORE_COUNT = 10;
    let enabled = true;

    function loadConfig() {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                BASE_MAX_VISIBLE = parsed.BASE_MAX_VISIBLE ?? 35;
                MAX_CACHE = parsed.MAX_CACHE ?? 50;
                RESTORE_COUNT = parsed.RESTORE_COUNT ?? 10;
                enabled = parsed.enabled ?? true;
            }
        } catch (e) { console.error("[Optimizer] Erreur config", e); }
        MAX_VISIBLE = BASE_MAX_VISIBLE;
    }

    function saveConfig() {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify({
                BASE_MAX_VISIBLE, MAX_CACHE, RESTORE_COUNT, enabled
            }));
        } catch (e) {}
    }

    loadConfig();

    // ==============================
    // 🧠 GESTION MÉMOIRE & DOM
    // ==============================

    let hiddenMessages = [];
    let detachedMessages = [];
    let chatContainerRef = null;

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function getMessages() {
        return Array.from(document.querySelectorAll('ms-chat-turn'));
    }

    function updateRestoreBtnLabel() {
        if (typeof restoreBtn !== 'undefined' && restoreBtn) {
            const total = hiddenMessages.length + detachedMessages.length;
            restoreBtn.innerText = `⬆ Restore (${total} dispo)`;
        }
    }

    function optimizeDOM() {
        if (!enabled) return;

        const messages = getMessages();

        if (messages.length <= MAX_VISIBLE) {
            messages.forEach(el => {
                if (el.style.display === 'none') el.style.display = '';
            });
            hiddenMessages = [];
            updateRestoreBtnLabel();
            return;
        }

        const toHide = messages.length - MAX_VISIBLE;
        hiddenMessages = [];

        messages.forEach((el, index) => {
            if (index < toHide) {
                if (el.style.display !== 'none') el.style.display = 'none';
                hiddenMessages.push(el);
            } else {
                if (el.style.display === 'none') el.style.display = '';
            }
        });

        if (hiddenMessages.length > MAX_CACHE) {
            const excess = hiddenMessages.length - MAX_CACHE;
            const toPurge = hiddenMessages.slice(0, excess);

            toPurge.forEach(el => {
                if (!chatContainerRef && el.parentNode) chatContainerRef = el.parentNode;
                el.remove();
                detachedMessages.push(el);
            });

            hiddenMessages = hiddenMessages.slice(excess);
        }
        updateRestoreBtnLabel();
    }

    const debouncedOptimizeDOM = debounce(optimizeDOM, 200);

    function restoreMessages() {
        const totalAvailable = hiddenMessages.length + detachedMessages.length;
        if (totalAvailable === 0) {
            alert("Tout l'historique disponible est déjà affiché !");
            return;
        }

        const count = Math.min(RESTORE_COUNT, totalAvailable);
        MAX_VISIBLE += count;

        const currentDomCount = getMessages().length;
        const neededFromDetached = MAX_VISIBLE - currentDomCount;

        if (neededFromDetached > 0 && detachedMessages.length > 0) {
            const actualToReattach = Math.min(neededFromDetached, detachedMessages.length);
            const toReattach = detachedMessages.splice(-actualToReattach);
            const referenceNode = getMessages()[0];

            if (referenceNode && referenceNode.parentNode) {
                toReattach.forEach(el => referenceNode.parentNode.insertBefore(el, referenceNode));
            } else if (chatContainerRef) {
                toReattach.forEach(el => chatContainerRef.appendChild(el));
            }
        }

        optimizeDOM();
    }

    function cleanAgain() {
        MAX_VISIBLE = BASE_MAX_VISIBLE;
        optimizeDOM();
    }

    // ==============================
    // 👀 OBSERVERS & COLLAPSE
    // ==============================

    const observer = new MutationObserver((mutations) => {
        let shouldOptimize = false;
        for (let m of mutations) {
            if (m.addedNodes.length > 0) { shouldOptimize = true; break; }
        }
        if (shouldOptimize) debouncedOptimizeDOM();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(optimizeDOM, 2000);

    let autoMode = true;
    function collapseAll() {
        const openBtns = document.querySelectorAll('ms-code-block button[data-test-id="expand-icon-button"] span');
        let c = 0;
        openBtns.forEach(span => {
            if (span.textContent.trim() === 'expand_less') {
                const b = span.closest('button');
                if (b) { b.click(); c++; }
            }
        });
        return c;
    }
    function stopAutoMode() { autoMode = false; collapseObserver.disconnect(); }

    const collapseObserver = new MutationObserver(() => {
        if (!autoMode) return;
        if (collapseAll() === 0) stopAutoMode();
    });
    collapseObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { if (collapseAll() === 0) stopAutoMode(); }, 1200);

    // ==============================
    // 🎨 UI & PANEL (REFONTE)
    // ==============================

    const btnContainer = document.createElement('div');
    Object.assign(btnContainer.style, {
        position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '12px', zIndex: 99999
    });

    const baseBtnStyle = {
        padding: '10px 18px',
        background: '#333', color: '#fff', border: 'none', borderRadius: '8px',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '15px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s, transform 0.1s'
    };

    const collapseBtn = document.createElement('button');
    collapseBtn.innerText = '▼';
    collapseBtn.title = "Fermer les codes";
    Object.assign(collapseBtn.style, baseBtnStyle);

    collapseBtn.onclick = () => { autoMode = false; collapseAll(); };

    const optimizerBtn = document.createElement('button');
    optimizerBtn.innerText = '\u00A0🚀\u00A0';
    Object.assign(optimizerBtn.style, baseBtnStyle);

    [collapseBtn, optimizerBtn].forEach(btn => {
        btn.onmouseover = () => btn.style.background = '#444';
        btn.onmouseout = () => btn.style.background = '#333';
        btn.onmousedown = () => btn.style.transform = 'scale(0.95)';
        btn.onmouseup = () => btn.style.transform = 'scale(1)';
    });

    btnContainer.appendChild(collapseBtn);
    btnContainer.appendChild(optimizerBtn);

    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
        background: '#2b2b2b', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '13px',
        display: 'none', flexDirection: 'column', gap: '10px', minWidth: '240px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    });

    function createRow(text, el) {
        const r = document.createElement('div'); r.style.display = 'flex'; r.style.justifyContent = 'space-between'; r.style.alignItems = 'center';
        const l = document.createElement('span'); l.innerText = text; r.appendChild(l); r.appendChild(el); return r;
    }

    const inputStyle = { width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid #555', background: '#1e1e1e', color: '#fff', textAlign: 'center' };

    const maxInput = document.createElement('input'); maxInput.type = 'number'; maxInput.value = BASE_MAX_VISIBLE; Object.assign(maxInput.style, inputStyle);
    maxInput.onchange = () => { BASE_MAX_VISIBLE = parseInt(maxInput.value) || 35; MAX_VISIBLE = BASE_MAX_VISIBLE; saveConfig(); debouncedOptimizeDOM(); };

    const restoreInput = document.createElement('input'); restoreInput.type = 'number'; restoreInput.value = RESTORE_COUNT; Object.assign(restoreInput.style, inputStyle);
    restoreInput.onchange = () => { RESTORE_COUNT = parseInt(restoreInput.value) || 10; saveConfig(); };

    const cacheInput = document.createElement('input'); cacheInput.type = 'number'; cacheInput.value = MAX_CACHE; Object.assign(cacheInput.style, inputStyle);
    cacheInput.onchange = () => { MAX_CACHE = parseInt(cacheInput.value) || 50; saveConfig(); debouncedOptimizeDOM(); };

    function makeBtn(txt, act, color = '#3c3c3c') {
        const b = document.createElement('button'); b.innerText = txt;
        Object.assign(b.style, { background: color, color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', width: '100%', marginTop: '4px', fontWeight: 'bold' });
        b.onclick = act;
        b.onmouseover = () => b.style.opacity = '0.8';
        b.onmouseout = () => b.style.opacity = '1';
        return b;
    }

    let restoreBtn;

    const toggleBtn = makeBtn(enabled ? '⚡ Optimizer ON' : '⛔ Optimizer OFF', () => {
        enabled = !enabled;
        toggleBtn.innerText = enabled ? '⚡ Optimizer ON' : '⛔ Optimizer OFF';
        toggleBtn.style.background = enabled ? '#3c3c3c' : '#8b0000';
        saveConfig();

        if (enabled) {
            debouncedOptimizeDOM();
        } else {
            // RESTAURATION COMPLÈTE (comme si le script n'existait pas)
            const currentMessages = getMessages();
            const referenceNode = currentMessages.length > 0 ? currentMessages[0] : null;
            const container = referenceNode ? referenceNode.parentNode : chatContainerRef;

            // 1. Réinsérer les éléments retirés du DOM à leur bonne place et dans le bon ordre
            if (detachedMessages.length > 0 && container) {
                detachedMessages.forEach(el => {
                    if (referenceNode) {
                        container.insertBefore(el, referenceNode); // Insère avant le 1er visible actuel
                    } else {
                        container.appendChild(el);
                    }
                });
                detachedMessages = [];
            }

            // 2. Réafficher tous les messages qui étaient juste masqués
            getMessages().forEach(el => {
                if (el.style.display === 'none') el.style.display = '';
            });

            // 3. Réinitialiser la mémoire
            hiddenMessages = [];
            updateRestoreBtnLabel();
        }
    }, enabled ? '#3c3c3c' : '#8b0000');

    restoreBtn = makeBtn('⬆ Restore', restoreMessages, '#0056b3');
    const cleanBtn = makeBtn('⬇ Clean', cleanAgain, '#d35400');

    panel.appendChild(createRow('Max visible', maxInput));
    panel.appendChild(createRow('Restore count', restoreInput));
    panel.appendChild(createRow('Cache size', cacheInput));

    const divider = document.createElement('hr');
    divider.style.borderColor = '#444'; divider.style.margin = '4px 0';
    panel.appendChild(divider);

    panel.appendChild(toggleBtn); panel.appendChild(restoreBtn); panel.appendChild(cleanBtn);

    optimizerBtn.onclick = () => panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    document.addEventListener('click', (e) => { if (!panel.contains(e.target) && !btnContainer.contains(e.target)) panel.style.display = 'none'; });

    function waitForBody() {
        if (!document.body) { requestAnimationFrame(waitForBody); return; }
        document.body.appendChild(btnContainer);
        document.body.appendChild(panel);
    }
    waitForBody();
})();
