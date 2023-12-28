//import logo from './logo.svg';
import './App.css';
import React from 'react';

import config from './clientConfig.json';
import language from './language.json';

import Tabla from './TablaApp.js';
import LanguageSelector from './LanguageSelector.js';
import ListaDeTablas from './ListaDeTablas.js';


function App() {

	const [lang, setLanguage] = React.useState(language.en);
	const [tableList, setTableList] = React.useState(null);
	const [currentTable, setCurrentTable] = React.useState(null); //dont use setCurrentTable!
	//use this instead.
	function setTable(data, tableName) {
		if (data != null) { //when setting table to an object (not null)...
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
					currentTable ? <Tabla currentTable={currentTable}
						lang={lang} setTable={setTable} /> : //si hay tabla elegida, mostrarla. Sino...
						(tableList ? <ListaDeTablas tableList={tableList}
							lang={lang} setTable={setTable} setTableList={setTableList}/> : //si se consiguió la lista de tablas, mostrarla. Sino...
							(!loadError ? <p>{lang.loading}</p> : loadError)) //si hubo un error al conseguir las listas, mostrarlo. Sino mostrar "loading..."
				}


			</div>
		</div>
	);
}

export default App;
