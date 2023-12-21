//import logo from './logo.svg';
import './App.css';
import React from 'react';

import config from './clientConfig.json';
import language from './language.json';

function ListaDeTablas(tablas) {
	const lista = [];
	tablas.forEach(row => {
		const tableName = row.table_name;
		lista.push(
			<a key={tableName} href={`${config.SERVER_ADDRESS}/tables/${tableName}`} className="link-tabla">
				{row.table_name}
			</a>
		);
	});

	return lista;
}

function Tabla(tabla) {
	return (
		<p></p>
	);
}





function App() {
	const [lang, setLanguage] = React.useState(language.en);
	const [tableList, setTableList] = React.useState(null);
	const [currentTable, setCurrentTable] = React.useState(null);



	React.useEffect(() => {
		setCurrentTable(null);
		fetch(config.SERVER_ADDRESS + "/tables")
			.then(res => {
				return res.json();
			})
			.then(data => {
				setTableList(data.rows);
			})
			.catch(err => console.error("An error has ocurred: ", err));
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<LanguageSelector />
				{/* <img src={logo} className="App-logo" alt="logo" /> */}
				<h1>{lang.title}</h1>
			</header>

			<div className='App-main'>
				<div id="lista-tablas">
					{currentTable ? Tabla(currentTable) :
						(tableList ? ListaDeTablas(tableList) :
							<p>{lang.loading}</p>)}
					<NewTableButton />
				</div>
			</div>
		</div>
	);

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
		return <button id="new-table-button" onClick={createTable}>+</button>;
	}

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
