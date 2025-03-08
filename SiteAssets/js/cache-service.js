const cache = {};
cache.data = {};

cache.init = function() {
	return new Promise(function(resolve, reject) {
			data.getList("GetByTitle('OsseParentList')").then((parentItems) => {
			cache.data.parents = parentItems;
			return data.getList("GetByTitle('OsseRequirementList')");
		}, (err) => {
			const errorObj = {
			cache: 'Error fetching OsseParentList in cache.fetchAllItems',
			data: err
			};
			reject(errorObj);
		}).then((requirementItems)=>{
			cache.data.requirements = requirementItems;
			/*for(let i = 0; i<requirementItems.value.length; i++) {

			}*/
			resolve(cache.data);
		}, (err)=>{
			const errorObj = {
			cache: 'Error fetching OsseRequirementList in cache.fetchAllItems',
			data: err
			};
			reject(errorObj);
		});//.then(()=>{}, (err)=>{});
	});
};
