const cache = {};

cache.initData = function() {
  return new Promise(function(resolve, reject) {
    data.getList("GetByTitle('OsseParentList')")
      .then((parentItems) => {
        cache.parents = parentItems;
        return data.getList("GetByTitle('OsseRequirementList')");
      }, (err) => {
        const errorObj = {
          cache: 'Error fetching OsseParentList in cache.fetchAllItems',
          data: err
        };
        reject(errorObj);
      })
      .then((requirementItems) => {
        cache.requirements = requirementItems;
        resolve({
          parents: cache.parents || [],
          requirements: cache.requirements || []
        });
      }, (err) => {
        const errorObj = {
          cache: 'Error fetching OsseRequirementList in cache.fetchAllItems',
          data: err
        };
        reject(errorObj);
      });
  });
};
