//import logo from './logo.svg';
import './App.css';
import React from 'react';

import config from './clientConfig.json';
import language from './language.json';

import Tabla from './Tabla.js';
import LanguageSelector from './LanguageSelector.js';


function App() {
	const [lang, setLanguage] = React.useState(language.en);
	const [tableList, setTableList] = React.useState(null);
	const [currentTable, setCurrentTable] = React.useState(null); //dont use setCurrentTable!
	//use this instead.
	const setTable = (data, tableName) => {
		if (data != null){ //when setting table to an object (not null)...
			data.tableName = tableName; //add tablename to table object so it can be retrieved in Tabla()
		}
		setCurrentTable(data);
	}

	let [loadError, setLoadError] = React.useState(null);

	React.useEffect(() => {
		fetch(config.SERVER_ADDRESS + "/tables")
			.then(res => {
				return res.json();
			})
			.then(data => {
				setTableList(data.rows);
			})
			.catch(err => {
				setLoadError(lang.error + err.toString());
			});
	}, [lang.error]);

	return (
		<div className="App">
			<header className="App-header">
				{LanguageSelector(lang, setLanguage)}
				<h1>{lang.title}</h1>
			</header>

			<div className='App-main'>
				{
					currentTable ? Tabla(currentTable, lang, setTable) : //si hay tabla elegida, mostrarla. Sino...
						(tableList ? ListaDeTablas(tableList) : //si se consiguió la lista de tablas, mostrarla. Sino...
							(!loadError ? <p>{lang.loading}</p> : loadError)) //si hubo un error al conseguir las listas, mostrarlo. Sino mostrar "loading..."
				}


			</div>
		</div>
	);

	function ListaDeTablas() {
		//each of the table buttons will call this on click
		const loadTable = (event) => {
			//get the table name from the button's table property, which is the table name in the db
			const tableName = event.target.getAttribute('tabla');
			//make a request and load the table
			fetch(`${config.SERVER_ADDRESS}/tables/${tableName}`)
				.then(res => res.json())
				.then(data => {
					setTable(data, tableName)
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
	}

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

export default App;
