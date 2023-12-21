const express = require('express');
const app = express();
const cors = require('cors');

const config = require("./config.json");
const port = config.PORT || 3000;

const routes = require("./api.js");

const { Pool } = require('pg');
const pool = new Pool({
	user: config.DATABASE_USER,
	password: config.DATABASE_PASS,
	host: config.DATABASE_HOST,
	port: config.DATABASE_PORT,
	database: config.DATABASE_NAME,
	query_timeout: config.QUERY_TIMEOUT, //this is in miliseconds
	connectionTimeoutMillis: config.CONNECTION_TIMEOUT
});

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));

// Serving static files from the 'public' directory
app.use(express.static('public'));

//This middleware allows for CORS between client and server,
//which could be hosted at different addresses
app.use(cors({
	origin: config.CLIENT_HOST
}));

// Serve HTML of webpage and redirect to /tables
app.get('/', (req, res) => res.sendFile(process.cwd() + '/views/index.html'));

//TODO: (for the first time) if they don't exist, create database and template table

(async () => {
	try {
		await pool.connect();
		process.on('exit', () => {
			pool.end();
		});

		const SQLExampleResponse = await pool.query('SELECT $1::text as message', ['hello world!']);
		console.log(SQLExampleResponse.rows[0].message);

		routes(app, pool); //set up routes

	} catch (err) {
		console.error(err);
	}
})();

app.listen(port, () => console.log(`App listening on port ${port}!`));