/**
 * Dashboard Template JavaScript
 * Contains all the dashboard-specific functionality
 */

// Add dashboard functionality to the app namespace
app.dashboard = {};

/**
 * Initializes the dashboard components and populates data
 */
app.dashboard.init = function() {
  // Initialize any Materialize components specific to the dashboard
  var elems = document.querySelectorAll('.modal');
  M.Modal.init(elems, {});
  
  // Populate OSSE Parent collection if cache is available
  app.dashboard.populateParentCollection();
};

/**
 * Populates the OSSE Parent collection from cache
 */
app.dashboard.populateParentCollection = function() {
  // Get the collection element
  const collection = $('#osse-parent-collection');
  
  // Clear loading indicators
  collection.find('.loading-indicator').remove();
  
  // Check if data is available
  const hasData = app.data && app.data.parents && app.data.requirements;
  
  // Check if parents data is available
  if (hasData) {
    // If no items exist, show empty message
    if (app.data.parents.length === 0) {
      collection.append(`
        <li class="collection-item">
          <span class="title">No parent items found</span>
          <p>There are no OSSE parent items in the system</p>
        </li>
      `);
      return;
    }
    
    // Add each parent item to the collection
    app.data.parents.forEach(function(parent) {
      collection.append(`
        <li class="collection-item avatar">
          <i class="material-icons circle blue">folder</i>
          <span class="title">${parent.Title || 'Untitled'}</span>
          <p>${parent.Description || 'No description'}<br>
             ID: ${parent.Id || 'N/A'}
          </p>
          <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
        </li>
      `);
    });
  } else {
    // Data not available, show error message
    collection.append(`
      <li class="collection-item avatar">
        <i class="material-icons circle red">error</i>
        <span class="title">Data not available</span>
        <p>The parent data is not available.<br>
           Please try refreshing the page.
        </p>
      </li>
    `);
  }
};

// Initialize the dashboard 
app.dashboard.init();