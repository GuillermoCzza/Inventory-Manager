import React from 'react';
import config from './clientConfig.json';


export default function ListaDeTablas(props) {
	const { tableList, lang, setTable, setTableList } = props;

	//each of the table buttons will call this on click
	const loadTable = (event) => {
		//get the table name from the button's table property, which is the table name in the db
		const tableName = event.target.getAttribute('tabla');
		//make a request and load the table
		fetch(`${config.SERVER_ADDRESS}/tables/${tableName}`)
			.then(res => res.json())
			.then(data => {
				setTable(data, tableName)

				//the first time it renders, push the home page into history stack so you can go back with the broser button,
				//And set currentTable to null when going back so the table list is actually shown
				window.history.pushState({}, "Table List", "/")
				window.addEventListener('popstate', (_e) => {
					setTable(null);

				});
			})
			.catch(err => {
				alert(lang.error + err.toString());
			});

	}

	//create the list of buttons to go to each table
	const lista = [];
	tableList.forEach(row => {
		const tableName = row.table_name;
		lista.push(
			<button tabla={tableName} key={tableName} onClick={loadTable} className="link-tabla">
				{tableName}
			</button>
		);
	});

	return <div id="lista-tablas">
		{lista.concat(<NewTableButton />)}
	</div>;

	//button to create a new table
	function NewTableButton() {
		const createTable = async () => {
			const newTableName = prompt(lang.newTablePrompt)
			await fetch(`${config.SERVER_ADDRESS}/tables`, {
				method: "POST",
				redirect: 'follow',
				body: JSON.stringify({
					tableName: newTableName
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			})
				.then(res => res.json())
				.then(data => {
					setTableList(data.rows);
				})
				.catch(err => { alert(lang.error + err) });
		};

		return <button key="newTable-button" id="new-table-button" onClick={createTable}>+</button>;
	}
}