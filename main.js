const express = require('express');

const client = require('./db');

const app = express();
const port = 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
	try {
		const resuls = await client.query(`SELECT * FROM public.users WHERE Статус= 'On' ORDER BY Зарегистрирован`);
		resuls.rows.map((row) => {
			row['Зарегистрирован'] = new Date(row['Зарегистрирован'] * 1000).toLocaleString();
		})
		await res.render('index', { rows: resuls.rows });
	} catch (error) {
		console.error(error);
		res.render('index', { error: error });
	}
});

app.listen(port, () => {
	console.log(`Приложение запущенно на порту ${port}`);
})
