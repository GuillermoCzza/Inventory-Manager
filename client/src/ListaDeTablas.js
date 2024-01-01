import React from 'react';
import config from './clientConfig.json';
import tableListRequestFunction from './util/tableListRequestFunction';


export default function ListaDeTablas(props) {
	const { tableList, lang, setTable, setTableList, tableRequest, setSortField, setSearchTerm } = props;

	//create tableListRequest function for current setTableList
	const tableListRequest = tableListRequestFunction(setTableList);

	//each of the table buttons will call this on click
	const loadTable = (e) => {
		//reset sortField and searchTerm
		setSortField("");
		setSearchTerm("");
		//get the table name from the button's table property, which is the table name in the db
		const tableName = e.target.getAttribute('tabla');
		//make a request and load the table
		tableRequest(tableName,
			{
				method: 'GET', headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			}, false,
			() => {
				window.history.pushState({}, "Table List", "/")
				window.addEventListener('popstate', (_e) => {
					setTable(null);

				});
			});
	}

	function borrarTabla(e) {
		e.stopPropagation() //so it doesn't trigger the table loading of parent
		const tableName = e.target.parentNode.getAttribute('tabla');

		//perform request
		tableListRequest({
			method: 'DELETE',
			body: JSON.stringify({ tableName: tableName }),

			headers: {
				"Content-type": "application/json; charset=UTF-8"
			}
		});
	}

	//create the list of buttons to go to each table
	const lista = [];
	tableList.forEach(row => {
		const tableName = row.table_name;
		lista.push(
			<button tabla={tableName} key={tableName} onClick={loadTable} className="link-tabla">
				{tableName}
				<button className='borrar-tabla' onClick={borrarTabla}>x</button>
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
			if (newTableName === null){ //if prompt was canceled
				return;
			}
			
			//perform request
			await tableListRequest({
				method: "POST",
				redirect: 'follow',
				body: JSON.stringify({
					tableName: newTableName
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			});
		};

		return <button key="newTable-button" id="new-table-button" onClick={createTable}>+</button>;
	}
}