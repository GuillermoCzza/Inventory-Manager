import config from '../clientConfig.json'
export default function tableRequestFunction(setTable, sortField, sortAscending) {
	//this function performs any request and automatically updates the table state
	return function (tableName, request, supressAlert = false, successCallback = () => { }) {
		console.log(sortField);
		console.log(sortAscending);
		const query = new URLSearchParams({ sortField, sortAscending });
		const url = `${config.SERVER_ADDRESS}/tables/${tableName}?${query}`;
		fetch(url, request)
			.then(res => res.json())
			.then(data => {
				//if the response contains an error message, throw the error
				if (data.error) {
					throw data.error;
				}

				console.log(JSON.stringify(data));

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