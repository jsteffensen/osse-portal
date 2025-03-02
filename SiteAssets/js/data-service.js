/**
 * SharePoint Data Service Module
 * This module provides functions to interact with SharePoint APIs
 * using Bluebird promises for better performance and error handling.
 */

// Namespace for configuration settings
window.config = {};

// Namespace for data service functions
window.data = {};

// Cache object to store results
data._cache = {};

/**
 * Initialize the data service by loading configuration
 * @returns {Promise} Promise that resolves when initialization is complete
 */
data.init = function() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: '../SiteAssets/config.json',
      dataType: 'json',
      cache: false,
      success: function(configData) {
        // Load the config data into the config namespace
        for (var key in configData) {
          config[key] = configData[key];
        }
        
        // Ensure derived endpoints are correct
        config.apiListEndpoint = config.apiEndpoint + 'Web/Lists/';
        config.apiUserEndpoint = config.apiEndpoint + 'Web/Siteusers/';
        
        console.log('Data service initialized successfully');
        resolve(config);
      },
      error: function(xhr, status, error) {
        console.error('Failed to load configuration:', error);
        reject(error);
      }
    });
  });
};

/**
 * Helper for creating SharePoint REST API requests
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} Promise that resolves with the API response
 */
data._request = function(endpoint, options) {
  options = options || {};
  var method = options.method || 'GET';
  var headers = {
    'Accept': 'application/json;odata=verbose',
    'Content-Type': 'application/json;odata=verbose'
  };
  
  // Cache key for GET requests
  var cacheKey = null;
  if (method === 'GET') {
    cacheKey = endpoint + JSON.stringify(options.data || {});
    
    // Check cache first
    var cachedData = data._getFromCache(cacheKey);
    if (cachedData) {
      console.log('Using cached data for:', endpoint);
      return Promise.resolve(cachedData);
    }
  }
  
  // Function to perform the actual request
  function performRequest(digestValue) {
    // Add SharePoint request digest for non-GET requests
    if (method !== 'GET' && digestValue) {
      headers['X-RequestDigest'] = digestValue;
    }
    
    // Add any custom headers
    if (options.headers) {
      for (var key in options.headers) {
        headers[key] = options.headers[key];
      }
    }
    
    // Create promise with jQuery AJAX
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: endpoint,
        type: method,
        headers: headers,
        data: JSON.stringify(options.data),
        success: function(response) {
          // For GET requests, cache the result
          if (method === 'GET' && cacheKey) {
            data._addToCache(cacheKey, response);
          }
          resolve(response);
        },
        error: function(xhr, status, error) {
          console.error('API request failed:', endpoint, error);
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: error
          });
        }
      });
    });
  }
  
  // For GET requests, we don't need a digest
  if (method === 'GET') {
    return performRequest();
  }
  
  // For non-GET requests, ensure we have a valid digest first
  return data.ensureDigest().then(function(digestValue) {
    return performRequest(digestValue);
  });
};

/**
 * Add data to the cache with timestamp
 * @param {string} key - Cache key
 * @param {Object} value - Data to cache
 */
data._addToCache = function(key, value) {
  data._cache[key] = {
    timestamp: new Date(),
    data: value
  };
};

/**
 * Get data from cache if not expired
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null if expired/not found
 */
data._getFromCache = function(key) {
  var cached = data._cache[key];
  if (!cached) return null;
  
  var now = new Date();
  var cacheTimeout = config.cacheTimeoutMinutes * 60 * 1000; // minutes to ms
  if ((now - cached.timestamp) > cacheTimeout) {
    // Cache expired
    delete data._cache[key];
    return null;
  }
  
  return cached.data;
};

/**
 * Clear the entire cache or a specific key
 * @param {string} [key] - Optional key to clear specific item
 */
data.clearCache = function(key) {
  if (key) {
    delete data._cache[key];
  } else {
    data._cache = {};
  }
  console.log(key ? 'Cleared cache for: ' + key : 'Cleared all cache');
};

/**
 * Get items from a SharePoint list
 * @param {string} listName - Name of the list
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with list items
 */
data.getListItems = function(listName, options) {
  options = options || {};
  
  // Build the endpoint URL
  var endpoint = config.apiListEndpoint + 
    "getbytitle('" + listName + "')/items";
  
  // Add query parameters
  var queryParams = [];
  
  // Select specific fields
  if (options.select) {
    queryParams.push('$select=' + options.select);
  }
  
  // Filter items
  if (options.filter) {
    queryParams.push('$filter=' + options.filter);
  }
  
  // Order items
  if (options.orderBy) {
    queryParams.push('$orderby=' + options.orderBy);
  }
  
  // Limit number of items
  if (options.top) {
    queryParams.push('$top=' + options.top);
  } else if (config.defaultPageSize) {
    queryParams.push('$top=' + config.defaultPageSize);
  }
  
  // Skip items (for paging)
  if (options.skip) {
    queryParams.push('$skip=' + options.skip);
  }
  
  // Expand related items
  if (options.expand) {
    queryParams.push('$expand=' + options.expand);
  }
  
  // Add query parameters to endpoint
  if (queryParams.length > 0) {
    endpoint += '?' + queryParams.join('&');
  }
  
  // Function to load from fallback file
  function loadFallbackData(fallbackFile) {
    console.log('Loading data from fallback file: ' + fallbackFile);
    
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: fallbackFile,
        dataType: 'json',
        cache: false,
        success: function(fallbackData) {
          console.log('Successfully loaded fallback data');
          // Only support newer format (value array)
          if (fallbackData.value !== undefined) {
            resolve(fallbackData.value);
          } else {
            console.warn('Unexpected fallback data format:', fallbackData);
            resolve([]);
          }
        },
        error: function(xhr, status, fallbackError) {
          console.error('Fallback file failed to load:', fallbackError);
          reject(fallbackError);
        }
      });
    });
  }
  
  // Get the fallback file path if available
  var fallbackFile = null;
  for (var key in config.lists) {
    if (config.lists[key].name === listName && config.lists[key].fallbackFile) {
      fallbackFile = config.lists[key].fallbackFile;
      break;
    }
  }
  
  // If config says to use fallback data and we have a fallback file, use it directly
  if (config.useFallbackData === true && fallbackFile) {
    console.log('Using fallback data instead of API for list: ' + listName);
    return loadFallbackData(fallbackFile);
  }
  
  // Otherwise try the API first, then fall back if it fails
  return data._request(endpoint)
    .then(function(response) {
      // Extract the items from the response
      // Only support newer format (value array)
      if (response.value !== undefined) {
        return response.value;
      } else {
        console.warn('Unexpected API response format:', response);
        return [];
      }
    })
    .catch(function(error) {
      // If we have a fallback file, try to load it
      if (fallbackFile) {
        console.warn('API request failed for list ' + listName + '. Trying fallback file: ' + fallbackFile);
        return loadFallbackData(fallbackFile).catch(function(fallbackError) {
          console.error('Both API request and fallback file failed for list: ' + listName);
          console.error('Original error:', error);
          console.error('Fallback error:', fallbackError);
          throw error; // Throw the original error
        });
      } else {
        // No fallback file, propagate the original error
        console.error('API request failed for list ' + listName + ' and no fallback file specified');
        throw error;
      }
    });
};

/**
 * Get a single item from a SharePoint list by ID
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with the item
 */
data.getListItem = function(listName, itemId, options) {
  options = options || {};
  
  // Build the endpoint URL
  var endpoint = config.apiListEndpoint + 
    "getbytitle('" + listName + "')/items(" + itemId + ")";
  
  // Add query parameters
  var queryParams = [];
  
  // Select specific fields
  if (options.select) {
    queryParams.push('$select=' + options.select);
  }
  
  // Expand related items
  if (options.expand) {
    queryParams.push('$expand=' + options.expand);
  }
  
  // Add query parameters to endpoint
  if (queryParams.length > 0) {
    endpoint += '?' + queryParams.join('&');
  }
  
  // Make the request
  return data._request(endpoint)
    .then(function(response) {
      // Handle both older SP format (response.d) and newer format (response directly)
      if (response.d) {
        return response.d;
      } else {
        return response;
      }
    });
};

/**
 * Create a new item in a SharePoint list
 * @param {string} listName - Name of the list
 * @param {Object} itemData - Data for the new item
 * @returns {Promise} Promise that resolves with the created item
 */
data.createListItem = function(listName, itemData) {
  // Build the endpoint URL
  var endpoint = config.apiListEndpoint + 
    "getbytitle('" + listName + "')/items";
  
  // Make the request
  return data._request(endpoint, {
    method: 'POST',
    data: itemData
  }).then(function(response) {
    // Clear cache for this list
    data.clearCache(config.apiListEndpoint + "getbytitle('" + listName + "')/items");
    // Handle both older SP format (response.d) and newer format (response directly)
    if (response.d) {
      return response.d;
    } else {
      return response;
    }
  });
};

/**
 * Update an existing item in a SharePoint list
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item to update
 * @param {Object} itemData - New data for the item
 * @returns {Promise} Promise that resolves when update is complete
 */
data.updateListItem = function(listName, itemId, itemData) {
  // Build the endpoint URL
  var endpoint = config.apiListEndpoint + 
    "getbytitle('" + listName + "')/items(" + itemId + ")";
  
  // Make the request
  return data._request(endpoint, {
    method: 'MERGE',
    headers: {
      'X-HTTP-Method': 'MERGE',
      'If-Match': '*'
    },
    data: itemData
  }).then(function(response) {
    // Clear cache for this list
    data.clearCache(config.apiListEndpoint + "getbytitle('" + listName + "')/items");
    data.clearCache(endpoint);
    return response;
  });
};

/**
 * Delete an item from a SharePoint list
 * @param {string} listName - Name of the list
 * @param {number} itemId - ID of the item to delete
 * @returns {Promise} Promise that resolves when delete is complete
 */
data.deleteListItem = function(listName, itemId) {
  // Build the endpoint URL
  var endpoint = config.apiListEndpoint + 
    "getbytitle('" + listName + "')/items(" + itemId + ")";
  
  // Make the request
  return data._request(endpoint, {
    method: 'DELETE',
    headers: {
      'X-HTTP-Method': 'DELETE',
      'If-Match': '*'
    }
  }).then(function(response) {
    // Clear cache for this list
    data.clearCache(config.apiListEndpoint + "getbytitle('" + listName + "')/items");
    return response;
  });
};

/**
 * Get the current user information
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with user information
 */
data.getCurrentUser = function(options) {
  options = options || {};
  
  // Get user configuration
  var userConfig = config.users && config.users.currentUser;
  var endpoint = config.apiEndpoint + (userConfig ? userConfig.endpoint : 'web/currentuser');
  
  // Add query parameters
  var queryParams = [];
  
  // Select specific fields
  if (options.select) {
    queryParams.push('$select=' + options.select);
  }
  
  // Expand related items
  if (options.expand) {
    queryParams.push('$expand=' + options.expand);
  }
  
  // Add query parameters to endpoint
  if (queryParams.length > 0) {
    endpoint += '?' + queryParams.join('&');
  }
  
  // Function to load from fallback file
  function loadFallbackData() {
    if (userConfig && userConfig.fallbackFile) {
      console.log('Loading current user from fallback file:', userConfig.fallbackFile);
      
      return new Promise(function(resolve, reject) {
        $.ajax({
          url: userConfig.fallbackFile,
          dataType: 'json',
          cache: false,
          success: function(fallbackData) {
            console.log('Successfully loaded current user from fallback data');
            // Handle both formats: plain object or object with d property
            if (fallbackData.d) {
              resolve(fallbackData.d);
            } else {
              resolve(fallbackData);
            }
          },
          error: function(xhr, status, fallbackError) {
            console.error('Failed to load fallback current user data:', fallbackError);
            reject(fallbackError);
          }
        });
      });
    } else {
      return Promise.reject(new Error('No fallback file specified for current user'));
    }
  }
  
  // If using fallback data directly
  if (config.useFallbackData === true && userConfig && userConfig.fallbackFile) {
    console.log('Using fallback data instead of API for current user');
    return loadFallbackData();
  }
  
  // Make the request with fallback
  return data._request(endpoint)
    .then(function(response) {
      return response.d;
    })
    .catch(function(error) {
      console.warn('API request failed for current user. Trying fallback file.');
      return loadFallbackData().catch(function(fallbackError) {
        console.error('Both API request and fallback file failed for current user');
        console.error('Original error:', error);
        console.error('Fallback error:', fallbackError);
        throw error; // Throw the original error
      });
    });
};

/**
 * Get user profile information
 * @param {string} [loginName] - Optional login name (defaults to current user)
 * @returns {Promise} Promise that resolves with profile information
 */
data.getUserProfile = function(loginName) {
  var promise;
  
  // If no login name provided, get current user first
  if (!loginName) {
    promise = data.getCurrentUser().then(function(user) {
      return user.LoginName;
    });
  } else {
    promise = Promise.resolve(loginName);
  }
  
  return promise.then(function(login) {
    // Build the endpoint URL
    var endpoint = config.apiEndpoint + 
      "SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + 
      encodeURIComponent(login) + "'";
    
    // Make the request
    return data._request(endpoint)
      .then(function(response) {
        return response.d;
      });
  });
};

/**
 * Get all users in the site
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with the site users
 */
data.getSiteUsers = function(options) {
  options = options || {};
  
  // Get user configuration
  var userConfig = config.users && config.users.siteUsers;
  var endpoint = config.apiEndpoint + (userConfig ? userConfig.endpoint : 'web/siteusers');
  
  // Add query parameters
  var queryParams = [];
  
  // Select specific fields
  if (options.select) {
    queryParams.push('$select=' + options.select);
  }
  
  // Filter users
  if (options.filter) {
    queryParams.push('$filter=' + options.filter);
  }
  
  // Order by
  if (options.orderBy) {
    queryParams.push('$orderby=' + options.orderBy);
  }
  
  // Add query parameters to endpoint
  if (queryParams.length > 0) {
    endpoint += '?' + queryParams.join('&');
  }
  
  // Function to load from fallback file
  function loadFallbackData() {
    if (userConfig && userConfig.fallbackFile) {
      console.log('Loading site users from fallback file:', userConfig.fallbackFile);
      
      return new Promise(function(resolve, reject) {
        $.ajax({
          url: userConfig.fallbackFile,
          dataType: 'json',
          cache: false,
          success: function(fallbackData) {
            console.log('Successfully loaded site users from fallback data');
            // Only support newer format (value array)
            if (fallbackData.value !== undefined) {
              resolve(fallbackData.value);
            } else {
              console.warn('Unexpected fallback data format:', fallbackData);
              resolve([]);
            }
          },
          error: function(xhr, status, fallbackError) {
            console.error('Failed to load fallback site users data:', fallbackError);
            reject(fallbackError);
          }
        });
      });
    } else {
      return Promise.reject(new Error('No fallback file specified for site users'));
    }
  }
  
  // If using fallback data directly
  if (config.useFallbackData === true && userConfig && userConfig.fallbackFile) {
    console.log('Using fallback data instead of API for site users');
    return loadFallbackData();
  }
  
  // Make the request with fallback
  return data._request(endpoint)
    .then(function(response) {
      // Only support newer format (value array)
      if (response.value !== undefined) {
        return response.value;
      } else {
        console.warn('Unexpected API response format:', response);
        return [];
      }
    })
    .catch(function(error) {
      console.warn('API request failed for site users. Trying fallback file.');
      return loadFallbackData().catch(function(fallbackError) {
        console.error('Both API request and fallback file failed for site users');
        console.error('Original error:', error);
        console.error('Fallback error:', fallbackError);
        throw error; // Throw the original error
      });
    });
};

/**
 * Get all lists in the site
 * @param {Object} [options] - Query options
 * @returns {Promise} Promise that resolves with the lists
 */
data.getLists = function(options) {
  options = options || {};
  
  // Build the endpoint URL
  var endpoint = config.apiEndpoint + 'web/lists';
  
  // Add query parameters
  var queryParams = [];
  
  // Select specific fields
  if (options.select) {
    queryParams.push('$select=' + options.select);
  } else {
    queryParams.push('$select=Id,Title,ItemCount,LastItemModifiedDate');
  }
  
  // Filter lists
  if (options.filter) {
    queryParams.push('$filter=' + options.filter);
  }
  
  // Add query parameters to endpoint
  if (queryParams.length > 0) {
    endpoint += '?' + queryParams.join('&');
  }
  
  // Make the request
  return data._request(endpoint)
    .then(function(response) {
      if (response.value !== undefined) {
        return response.value;
      } else {
        console.warn('Unexpected API response format for getLists:', response);
        return [];
      }
    });
};

/**
 * Get the SharePoint request digest value
 * This is required for POST operations
 * @returns {Promise} Promise that resolves with the request digest value
 */
data.getDigest = function() {
  // Create a fallback file path for digest
  var fallbackDigestFile = '../SiteAssets/FallbackData/digest.json';
  
  // Function to load from fallback file
  function loadFallbackDigest() {
    console.log('Loading digest from fallback file:', fallbackDigestFile);
    
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: fallbackDigestFile,
        dataType: 'json',
        cache: false,
        success: function(fallbackData) {
          console.log('Successfully loaded digest from fallback data');
          if (fallbackData.digest) {
            // Simple digest format with just a digest property
            resolve(fallbackData.digest);
          } else if (fallbackData.d && fallbackData.d.GetContextWebInformation) {
            // SharePoint format response
            resolve(fallbackData.d.GetContextWebInformation.FormDigestValue);
          } else {
            console.error('Invalid digest data format in fallback file');
            reject(new Error('Invalid digest data format'));
          }
        },
        error: function(xhr, status, fallbackError) {
          console.error('Failed to load fallback digest data:', fallbackError);
          // If no fallback, generate a fake digest (only for development)
          var fakeDigest = 'DEV_DIGEST_' + new Date().toISOString();
          console.warn('Using fake digest for development:', fakeDigest);
          resolve(fakeDigest);
        }
      });
    });
  }
  
  // If using fallback data directly
  if (config.useFallbackData === true) {
    console.log('Using fallback data instead of API for digest');
    return loadFallbackDigest();
  }
  
  // Make the actual request
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: config.apiEndpoint + 'contextinfo',
      type: 'POST',
      headers: { 'Accept': 'application/json;odata=verbose' },
      success: function(response) {
        var requestDigest = response.d.GetContextWebInformation.FormDigestValue;
        console.log('Successfully obtained request digest');
        
        // Store the digest and its expiration time
        data._digestValue = requestDigest;
        data._digestExpires = new Date().getTime() + (response.d.GetContextWebInformation.FormDigestTimeoutSeconds * 1000) - 60000; // Subtract 1 minute for safety
        
        resolve(requestDigest);
      },
      error: function(xhr, status, error) {
        console.error('Error getting request digest:', error);
        
        // Try fallback
        console.warn('Trying fallback digest...');
        loadFallbackDigest()
          .then(resolve)
          .catch(function() {
            reject(error);
          });
      }
    });
  });
};

/**
 * Get a valid digest value, refreshing if necessary
 * @returns {Promise} Promise that resolves with a valid digest value
 */
data.ensureDigest = function() {
  // Check if we have a valid digest already
  var now = new Date().getTime();
  if (data._digestValue && data._digestExpires && now < data._digestExpires) {
    console.log('Using cached digest value');
    return Promise.resolve(data._digestValue);
  }
  
  // Otherwise get a new one
  console.log('Digest expired or not available, requesting new one');
  return data.getDigest();
};

// Namespaces are already exported to the global scope at the top of the file