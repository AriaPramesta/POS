const app = require('./app');
const http = require('http');
const server = http.createServer(app);
const { Good } = require('./models');
const { Op } = require('sequelize');

const { Server } = require('socket.io');
const io = new Server(server);

app.set('io', io);

io.on('connection', async (socket) => {
    console.log('User connected');

    try {
        const lowStocks = await Good.findAll({
            where: {
                stock: {
                    [Op.lt]: 10
                }
            }
        });

        const alerts = lowStocks.map(item => ({
            id: item.id,
            barcode: item.code || item.barcode,
            name: item.name,
            stock: item.stock
        }));

        socket.emit('stock-alert', alerts);
    } catch (err) {
        console.error('Gagal ambil stok rendah:', err.message);
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
