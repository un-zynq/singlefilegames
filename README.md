Single file games, you can use 
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arcade Vault</title>
    <style>
        :root{--bg-deep:#0a0a0b;--bg-surface:#141417;--bg-button:#1c1c21;--accent:#3b82f6;--text-main:#e4e4e7;--text-muted:#71717a;--border:#27272a}
        body{font-family:'Inter',sans-serif;background:var(--bg-deep);color:var(--text-main);display:flex;margin:0;height:100vh;overflow:hidden}
        #sidebar{width:280px;background:var(--bg-surface);border-right:1px solid var(--border);display:flex;flex-direction:column}
        .sidebar-header{padding:24px 20px;border-bottom:1px solid var(--border)}
        .sidebar-header h2{margin:0;font-size:1.25rem;font-weight:600}
        #menu{flex-grow:1;overflow-y:auto;padding:16px}
        #menu::-webkit-scrollbar{width:6px}
        #menu::-webkit-scrollbar-thumb{background:var(--border);border-radius:10px}
        .game-btn{display:block;width:100%;padding:12px 16px;margin-bottom:8px;background:var(--bg-button);border:1px solid var(--border);color:var(--text-main);text-align:left;cursor:pointer;border-radius:8px;font-size:.9rem;transition:all .2s}
        .game-btn:hover{background:#27272a;transform:translateY(-1px)}
        .game-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}
        #main{flex-grow:1;display:flex;flex-direction:column;background:#000;position:relative}
        iframe{width:100%;height:100%;border:none;background:#fff;opacity:0;transition:opacity .4s ease}
        iframe.loaded{opacity:1}
        .status-layer{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg-deep);color:var(--text-muted);z-index:10}
        .loader{width:24px;height:24px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin-bottom:12px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .hidden{display:none!important}
    </style>
</head>
<body>
    <div id="sidebar">
        <div class="sidebar-header"><h2>Arcade Vault</h2></div>
        <div id="menu"><div class="status-layer" style="position:static;background:0 0"><div class="loader"></div></div></div>
    </div>
    <div id="main">
        <div id="placeholder" class="status-layer"><p>Select a title to begin</p></div>
        <div id="loading-screen" class="status-layer hidden"><div class="loader"></div><p>Loading Resources...</p></div>
        <div id="container" style="width:100%;height:100%"></div>
    </div>
    <script>
        const repo="un-zynq/singlefilegames",commit="main",menu=document.getElementById('menu'),container=document.getElementById('container'),placeholder=document.getElementById('placeholder'),loader=document.getElementById('loading-screen');
        async function init(){try{const e=await fetch(`https://api.github.com/repos/${repo}/git/trees/main`),t=await e.json(),n=t.tree.filter(e=>"blob"===e.type&&e.path.endsWith(".html"));menu.innerHTML="",n.forEach(e=>{const t=document.createElement("button");t.className="game-btn",t.textContent=e.path.replace(".html","").replace(/-/g," "),t.onclick=()=>loadGame(e.path,t),menu.appendChild(t)})}catch(e){menu.innerHTML='<div style="color:#ef4444;font-size:.8rem">Failed to load library.</div>'}}
        async function loadGame(path,btn){document.querySelectorAll(".game-btn").forEach(e=>e.classList.remove("active")),btn.classList.add("active"),placeholder.classList.add("hidden"),loader.classList.remove("hidden"),container.innerHTML="";try{const e=await fetch(`https://cdn.jsdelivr.net/gh/${repo}@${commit}/${path}`),t=await e.text(),n=document.createElement("iframe");n.id="active-game",container.appendChild(n);const a=n.contentWindow.document;a.open(),a.write(t),a.close();n.contentWindow.addEventListener("load",()=>{setTimeout(()=>{n.classList.add("loaded"),loader.classList.add("hidden")},200)})   }catch(e){loader.classList.add("hidden"),placeholder.classList.remove("hidden"),placeholder.innerHTML='<p style="color:#ef4444">Error loading game data.</p>'}}
        init();
    </script>
</body>
</html>
```

to load them in.<br>
or, if you want to, you can use this pretty version :)
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#080809;--surface:#0f0f11;--panel:#141418;--border:#222228;--border-hi:#333340;--accent:#e8ff47;--accent2:#ff4766;--text:#e8e8ec;--muted:#55555f;--dim:#2a2a32}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);display:flex;height:100vh;overflow:hidden}

#sidebar{width:280px;min-width:280px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.brand{padding:26px 22px 18px;border-bottom:1px solid var(--border)}
.brand-eyebrow{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.25em;color:var(--accent);text-transform:uppercase;margin-bottom:6px;opacity:.8}
.brand-name{font-family:'Space Mono',monospace;font-size:22px;font-weight:700;letter-spacing:-.02em;color:var(--text);line-height:1}
.brand-name span{color:var(--accent)}
.search-wrap{padding:16px 16px 14px;border-bottom:1px solid var(--border)}
.search-row{position:relative}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);width:14px;height:14px;pointer-events:none}
#search{width:100%;background:var(--panel);border:1px solid var(--border);border-radius:8px;padding:10px 12px 10px 36px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);outline:none}
#search::placeholder{color:var(--muted)}
#search:focus{border-color:var(--border-hi)}
.count-badge{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);background:var(--panel);padding:2px 6px;border-radius:20px;border:1px solid var(--border);line-height:1}
#menu{flex:1;overflow-y:auto;padding:14px 12px;scrollbar-width:thin;scrollbar-color:var(--dim) transparent}
#menu::-webkit-scrollbar{width:4px}
#menu::-webkit-scrollbar-thumb{background:var(--dim);border-radius:4px}
.section-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase;padding:6px 8px 8px;margin-top:4px}
.game-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;margin-bottom:3px;background:transparent;border:1px solid transparent;color:var(--text);text-align:left;cursor:pointer;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:450;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.game-btn .btn-icon{font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);min-width:22px;text-align:center;font-weight:600}
.game-btn .btn-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:capitalize}
.game-btn .btn-arrow{font-size:11px;color:var(--muted);opacity:0}
.game-btn:hover{background:var(--panel);border-color:var(--border)}
.game-btn:hover .btn-arrow{opacity:1;transform:translateX(2px)}
.game-btn:hover .btn-icon{color:var(--accent)}
.game-btn.active{background:var(--dim);border-color:var(--border-hi)}
.game-btn.active .btn-icon{color:var(--accent)}
.game-btn.active .btn-arrow{opacity:1;color:var(--accent)}
.sidebar-footer{padding:14px 20px;border-top:1px solid var(--border);font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);display:flex;justify-content:space-between;letter-spacing:.05em}
.status-badge{display:flex;align-items:center;gap:6px}
.status-badge::before{content:"●";font-size:8px;color:var(--accent)}

#main{flex:1;display:flex;flex-direction:column;background:var(--bg);position:relative;overflow:hidden}
#game-frame{flex:1;position:relative;background:#000}
iframe{width:100%;height:100%;border:none;display:block;background:#fff}
.overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20}
#placeholder{background:var(--bg)}
.placeholder-inner{text-align:center;max-width:340px;padding:20px}
.placeholder-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:0 auto 28px;width:80px}
.placeholder-grid span{height:6px;border-radius:2px;background:var(--dim)}
.placeholder-grid span:nth-child(2),.placeholder-grid span:nth-child(5),.placeholder-grid span:nth-child(8){background:var(--border-hi)}
.ph-title{font-family:'Space Mono',monospace;font-size:14px;color:var(--text);margin-bottom:10px;letter-spacing:.03em;font-weight:600}
.ph-sub{font-size:13px;color:var(--muted);line-height:1.5}
.ph-shortcut{margin-top:28px;display:inline-flex;align-items:center;gap:10px;font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:.1em}
.key{padding:3px 8px;background:var(--panel);border:1px solid var(--border-hi);border-radius:5px;color:var(--text);font-size:10px}
#loading-overlay{background:rgba(8,8,9,.92);backdrop-filter:blur(2px)}
.loader-inner{text-align:center}
.loader-bar-wrap{width:160px;height:2px;background:var(--dim);border-radius:3px;overflow:hidden;margin:0 auto 20px}
.loader-bar{height:100%;width:40%;background:var(--accent);border-radius:3px;animation:load-sweep 1s ease-in-out infinite alternate}
@keyframes load-sweep{0%{width:10%;margin-left:0%}100%{width:70%;margin-left:30%}}
.loader-text{font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:.15em;text-transform:uppercase}
.menu-skeleton{padding:4px}
.skel{height:36px;margin-bottom:4px;border-radius:8px;background:linear-gradient(90deg,var(--panel) 25%,var(--dim) 50%,var(--panel) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.hidden{display:none !important}
#container{width:100%;height:100%}
</style>
</head>
<body>

<div id="sidebar">
  <div class="brand">
    <div class="brand-eyebrow">GAME VAULT</div>
    <div class="brand-name">ZYNQ<span> GAMES</span></div>
  </div>

  <div class="search-wrap">
    <div class="search-row">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input type="text" id="search" placeholder="Search games…" autocomplete="off">
      <span class="count-badge" id="count-badge">—</span>
    </div>
  </div>

  <div id="menu">
    <div class="menu-skeleton">
      <div class="skel"></div><div class="skel" style="width:85%"></div><div class="skel"></div>
      <div class="skel" style="width:90%"></div><div class="skel" style="width:75%"></div><div class="skel"></div>
    </div>
  </div>

  <div class="sidebar-footer">
    <span class="status-badge">ONLINE</span>
    <span id="footer-count">0 TITLES</span>
  </div>
</div>

<div id="main">
  <div id="game-frame">
    <div class="overlay" id="placeholder">
      <div class="placeholder-inner">
        <div class="placeholder-grid">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
        <div class="ph-title">⟡ NO GAME LOADED ⟡</div>
        <div class="ph-sub">Select any title from the left library to start playing.<br>Instant single-file arcade.</div>
        <div class="ph-shortcut">
          <span class="key">↑</span> <span class="key">↓</span> <span style="margin:0 4px">NAVIGATE</span> <span class="key">↵</span> <span>LAUNCH</span>
        </div>
      </div>
    </div>

    <div class="overlay hidden" id="loading-overlay">
      <div class="loader-inner">
        <div class="loader-bar-wrap"><div class="loader-bar"></div></div>
        <div class="loader-text">LOADING SINGLE FILE</div>
      </div>
    </div>

    <div id="container"></div>
  </div>
</div>

<script>
(function(){
    const REPO = 'un-zynq/singlefilegames';
    const COMMIT = 'main';
    const ICONS = ['■','▲','●','◆','▸','⊕','▣','◉','⌘','✦'];

    const menuDiv = document.getElementById('menu');
    const containerDiv = document.getElementById('container');
    const placeholderDiv = document.getElementById('placeholder');
    const loadingOverlay = document.getElementById('loading-overlay');
    const searchInput = document.getElementById('search');
    const countBadge = document.getElementById('count-badge');
    const footerCountSpan = document.getElementById('footer-count');

    let allGames = [];
    let activeButton = null;
    let currentSelectedIndex = -1;
    let activeIframe = null;
    let abortController = null;

    function formatGameName(path) {
        return path.replace('.html','').replace(/-/g,' ').replace(/_/g,' ').trim();
    }

    function getIcon(index) {
        return ICONS[index % ICONS.length];
    }

    function renderGameList(gamesArray) {
        if (!gamesArray.length) {
            menuDiv.innerHTML = `<div style="padding:32px 20px;font-size:13px;color:var(--muted);text-align:center;">🎮 no matches<br>try a different keyword</div>`;
            return;
        }

        menuDiv.innerHTML = '';
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-label';
        sectionHeader.textContent = 'GAME LIBRARY';
        menuDiv.appendChild(sectionHeader);

        gamesArray.forEach((game, idx) => {
            const btn = document.createElement('button');
            btn.className = 'game-btn';
            btn.dataset.path = game.path;
            btn.dataset.index = idx;
            const gameDisplayName = formatGameName(game.path);
            btn.innerHTML = `
                <span class="btn-icon">${getIcon(idx)}</span>
                <span class="btn-label">${gameDisplayName}</span>
                <span class="btn-arrow">↳</span>
            `;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                loadSpecificGame(game.path, btn);
            });
            menuDiv.appendChild(btn);
        });
    }

    async function loadSpecificGame(path, buttonElement) {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }

        if (activeButton) activeButton.classList.remove('active');
        activeButton = buttonElement;
        activeButton.classList.add('active');

        placeholderDiv.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');

        if (activeIframe && containerDiv.contains(activeIframe)) {
            containerDiv.removeChild(activeIframe);
            activeIframe = null;
        }

        const gameTitle = formatGameName(path);
        document.title = `ZYNQ GAMES - ${gameTitle}`;

        abortController = new AbortController();
        const signal = abortController.signal;

        try {
            const rawUrl = `https://cdn.jsdelivr.net/gh/${REPO}@${COMMIT}/${path}`;
            const response = await fetch(rawUrl, { signal, cache: 'force-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const htmlContent = await response.text();

            const iframe = document.createElement('iframe');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.backgroundColor = '#000';
            iframe.style.display = 'block';
            
            containerDiv.appendChild(iframe);
            activeIframe = iframe;

            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            loadingOverlay.classList.add('hidden');
            abortController = null;

        } catch (err) {
            loadingOverlay.classList.add('hidden');
            placeholderDiv.classList.remove('hidden');
            const phTitle = placeholderDiv.querySelector('.ph-title');
            const phSub = placeholderDiv.querySelector('.ph-sub');
            if (phTitle) phTitle.textContent = '⚠️ LOAD ERROR';
            if (phSub) phSub.textContent = `Could not load "${gameTitle}". Check connection or try another game.`;
            if (activeButton) activeButton.classList.remove('active');
            activeButton = null;
            abortController = null;
        }
    }

    function filterGamesByQuery(query) {
        const lowerQuery = query.trim().toLowerCase();
        if (lowerQuery === "") {
            countBadge.textContent = allGames.length;
            renderGameList(allGames);
            return;
        }
        const filtered = allGames.filter(g => formatGameName(g.path).toLowerCase().includes(lowerQuery));
        countBadge.textContent = filtered.length;
        renderGameList(filtered);
    }

    async function initializeLibrary() {
        try {
            const apiUrl = `https://api.github.com/repos/${REPO}/git/trees/${COMMIT}?recursive=1`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
            const data = await response.json();
            const treeItems = data.tree || [];
            const htmlFiles = treeItems.filter(item => 
                item.type === 'blob' && item.path && item.path.toLowerCase().endsWith('.html')
            ).map(item => ({ path: item.path }));
            
            allGames = htmlFiles;
            countBadge.textContent = allGames.length;
            footerCountSpan.textContent = `${allGames.length} TITLES`;
            
            if (allGames.length === 0) {
                menuDiv.innerHTML = `<div style="padding:28px;font-size:13px;color:var(--muted);text-align:center;">✨ No HTML games found in repo.<br>Add .html files to /un-zynq/singlefilegames</div>`;
            } else {
                renderGameList(allGames);
            }
        } catch (err) {
            menuDiv.innerHTML = `<div style="padding:28px;font-size:13px;color:var(--accent2);background:var(--panel);margin:20px;border-radius:12px;text-align:center;">❌ Failed to fetch game library.<br>Check repo or network.</div>`;
            countBadge.textContent = '!';
            footerCountSpan.textContent = 'ERROR';
        }
    }

    function bindGlobalKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            const buttons = [...menuDiv.querySelectorAll('.game-btn')];
            if (!buttons.length) return;
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                let focusedIndex = buttons.findIndex(btn => btn === document.activeElement);
                if (focusedIndex === -1) {
                    if (currentSelectedIndex >= 0 && currentSelectedIndex < buttons.length) {
                        focusedIndex = currentSelectedIndex;
                    } else {
                        focusedIndex = -1;
                    }
                }
                let nextIndex = focusedIndex + 1;
                if (nextIndex >= buttons.length) nextIndex = 0;
                buttons[nextIndex].focus();
                currentSelectedIndex = nextIndex;
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                let focusedIndex = buttons.findIndex(btn => btn === document.activeElement);
                if (focusedIndex === -1) {
                    if (currentSelectedIndex >= 0 && currentSelectedIndex < buttons.length) {
                        focusedIndex = currentSelectedIndex;
                    } else {
                        focusedIndex = 0;
                    }
                }
                let prevIndex = focusedIndex - 1;
                if (prevIndex < 0) prevIndex = buttons.length - 1;
                buttons[prevIndex].focus();
                currentSelectedIndex = prevIndex;
            }
            else if (e.key === 'Enter') {
                const focusedBtn = document.activeElement;
                if (focusedBtn && focusedBtn.classList && focusedBtn.classList.contains('game-btn')) {
                    e.preventDefault();
                    focusedBtn.click();
                }
            }
        });
    }

    function attachSearchEvents() {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            filterGamesByQuery(query);
            currentSelectedIndex = -1;
        });
    }

    initializeLibrary();
    attachSearchEvents();
    bindGlobalKeyboardNav();
})();
</script>
</body>
</html>
```
