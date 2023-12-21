let config;

fetch('../config.json').then(response => {
	config = response.json();
});
//get table data
fetch('/tables')
	.then(response => response.json())
	.then(data => {
		const ListaTablas = document.getElementById('lista-tablas');
		data.rows.forEach(row => {
			console.log(config.TEMPLATE_TABLE_NAME);
			if (row.table_name != config.TEMPLATE_TABLE_NAME) {
				const tableName = row.table_name;
				ListaTablas.innerHTML += `<li><a href="/tables/${tableName}">${tableName}</a></li>`;
			}
		});
		console.log(data);
	})
	.catch(err => window.alert(err.toString()));