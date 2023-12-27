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
			res.redirect(`/tables`);
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
	app.post('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		const tableName = req.params.tableName;
		const nombre = req.body.nombre;
		const stock = req.body.stock;
		const precio = req.body.precio;
		const categoria = req.body.categoria;
		try {
			await pool.query(`INSERT INTO ${tableName}(nombre, stock, precio, categoria) VALUES($1, $2, $3, $4)`, [nombre, stock, precio, categoria]);
			const tabla = await pool.query(`SELECT * FROM ${tableName}`);
			res.json(tabla);
		} catch (err) {
			console.log('error al POST una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//TODO: modify row (the more generic the implementation, the better)
	app.put('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableName = req.params.tableName;
			const keyValuePairs = req.body.keyValuePairs; //is an array of {key, value} objects

			//find name of identifier
			let identifier = null;
			for (const pair of keyValuePairs){
				if (pair.key == config.IDENTIFIER_COLUMN){
					identifier = pair.value;
					break;
				}
			}
			if (identifier == null) {
				res.json({error: "Identifier column not found."})
				return;
			}

			//write the string for the query values
			let queryAssignmentsString = "";
			const valuesArray = [];

			let valueIndexInArr = '0';
			for(const pair of keyValuePairs){
				//skip identifier column, for it cannot be reassigned
				if (pair.key == config.IDENTIFIER_COLUMN) {
					valueIndexInArr++;
					continue;
				} 

				//write down each key and value in order
				queryAssignmentsString += `${pair.key} = $${valueIndexInArr}`;

				//if it's not the last one, add a comma to the set query string
				if (valueIndexInArr != keyValuePairs.length - 1){
					queryAssignmentsString += ", ";
				}
				valuesArray.push(pair.value);

				valueIndexInArr++;
			}

			//perform the row updating
			const query = `UPDATE ${tableName} SET ${queryAssignmentsString} WHERE ${config.IDENTIFIER_COLUMN}='${identifier}'`
			await pool.query(query, valuesArray);

			//send back the updated table
			const tabla = await pool.query(`SELECT * FROM ${tableName}`);
			res.json(tabla);
		} catch (err) {
			console.log('error al PUT (modificar) una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	});

	//TODO: delete row
	app.delete('/tables/:tableName', tableNameToLowerCase, protectTemplate, async (req, res) => {
		try {
			const tableName = req.params.tableName;
			console.log(req.body.row);
			const id = req.body.row[config.IDENTIFIER_COLUMN]; //row is the node-pg sql row object (json)
			
			//perform the row deletion
			await pool.query(`DELETE FROM ${tableName} WHERE ${config.IDENTIFIER_COLUMN}=$1`, [id]);

			//send back the updated table
			const tabla = await pool.query(`SELECT * FROM ${tableName}`);
			res.json(tabla);
		} catch (err) {
			console.log('error al DELETE una fila');
			console.error(err);
			res.json({ error: err.toString() });
		}
	})
};