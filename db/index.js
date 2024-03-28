const { Client } = require('pg');
const { parse } = require('csv-parse');
const fs = require('fs');

const client = new Client({
	host: 'localhost',
	user: 'postgres',
	password: '111111',
	database: 'TargemTask',
	port: 5432,
});

const processFile = async () => {
	const records = [];
	const parser = fs
		.createReadStream(`${__dirname}/data.csv`)
		.pipe(parse({
			columns: true,
			delimiter: ';'
		}));
	for await (const record of parser) {
		let datetime = record['Зарегистрирован'].split(' ');
		const time = datetime[1].split(':');
		const date = datetime[0].split('.');
		record['Зарегистрирован'] = Date.parse(new Date(date[2], date[1] - 1, date[0], time[0], time[1])) / 1000;
		records.push(record);
	}
	return records;
};

client.connect()
	.then(() => console.log('Соединение с БД утсановленно'))
	.catch(err => console.error('Ошибка соединения с БД: ', err.stack));

(async () => {
	const records = await processFile();

	await client.query('DROP TABLE IF EXISTS public.users;', (err, res) => {
		console.log(err, res);
	});

	await client.query(`CREATE TABLE IF NOT EXISTS public.users(
			id SERIAL,
			Ник text COLLATE pg_catalog."default",
			Email text COLLATE pg_catalog."default",
			Зарегистрирован integer,
			Статус text COLLATE pg_catalog."default",
			CONSTRAINT users_pkey PRIMARY KEY (id))`, (err, res) => {
		console.log(err, res);
	});

	await client.query(`INSERT INTO public.users(Ник, Email, Зарегистрирован, Статус) VALUES ${records.map((item, index) => `($${1 + 4 * index}, $${2 + 4 * index}, $${3 + 4 * index}, $${4 + 4 * index})`).join(', ')}`, records.reduce((record, item) => record.concat([item['Ник'], item['Email'], item['Зарегистрирован'], item['Статус']]), []), (err, res) => {
		console.log(err, res);
	})

	// console.info(records);
})();

module.exports = client;