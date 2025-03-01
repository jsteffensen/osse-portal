/**
 * Cache Service Module
 * This module provides a global in-memory cache and data preloading
 * to minimize delays when navigating through the application.
 */

// Namespace for caching functionality
window.cache = {
  // Storage for cached data
  _store: {},
  
  // Flags to track loading status
  _loading: {},
  
  // Promise objects for in-progress loads
  _promises: {},
  
  // Data load statistics
  _stats: {
    hits: 0,
    misses: 0,
    loads: 0
  }
};

/**
 * Initialize the cache service
 * @returns {Promise} Promise that resolves when initialization is complete
 */
cache.init = function() {
  console.log('Initializing cache service...');
  return data.init().then(function() {
    return cache.preloadEssentialData();
  });
};

/**
 * Preload essential data that will be needed throughout the application
 * @returns {Promise} Promise that resolves when all essential data is loaded
 */
cache.preloadEssentialData = function() {
  console.log('Preloading essential data...');
  
  // First get the digest value
  return data.getDigest().then(function(digestValue) {
    console.log('Obtained request digest for API requests');
    
    // Collection of promises for all data loads
    var promises = [];
    var keys = [];
    
    // Load lists specified in config
    if (config.lists) {
      for (var key in config.lists) {
        if (config.lists.hasOwnProperty(key)) {
          var listConfig = config.lists[key];
          var listName = listConfig.name;
          
          console.log('Preloading data from list:', listName, 'with options:', listConfig);
          
          // Add this list load to our promises and keep track of the key
          promises.push(cache.loadListItems(listName, listConfig));
          keys.push(key);
        }
      }
    }
    
    // Load current user information
    promises.push(cache.loadCurrentUser());
    keys.push('currentUser');
    
    // Load site users information
    promises.push(cache.loadSiteUsers());
    keys.push('siteUsers');
    
    // Return a promise that resolves when all data is loaded
    return Promise.all(promises).then(function(results) {
      // Assign results directly to cache object properties for easy access
      results.forEach(function(result, index) {
        var key = keys[index];
        cache[key] = result;
        console.log('Assigned preloaded data to cache.' + key + ' (' + (result ? (Array.isArray(result) ? result.length : 1) : 0) + ' items)');
      });
      
      // Process relationships between lists if needed
      if (cache.osseParentList && cache.osseRequirementList) {
        console.log('Processing OSSE data relationships...');
        
        // Create a map of parent items for faster lookup
        var parentMap = {};
        cache.osseParentList.forEach(function(parent) {
          if (parent && parent.Id) {
            parentMap[parent.Id] = parent;
            // Initialize empty children array for each parent
            parent.Requirements = [];
          }
        });
        
        // Assign each requirement to its parent
        cache.osseRequirementList.forEach(function(req) {
          if (req && req.ParentId && parentMap[req.ParentId]) {
            parentMap[req.ParentId].Requirements.push(req);
            // Add reference to parent for easier navigation
            req.Parent = parentMap[req.ParentId];
          }
        });
        
        console.log('Finished processing OSSE data relationships');
      }
      
      console.log('All essential data preloaded successfully');
      return results;
    }).catch(function(error) {
      console.error('Error in preloading data:', error);
      throw error;
    });
  });
};

/**
 * Load list items into cache
 * @param {string} listName - Name of the list to load
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with list items
 */
cache.loadListItems = function(listName, options) {
  var cacheKey = 'list:' + listName + ':' + JSON.stringify(options || {});
  
  // Check if we already have this data in cache
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Check if we're already loading this data
  if (cache._loading[cacheKey]) {
    return cache._promises[cacheKey];
  }
  
  // Mark as loading
  cache._loading[cacheKey] = true;
  cache._stats.misses++;
  cache._stats.loads++;
  
  // Start the loading process
  var promise = data.getListItems(listName, options)
    .then(function(items) {
      // Store in internal cache store
      cache._store[cacheKey] = items;
      
      // Store direct reference on the cache object
      // Find the key in config.lists that matches this list name
      var listKey = null;
      for (var key in config.lists) {
        if (config.lists[key].name === listName) {
          listKey = key;
          break;
        }
      }
      
      // If we found a key, store the data directly on the cache object
      if (listKey) {
        cache[listKey] = items;
        console.log('Assigned list data to cache.' + listKey);
      }
      
      // Clear loading state
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.log('Loaded and cached ' + items.length + ' items from list: ' + listName);
      return items;
    })
    .catch(function(error) {
      // Clear loading state on error
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.error('Error loading list items for ' + listName + ':', error);
      throw error;
    });
  
  // Store the promise
  cache._promises[cacheKey] = promise;
  
  return promise;
};

/**
 * Get cached list items or load them if not available
 * @param {string} listName - Name of the list
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with list items
 */
cache.getListItems = function(listName, options) {
  var cacheKey = 'list:' + listName + ':' + JSON.stringify(options || {});
  
  // If data is cached, return it immediately
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Otherwise load and cache it
  return cache.loadListItems(listName, options);
};

/**
 * Load a single list item by ID
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with the item
 */
cache.loadListItem = function(listName, itemId, options) {
  var cacheKey = 'listItem:' + listName + ':' + itemId + ':' + JSON.stringify(options || {});
  
  // Check if we already have this data in cache
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Check if we're already loading this data
  if (cache._loading[cacheKey]) {
    return cache._promises[cacheKey];
  }
  
  // Mark as loading
  cache._loading[cacheKey] = true;
  cache._stats.misses++;
  cache._stats.loads++;
  
  // Start the loading process
  var promise = data.getListItem(listName, itemId, options)
    .then(function(item) {
      // Store in cache
      cache._store[cacheKey] = item;
      
      // Clear loading state
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.log('Loaded and cached item #' + itemId + ' from list: ' + listName);
      return item;
    })
    .catch(function(error) {
      // Clear loading state on error
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.error('Error loading list item #' + itemId + ' from ' + listName + ':', error);
      throw error;
    });
  
  // Store the promise
  cache._promises[cacheKey] = promise;
  
  return promise;
};

/**
 * Get a cached list item or load it if not available
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with the item
 */
cache.getListItem = function(listName, itemId, options) {
  var cacheKey = 'listItem:' + listName + ':' + itemId + ':' + JSON.stringify(options || {});
  
  // If data is cached, return it immediately
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Otherwise load and cache it
  return cache.loadListItem(listName, itemId, options);
};

/**
 * Load current user information
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with user information
 */
cache.loadCurrentUser = function(options) {
  var cacheKey = 'currentUser:' + JSON.stringify(options || {});
  
  // Check if we already have this data in cache
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Check if we're already loading this data
  if (cache._loading[cacheKey]) {
    return cache._promises[cacheKey];
  }
  
  // Mark as loading
  cache._loading[cacheKey] = true;
  cache._stats.misses++;
  cache._stats.loads++;
  
  // Start the loading process
  var promise = data.getCurrentUser(options)
    .then(function(user) {
      // Store in cache
      cache._store[cacheKey] = user;
      
      // Store direct reference on the cache object
      cache.currentUser = user;
      
      // Clear loading state
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.log('Loaded and cached current user');
      return user;
    })
    .catch(function(error) {
      // Clear loading state on error
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.error('Error loading current user:', error);
      throw error;
    });
  
  // Store the promise
  cache._promises[cacheKey] = promise;
  
  return promise;
};

/**
 * Load site users information
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with site users
 */
cache.loadSiteUsers = function(options) {
  var cacheKey = 'siteUsers:' + JSON.stringify(options || {});
  
  // Check if we already have this data in cache
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Check if we're already loading this data
  if (cache._loading[cacheKey]) {
    return cache._promises[cacheKey];
  }
  
  // Mark as loading
  cache._loading[cacheKey] = true;
  cache._stats.misses++;
  cache._stats.loads++;
  
  // Start the loading process
  var promise = data.getSiteUsers(options)
    .then(function(users) {
      // Store in cache
      cache._store[cacheKey] = users;
      
      // Store direct reference on the cache object
      cache.siteUsers = users;
      
      // Create a map of users by ID for quick lookup
      cache.userMap = {};
      if (Array.isArray(users)) {
        users.forEach(function(user) {
          if (user && user.Id) {
            cache.userMap[user.Id] = user;
          }
        });
      }
      
      // Clear loading state
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.log('Loaded and cached ' + users.length + ' site users');
      return users;
    })
    .catch(function(error) {
      // Clear loading state on error
      delete cache._loading[cacheKey];
      delete cache._promises[cacheKey];
      
      console.error('Error loading site users:', error);
      throw error;
    });
  
  // Store the promise
  cache._promises[cacheKey] = promise;
  
  return promise;
};

/**
 * Get cached current user or load it if not available
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with user information
 */
cache.getCurrentUser = function(options) {
  var cacheKey = 'currentUser:' + JSON.stringify(options || {});
  
  // If data is cached, return it immediately
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Otherwise load and cache it
  return cache.loadCurrentUser(options);
};

/**
 * Get cached site users or load them if not available
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with site users
 */
cache.getSiteUsers = function(options) {
  var cacheKey = 'siteUsers:' + JSON.stringify(options || {});
  
  // If data is cached, return it immediately
  if (cache._store[cacheKey]) {
    cache._stats.hits++;
    return Promise.resolve(cache._store[cacheKey]);
  }
  
  // Otherwise load and cache it
  return cache.loadSiteUsers(options);
};

/**
 * Get a user by ID from the cached users
 * @param {number} userId - The user ID to look up
 * @returns {Object|null} The user object or null if not found
 */
cache.getUserById = function(userId) {
  // Ensure we have a userMap
  if (!cache.userMap) {
    console.warn('User map not initialized. Call cache.getSiteUsers() first.');
    return null;
  }
  
  return cache.userMap[userId] || null;
};

/**
 * Create a new item in a SharePoint list and update cache
 * @param {string} listName - Name of the list
 * @param {Object} itemData - Data for the new item
 * @returns {Promise} Promise that resolves with the created item
 */
cache.createListItem = function(listName, itemData) {
  return data.createListItem(listName, itemData)
    .then(function(newItem) {
      // Invalidate cache entries for this list
      cache.invalidateList(listName);
      
      // Reload the list data to update the direct reference
      var listKey = null;
      for (var key in config.listNames) {
        if (config.listNames[key] === listName) {
          listKey = key;
          break;
        }
      }
      
      if (listKey) {
        cache.loadListItems(listName).then(function(refreshedItems) {
          cache[listKey] = refreshedItems;
          console.log('Refreshed cache.' + listKey + ' after item creation');
        });
      }
      
      return newItem;
    });
};

/**
 * Update an existing item in a SharePoint list and update cache
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item to update
 * @param {Object} itemData - New data for the item
 * @returns {Promise} Promise that resolves when update is complete
 */
cache.updateListItem = function(listName, itemId, itemData) {
  return data.updateListItem(listName, itemId, itemData)
    .then(function(result) {
      // Invalidate cache entries for this list and item
      cache.invalidateList(listName);
      cache.invalidateListItem(listName, itemId);
      
      // Reload the list data to update the direct reference
      var listKey = null;
      for (var key in config.listNames) {
        if (config.listNames[key] === listName) {
          listKey = key;
          break;
        }
      }
      
      if (listKey) {
        cache.loadListItems(listName).then(function(refreshedItems) {
          cache[listKey] = refreshedItems;
          console.log('Refreshed cache.' + listKey + ' after item update');
        });
      }
      
      return result;
    });
};

/**
 * Delete an item from a SharePoint list and update cache
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item to delete
 * @returns {Promise} Promise that resolves when delete is complete
 */
cache.deleteListItem = function(listName, itemId) {
  return data.deleteListItem(listName, itemId)
    .then(function(result) {
      // Invalidate cache entries for this list and item
      cache.invalidateList(listName);
      cache.invalidateListItem(listName, itemId);
      
      // Reload the list data to update the direct reference
      var listKey = null;
      for (var key in config.listNames) {
        if (config.listNames[key] === listName) {
          listKey = key;
          break;
        }
      }
      
      if (listKey) {
        cache.loadListItems(listName).then(function(refreshedItems) {
          cache[listKey] = refreshedItems;
          console.log('Refreshed cache.' + listKey + ' after item deletion');
        });
      }
      
      return result;
    });
};

/**
 * Invalidate all cached items for a specific list
 * @param {string} listName - Name of the list to invalidate
 */
cache.invalidateList = function(listName) {
  console.log('Invalidating cache for list:', listName);
  
  // Find and remove all cache entries for this list
  var keysToRemove = [];
  for (var key in cache._store) {
    if (key.startsWith('list:' + listName + ':')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove the keys
  keysToRemove.forEach(function(key) {
    delete cache._store[key];
  });
  
  console.log('Invalidated ' + keysToRemove.length + ' cached items for list: ' + listName);
};

/**
 * Invalidate a specific cached list item
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item to invalidate
 */
cache.invalidateListItem = function(listName, itemId) {
  console.log('Invalidating cache for item #' + itemId + ' in list:', listName);
  
  // Find and remove all cache entries for this item
  var keysToRemove = [];
  for (var key in cache._store) {
    if (key.startsWith('listItem:' + listName + ':' + itemId + ':')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove the keys
  keysToRemove.forEach(function(key) {
    delete cache._store[key];
  });
  
  console.log('Invalidated ' + keysToRemove.length + ' cached items');
};

/**
 * Clear the entire cache
 */
cache.clear = function() {
  console.log('Clearing entire cache');
  
  // Clear internal cache store
  cache._store = {};
  
  // Clear direct references to data stored on the cache object
  if (config.lists) {
    for (var key in config.lists) {
      if (config.lists.hasOwnProperty(key)) {
        delete cache[key];
      }
    }
  }
  
  // Clear currentUser
  delete cache.currentUser;
  
  console.log('Cache cleared');
  
  // Reload essential data
  return cache.preloadEssentialData();
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
cache.getStats = function() {
  var stats = {
    hits: cache._stats.hits,
    misses: cache._stats.misses,
    loads: cache._stats.loads,
    itemCount: Object.keys(cache._store).length,
    hitRate: cache._stats.hits / (cache._stats.hits + cache._stats.misses) * 100
  };
  
  // Add direct property counts
  if (config.listNames) {
    for (var key in config.listNames) {
      if (config.listNames.hasOwnProperty(key) && cache[key]) {
        stats[key + 'Count'] = cache[key].length;
      }
    }
  }
  
  return stats;
};

/**
 * Get a sample of data for a cached list
 * @param {string} listKey - The key of the list in config.listNames
 * @param {number} [count=5] - Number of items to return
 * @returns {Array} Sample of items from the list
 */
cache.getSample = function(listKey, count) {
  count = count || 5;
  
  if (!cache[listKey]) {
    console.warn('No cached data found for: ' + listKey);
    return [];
  }
  
  return cache[listKey].slice(0, count);
};

/**
 * Find items in a cached list by filtering with a predicate function
 * @param {string} listKey - The key of the list in config.listNames
 * @param {Function} predicate - Filter function that takes an item and returns boolean
 * @returns {Array} Filtered items
 */
cache.find = function(listKey, predicate) {
  if (!cache[listKey]) {
    console.warn('No cached data found for: ' + listKey);
    return [];
  }
  
  return cache[listKey].filter(predicate);
};

/**
 * Find a single item in a cached list by ID
 * @param {string} listKey - The key of the list in config.listNames
 * @param {number} itemId - ID of the item to find
 * @returns {Object|null} Found item or null
 */
cache.findById = function(listKey, itemId) {
  if (!cache[listKey]) {
    console.warn('No cached data found for: ' + listKey);
    return null;
  }
  
  return cache[listKey].find(function(item) {
    return item.Id === itemId;
  }) || null;
};

// The cache namespace is already exported to the global scope at the top of the file