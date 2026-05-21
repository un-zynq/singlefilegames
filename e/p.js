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
                .loader { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:#0a0a0c; z-index:10; }
                .bar { width:200px; height:2px; background:rgba(255,255,255,0.1); overflow:hidden; }
                .fill { width:0%; height:100%; background:#fff; transition:width .1s; }
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
            const res = await fetch(`${BASE_CDN}external/${alias}.html`, { signal });
            if (!res.ok) throw new Error("Game niet gevonden");

            this.updateProgress(30);

            const html = await res.text();

            // 🔥 MODERN PART: Blob URL i.p.v document.write
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);

            const iframe = document.createElement("iframe");
            iframe.sandbox = "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads";
            iframe.allow = "autoplay; fullscreen; gamepad; pointer-lock";
            iframe.src = url;

            this.shadowRoot.appendChild(iframe);

            this.updateProgress(100);

            setTimeout(() => {
                this.ui.loader.classList.add("hidden");
            }, 150);

            // cleanup
            setTimeout(() => URL.revokeObjectURL(url), 60000);

        } catch (e) {
            if (e.name === "AbortError") return;
            this.ui.bar.style.background = "red";
            console.error(e);
        }
    }
}

customElements.define("game-embed", GameEmbed);
