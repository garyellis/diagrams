class DiagramEngine {
    constructor(config) {
        this.config = Object.assign(
            {
                stageWidth: 940,
                stageHeight: 560,
                nodeSize: 60,
                legendPosition: 'top-left',
                legend: [],
                groups: [],
                nodes: [],
                connections: [],
                svgPaths: [],
                svgOverlays: [],
                dnsCards: [],
                xMarks: [],
                button: { label: 'Play Scenario', color: '--green' },
                stepCount: 5,
                vignetteColor: 'rgba(229, 115, 115, 0.35)',
                initialStatus: '',
            },
            config,
        );
        this._scenarioFn = null;
        this._initFn = null;
    }

    onScenario(fn) {
        this._scenarioFn = fn;
    }

    onInit(fn) {
        this._initFn = fn;
    }

    init() {
        const stage = document.createElement('div');
        stage.id = 'stage';
        stage.style.width = `${this.config.stageWidth}px`;
        stage.style.height = `${this.config.stageHeight}px`;
        document.body.appendChild(stage);
        this._stage = stage;

        this._renderVignette(stage);
        this._renderGroups(stage);
        this._renderLegend(stage);
        this._renderConnections(stage);
        this._renderSvgPaths(stage);
        this._renderSvgOverlays(stage);
        this._renderDnsCards(stage);
        this._renderNodes(stage);
        this._renderXMarks(stage);
        this._renderStepDots(stage);
        this._renderStatusText(stage);
        this._renderControls(stage);

        // Set initial state
        if (this.config.initialStatus) {
            document.getElementById('text-target').innerHTML =
                this.config.initialStatus;
            this.step(0, this.config.initialStatus);
        }

        if (this._initFn) this._initFn(this);
    }

    // ── Rendering ──

    _renderVignette(stage) {
        const v = document.createElement('div');
        v.id = 'vignette';
        v.style.boxShadow = `inset 0 0 150px ${this.config.vignetteColor}`;
        stage.appendChild(v);
    }

    _renderGroups(stage) {
        for (const g of this.config.groups) {
            const box = document.createElement('div');
            box.id = g.id;
            box.className = 'group-box';
            box.style.left = `${g.x}px`;
            box.style.top = `${g.y}px`;
            box.style.width = `${g.width}px`;
            box.style.height = `${g.height}px`;

            const colorVal = g.color.startsWith('--')
                ? `var(${g.color})`
                : g.color;
            box.style.borderColor = this._alpha(g.color, 0.3);
            if (g.bg) box.style.background = g.bg;

            const lbl = document.createElement('div');
            lbl.className = 'group-label';
            lbl.style.color = colorVal;
            lbl.textContent = g.label;
            box.appendChild(lbl);
            stage.appendChild(box);
        }
    }

    _renderLegend(stage) {
        if (!this.config.legend.length) return;
        const legend = document.createElement('div');
        legend.id = 'legend';
        if (this.config.legendPosition === 'top-right') {
            legend.style.right = '20px';
        } else {
            legend.style.left = '20px';
        }
        for (const item of this.config.legend) {
            const row = document.createElement('div');
            row.className = 'legend-item';
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.background = item.color.startsWith('--')
                ? `var(${item.color})`
                : item.color;
            row.appendChild(dot);
            row.appendChild(document.createTextNode(` ${item.label}`));
            legend.appendChild(row);
        }
        stage.appendChild(legend);
    }

    _renderConnections(stage) {
        for (const c of this.config.connections) {
            const dir = c.direction || 'horizontal';
            const el = document.createElement('div');
            el.id = c.id;

            if (dir === 'vertical') {
                el.className = 'connection-v';
                el.style.left = `${c.x}px`;
                el.style.top = `${c.y}px`;
                el.style.height = `${c.length}px`;
            } else {
                el.className = 'connection';
                el.style.left = `${c.x}px`;
                el.style.top = `${c.y}px`;
                el.style.width = `${c.length}px`;
            }

            // Custom dash color
            if (c.color) {
                const cv = c.color.startsWith('--')
                    ? `var(${c.color})`
                    : c.color;
                const gradDir = dir === 'vertical' ? '180deg' : '90deg';
                el.style.setProperty('--conn-color', cv);
                const ss = document.createElement('style');
                ss.textContent = `#${c.id}::before { background-image: repeating-linear-gradient(${gradDir}, ${cv} 0, ${cv} 6px, transparent 6px, transparent 12px); }`;
                stage.appendChild(ss);
            }

            // Thin line
            if (c.thin) {
                const ss = document.createElement('style');
                ss.textContent = `#${c.id}::before { height: 1.5px; }`;
                if (dir === 'horizontal') {
                    el.style.height = '0';
                    ss.textContent = `#${c.id} { height: 0; } #${c.id}::before { height: 1.5px; background-image: repeating-linear-gradient(90deg, ${c.color ? (c.color.startsWith('--') ? `var(${c.color})` : c.color) : '#555'} 0, ${c.color ? (c.color.startsWith('--') ? `var(${c.color})` : c.color) : '#555'} 4px, transparent 4px, transparent 8px); }`;
                }
                stage.appendChild(ss);
            }

            // Reverse flow
            if (c.reverseFlow) {
                const gradDir = dir === 'vertical' ? '180deg' : '90deg';
                const cv = c.color
                    ? c.color.startsWith('--')
                        ? `var(${c.color})`
                        : c.color
                    : '#555';
                const dashLen = c.thin ? 4 : 6;
                const gapLen = c.thin ? 4 : 6;
                const ss = document.createElement('style');
                const totalLen = dashLen + gapLen;
                if (dir === 'vertical') {
                    ss.textContent = `#${c.id}::before { animation-name: dash-flow-v-rev-${c.id}; } @keyframes dash-flow-v-rev-${c.id} { to { background-position: 0 -${totalLen * 2}px; } }`;
                } else {
                    ss.textContent = `#${c.id}::before { animation-name: dash-flow-h-rev-${c.id}; } @keyframes dash-flow-h-rev-${c.id} { to { background-position: -${totalLen * 2}px 0; } }`;
                }
                stage.appendChild(ss);
            }

            // Slow animation
            if (c.slow) {
                const ss = document.createElement('style');
                ss.textContent = `#${c.id}::before { animation-duration: 1s; }`;
                stage.appendChild(ss);
            }

            // Label
            if (c.label) {
                const lbl = document.createElement('div');
                lbl.className = 'connection-label';
                if (c.labelStyle) {
                    Object.assign(lbl.style, c.labelStyle);
                } else if (dir === 'vertical') {
                    lbl.style.left = '10px';
                    lbl.style.top = `${Math.floor(c.length / 2)}px`;
                    lbl.style.transform = 'rotate(90deg)';
                    lbl.style.transformOrigin = 'left top';
                } else {
                    lbl.style.left = `${Math.floor(c.length / 2 - 30)}px`;
                    lbl.style.top = '-15px';
                }
                lbl.textContent = c.label;
                el.appendChild(lbl);
            }

            // Packet
            if (c.packet) {
                const pkt = document.createElement('div');
                pkt.className = 'packet';
                const pathLen = dir === 'vertical' ? c.length : c.length;
                const pathDir =
                    dir === 'vertical'
                        ? `M 0 0 L 0 ${pathLen}`
                        : `M 0 0 L ${pathLen} 0`;
                pkt.style.offsetPath = `path('${pathDir}')`;
                if (c.packetDuration)
                    pkt.style.animationDuration = c.packetDuration;
                el.appendChild(pkt);
            }

            // Pulse
            if (c.pulse) {
                const p = document.createElement('div');
                p.className = 'pulse';
                p.style.offsetPath = `path('M 0 0 L 0 ${c.length}')`;
                el.appendChild(p);
            }

            stage.appendChild(el);
        }
    }

    _renderSvgPaths(stage) {
        for (const sp of this.config.svgPaths) {
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            );
            svg.id = sp.id;
            svg.setAttribute(
                'viewBox',
                `0 0 ${this.config.stageWidth} ${this.config.stageHeight}`,
            );
            svg.classList.add('svg-path-layer');
            svg.style.width = `${this.config.stageWidth}px`;
            svg.style.height = `${this.config.stageHeight}px`;
            if (sp.opacity !== undefined) svg.style.opacity = sp.opacity;

            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path',
            );
            path.setAttribute('d', sp.d);
            path.setAttribute('fill', 'none');
            const strokeColor = sp.stroke.startsWith('--')
                ? `var(${sp.stroke})`
                : sp.stroke;
            path.setAttribute('stroke', strokeColor);
            if (sp.strokeWidth)
                path.setAttribute('stroke-width', sp.strokeWidth);
            if (sp.dashed)
                path.setAttribute('stroke-dasharray', sp.dashArray || '3,3');
            svg.appendChild(path);
            stage.appendChild(svg);
        }
    }

    _renderSvgOverlays(stage) {
        for (const ov of this.config.svgOverlays) {
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            );
            svg.id = ov.id;
            svg.setAttribute(
                'viewBox',
                `0 0 ${this.config.stageWidth} ${this.config.stageHeight}`,
            );
            svg.classList.add('svg-overlay');
            if (ov.hidden) svg.style.display = 'none';

            for (const p of ov.paths || []) {
                const path = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'path',
                );
                path.id = p.id;
                if (p.class) path.setAttribute('class', p.class);
                path.setAttribute('d', p.d);
                svg.appendChild(path);
            }

            for (const pt of ov.particles || []) {
                const circle = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'circle',
                );
                if (pt.class) circle.setAttribute('class', pt.class);
                circle.setAttribute('r', pt.r || 5);
                const anim = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'animateMotion',
                );
                anim.setAttribute('dur', pt.dur || '2s');
                anim.setAttribute('repeatCount', 'indefinite');
                if (pt.delay) anim.setAttribute('begin', pt.delay);
                const mpath = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'mpath',
                );
                mpath.setAttribute('href', `#${pt.follow}`);
                anim.appendChild(mpath);
                circle.appendChild(anim);
                svg.appendChild(circle);
            }

            stage.appendChild(svg);
        }
    }

    _renderDnsCards(stage) {
        for (const card of this.config.dnsCards) {
            const el = document.createElement('div');
            el.id = card.id;
            el.className = 'dns-card';
            el.style.left = `${card.x}px`;
            el.style.top = `${card.y}px`;
            if (card.width) el.style.width = `${card.width}px`;
            if (card.padding) el.style.padding = card.padding;
            if (card.fontSize) el.style.fontSize = card.fontSize;

            const borderColor = card.borderColor.startsWith('--')
                ? `var(${card.borderColor})`
                : card.borderColor;
            el.style.border = `2px solid ${borderColor}`;

            // Title
            if (card.title) {
                const title = document.createElement('div');
                title.className = 'record-title';
                if (card.titleColor) {
                    title.style.color = card.titleColor.startsWith('--')
                        ? `var(${card.titleColor})`
                        : card.titleColor;
                } else {
                    title.style.color = borderColor;
                }
                const span1 = document.createElement('span');
                span1.textContent = card.title;
                title.appendChild(span1);
                if (card.titleIcon) {
                    const span2 = document.createElement('span');
                    span2.textContent = card.titleIcon;
                    title.appendChild(span2);
                }
                el.appendChild(title);
            }

            // Rows
            for (const row of card.rows || []) {
                const div = document.createElement('div');
                if (typeof row === 'string') {
                    div.textContent = row;
                } else {
                    if (row.id) div.id = row.id;
                    div.textContent = row.text;
                    if (row.color)
                        div.style.color = row.color.startsWith('--')
                            ? `var(${row.color})`
                            : row.color;
                    if (row.bold) div.style.fontWeight = 'bold';
                    if (row.marginTop) div.style.marginTop = row.marginTop;
                    if (row.small) div.style.fontSize = '7px';
                    if (row.dim) div.style.opacity = '0.6';
                }
                el.appendChild(div);
            }

            // Footer (proxy status)
            if (card.footer) {
                const footer = document.createElement('div');
                footer.className = 'proxy-status';
                if (card.footer.color) {
                    footer.style.color = card.footer.color.startsWith('--')
                        ? `var(${card.footer.color})`
                        : card.footer.color;
                }
                if (card.footer.icon) {
                    const iconSpan = document.createElement('span');
                    iconSpan.textContent = card.footer.icon;
                    footer.appendChild(iconSpan);
                }
                if (card.footer.text) {
                    const textSpan = document.createElement('span');
                    textSpan.textContent = card.footer.text;
                    footer.appendChild(textSpan);
                }
                el.appendChild(footer);
            }

            stage.appendChild(el);
        }
    }

    _renderNodes(stage) {
        for (const n of this.config.nodes) {
            const el = document.createElement('div');
            el.id = n.id;
            el.className = 'node';
            el.style.left = `${n.x}px`;
            el.style.top = `${n.y}px`;

            const img = document.createElement('img');
            img.src = `components/${n.icon}.svg`;
            img.style.width = `${this.config.nodeSize}px`;
            img.style.height = `${this.config.nodeSize}px`;
            if (n.iconStyle) img.style.filter = n.iconStyle;
            el.appendChild(img);

            const span = document.createElement('span');
            span.style.fontSize = `${this.config.nodeSize <= 50 ? 10 : 11}px`;
            span.textContent = n.label;
            el.appendChild(span);

            if (n.tooltip) {
                const tip = document.createElement('div');
                tip.className = 'tooltip';
                tip.textContent = n.tooltip;
                el.appendChild(tip);
            }

            stage.appendChild(el);
        }
    }

    _renderXMarks(stage) {
        for (const xm of this.config.xMarks) {
            const el = document.createElement('div');
            el.id = xm.id;
            el.className = 'x-mark';
            el.style.left = `${xm.x}px`;
            el.style.top = `${xm.y}px`;
            el.textContent = '\u2715';
            stage.appendChild(el);
        }
    }

    _renderStepDots(stage) {
        const container = document.createElement('div');
        container.id = 'step-progress';
        for (let i = 0; i < this.config.stepCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'step-dot';
            dot.id = `sd-${i}`;
            container.appendChild(dot);
        }
        stage.appendChild(container);
    }

    _renderStatusText(stage) {
        const el = document.createElement('div');
        el.id = 'status-text';
        const liveDot = document.createElement('span');
        liveDot.id = 'live-indicator';
        el.appendChild(liveDot);
        const text = document.createElement('span');
        text.id = 'text-target';
        el.appendChild(text);
        stage.appendChild(el);
    }

    _renderControls(stage) {
        const controls = document.createElement('div');
        controls.id = 'controls';

        const runBtn = document.createElement('button');
        runBtn.id = 'run-btn';
        runBtn.textContent = this.config.button.label;

        // Apply button color
        const colorVar = this.config.button.color;
        const colorVal = colorVar.startsWith('--')
            ? `var(${colorVar})`
            : colorVar;
        const btnBorder = this._resolveAlpha(colorVar, 0.4);
        const btnBg = this._resolveAlpha(colorVar, 0.08);
        const btnHoverBg = this._resolveAlpha(colorVar, 0.18);
        const btnHoverBorder = this._resolveAlpha(colorVar, 0.6);
        const ss = document.createElement('style');
        ss.textContent = `
            #run-btn { border-color: ${btnBorder}; background: ${btnBg}; color: ${colorVal}; }
            #run-btn:hover { background: ${btnHoverBg}; border-color: ${btnHoverBorder}; }
        `;
        stage.appendChild(ss);

        runBtn.onclick = () => this._runScenario();
        controls.appendChild(runBtn);

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.style.background = '#252525';
        resetBtn.style.color = '#aaa';
        resetBtn.style.borderColor = '#333';
        resetBtn.onclick = () => location.reload();
        controls.appendChild(resetBtn);

        stage.appendChild(controls);
    }

    async _runScenario() {
        if (!this._scenarioFn) return;
        document.getElementById('run-btn').disabled = true;
        await this._scenarioFn(this);
    }

    // ── Scenario API ──

    step(index, text, style = 'active') {
        const count = this.config.stepCount;
        for (let i = 0; i < count; i++) {
            const dot = document.getElementById(`sd-${i}`);
            dot.className = 'step-dot';
            if (i <= index) {
                if (style === 'error' && i >= 1) dot.classList.add('error');
                else if (style === 'warn' && i >= 1) dot.classList.add('warn');
                else if (style === 'success' && i === index)
                    dot.classList.add('success');
                else if (style === 'success' && i >= 1 && i < index)
                    dot.classList.add('warn');
                else dot.classList.add('active');
            }
        }
        // Update status text
        const statusEl = document.getElementById('status-text');
        const textEl = document.getElementById('text-target');
        statusEl.classList.add('status-update');
        setTimeout(() => {
            textEl.innerHTML = text;
            statusEl.classList.remove('status-update');
        }, 300);
    }

    async wait(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    fail(...nodeIds) {
        for (const id of nodeIds) {
            document.getElementById(id).classList.add('failed');
        }
    }

    dim(...ids) {
        for (const id of ids) {
            document.getElementById(id).classList.add('dimmed');
        }
    }

    showX(...markIds) {
        for (const id of markIds) {
            const el = document.getElementById(id);
            el.style.display = 'block';
            el.style.animation =
                'x-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        }
    }

    flash() {
        const v = document.getElementById('vignette');
        v.style.opacity = '1';
        setTimeout(() => {
            v.style.opacity = '0';
        }, 250);
    }

    shake() {
        const stage = this._stage;
        stage.classList.add('shaking');
        stage.addEventListener(
            'animationend',
            () => {
                stage.classList.remove('shaking');
            },
            { once: true },
        );
    }

    hidePackets() {
        for (const p of this._stage.querySelectorAll('.packet')) {
            p.style.display = 'none';
        }
    }

    hidePulses() {
        for (const p of this._stage.querySelectorAll('.pulse')) {
            p.style.display = 'none';
        }
    }

    failLinks(...linkIds) {
        for (const id of linkIds) {
            const el = document.getElementById(id);
            el.classList.add('failed-link');
            if (el.classList.contains('connection-v')) {
                el.classList.add('failed-link-v');
            }
        }
    }

    stageGlow(style) {
        this._stage.classList.remove(
            'stage-error',
            'stage-warn',
            'stage-success',
        );
        if (style && style !== 'none') {
            this._stage.classList.add(`stage-${style}`);
        }
    }

    sendPacket(linkId, opts = {}) {
        const link = document.getElementById(linkId);
        const pkt = document.createElement('div');
        pkt.className = 'packet';
        const color = opts.color || 'var(--admin-blue)';
        const colorVal = color.startsWith('--') ? `var(${color})` : color;
        pkt.style.background = colorVal;

        // Resolve trail shadow colors with alpha
        const trailMed = this._resolveAlpha(color, 0.35);
        const trailDim = this._resolveAlpha(color, 0.15);
        pkt.style.boxShadow = `0 0 8px ${colorVal}, 8px 0 6px ${trailMed}, 16px 0 4px ${trailDim}`;

        // Determine path from connection
        const isVertical = link.classList.contains('connection-v');
        let pathLen;
        if (isVertical) {
            pathLen = Number.parseInt(link.style.height);
        } else {
            pathLen = Number.parseInt(link.style.width);
        }

        let pathD;
        if (opts.reverse) {
            if (isVertical) {
                pathD = `M 0 ${pathLen} L 0 0`;
            } else {
                pathD = `M ${pathLen} 0 L 0 0`;
            }
        } else {
            if (isVertical) {
                pathD = `M 0 0 L 0 ${pathLen}`;
            } else {
                pathD = `M 0 0 L ${pathLen} 0`;
            }
        }

        pkt.style.offsetPath = `path('${pathD}')`;
        pkt.style.animation = `flow ${opts.duration || '1.5s'} forwards linear`;
        link.appendChild(pkt);
        return pkt;
    }

    highlightCard(cardId, opts = {}) {
        const card = document.getElementById(cardId);
        if (opts.borderColor) {
            const c = opts.borderColor.startsWith('--')
                ? `var(${opts.borderColor})`
                : opts.borderColor;
            card.style.borderColor = c;
        }
        if (opts.flash) {
            card.style.animation = 'dns-flash 0.6s ease';
        }
        if (opts.scale) {
            card.style.transform = `scale(${opts.scale})`;
        }
    }

    dimCard(cardId) {
        document.getElementById(cardId).classList.add('dimmed');
    }

    setText(fieldId, text, opts = {}) {
        const el = document.getElementById(fieldId);
        el.textContent = text;
        if (opts.color) {
            el.style.color = opts.color.startsWith('--')
                ? `var(${opts.color})`
                : opts.color;
        }
        if (opts.highlight) {
            el.classList.add('value-highlight');
        }
    }

    setLiveDot(colorVar) {
        const dot = document.getElementById('live-indicator');
        const val = colorVar.startsWith('--') ? `var(${colorVar})` : colorVar;
        dot.style.backgroundColor = val;
        dot.style.boxShadow = `0 0 12px ${val}`;
        // Remove pulse animation when changing color for non-green
        if (colorVar !== '--green') {
            dot.style.animation = 'none';
        } else {
            dot.style.animation = '';
        }
    }

    setLiveDotDown() {
        document
            .getElementById('live-indicator')
            .classList.add('indicator-down');
    }

    show(id) {
        document.getElementById(id).style.display = 'block';
    }

    hide(id) {
        document.getElementById(id).style.display = 'none';
    }

    fadeOut(id) {
        document.getElementById(id).style.opacity = '0';
    }

    el(id) {
        return document.getElementById(id);
    }

    resetScale(cardId) {
        document.getElementById(cardId).style.transform = 'scale(1.0)';
    }

    // ── Helpers ──

    _alpha(colorVar, alpha) {
        // Returns a CSS color with alpha for common vars
        const map = {
            '--cf-orange': `rgba(255, 183, 77, ${alpha})`,
            '--azure-teal': `rgba(77, 182, 172, ${alpha})`,
            '--green': `rgba(129, 199, 132, ${alpha})`,
            '--red': `rgba(229, 115, 115, ${alpha})`,
            '--failover-teal': `rgba(0, 188, 212, ${alpha})`,
            '--dns-purple': `rgba(186, 104, 200, ${alpha})`,
            '--admin-blue': `rgba(100, 181, 246, ${alpha})`,
        };
        return map[colorVar] || `var(${colorVar})`;
    }

    _resolveAlpha(color, alpha) {
        // Resolve a color (CSS var or raw) to an rgba string with given alpha
        // Handle 'var(--name)' format
        if (color.startsWith('var(--')) {
            const varName = color.slice(4, -1); // '--admin-blue'
            return this._alpha(varName, alpha);
        }
        // Handle '--name' format
        if (color.startsWith('--')) {
            return this._alpha(color, alpha);
        }
        // Handle raw rgba/rgb
        return color.replace(')', `, ${alpha})`).replace('rgb(', 'rgba(');
    }
}
