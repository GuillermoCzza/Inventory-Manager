//import logo from './logo.svg';
import './App.css';
import React from 'react';

import config from './clientConfig.json';
import language from './language.json';
import Tabla from './Tabla.js';


function App() {
	const [lang, setLanguage] = React.useState(language.en);
	const [tableList, setTableList] = React.useState(null);
	const [currentTable, setCurrentTable] = React.useState(null);
	let [loadError, setLoadError] = React.useState(null);

	React.useEffect(() => {
		setCurrentTable(null);
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
				<LanguageSelector />
				{/* <img src={logo} className="App-logo" alt="logo" /> */}
				<h1>{lang.title}</h1>
			</header>

			<div className='App-main'>

				{currentTable ? Tabla(currentTable) :
					(tableList ? ListaDeTablas(tableList) :
						(!loadError ? <p>{lang.loading}</p> : loadError))}


			</div>
		</div>
	);

	function ListaDeTablas(tablas) {
		//each of the table buttons will call this on click
		const loadTable = (event) => {
			//get the table name from the button's table property, which is the table name in the db
			const tableName = event.target.getAttribute('table');
			//make a request and load the table
			fetch(`${config.SERVER_ADDRESS}/tables/${tableName}`)
				.then(res => res.json())
				.then(data => {
					data.tableName = tableName; //add tablename to table object so it can be retrieved in Tabla()
					setCurrentTable(data);
				})
				.catch(err => {
					alert(lang.error + err.toString());
				});

		}

		//create the list of buttons to go to each table
		const lista = [];
		tablas.forEach(row => {
			const tableName = row.table_name;
			lista.push(
				<button key={`${tableName}-table-button`} onClick={loadTable} className="link-tabla">
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

	//language change select element
	function LanguageSelector() {
		const changeLanguage = (event) => {
			const selectedLanguage = event.target.value;
			setLanguage(language[selectedLanguage]);
		}

		return (
			<div id="language-selection">
				<p>{lang.language}</p>
				<select value={lang.code} onChange={changeLanguage}>
					<option value="en">English</option>
					<option value="es">Español</option>
				</select>
			</div>
		)
	}
}

export default App;
