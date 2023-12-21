const format = require('pg-format');
const config = require("./config.json");
const { tableNameToLowerCase, protectTemplate } = require('./middleware.js');

/**
* @param {import('express').Express} app
* @param {import('pg').Pool} pool
**/
module.exports = (app, pool) => {


	app.get('/test', (req, res) => {
		console.log("recibido GET /test");
		res.json({ test: true });
	});

	//get all tables in the database
	app.get('/tables', async (req, res) => {
		try {
			const tablas = await pool.query("SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
			//remove template table from results
			for (const index in tablas.rows) {
				if (tablas.rows[index].table_name == config.TEMPLATE_TABLE_NAME) {
					tablas.rows.splice(index, 1);
					break;
				}
			}

			res.json(tablas);
		} catch (err) {
			res.json({ error: err });
			console.error(err);
			console.log('error al GET todas las tablas');
		}
	});

	//create a new table
	app.post('/tables', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableString = req.body.tableName.trim().replace(/\s+/, '_');
			const tableName = encodeURIComponent(tableString); //this is necessary because pg doesn't do safe identifier insertion (though it does do other query parameters safely)
			const escapedIdentifier = format.ident(tableName);

			//tables are created from template table to have the same column types
			await pool.query(`CREATE TABLE ${escapedIdentifier} (LIKE ${config.TEMPLATE_TABLE_NAME} INCLUDING ALL)`);
			res.redirect(`/tables/${escapedIdentifier}`);
		} catch (err) {
			console.log('error al POST una tabla');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});


	//TODO: delete table (except template table). Falta testear
	app.delete('/tables', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableName = req.body.tableName;
			await pool.query(`DROP TABLE ${tableName}`);
			res.redirect('/tables');
		} catch (err) {
			console.log('error al DELETE una tabla');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//Get a specific table
	app.get('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		const tableName = req.params.tableName;
		try {
			const tabla = await pool.query(`SELECT * FROM ${tableName}`);
			res.json(tabla);
		} catch (err) {
			console.log('error al GET una tabla');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});


	//TODO: add row
	app.put('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		const tableName = req.params.tableName;
		const nombre = req.body.nombre;
		const stock = req.body.stock;
		const precio = req.body.precio;
		const categoria = req.body.categoría;
		try {
			pool.query(`INSERT INTO ${tableName}(nombre, stock, precio, categoria) VALUES($1, $2, $3, $4)`, [nombre, stock, precio, categoria]);
		} catch (err) {
			console.log('error al POST una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//TODO: modify row (the more generic the implementation, the better)

	//TODO: delete row
};