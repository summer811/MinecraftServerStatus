async function loadStatus() {

    try {
        const res = await fetch('http://YOUR_DOMAIN:PORT/api/mc-status');
        const data = await res.json();

        if (!data.online) {
            document.getElementById("status-indicator").className = "status offline";
            document.getElementById("status-indicator").innerText = "离线";
            return;
        }

        document.getElementById("status-indicator").className = "status online";
        document.getElementById("status-indicator").innerText = "在线";

        document.getElementById("players").innerText =
            `${data.players}/${data.max}`;

        document.getElementById("ping").innerText = data.ping;
        document.getElementById("version").innerText = data.version;

        if (data.icon) {
            document.getElementById("server-icon").src = data.icon;
        }

        // 渐变 MOTD
        if (data.motd && data.motd.html) {
            document.getElementById("motd").innerHTML = data.motd.html;
        }

        renderPlayers(data.playerList);

    } catch (err) {
        console.error("加载失败:", err);
    }
}

function renderPlayers(players) {

    const container = document.getElementById("player-list");
    container.innerHTML = "";

    if (!players || players.length === 0) {
        container.innerHTML = "<div style='opacity:0.6'>暂无玩家</div>";
        return;
    }

    players.forEach(p => {
        const div = document.createElement("div");
        div.className = "player";
        div.textContent = p.name;
        container.appendChild(div);
    });
}

loadStatus();
setInterval(loadStatus, 15000);

