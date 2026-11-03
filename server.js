const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Подключение к PostgreSQL (порт 5434!)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5434,
});

// Проверка соединения при старте
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Ошибка подключения к базе данных:', err.stack);
    }
    console.log('Успешно подключено к базе данных PostgreSQL!');
    release();
});

// Получить все записи на маникюр
app.get('/api/appointments', async (req, res) => {
    try {
        // ИСПРАВЛЕНО: берем данные из таблицы appointments
        const result = await pool.query('SELECT * FROM appointments ORDER BY appointment_date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// НОВОЕ: Добавить новую запись (понадобится для сайта)
app.post('/api/appointments', async (req, res) => {
    try {
        const { client_id, appointment_date, service_type } = req.body;
        const result = await pool.query(
            'INSERT INTO appointments (client_id, appointment_date, service_type) VALUES ($1, $2, $3) RETURNING *',
            [client_id, appointment_date, service_type]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка при добавлении');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});