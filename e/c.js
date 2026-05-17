            customElements.define(
                "single-file-game",
                class extends HTMLElement {
                    static get observedAttributes() {
                        return ["alias"];
                    }
                    attributeChangedCallback(n, o, v) {
                        if (v) this.loadGame(v);
                    }
                    set alias(v) {
                        this.setAttribute("alias", v);
                    }
                    loadGame(v) {
                        this.innerHTML = '<div class="msg">Streamen...</div>';
                        fetch(
                            `https://cdn.jsdelivr.net/gh/un-zynq/singlefilegames@main/${v}.html`,
                        )
                            .then((r) => (r.ok ? r.text() : Promise.reject()))
                            .then((html) => {
                                this.innerHTML = "";
                                const f = document.createElement("iframe");
                                Object.assign(f.style, {
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                });
                                f.sandbox =
                                    "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads";
                                f.allow =
                                    "autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated";
                                this.appendChild(f);
                                const d = f.contentWindow.document;
                                d.open();
                                d.write(html);
                                d.close();
                                d.addEventListener("contextmenu", (e) =>
                                    e.preventDefault(),
                                );
                            })
                            .catch(
                                () =>
                                    (this.innerHTML = `<div class="msg error">Fout: "${v}" niet geladen.</div>`),
                            );
                    }
                },
            );
