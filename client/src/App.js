//import logo from './logo.svg';
import './App.css';
import React from 'react';

import config from './clientConfig.json';
import language from './language.json';
import plusSign from './plus.png'

function ListaDeTablas(tablas) {
	const lista = [];
	tablas.forEach(row => {
		const tableName = row.table_name;
		lista.push(
			<a href={`${config.SERVER_ADDRESS}/tables/${tableName}`} className="link-tabla">
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
				console.log(data.rows);
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
			/*I'll implement this later*/
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
				<select onChange={changeLanguage}>
					<option value="en">English</option>
					<option value="es">Español</option>
				</select>
			</div>
		)
	}
}

export default App;
