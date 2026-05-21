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
            const listRes = await fetch(`${BASE_CDN}game_list.json`, { signal });
            const data = await listRes.json();

            const chunked = data[0] || [];
            const streamed = data[1] || [];

            this.updateProgress(10);

            let html = "";

            // 🔥 STREAMED GAME
            if (streamed.includes(alias)) {
                const res = await fetch(`${BASE_CDN}external/${alias}.html`, { signal });
                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    html += decoder.decode(value, { stream: true });
                }
            }

            // 🔥 CHUNKED GAME
            else if (chunked.includes(alias)) {
                const nr = await fetch(`${BASE_CDN}${alias}/nr.txt`, { signal });
                const total = parseInt(await nr.text(), 10);

                for (let i = 1; i <= total; i++) {
                    const part = await fetch(`${BASE_CDN}${alias}/src.part${i}.html`, { signal });
                    html += await part.text();

                    this.updateProgress(10 + (i / total) * 60);
                }
            } else {
                throw new Error("Game not found");
            }

            this.updateProgress(85);

            // 🔥 FIX FOR RELATIVE PATHS (IMPORTANT)
            const wrapped = `
                <base href="${BASE_CDN}">
                ${html}
            `;

            const iframe = document.createElement("iframe");
            iframe.setAttribute("sandbox",
                "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"
            );
            iframe.allow = "autoplay; fullscreen; gamepad; pointer-lock";

            // 🔥 MODERN FIX: srcdoc instead of blob/document.write
            iframe.srcdoc = wrapped;

            this.shadowRoot.appendChild(iframe);

            this.updateProgress(100);

            setTimeout(() => {
                this.ui.loader.classList.add("hidden");
            }, 150);

        } catch (e) {
            if (e.name === "AbortError") return;
            console.error(e);
            this.ui.bar.style.background = "red";
        }
    }
}

customElements.define("game-embed", GameEmbed);
