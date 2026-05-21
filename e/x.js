const DEFAULT_COMMIT = "576469a8ef60ab648072d27dff1bf2b47413e017";
const BASE_CDN = "https://nxyderrr-assets.pages.dev/";

class GameEmbed extends HTMLElement {
    static get observedAttributes() {
        return ["alias", "commit"];
    }

    constructor() {
        super();
        this.ui = null;
        this._currentPct = 0;
        this._abortController = null;
        this.attachShadow({ mode: "open" });
    }

    get alias() { return this.getAttribute("alias"); }
    set alias(v) { this.setAttribute("alias", v); }

    get commit() { return this.getAttribute("commit") || DEFAULT_COMMIT; }
    set commit(v) { this.setAttribute("commit", v); }

    static async fetchGameList() {
        const res = await fetch(`${BASE_CDN}game_list.json`);
        if (!res.ok) throw new Error("Failed to fetch game list.");
        const data = await res.json();

        const group1 = (data[0] || []).map(alias => ({ alias, type: "chunked" }));
        const group2 = (data[1] || []).map(alias => ({ alias, type: "streamed" }));

        return [...group1, ...group2];
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display:block; width:100%; height:100%; position:relative; background:#0a0a0c; overflow:hidden; }
                iframe { width:100%; height:100%; border:0; background:#000; }
                .loader {
                    position:absolute; inset:0;
                    display:flex; align-items:center; justify-content:center;
                    background:#0a0a0c;
                    z-index:10;
                    transition:opacity .3s;
                }
                .bar {
                    width:220px; height:2px;
                    background:rgba(255,255,255,0.08);
                    overflow:hidden;
                }
                .fill {
                    width:0%; height:100%;
                    background:#fff;
                    transition:width .08s linear;
                }
                .hidden { opacity:0; pointer-events:none; }
            </style>

            <div class="loader" id="loader">
                <div class="bar"><div class="fill" id="bar"></div></div>
            </div>
        `;

        this.ui = {
            loader: this.shadowRoot.querySelector("#loader"),
            bar: this.shadowRoot.querySelector("#bar")
        };

        if (this.alias) this.loadGame(this.alias);
    }

    updateProgress(p) {
        this._currentPct = Math.max(this._currentPct, p);
        this.ui.bar.style.width = `${this._currentPct}%`;
    }

    async loadGame(alias) {
        if (this._abortController) this._abortController.abort();
        this._abortController = new AbortController();
        const signal = this._abortController.signal;

        this._currentPct = 0;

        const old = this.shadowRoot.querySelector("iframe");
        if (old) old.remove();

        this.ui.loader.classList.remove("hidden");

        try {
            // 🔥 SMART STEP 1: load game list
            const listRes = await fetch(`${BASE_CDN}game_list.json`, { signal });
            if (!listRes.ok) throw new Error("Game DB missing");
            const data = await listRes.json();

            const chunked = data[0] || [];
            const streamed = data[1] || [];

            const cdn = BASE_CDN;

            let html = "";

            this.updateProgress(10);

            // 🔥 STREAMED GAME (full HTML stream)
            if (streamed.includes(alias)) {
                const res = await fetch(`${cdn}external/${alias}.html`, { signal });
                if (!res.ok) throw new Error("External game missing");

                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    html += decoder.decode(value, { stream: true });
                }
            }

            // 🔥 CHUNKED GAME (multi-part rebuild)
            else if (chunked.includes(alias)) {
                const nr = await fetch(`${cdn}${alias}/nr.txt`, { signal });
                if (!nr.ok) throw new Error("nr.txt missing");

                const total = parseInt(await nr.text(), 10);

                const parts = [];

                for (let i = 1; i <= total; i++) {
                    const partRes = await fetch(`${cdn}${alias}/src.part${i}.html`, { signal });
                    if (!partRes.ok) throw new Error(`part ${i} missing`);

                    const text = await partRes.text();
                    parts.push(text);

                    this.updateProgress(10 + (i / total) * 60);
                }

                html = parts.join("");
            } else {
                throw new Error("Game not found in list");
            }

            this.updateProgress(85);

            // 🔥 MODERN STEP: Blob URL instead of document.write
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);

            const iframe = document.createElement("iframe");
            iframe.sandbox =
                "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads";
            iframe.allow = "autoplay; fullscreen; gamepad; pointer-lock";
            iframe.src = url;

            this.shadowRoot.appendChild(iframe);

            this.updateProgress(100);

            setTimeout(() => {
                this.ui.loader.classList.add("hidden");
            }, 150);

            setTimeout(() => URL.revokeObjectURL(url), 60000);

        } catch (e) {
            if (e.name === "AbortError") return;
            console.error(e);
            this.ui.bar.style.background = "red";
        }
    }
}

customElements.define("game-embed", GameEmbed);
