// ==UserScript==
// @name         Google AI Studio - Ultimate Optimizer UI
// @namespace    http://tampermonkey.net/
// @version      5.17
// @description  Reduce lag + Collapse code + Restore + Power-User Export (JSON/MD)
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
    
    // Options d'export
    let expIncludeThoughts = false;
    let expIncludeSystem = true;
    let expRemoveEmojis = false;
    let expFormat = 'md'; // 'md' ou 'json'

    function loadConfig() {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                BASE_MAX_VISIBLE = parsed.BASE_MAX_VISIBLE ?? 35;
                MAX_CACHE = parsed.MAX_CACHE ?? 50;
                RESTORE_COUNT = parsed.RESTORE_COUNT ?? 10;
                enabled = parsed.enabled ?? true;
                
                expIncludeThoughts = parsed.expIncludeThoughts ?? false;
                expIncludeSystem = parsed.expIncludeSystem ?? true;
                expRemoveEmojis = parsed.expRemoveEmojis ?? false;
                expFormat = parsed.expFormat ?? 'md';
            }
        } catch (e) {}
        MAX_VISIBLE = BASE_MAX_VISIBLE;
    }

    function saveConfig() {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify({
                BASE_MAX_VISIBLE, MAX_CACHE, RESTORE_COUNT, enabled,
                expIncludeThoughts, expIncludeSystem, expRemoveEmojis, expFormat
            }));
        } catch (e) {}
    }

    loadConfig();

    // ==============================
    // 🧠 GESTION MÉMOIRE & CACHE
    // ==============================

    let hiddenMessages = [];
    let detachedMessages = []; 
    let chatContainerRef = null;
    const exportedTurns = new Map();

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
            restoreBtn.innerText = '⬆ Restore (' + total + ' dispo)';
        }
    }

    function updateCollectedTurns() {
        const turns = document.querySelectorAll('ms-chat-turn');
        
        for (let i = 0; i < turns.length; i++) {
            const turn = turns[i];
            const turnId = turn.id;
            if (!turnId) continue;

            const contentRoot = turn.querySelector('ms-prompt-chunk, .text-chunk, ms-text-chunk');
            if (!contentRoot) continue; 

            const rawText = contentRoot.textContent;
            if (!rawText || !rawText.trim()) continue; 

            let role = 'Unknown';
            if (turn.querySelector('[data-turn-role="User"], .user, .user-prompt-container')) role = 'User';
            else if (turn.querySelector('[data-turn-role="Model"], .model, .model-prompt-container')) role = 'Gemini';

            const signature = rawText.length + '-' + role;
            const existing = exportedTurns.get(turnId);
            if (existing && existing.signature === signature) continue; 

            let thoughtsText = '';
            const thoughtNode = turn.querySelector('ms-thought-chunk');
            if (thoughtNode) {
                const body = thoughtNode.querySelector('.mat-expansion-panel-body, ms-text-chunk');
                if (body) thoughtsText = htmlToMarkdown(body).replace(/\n{3,}/g, '\n\n').trim();
            }

            let text = htmlToMarkdown(contentRoot).replace(/\n{3,}/g, '\n\n').trim();
            if (!text && !thoughtsText) continue;

            exportedTurns.set(turnId, { role, thoughts: thoughtsText, markdown: text, signature });
        }
    }

    const debouncedCapture = debounce(updateCollectedTurns, 100);

    function restoreFullDOM() {
        const currentMessages = getMessages();
        const referenceNode = currentMessages.length > 0 ? currentMessages[0] : null;
        const container = referenceNode ? referenceNode.parentNode : chatContainerRef;

        if (detachedMessages.length > 0 && container) {
            detachedMessages.forEach(el => {
                if (referenceNode) container.insertBefore(el, referenceNode);
                else container.appendChild(el);
            });
            detachedMessages = [];
        }
        getMessages().forEach(el => el.style.display = '');
        hiddenMessages = [];
        updateRestoreBtnLabel();
    }

    function optimizeDOM() {
        if (!enabled) return;

        const messages = getMessages();
        
        if (messages.length <= MAX_VISIBLE) {
            messages.forEach(el => { if (el.style.display === 'none') el.style.display = ''; });
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
            alert("Tout l'historique disponible est déjà affiché !"); return;
        }

        const count = Math.min(RESTORE_COUNT, totalAvailable);
        MAX_VISIBLE += count; 

        const neededFromDetached = MAX_VISIBLE - getMessages().length;
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
        if (!enabled) {
            enabled = true;
            if (typeof toggleBtn !== 'undefined' && toggleBtn) {
                toggleBtn.innerText = '⚡ Optimizer ON';
                toggleBtn.style.background = '#3c3c3c';
            }
            saveConfig();
        }
        MAX_VISIBLE = BASE_MAX_VISIBLE;
        optimizeDOM();
    }

    // ==============================
    // 📥 PARSER MARKDOWN & CHAT DATA
    // ==============================

    function getConversationTitle() {
        const titleEl = document.querySelector('.page-title h1, h1.mode-title');
        return titleEl ? titleEl.textContent.trim() : 'Google_AI_Studio_Export';
    }

    // NOUVELLE FONCTION ULTRA-ROBUSTE DE CAPTURE DU SYSTEM PROMPT (DÉTECTÉ ET CORRIGÉ)
    function getSystemInstructions() {
        if (!expIncludeSystem) return '';
        const panel = document.querySelector('ms-system-instructions-panel');
        if (!panel) return '';
        
        // Cas A : Panneau d'édition ouvert
        const textarea = panel.querySelector('textarea');
        if (textarea) return textarea.value.trim();

        // Cas B : Panneau d'édition fermé (Lecture directe de la prévisualisation Angular dans "subtitle")
        const subtitleEl = panel.querySelector('.subtitle');
        if (subtitleEl) {
            const text = subtitleEl.textContent.trim();
            const defaultPlaceholder = "Optional tone and style instructions for the model";
            // On ignore le texte d'aide par défaut de Google si l'utilisateur n'a rien écrit
            if (text && text.toLowerCase() !== defaultPlaceholder.toLowerCase()) {
                return text;
            }
        }
        return '';
    }

    function htmlToMarkdown(node) {
        if (!node) return '';
        if (node.nodeType === 3) return node.nodeValue;
        if (node.nodeType !== 1) return '';

        const tagName = node.tagName.toLowerCase();
        if (tagName === 'ms-thought-chunk') return '';
        if (tagName === 'ms-code-block') {
            const lang = node.getAttribute('data-test-language') || '';
            const code = node.querySelector('pre code')?.textContent || '';
            return '\n\n```' + lang + '\n' + code + '\n```\n\n';
        }

        let childrenMarkdown = '';
        node.childNodes.forEach(child => childrenMarkdown += htmlToMarkdown(child));

        switch (tagName) {
            case 'p': return '\n\n' + childrenMarkdown.trim() + '\n\n';
            case 'strong': case 'b': return '**' + childrenMarkdown + '**';
            case 'em': case 'i': return '*' + childrenMarkdown + '*';
            case 'a':
                let cleanHref = node.getAttribute('href') || '';
                if (cleanHref.startsWith('https://www.google.com/url?sa=')) {
                    try { cleanHref = new URL(cleanHref).searchParams.get('q') || cleanHref; } catch(e) {}
                }
                return '[' + childrenMarkdown + '](' + cleanHref + ')';
            case 'ul': case 'ol': return '\n' + childrenMarkdown + '\n';
            case 'li':
                const listAncestor = node.closest('ul, ol');
                if (listAncestor && listAncestor.tagName.toLowerCase() === 'ol') {
                    const index = Array.from(listAncestor.querySelectorAll('li')).indexOf(node) + 1;
                    return index + '. ' + childrenMarkdown.trim() + '\n';
                }
                return '* ' + childrenMarkdown.trim() + '\n';
            case 'h1': return '\n\n# ' + childrenMarkdown.trim() + '\n\n';
            case 'h2': return '\n\n## ' + childrenMarkdown.trim() + '\n\n';
            case 'h3': return '\n\n### ' + childrenMarkdown.trim() + '\n\n';
            case 'h4': case 'h5': case 'h6': return '\n\n#### ' + childrenMarkdown.trim() + '\n\n';
            case 'br': return '\n';
            default: return childrenMarkdown; 
        }
    }

    // Filtrage des Emojis avec protection absolue des blocs de code
    function stripEmojisSafe(text) {
        if (!text) return text;
        const regex = /(```[\s\S]*?```|`[\s\S]*?`)|([\p{Emoji_Presentation}\p{Extended_Pictographic}])/gu;
        
        return text.replace(regex, (match, codeBlock, emoji) => {
            if (codeBlock) return codeBlock;
            if (emoji) return '';
            return match;
        });
    }

    // ==============================
    // ⚙️ GÉNÉRATEUR FINAL (JSON ou MD)
    // ==============================
    function generateExportFile(orderedIds) {
        let title = getConversationTitle();
        let systemInstructions = getSystemInstructions();
        const date = new Date().toISOString().split('T')[0];
        
        if (expRemoveEmojis) {
            title = stripEmojisSafe(title);
            systemInstructions = stripEmojisSafe(systemInstructions);
        }
        
        let fileContent = "";
        let fileExt = "";
        let mimeType = "";

        if (expFormat === 'json') {
            const jsonOutput = {
                title: title,
                date: date,
                system_instructions: systemInstructions || undefined,
                history: []
            };

            orderedIds.forEach(turnId => {
                const data = exportedTurns.get(turnId);
                if (data && (data.markdown || (expIncludeThoughts && data.thoughts))) {
                    const messageObj = { role: data.role.toLowerCase() };
                    
                    let thoughts = data.thoughts;
                    let content = data.markdown;
                    
                    if (expRemoveEmojis) {
                        thoughts = stripEmojisSafe(thoughts);
                        content = stripEmojisSafe(content);
                    }

                    if (expIncludeThoughts && thoughts) messageObj.thoughts = thoughts;
                    if (content) messageObj.content = content;
                    
                    jsonOutput.history.push(messageObj);
                }
            });

            fileContent = JSON.stringify(jsonOutput, null, 2);
            fileExt = "json";
            mimeType = "application/json";

        } else {
            fileContent = '---\nTitle: ' + title + '\nDate: ' + date + '\n';
            if (systemInstructions) {
                fileContent += 'System Instructions: |\n  ' + systemInstructions.replace(/\n/g, '\n  ') + '\n';
            }
            fileContent += '---\n\n# Conversation History\n\n';

            const iconUser = expRemoveEmojis ? "" : "👤 ";
            const iconBot = expRemoveEmojis ? "" : "🤖 ";
            const iconThought = expRemoveEmojis ? "Gemini's Thoughts" : "💭 Gemini's Thoughts";

            orderedIds.forEach(turnId => {
                const data = exportedTurns.get(turnId);
                if (data) {
                    let text = data.markdown;
                    let thoughts = data.thoughts;

                    if (expRemoveEmojis) {
                        text = stripEmojisSafe(text);
                        thoughts = stripEmojisSafe(thoughts);
                    }

                    if (expIncludeThoughts && thoughts) {
                        const formattedThoughts = '<details>\n<summary>' + iconThought + '</summary>\n\n' + thoughts + '\n\n</details>';
                        text = formattedThoughts + '\n\n' + text;
                    }

                    if (text) {
                        if (data.role === 'User') fileContent += '### ' + iconUser + 'User\n' + text + '\n\n';
                        else if (data.role === 'Gemini') fileContent += '### ' + iconBot + 'Gemini\n' + text + '\n\n';
                        else fileContent += text + '\n\n';
                    }
                }
            });

            fileExt = "md";
            mimeType = "text/markdown";
        }

        const blob = new Blob([fileContent], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '').substring(0, 15);

        a.href = url;
        a.download = safeTitle + '_' + timestamp + '.' + fileExt;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==============================
    // 🔍 SCANNER HAUTE VITESSE 
    // ==============================
    async function performAutoScrollExport() {
        const btn = document.getElementById('modal-start-export-btn');
        if (!btn) return;
        
        const originalText = btn.innerText;
        btn.disabled = true;

        try {
            let scrollEl = document.documentElement;
            const chatTurn = document.querySelector('ms-chat-turn');
            if (chatTurn) {
                let parent = chatTurn.parentElement;
                while (parent && parent !== document.body) {
                    const style = window.getComputedStyle(parent);
                    if (style.overflowY === 'auto' || style.overflowY === 'scroll') { scrollEl = parent; break; }
                    parent = parent.parentElement;
                }
            }

            const wasEnabled = enabled;
            const originalScrollPos = scrollEl.scrollTop;

            enabled = false;
            restoreFullDOM();
            
            btn.innerText = '⏳ Initializing...';
            
            let lastUp = -1;
            while(scrollEl.scrollTop > 0 && scrollEl.scrollTop !== lastUp) {
                lastUp = scrollEl.scrollTop;
                scrollEl.scrollTop -= 2000;
                await new Promise(r => setTimeout(r, 50)); 
            }
            scrollEl.scrollTop = 0;
            
            await new Promise(r => setTimeout(r, 500)); 

            const perfectChronologicalIds = [];
            let maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
            let lastScroll = -1;
            let dots = 0;
            
            const scrollStep = Math.max(500, scrollEl.clientHeight * 0.85);
            
            while (scrollEl.scrollTop <= maxScroll) {
                
                collapseAll();

                maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
                
                dots = (dots + 1) % 4;
                btn.innerText = '⏳ Scanning' + '.'.repeat(dots);

                const currentTurns = document.querySelectorAll('ms-chat-turn');
                currentTurns.forEach(turn => {
                    const turnId = turn.id;
                    if (!turnId) return;

                    if (!perfectChronologicalIds.includes(turnId)) {
                        perfectChronologicalIds.push(turnId);
                    }

                    const contentRoot = turn.querySelector('ms-prompt-chunk, .text-chunk, ms-text-chunk');
                    if (!contentRoot) return; 

                    const rawText = contentRoot.textContent;
                    if (!rawText || !rawText.trim()) return; 

                    let role = 'Unknown';
                    if (turn.querySelector('[data-turn-role="User"], .user, .user-prompt-container')) role = 'User';
                    else if (turn.querySelector('[data-turn-role="Model"], .model, .model-prompt-container')) role = 'Gemini';

                    const signature = rawText.length + '-' + role;
                    const existing = exportedTurns.get(turnId);
                    if (existing && existing.signature === signature) return; 

                    let thoughtsText = '';
                    const thoughtNode = turn.querySelector('ms-thought-chunk');
                    if (thoughtNode) {
                        const body = thoughtNode.querySelector('.mat-expansion-panel-body, ms-text-chunk');
                        if (body) thoughtsText = htmlToMarkdown(body).replace(/\n{3,}/g, '\n\n').trim();
                    }

                    let text = htmlToMarkdown(contentRoot).replace(/\n{3,}/g, '\n\n').trim();
                    if (!text && !thoughtsText) return;

                    exportedTurns.set(turnId, { role, thoughts: thoughtsText, markdown: text, signature });
                });

                if (scrollEl.scrollTop === lastScroll && scrollEl.scrollTop > 0) {
                    await new Promise(r => setTimeout(r, 300)); 
                    maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
                    if (scrollEl.scrollTop >= maxScroll) break;
                }

                lastScroll = scrollEl.scrollTop;
                scrollEl.scrollTop += scrollStep; 
                await new Promise(r => setTimeout(r, 150)); 
            }

            generateExportFile(perfectChronologicalIds);

            scrollEl.scrollTop = originalScrollPos;
            if (wasEnabled) {
                enabled = true;
                optimizeDOM();
            }
            
            closeExportModal();

        } catch (e) {
            console.error("[Optimizer] Scan Error:", e);
            alert("Erreur lors de l'analyse de la conversation.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }

    // ==============================
    // 👀 OBSERVERS & COLLAPSE
    // ==============================

    const observer = new MutationObserver((mutations) => {
        let shouldOptimize = false;
        let shouldCapture = false;
        for (let m of mutations) {
            if (m.addedNodes.length > 0 || m.type === 'characterData' || m.type === 'childList') { 
                shouldCapture = true;
                if (m.addedNodes.length > 0) shouldOptimize = true;
            }
        }
        if (shouldCapture) debouncedCapture();
        if (shouldOptimize) debouncedOptimizeDOM();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => { updateCollectedTurns(); optimizeDOM(); }, 2000);

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
    // 🎨 UI & MODALS
    // ==============================

    const btnContainer = document.createElement('div');
    Object.assign(btnContainer.style, {
        position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '12px', zIndex: 99999
    });

    const baseBtnStyle = {
        padding: '10px 18px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontSize: '15px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, transform 0.1s'
    };

    const collapseBtn = document.createElement('button');
    collapseBtn.innerText = '▼'; collapseBtn.title = "Fermer les codes";
    Object.assign(collapseBtn.style, baseBtnStyle);
    collapseBtn.onclick = () => { autoMode = false; collapseAll(); };

    const optimizerBtn = document.createElement('button');
    // ✅ CORRECTIF DE L'ÉCHAPPEMENT UNICODE : UN SEUL ANTI-SLASH SÉCURISÉ
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

    // MAIN PANEL
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
        if (enabled) debouncedOptimizeDOM(); else restoreFullDOM();
    }, enabled ? '#3c3c3c' : '#8b0000');

    restoreBtn = makeBtn('⬆ Restore', restoreMessages, '#0056b3');
    const cleanBtn = makeBtn('⬇ Reset to Max Visible', cleanAgain, '#d35400');
    
    const openExportModalBtn = makeBtn('⚙️ Export Options...', () => {
        panel.style.display = 'none';
        exportModalOverlay.style.display = 'flex';
    }, '#2e7d32'); 

    panel.appendChild(createRow('Max visible', maxInput));
    panel.appendChild(createRow('Restore count', restoreInput));
    panel.appendChild(createRow('Cache size', cacheInput));

    const divider = document.createElement('hr');
    divider.style.borderColor = '#444'; divider.style.margin = '4px 0';
    panel.appendChild(divider);

    panel.appendChild(toggleBtn); 
    panel.appendChild(restoreBtn); 
    panel.appendChild(cleanBtn);
    panel.appendChild(openExportModalBtn);

    optimizerBtn.onclick = () => {
        if(exportModalOverlay.style.display === 'flex') { exportModalOverlay.style.display = 'none'; return; }
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    };

    // ==============================
    // 🪟 EXPORT MODAL (POWER USER)
    // ==============================
    const exportModalOverlay = document.createElement('div');
    Object.assign(exportModalOverlay.style, {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.6)', zIndex: 100000, display: 'none',
        alignItems: 'center', justifyContent: 'center'
    });

    const exportModal = document.createElement('div');
    Object.assign(exportModal.style, {
        background: '#2b2b2b', padding: '24px', borderRadius: '12px', color: '#fff', fontSize: '14px',
        display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '400px', boxShadow: '0 12px 40px rgba(0,0,0,0.8)'
    });

    const modalTitle = document.createElement('h3');
    modalTitle.innerText = "Export Options";
    modalTitle.style.margin = "0 0 10px 0";
    modalTitle.style.textAlign = "center";
    exportModal.appendChild(modalTitle);

    const formatSelect = document.createElement('select');
    Object.assign(formatSelect.style, inputStyle, { width: '140px', cursor: 'pointer' });
    ['Markdown (.md)', 'JSON (.json)'].forEach((text, i) => {
        const opt = document.createElement('option');
        opt.value = i === 0 ? 'md' : 'json';
        opt.innerText = text;
        if(opt.value === expFormat) opt.selected = true;
        formatSelect.appendChild(opt);
    });
    formatSelect.onchange = () => { expFormat = formatSelect.value; saveConfig(); };

    function createCheckboxRow(text, isChecked, onChange) {
        const row = document.createElement('label');
        row.style.display = 'flex'; row.style.justifyContent = 'space-between'; row.style.alignItems = 'center'; row.style.cursor = 'pointer';
        const span = document.createElement('span'); span.innerText = text;
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = isChecked;
        cb.style.accentColor = '#2e7d32'; cb.style.cursor = 'pointer';
        cb.onchange = (e) => onChange(e.target.checked);
        row.appendChild(span); row.appendChild(cb);
        return row;
    }

    const rowThoughts = createCheckboxRow("Include Gemini's Thoughts", expIncludeThoughts, (val) => { expIncludeThoughts = val; saveConfig(); });
    const rowSystem = createCheckboxRow("Include System Prompt", expIncludeSystem, (val) => { expIncludeSystem = val; saveConfig(); });
    const rowEmojis = createCheckboxRow("Remove Emojis (Strict Mode)", expRemoveEmojis, (val) => { expRemoveEmojis = val; saveConfig(); });

    exportModal.appendChild(createRow('File Format', formatSelect));
    exportModal.appendChild(rowThoughts);
    exportModal.appendChild(rowSystem);
    exportModal.appendChild(rowEmojis);

    const modalBtnContainer = document.createElement('div');
    modalBtnContainer.style.display = 'flex'; modalBtnContainer.style.gap = '10px'; modalBtnContainer.style.marginTop = '10px';

    function closeExportModal() { exportModalOverlay.style.display = 'none'; }

    const cancelBtn = makeBtn('Cancel', closeExportModal, '#555');
    const startExportBtn = makeBtn('🚀 Start Auto-Scan', performAutoScrollExport, '#2e7d32');
    startExportBtn.id = 'modal-start-export-btn';

    modalBtnContainer.appendChild(cancelBtn);
    modalBtnContainer.appendChild(startExportBtn);
    exportModal.appendChild(modalBtnContainer);
    exportModalOverlay.appendChild(exportModal);

    document.addEventListener('click', (e) => { 
        if (!panel.contains(e.target) && !btnContainer.contains(e.target) && e.target !== exportModalOverlay) panel.style.display = 'none'; 
        if (e.target === exportModalOverlay) closeExportModal();
    });

    function waitForBody() {
        if (!document.body) { requestAnimationFrame(waitForBody); return; }
        document.body.appendChild(btnContainer);
        document.body.appendChild(panel);
        document.body.appendChild(exportModalOverlay);
    }
    waitForBody();
})();
