export default function tableListRequestFunction(setTableList) {
	//this function performs any request and automatically updates the table state
	return function (request, supressAlert = false) {
		const url = '/tables/';
		fetch(url, request)
			.then(res => res.json())
			.then(data => {
				//if the response contains an error message, throw the error
				if (data.error) {
					throw data.error;
				}

				setTableList(data.rows);
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