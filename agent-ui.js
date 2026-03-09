// Browser-based AI research agent
// Calls any OpenAI-compatible chat completions endpoint directly from the browser
// Works with: OpenAI, OpenRouter (Claude, Llama, Mistral, etc.), Ollama, or any compatible API

const AgentUI = (() => {
    const SYSTEM_PROMPT = `You are a research agent for Doughnut Economics city portraits. Find real, sourced data for a specific dimension.

California Doughnut reference targets:
SOCIAL: Food <10% insecurity, Health 0% uninsured, Education 95%+ grad rate, Income <10% poverty, Housing <30% cost-burdened, Water 100% compliance, Energy 100% clean/<6% burden, Equity Gini<0.30, Peace <300 violent/100K, Voice >75% turnout, Gender 1:1 pay, Networks universal broadband.
ECOLOGICAL: Climate <2.5 MT CO2e/person by 2030, Air PM2.5 <5 ug/m3, Biodiversity 30% land protected, Freshwater sustainable yield.

Return JSON: { name, level (-100 to 150 or null), indicator, value, year, target, context, source, sourceUrl, confidence ("high"/"medium"/"low"), actions [3-5 items] }
Only use real verifiable data. Include direct source URLs. Return ONLY valid JSON.`;

    const PRESETS = {
        openai:     { url: 'https://api.openai.com/v1',     model: 'gpt-4o',            label: 'OpenAI',     hint: 'Requires OpenAI API key (sk-...)', noJsonMode: false },
        openrouter: { url: 'https://openrouter.ai/api/v1',  model: 'anthropic/claude-sonnet-4-20250514', label: 'OpenRouter', hint: 'Access Claude, Llama, Mistral & more (openrouter.ai)', noJsonMode: true },
        ollama:     { url: 'http://localhost:11434/v1',      model: 'llama3',            label: 'Ollama',     hint: 'Free local models — no API key needed', noJsonMode: true },
    };

    function getConfig() {
        return {
            apiKey: localStorage.getItem('agent_api_key') || '',
            baseURL: localStorage.getItem('agent_base_url') || '',
            model: localStorage.getItem('agent_model') || '',
            noJsonMode: localStorage.getItem('agent_no_json_mode') === 'true',
        };
    }

    function saveConfig(apiKey, baseURL, model, noJsonMode) {
        localStorage.setItem('agent_api_key', apiKey);
        localStorage.setItem('agent_base_url', baseURL);
        localStorage.setItem('agent_model', model);
        localStorage.setItem('agent_no_json_mode', noJsonMode ? 'true' : 'false');
    }

    function clearConfig() {
        localStorage.removeItem('agent_api_key');
        localStorage.removeItem('agent_base_url');
        localStorage.removeItem('agent_model');
        localStorage.removeItem('agent_no_json_mode');
    }

    function isConfigured() {
        const c = getConfig();
        return !!(c.baseURL && c.model);
    }

    function showSettings() {
        hideSettings();
        const isDark = document.documentElement.classList.contains('dark');
        const bg = isDark ? '#151926' : '#fff';
        const fg = isDark ? '#e5e7eb' : '#111';
        const muted = isDark ? '#6b7280' : '#888';
        const inputBg = isDark ? '#0c0f1a' : '#f9fafb';
        const border = isDark ? '#1e2235' : '#e5e7eb';
        const accent = isDark ? '#34d399' : '#059669';

        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'agentSettingsBackdrop';
        Object.assign(backdrop.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: '10000',
        });
        backdrop.addEventListener('click', hideSettings);
        document.body.appendChild(backdrop);

        // Modal
        const modal = document.createElement('div');
        modal.id = 'agentSettingsModal';
        Object.assign(modal.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: bg, color: fg, borderRadius: '16px', padding: '24px',
            width: '420px', maxWidth: '92vw', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            zIndex: '10001', fontFamily: 'Inter,system-ui,sans-serif',
            border: `1px solid ${border}`,
        });
        modal.addEventListener('click', e => e.stopPropagation());
        document.body.appendChild(modal);

        const c = getConfig();
        let selectedNoJsonMode = c.noJsonMode;

        // Title
        const title = el('h3', 'Connect AI Provider', { fontSize: '1.1rem', margin: '0 0 2px 0', fontWeight: '700' });
        const subtitle = el('p', 'Works with any OpenAI-compatible chat completions API. Your key stays in your browser.', {
            fontSize: '0.78rem', color: muted, margin: '0 0 16px 0', lineHeight: '1.4',
        });

        // Presets
        const presetLabel = el('div', 'Quick Setup', {
            fontSize: '0.7rem', fontWeight: '600', color: muted,
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px',
        });
        const presetRow = document.createElement('div');
        Object.assign(presetRow.style, { display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' });

        for (const [key, preset] of Object.entries(PRESETS)) {
            const btn = document.createElement('button');
            btn.textContent = preset.label;
            Object.assign(btn.style, {
                padding: '6px 14px', borderRadius: '8px', border: `1px solid ${border}`,
                background: inputBg, color: fg, fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
            });
            btn.addEventListener('click', () => {
                urlInput.querySelector('input').value = preset.url;
                modelInput.querySelector('input').value = preset.model;
                selectedNoJsonMode = preset.noJsonMode;
                hintEl.textContent = preset.hint;
                hintEl.style.color = accent;
                if (key === 'ollama') {
                    keyInput.querySelector('input').value = 'ollama';
                } else {
                    keyInput.querySelector('input').value = '';
                    keyInput.querySelector('input').focus();
                }
            });
            presetRow.appendChild(btn);
        }

        // Hint
        const hintEl = el('div', c.baseURL ? '' : 'Select a provider above or enter a custom endpoint', {
            fontSize: '0.72rem', color: accent, marginBottom: '8px', minHeight: '16px',
        });

        // Inputs
        const urlInput = makeInput('Endpoint URL', c.baseURL, 'https://api.openai.com/v1', inputBg, border, fg);
        const keyInput = makeInput('API Key', c.apiKey, 'sk-... (paste your key here)', inputBg, border, fg);
        const modelInput = makeInput('Model', c.model, 'gpt-4o', inputBg, border, fg);

        // Buttons
        const btnRow = document.createElement('div');
        Object.assign(btnRow.style, { display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '8px' });

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        Object.assign(clearBtn.style, {
            padding: '8px 14px', borderRadius: '8px', border: 'none',
            background: 'transparent', color: '#ef4444', fontSize: '0.78rem', fontWeight: '500', cursor: 'pointer',
        });
        clearBtn.addEventListener('click', () => {
            clearConfig();
            hideSettings();
            if (typeof AgentChat !== 'undefined') AgentChat.updateConfigBar();
        });

        const rightBtns = document.createElement('div');
        Object.assign(rightBtns.style, { display: 'flex', gap: '8px' });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        Object.assign(cancelBtn.style, {
            padding: '8px 16px', borderRadius: '8px', border: `1px solid ${border}`,
            background: inputBg, color: muted, fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
        });
        cancelBtn.addEventListener('click', hideSettings);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        Object.assign(saveBtn.style, {
            padding: '8px 18px', borderRadius: '8px', border: 'none',
            background: accent, color: '#fff', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
        });
        saveBtn.addEventListener('click', () => {
            const key = keyInput.querySelector('input').value.trim();
            const url = urlInput.querySelector('input').value.trim();
            const mdl = modelInput.querySelector('input').value.trim();
            if (!url || !mdl) {
                hintEl.textContent = 'Endpoint URL and model are required';
                hintEl.style.color = '#ef4444';
                return;
            }
            saveConfig(key, url, mdl, selectedNoJsonMode);
            hideSettings();
            if (typeof AgentChat !== 'undefined') AgentChat.updateConfigBar();
        });

        rightBtns.appendChild(cancelBtn);
        rightBtns.appendChild(saveBtn);
        btnRow.appendChild(clearBtn);
        btnRow.appendChild(rightBtns);

        // Assemble
        modal.appendChild(title);
        modal.appendChild(subtitle);
        modal.appendChild(presetLabel);
        modal.appendChild(presetRow);
        modal.appendChild(hintEl);
        modal.appendChild(urlInput);
        modal.appendChild(keyInput);
        modal.appendChild(modelInput);
        modal.appendChild(btnRow);

        // Focus key if URL is set, otherwise focus nothing (user picks preset first)
        if (c.baseURL) {
            setTimeout(() => keyInput.querySelector('input').focus(), 50);
        }
    }

    function el(tag, text, styles) {
        const e = document.createElement(tag);
        e.textContent = text;
        if (styles) Object.assign(e.style, styles);
        return e;
    }

    function makeInput(label, value, placeholder, inputBg, border, fg) {
        const wrap = document.createElement('div');
        wrap.style.marginBottom = '10px';
        const lbl = el('div', label, {
            fontSize: '0.7rem', fontWeight: '600', color: '#888',
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px',
        });
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.autocomplete = 'off';
        inp.spellcheck = false;
        inp.value = value || '';
        inp.placeholder = placeholder || '';
        Object.assign(inp.style, {
            display: 'block', width: '100%', padding: '8px 12px',
            border: `1px solid ${border}`, borderRadius: '8px',
            fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
            background: inputBg, color: fg,
        });
        inp.addEventListener('focus', () => inp.style.borderColor = '#059669');
        inp.addEventListener('blur', () => inp.style.borderColor = border);
        wrap.appendChild(lbl);
        wrap.appendChild(inp);
        return wrap;
    }

    function hideSettings() {
        const backdrop = document.getElementById('agentSettingsBackdrop');
        const modal = document.getElementById('agentSettingsModal');
        if (backdrop) backdrop.remove();
        if (modal) modal.remove();
    }

    async function researchDimension(city, state, dimName, ring) {
        if (!isConfigured()) { showSettings(); return null; }
        const config = getConfig();

        const prompt = `Research the "${dimName}" dimension for ${city}, ${state}.
This is a ${ring === "social" ? "social foundation" : "ecological ceiling"} dimension.
The "name" field must be exactly: "${dimName}"
Find the best available recent data. Return ONLY valid JSON.`;

        const body = {
            model: config.model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
        };

        // Only use JSON mode for providers that support it
        if (!config.noJsonMode) {
            body.response_format = { type: "json_object" };
        }

        const headers = { 'Content-Type': 'application/json' };
        if (config.apiKey && config.apiKey !== 'ollama') {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }

        const resp = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text()).substring(0, 200)}`);

        let content = (await resp.json()).choices[0].message.content.trim();
        // Strip markdown code fences if present
        if (content.startsWith('```')) content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        return JSON.parse(content);
    }

    async function doResearch(dimName, ring, city, state, btn) {
        if (!isConfigured()) { showSettings(); return; }
        const resultId = 'agentResult_' + dimName.replace(/[^a-z]/g, '_');
        const resultEl = document.getElementById(resultId);
        btn.disabled = true;
        btn.innerHTML = '<span class="agent-spinner"></span> Researching...';
        resultEl.innerHTML = '';
        try {
            const data = await researchDimension(city, state, dimName, ring);
            resultEl.innerHTML = renderResult(data);
            btn.innerHTML = '&#10003; Done';
        } catch (err) {
            resultEl.innerHTML = `<div class="agent-error">${err.message}</div>`;
            btn.innerHTML = 'Retry';
            btn.disabled = false;
        }
    }

    function renderResult(data) {
        if (!data) return '';
        const config = getConfig();
        const conf = (data.confidence || '').toLowerCase();
        const confColor = conf === 'high' ? '#059669' : conf === 'medium' ? '#eab308' : '#ef4444';
        let h = `<div class="agent-result-card">`;
        h += `<div class="agent-result-header">AI Research Result <span style="float:right;color:${confColor}">${conf || '?'} confidence</span></div>`;
        if (data.indicator) h += `<div class="agent-result-field"><strong>${data.value || '\u2014'}</strong> \u2014 ${data.indicator}</div>`;
        if (data.year) h += `<div class="agent-result-field" style="font-size:0.75rem;opacity:0.6">Year: ${data.year}</div>`;
        if (data.target) h += `<div class="agent-result-field" style="color:#7c3aed">Target: ${data.target}</div>`;
        if (data.context) h += `<div class="agent-result-field">${data.context}</div>`;
        if (data.source) {
            h += `<div class="agent-result-field">Source: `;
            h += data.sourceUrl ? `<a href="${data.sourceUrl}" target="_blank" rel="noopener">${data.source}</a>` : data.source;
            h += `</div>`;
        }
        h += `<div style="font-size:0.7rem;opacity:0.5;margin-top:6px;text-align:right;">${config.model}</div>`;
        h += `</div>`;
        return h;
    }

    function renderResearchButton(dimName, ring, city, state) {
        const safeId = dimName.replace(/[^a-z]/g, '_');
        return `<div class="agent-research-section">
            <button class="agent-btn agent-btn-research" onclick="AgentUI.doResearch('${dimName}', '${ring}', '${city}', '${state}', this)">
                <span class="agent-btn-icon">&#9881;</span> Auto-Research
            </button>
            <button class="agent-btn agent-btn-settings" onclick="AgentUI.showSettings()" title="Configure AI">&#9881;</button>
            <div class="agent-research-result" id="agentResult_${safeId}"></div>
        </div>`;
    }

    return { showSettings, hideSettings, doResearch, isConfigured, getConfig, renderResearchButton };
})();
