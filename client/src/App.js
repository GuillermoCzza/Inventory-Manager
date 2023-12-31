//import logo from './logo.svg';
import './App.css';
import React from 'react';

import language from './language.json';

import TablaApp from './TablaModule.js';
import LanguageSelector from './LanguageSelector.js';
import ListaDeTablas from './ListaDeTablas.js';
import tableRequestFunction from './util/tableRequestFunction.js';

function App() {
	const [loadError, setLoadError] = React.useState(null);
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

	//this is for searching the tables
	const [searchTerm, setSearchTerm] = React.useState("")
	const [searchField, setSearchField] = React.useState("");

	//this is for sorting the tables
	const [sortField, setSortField] = React.useState("");
	const [sortAscending, setSortAscending] = React.useState(false);

	//create tableRequest function for current sorting settings
	const tableRequest = tableRequestFunction(setTable, sortField, sortAscending);

	//reload table with current sorting if sorting state has changed
	React.useEffect(() => {
		if(currentTable){ //if currentTable isn't null
			tableRequest(currentTable.tableName);
		}
	}, [sortField, sortAscending])

	//request table list
	React.useEffect(() => {
		fetch("/tables")
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

		//these are the props that will be passed to the TablaApp component
		const passedProps = {
			currentTable,
			lang,
			setTable,
			searchField,
			setSearchField,
			searchTerm,
			setSearchTerm,
			sortField,
			setSortField,
			sortAscending,
			setSortAscending,
			tableRequest
		};

	return (
		<div className="App">
			<header className="App-header">
				{LanguageSelector(lang, setLanguage)}
				<h1>{lang.title}</h1>
			</header>

			<div className='App-main'>
				{
					currentTable ? <TablaApp  {...passedProps} /> : //si hay tabla elegida, mostrarla. Sino...
						(tableList ? <ListaDeTablas {...passedProps} setTableList={setTableList} tableList={tableList} /> : //si se consiguió la lista de tablas, mostrarla. Sino...
							(!loadError ? <p>{lang.loading}</p> : loadError)) //si hubo un error al conseguir las listas, mostrarlo. Sino mostrar "loading..."
				}


			</div>
		</div>
	);
}

export default App;
