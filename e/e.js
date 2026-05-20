const DEFAULT_COMMIT = "576469a8ef60ab648072d27dff1bf2b47413e017";
const BASE_CDN = "https://cdn.jsdelivr.net/gh/un-zynq/truesinglefilegames@";

class GameEmbed extends HTMLElement {
    static get observedAttributes() {
        return ["alias", "commit"];
    }

    constructor() {
        super();
        this.ui = null;
        this.attachShadow({ mode: "open" });
    }

    static async fetchGameList(commitHash = DEFAULT_COMMIT) {
        try {
            const res = await fetch(`${BASE_CDN}${commitHash}/game_list.json`);
            if (!res.ok) throw new Error("Failed to fetch game list.");
            const data = await res.json();
            
            const group1 = (data[0] || []).map(alias => ({ alias, type: "chunked" }));
            const group2 = (data[1] || []).map(alias => ({ alias, type: "streamed" }));
            
            return [...group1, ...group2];
        } catch (error) {
            console.error("Error fetching game list:", error);
            throw error;
        }
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal !== newVal && this.alias) {
            this.loadGame(this.alias, this.commit);
        }
    }

    get alias() { return this.getAttribute("alias"); }
    set alias(v) { this.setAttribute("alias", v); }

    get commit() { return this.getAttribute("commit") || DEFAULT_COMMIT; }
    set commit(v) { this.setAttribute("commit", v); }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    background-color: #0a0a0c;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    overflow: hidden;
                }
                iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    background: #000;
                    display: block;
                }
                .loader-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: #0a0a0c;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    z-index: 9999;
                    transition: opacity 0.4s ease, visibility 0.4s ease;
                }
                .loader-overlay.hidden {
                    opacity: 0; visibility: hidden; pointer-events: none;
                }
                .loader-card { text-align: center; width: 200px; box-sizing: border-box; }
                .percentage-txt { font-size: 0.9rem; font-weight: 400; color: rgba(255, 255, 255, 0.4); margin-bottom: 8px; font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }
                .progress-track { width: 100%; height: 1px; background: rgba(255, 255, 255, 0.05); overflow: hidden; }
                .progress-bar { width: 0%; height: 100%; background: #ffffff; transition: width 0.1s linear; }
                .error-msg { color: #ff5252; font-size: 0.9rem; text-align: center; line-height: 1.4; padding: 1rem; border: 1px solid rgba(255, 82, 82, 0.2); background: rgba(255, 82, 82, 0.05); border-radius: 4px; }
            </style>
            <div class="loader-overlay" id="loader">
                <div class="loader-card" id="loader-card">
                    <div class="percentage-txt" id="percentage">0%</div>
                    <div class="progress-track">
                        <div class="progress-bar" id="bar"></div>
                    </div>
                </div>
            </div>
        `;

        this.ui = {
            overlay: this.shadowRoot.querySelector("#loader"),
            card: this.shadowRoot.querySelector("#loader-card"),
            percent: this.shadowRoot.querySelector("#percentage"),
            bar: this.shadowRoot.querySelector("#bar")
        };

        if (this.alias) {
            this.loadGame(this.alias, this.commit);
        }
    }

    updateProgress(pct) {
        if (!this.ui || !this.ui.percent) return;
        const clampedPct = Math.min(100, Math.max(0, Math.floor(pct)));
        this.ui.percent.textContent = `${clampedPct}%`;
        this.ui.bar.style.width = `${clampedPct}%`;
    }

    showError(message) {
        if (!this.ui) return;
        this.ui.card.innerHTML = `<div class="error-msg"><strong>Launch Error:</strong><br>${message}</div>`;
    }

    async loadGame(alias, commitHash) {
        const oldIframe = this.shadowRoot.querySelector("iframe");
        if (oldIframe) oldIframe.remove();

        if (this.ui && this.ui.overlay) {
            this.ui.overlay.classList.remove("hidden");
            this.ui.card.innerHTML = `
                <div class="percentage-txt" id="percentage">0%</div>
                <div class="progress-track"><div class="progress-bar" id="bar"></div></div>
            `;
            this.ui.percent = this.shadowRoot.querySelector("#percentage");
            this.ui.bar = this.shadowRoot.querySelector("#bar");
        }

        const cdnUrl = `${BASE_CDN}${commitHash}`;
        this.updateProgress(0);

        try {
            const listReq = await fetch(`${cdnUrl}/game_list.json`);
            if (!listReq.ok) throw new Error("Could not download the game database.");
            const data = await listReq.json();

            const group1 = data[0] || [];
            const group2 = data[1] || [];

            const f = document.createElement("iframe");
            f.sandbox = "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads";
            f.allow = "autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated";
            f.src = "about:blank"; 
            this.shadowRoot.appendChild(f);

            const d = f.contentWindow.document;
            d.open();
            d.addEventListener("contextmenu", (e) => e.preventDefault());

            const decoder = new TextDecoder();

            if (group2.includes(alias)) {
                this.updateProgress(20);
                const response = await fetch(`${cdnUrl}/external/${alias}.html`);
                if (!response.ok) throw new Error("External game file missing.");
                
                const reader = response.body.getReader();
                this.updateProgress(60);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    d.write(decoder.decode(value, { stream: true }));
                }
                
                this.updateProgress(100);
                d.close();
                this.ui.overlay.classList.add("hidden");
                return;
            } 

            if (group1.includes(alias)) {
                const nrReq = await fetch(`${cdnUrl}/${alias}/nr.txt`);
                if (!nrReq.ok) throw new Error("Configuration file (nr.txt) is missing.");
                
                const nrText = await nrReq.text();
                const totalParts = parseInt(nrText.trim(), 10);
                if (isNaN(totalParts) || totalParts <= 0) throw new Error("Invalid chunk count data.");

                this.updateProgress(10);

                const partFetches = [];
                for (let i = 1; i <= totalParts; i++) {
                    partFetches.push(fetch(`${cdnUrl}/${alias}/src.part${i}.html`));
                }

                for (let i = 0; i < totalParts; i++) {
                    let basePct = (i / totalParts) * 100;
                    let nextBasePct = ((i + 1) / totalParts) * 100;
                    
                    this.updateProgress(basePct);

                    const res = await partFetches[i];
                    if (!res.ok) throw new Error(`Part ${i + 1} failed to download.`);
                    
                    const reader = res.body.getReader();
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        d.write(decoder.decode(value, { stream: true }));
                        basePct = Math.min(nextBasePct, basePct + 0.5);
                        this.updateProgress(basePct);
                    }
                }

                this.updateProgress(100);
                d.close();
                
                setTimeout(() => {
                    this.ui.overlay.classList.add("hidden");
                }, 200);
            } else {
                throw new Error(`The game "${alias}" was not found in this repository.`);
            }

        } catch (error) {
            console.error(error);
            this.showError(error.message);
        }
    }
}

customElements.define("game-embed", GameEmbed);
