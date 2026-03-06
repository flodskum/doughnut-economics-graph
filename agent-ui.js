// Browser-based AI research agent
// Calls any OpenAI-compatible API directly from the frontend (no backend needed)

const AgentUI = (() => {
    const SYSTEM_PROMPT = `You are a research agent for Doughnut Economics city portraits. Your job is to find real, sourced data for a specific dimension of a city's doughnut portrait.

The Doughnut Economics framework (Kate Raworth) maps social foundations and ecological ceilings. For reference, here are targets used in the California Doughnut:

SOCIAL FOUNDATION TARGETS (examples):
- Food: <10% food insecurity rate
- Health: Universal coverage (0% uninsured)
- Education: 95%+ graduation rate; equity across demographics
- Income & Work: <10% poverty rate; living wage
- Housing: <30% cost-burdened; functional zero homelessness
- Water: 100% compliance with drinking water standards
- Energy: 100% clean energy; <6% energy burden for all households
- Social Equity: Gini coefficient <0.30; Racial Equity Index = 100
- Peace & Justice: Violent crime below 300/100K
- Political Voice: >75% voter participation
- Gender Equality: 1:1 pay ratio
- Networks: Universal broadband; <30% driving alone

ECOLOGICAL CEILING TARGETS (examples):
- Climate Change: Net zero GHG; <2.5 MT CO2e/person for 2030
- Air Pollution: WHO guideline PM2.5 <5 ug/m3
- Biodiversity: No net species loss; 30% land protected
- Freshwater: Sustainable yield; per-capita use trending down

For the requested dimension, return a JSON object with:
- name: dimension name (exactly as given)
- level: severity from -100 (no problem) to 150 (severe), or null if unknown
- indicator: what metric is being measured
- value: the actual data value with units
- year: year of the data (integer)
- target: goal/threshold to compare against (use the CA Doughnut targets above as reference)
- context: 2-3 sentences of context explaining the number, trends, and comparison to targets
- source: full citation (e.g., "U.S. Census Bureau, ACS 5-Year Estimates, 2023")
- sourceUrl: direct URL to the data source (not just a homepage)
- confidence: "high", "medium", or "low"
- actions: array of 3-5 concrete ways residents can get involved locally

CRITICAL: Only use real, verifiable data from official sources. Include direct source URLs. If you cannot find reliable data, set confidence to "low". Prefer city-level data over county or state. Return ONLY valid JSON.`;

    let config = {
        apiKey: localStorage.getItem('agent_api_key') || '',
        baseURL: localStorage.getItem('agent_base_url') || 'https://integrate.api.nvidia.com/v1',
        model: localStorage.getItem('agent_model') || 'meta/llama-3.1-70b-instruct',
    };

    function saveConfig() {
        localStorage.setItem('agent_api_key', config.apiKey);
        localStorage.setItem('agent_base_url', config.baseURL);
        localStorage.setItem('agent_model', config.model);
    }

    function isConfigured() {
        return config.apiKey && config.baseURL && config.model;
    }

    // Settings modal
    function showSettings() {
        const existing = document.getElementById('agentSettingsModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'agentSettingsModal';
        modal.innerHTML = `
            <div class="agent-modal-backdrop" onclick="AgentUI.hideSettings()"></div>
            <div class="agent-modal">
                <h3>AI Research Agent Settings</h3>
                <p class="agent-modal-desc">Connect to any OpenAI-compatible API to research dimensions with AI. Your key stays in your browser (localStorage).</p>
                <label>API Base URL
                    <input type="url" id="agentBaseURL" value="${config.baseURL}" placeholder="https://api.openai.com/v1">
                </label>
                <label>API Key
                    <input type="password" id="agentApiKey" value="${config.apiKey}" placeholder="sk-... or nvapi-...">
                </label>
                <label>Model
                    <input type="text" id="agentModel" value="${config.model}" placeholder="gpt-4o, meta/llama-3.1-70b-instruct, etc.">
                </label>
                <div class="agent-modal-presets">
                    <span class="agent-preset" onclick="AgentUI.applyPreset('openai')">OpenAI</span>
                    <span class="agent-preset" onclick="AgentUI.applyPreset('nvidia')">NVIDIA</span>
                    <span class="agent-preset" onclick="AgentUI.applyPreset('ollama')">Ollama (local)</span>
                </div>
                <div class="agent-modal-actions">
                    <button class="agent-btn agent-btn-secondary" onclick="AgentUI.hideSettings()">Cancel</button>
                    <button class="agent-btn agent-btn-primary" onclick="AgentUI.saveSettings()">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function hideSettings() {
        const modal = document.getElementById('agentSettingsModal');
        if (modal) modal.remove();
    }

    function saveSettings() {
        config.baseURL = document.getElementById('agentBaseURL').value.trim();
        config.apiKey = document.getElementById('agentApiKey').value.trim();
        config.model = document.getElementById('agentModel').value.trim();
        saveConfig();
        hideSettings();
    }

    function applyPreset(name) {
        const urlEl = document.getElementById('agentBaseURL');
        const modelEl = document.getElementById('agentModel');
        if (name === 'openai') {
            urlEl.value = 'https://api.openai.com/v1';
            modelEl.value = 'gpt-4o';
        } else if (name === 'nvidia') {
            urlEl.value = 'https://integrate.api.nvidia.com/v1';
            modelEl.value = 'meta/llama-3.1-70b-instruct';
        } else if (name === 'ollama') {
            urlEl.value = 'http://localhost:11434/v1';
            modelEl.value = 'llama3';
        }
    }

    // Research a single dimension
    async function researchDimension(city, state, dimName, ring) {
        if (!isConfigured()) {
            showSettings();
            return null;
        }

        const prompt = `Research the "${dimName}" dimension for the city of ${city}, ${state}.
This is a ${ring === "social" ? "social foundation" : "ecological ceiling"} dimension.

Find the best available, most recent data. Return ONLY valid JSON matching the schema described.
The "name" field must be exactly: "${dimName}"`;

        const body = {
            model: config.model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
        };

        // Some providers support response_format, some don't
        if (!config.baseURL.includes('nvidia') && !config.baseURL.includes('ollama')) {
            body.response_format = { type: "json_object" };
        }

        const resp = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`API error ${resp.status}: ${err.substring(0, 200)}`);
        }

        const result = await resp.json();
        let content = result.choices[0].message.content;

        // Strip markdown code blocks if present
        content = content.trim();
        if (content.startsWith('```')) {
            content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        }

        return JSON.parse(content);
    }

    // Render the research button for the detail panel
    function renderResearchButton(dimName, ring, city, state) {
        return `
            <div class="agent-research-section">
                <button class="agent-btn agent-btn-research" onclick="AgentUI.doResearch('${dimName}', '${ring}', '${city}', '${state}', this)">
                    <span class="agent-btn-icon">&#9881;</span> Research with AI
                </button>
                <button class="agent-btn agent-btn-settings" onclick="AgentUI.showSettings()" title="Configure AI provider">
                    &#9881;
                </button>
                <div class="agent-research-result" id="agentResult_${dimName.replace(/[^a-z]/g, '_')}"></div>
            </div>
        `;
    }

    // Execute research and show result
    async function doResearch(dimName, ring, city, state, btn) {
        if (!isConfigured()) {
            showSettings();
            return;
        }

        const resultId = 'agentResult_' + dimName.replace(/[^a-z]/g, '_');
        const resultEl = document.getElementById(resultId);
        btn.disabled = true;
        btn.innerHTML = '<span class="agent-spinner"></span> Researching...';
        resultEl.innerHTML = '';

        try {
            const data = await researchDimension(city, state, dimName, ring);
            resultEl.innerHTML = renderResearchResult(data);
            btn.innerHTML = '<span class="agent-btn-icon">&#10003;</span> Done — see below';
        } catch (err) {
            resultEl.innerHTML = `<div class="agent-error">Error: ${err.message}</div>`;
            btn.innerHTML = '<span class="agent-btn-icon">&#9881;</span> Retry';
            btn.disabled = false;
        }
    }

    function renderResearchResult(data) {
        if (!data) return '';
        let html = '<div class="agent-result-card">';
        html += '<div class="agent-result-header">AI Research Result</div>';
        html += `<div class="agent-result-field"><span class="agent-result-label">Indicator</span> ${data.indicator || '—'}</div>`;
        html += `<div class="agent-result-field"><span class="agent-result-label">Value</span> <strong>${data.value || '—'}</strong></div>`;
        if (data.year) html += `<div class="agent-result-field"><span class="agent-result-label">Year</span> ${data.year}</div>`;
        if (data.target) html += `<div class="agent-result-field"><span class="agent-result-label">Target</span> ${data.target}</div>`;
        if (data.context) html += `<div class="agent-result-field"><span class="agent-result-label">Context</span> ${data.context}</div>`;
        if (data.source) {
            html += `<div class="agent-result-field"><span class="agent-result-label">Source</span> `;
            if (data.sourceUrl) {
                html += `<a href="${data.sourceUrl}" target="_blank" rel="noopener">${data.source}</a>`;
            } else {
                html += data.source;
            }
            html += `</div>`;
        }
        if (data.confidence) {
            const c = data.confidence;
            const color = c === 'high' ? 'var(--accent)' : c === 'medium' ? '#eab308' : '#ef4444';
            html += `<div class="agent-result-field"><span class="agent-result-label">Confidence</span> <span style="color:${color};font-weight:600">${c}</span></div>`;
        }
        if (data.actions && data.actions.length) {
            html += '<div class="agent-result-field"><span class="agent-result-label">Actions</span>';
            html += '<ul class="agent-result-actions">';
            data.actions.forEach(a => html += `<li>${a}</li>`);
            html += '</ul></div>';
        }
        html += `<div class="agent-result-model">Model: ${config.model}</div>`;
        html += '</div>';
        return html;
    }

    return { showSettings, hideSettings, saveSettings, applyPreset, doResearch, renderResearchButton, isConfigured };
})();
