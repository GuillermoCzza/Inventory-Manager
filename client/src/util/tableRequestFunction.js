import config from '../clientConfig.json'
export default function tableRequestFunction(sortField, sortAscending) {
	//this function performs any request and automatically updates the table state
	return function (tableName, body, setTable, supressAlert = false, successCallback = () => {}) {
		const url = `${config.SERVER_ADDRESS}/tables/${tableName}`;
		body.sortField = sortField;
		body.sortAscending = sortAscending;
		fetch(url, body)
			.then(res => res.json())
			.then(data => {
				//if the response contains an error message, throw the error
				if (data.error) {
					throw data.error;
				}
				setTable(data, tableName);
				successCallback();
			})
			.catch(err => {
				if (!supressAlert) {
					alert(err);
				} else {
					console.error(err);
				}
			})
	}

}