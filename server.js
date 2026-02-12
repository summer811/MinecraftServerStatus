const express = require('express');
const cors = require('cors');
const util = require('minecraft-server-util');

const app = express();

// ===== 基础配置 =====
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const MC_HOST = 'YOUR_DOMAIN';   // 修改为你的服务器地址
const MC_PORT = 25565;             // 修改为你的端口
const PORT = process.env.PORT || 3000;

// ===== 缓存配置 =====
const CACHE_TTL = 30 * 1000; // 30秒
let cache = {
    data: null,
    timestamp: 0
};

// ===== 首页 =====
app.get('/', (req, res) => {
    res.send('MC 状态 API 正在运行');
});

// ===== 健康检查 =====
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// ===== MC 状态接口 =====
app.get('/api/mc-status', async (req, res) => {

    // 使用缓存
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
        console.log('📦 使用缓存');
        return res.json(cache.data);
    }

    try {
        console.log('🔍 查询 MC 服务器...');

        const result = await util.status(MC_HOST, MC_PORT, {
            timeout: 5000
        });

        const responseData = {
            online: true,
            players: result.players.online,
            max: result.players.max,
            version: result.version.name,
            motd: result.motd,
            ping: result.roundTripLatency,
            icon: result.favicon,
            playerList: result.players.sample || [],
            timestamp: Date.now()
};


        cache.data = responseData;
        cache.timestamp = Date.now();

        console.log(`✅ 在线 ${responseData.players}/${responseData.max}`);

        res.json(responseData);

    } catch (error) {

        console.error('❌ 查询失败:', error.message);

        const offlineData = {
            online: false,
            players: 0,
            max: 0,
            error: error.message,
            timestamp: Date.now()
        };

        cache.data = offlineData;
        cache.timestamp = Date.now();

        res.json(offlineData);
    }
});

// ===== 启动服务器 =====
const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 MC 状态服务已启动');
    console.log(`🌐 访问: http://localhost:${PORT}`);
    console.log('=================================');
});

// ===== 关闭 =====
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已安全关闭');
        process.exit(0);
    });
});

