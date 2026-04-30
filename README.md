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
        body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg-deep);color:var(--text-main);display:flex;margin:0;height:100vh;overflow:hidden}
        #sidebar{width:280px;background:var(--bg-surface);border-right:1px solid var(--border);display:flex;flex-direction:column}
        .sidebar-header{padding:24px 20px;border-bottom:1px solid var(--border)}
        .sidebar-header h2{margin:0;font-size:1.25rem;font-weight:600;letter-spacing:-.025em}
        #menu{flex-grow:1;overflow-y:auto;padding:16px}
        #menu::-webkit-scrollbar{width:6px}
        #menu::-webkit-scrollbar-thumb{background:var(--border);border-radius:10px}
        .game-btn{display:block;width:100%;padding:12px 16px;margin-bottom:8px;background:var(--bg-button);border:1px solid var(--border);color:var(--text-main);text-align:left;cursor:pointer;border-radius:8px;font-size:.9rem;transition:all .2s cubic-bezier(.4,0,.2,1)}
        .game-btn:hover{background:#27272a;border-color:#3f3f46;transform:translateY(-1px)}
        .game-btn.active{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 4px 12px rgba(59,130,246,.25)}
        #main{flex-grow:1;display:flex;flex-direction:column;background:#000;position:relative}
        iframe{width:100%;height:100%;border:none;background:#fff;opacity:0;transition:opacity .3s ease}
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
        <div id="loading-screen" class="status-layer hidden"><div class="loader"></div><p>Initializing Game...</p></div>
        <div id="container" style="width:100%;height:100%"></div>
    </div>
    <script>
        const repo="un-zynq/singlefilegames",commit="main",menu=document.getElementById('menu'),container=document.getElementById('container'),placeholder=document.getElementById('placeholder'),loader=document.getElementById('loading-screen');
        async function init(){try{const e=await fetch(`https://api.github.com/repos/${repo}/git/trees/main`),t=await e.json(),n=t.tree.filter(e=>"blob"===e.type&&e.path.endsWith(".html"));menu.innerHTML="",n.forEach(e=>{const t=document.createElement("button");t.className="game-btn",t.textContent=e.path.replace(".html","").replace(/-/g," "),t.onclick=()=>loadGame(e.path,t),menu.appendChild(t)})}catch(e){menu.innerHTML='<div style="color:#ef4444;font-size:.8rem">Failed to load library.</div>'}}
        async function loadGame(path,btn){document.querySelectorAll(".game-btn").forEach(e=>e.classList.remove("active")),btn.classList.add("active"),placeholder.classList.add("hidden"),loader.classList.remove("hidden"),container.innerHTML="";try{const e=await fetch(`https://cdn.jsdelivr.net/gh/${repo}@${commit}/${path}`),t=await e.text(),n=document.createElement("iframe");n.id="active-game",n.onload=()=>{setTimeout(()=>{n.classList.add("loaded"),loader.classList.add("hidden")},100)},container.appendChild(n);const a=n.contentWindow.document;a.open(),a.write(t),a.close()}catch(e){loader.classList.add("hidden"),placeholder.classList.remove("hidden"),placeholder.innerHTML='<p style="color:#ef4444">Error loading game data.</p>'}}
        init();
    </script>
</body>
</html>
```

to load them in
