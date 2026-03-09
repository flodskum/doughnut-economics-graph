/*
 * Doughnut Detail Panel Extension
 * Adds click-to-view sourced data for doughnut dimensions.
 * Requires doughnut.js (the base Doughnut class).
 *
 * Usage:
 *   const detail = new DoughnutDetail(myDonut, 'detailPanel');
 *   detail.setData('inner', 'food', { indicator: '...', value: '...', source: '...', sourceUrl: '...' });
 *
 * MIT License - Copyright (c) 2025 Joe Glasskatz
 */

class DoughnutDetail {
    /**
     * @param {Doughnut} donut - A Doughnut instance from doughnut.js
     * @param {string} panelId - ID of the HTML element to render detail into
     * @param {object} [options]
     * @param {function} [options.onSelect] - Custom callback(dimType, dimName, data) on click
     * @param {function} [options.renderHTML] - Custom renderer(data) => HTML string
     */
    constructor(donut, panelId, options = {}) {
        this._donut = donut;
        this._panelId = panelId;
        this._onSelect = options.onSelect || null;
        this._renderHTML = options.renderHTML || DoughnutDetail.defaultRender;
        this._data = {}; // keyed by "type:name"

        // Intercept clicks on the canvas
        const canvas = document.getElementById(donut._canvasId);
        canvas.addEventListener('click', () => {
            setTimeout(() => {
                const dim = donut.getSelectedDimension();
                if (dim) {
                    this._showDetail(dim.type, dim.name);
                } else {
                    this._clearDetail();
                }
            }, 50);
        });
    }

    /**
     * Attach data to a dimension.
     * @param {string} type - "inner" or "outer"
     * @param {string} name - Dimension name (must match what was added to the doughnut)
     * @param {object} data - Arbitrary data object. The default renderer expects:
     *   { indicator, value, year, target, context, source, sourceUrl, level, actions[] }
     */
    setData(type, name, data) {
        this._data[type + ':' + name] = data;
    }

    /**
     * Load a full portrait (as produced by the research agent CLI).
     * @param {object} portrait - { social: [...], ecological: [...] }
     */
    loadPortrait(portrait) {
        if (portrait.social) {
            portrait.social.forEach(dim => {
                this.setData('inner', dim.name, { ...dim, ring: 'social' });
            });
        }
        if (portrait.ecological) {
            portrait.ecological.forEach(dim => {
                this.setData('outer', dim.name, { ...dim, ring: 'ecological' });
            });
        }
    }

    getData(type, name) {
        return this._data[type + ':' + name] || null;
    }

    _showDetail(type, name) {
        const data = this.getData(type, name);
        const panel = document.getElementById(this._panelId);
        if (!panel) return;

        if (this._onSelect) {
            this._onSelect(type, name, data);
            return;
        }

        if (!data) {
            panel.innerHTML = '<p style="padding:1rem;color:#999;">No data available for this dimension.</p>';
            return;
        }

        panel.innerHTML = this._renderHTML(data);
    }

    _clearDetail() {
        const panel = document.getElementById(this._panelId);
        if (panel) {
            panel.innerHTML = '<p style="padding:1rem;color:#999;">Click a dimension to see details.</p>';
        }
    }

    /**
     * Default HTML renderer for a dimension data object.
     * Override by passing options.renderHTML to the constructor.
     */
    static defaultRender(data) {
        let html = '';

        // Status helpers
        const statusLabel = (level) => {
            if (typeof level !== 'number' || isNaN(level)) return 'Unknown';
            if (level <= -100) return 'No problem';
            if (level <= -50) return 'Under control';
            if (level <= 0) return 'On track';
            if (level <= 50) return 'Needs attention';
            if (level <= 100) return 'Critical';
            return 'Severe';
        };
        const statusColor = (level) => {
            if (typeof level !== 'number' || isNaN(level)) return '#999';
            if (level <= -50) return '#4a8c1c';
            if (level <= 0) return '#a8d65c';
            if (level <= 50) return '#f0c929';
            if (level <= 100) return '#e17055';
            return '#d63031';
        };

        const isEco = data.ring === 'ecological';
        const ringColor = isEco ? '#d63c36' : '#4a8c1c';
        const level = data.level;

        // Header
        html += `<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">`;
        html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ringColor};"></span>`;
        html += `<strong style="text-transform:capitalize;font-size:1.1rem;">${data.name || ''}</strong>`;
        html += `<span style="margin-left:auto;padding:0.15rem 0.5rem;border-radius:1rem;font-size:0.75rem;font-weight:600;background:${statusColor(level)}22;color:${statusColor(level)};">${statusLabel(level)}</span>`;
        html += `</div>`;

        // Severity bar
        if (typeof level === 'number' && !isNaN(level)) {
            const pct = Math.min(100, Math.max(0, (level + 100) / 2.5));
            html += `<div style="background:#eee;border-radius:4px;height:6px;margin-bottom:0.75rem;">`;
            html += `<div style="width:${pct}%;height:100%;border-radius:4px;background:${statusColor(level)};"></div>`;
            html += `</div>`;
        }

        // Metric
        html += `<div style="background:#f8f9fa;border-radius:0.5rem;padding:0.75rem;margin-bottom:0.75rem;">`;
        if (data.indicator) html += `<div style="font-size:0.75rem;color:#888;text-transform:uppercase;">${data.indicator}</div>`;
        if (data.value) html += `<div style="font-size:1.3rem;font-weight:700;margin:0.2rem 0;">${data.value}</div>`;
        if (data.year) html += `<div style="font-size:0.8rem;color:#aaa;">Year: ${data.year}</div>`;
        if (data.target) html += `<div style="font-size:0.85rem;color:#6c5ce7;margin-top:0.3rem;">Target: ${data.target}</div>`;
        if (data.context) html += `<div style="font-size:0.85rem;color:#666;margin-top:0.4rem;line-height:1.4;">${data.context}</div>`;
        html += `</div>`;

        // Source
        if (data.source) {
            html += `<div style="margin-bottom:0.75rem;">`;
            html += `<div style="font-size:0.75rem;color:#888;text-transform:uppercase;margin-bottom:0.3rem;">Source</div>`;
            if (data.sourceUrl) {
                html += `<a href="${data.sourceUrl}" target="_blank" rel="noopener" style="color:#0984e3;text-decoration:none;font-size:0.9rem;">${data.source}</a>`;
            } else {
                html += `<span style="font-size:0.9rem;">${data.source}</span>`;
            }
            if (data.confidence) {
                const confColor = data.confidence === 'high' ? '#4a8c1c' : data.confidence === 'medium' ? '#f0c929' : '#e17055';
                html += `<span style="margin-left:0.5rem;font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:0.5rem;background:${confColor}22;color:${confColor};">${data.confidence} confidence</span>`;
            }
            html += `</div>`;
        }

        // Actions
        if (data.actions && data.actions.length > 0) {
            html += `<div style="margin-top:0.5rem;">`;
            html += `<div style="font-size:0.75rem;color:#4a8c1c;text-transform:uppercase;margin-bottom:0.3rem;">Get Involved</div>`;
            html += `<ul style="list-style:none;padding:0;margin:0;">`;
            data.actions.forEach(action => {
                html += `<li style="padding:0.3rem 0;border-bottom:1px solid #f1f3f5;font-size:0.85rem;">\u2192 ${action}</li>`;
            });
            html += `</ul></div>`;
        }

        return html;
    }
}
