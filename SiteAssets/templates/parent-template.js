/**
 * Parent Template JavaScript
 * Contains all the parent page specific functionality
 */

// Add parent functionality to the app namespace
app.parent = {};

/**
 * Initializes the parent page
 */
app.parent.init = function() {
  
  // Initialize any Materialize components
  app.parent.initializeComponents();
  
  // Populate parent list from cache
  app.parent.populateParentList();
  
  // Set up event handlers
  app.parent.setupEventHandlers();
  
  // Check if we need to show parent details
  app.parent.checkParentDetails();
};

/**
 * Initialize Materialize components
 */
app.parent.initializeComponents = function() {
  // Initialize tabs
  var tabsElem = document.querySelectorAll('.tabs');
  M.Tabs.init(tabsElem, {});
  
  // Initialize collapsible elements
  var collapsibleElem = document.querySelectorAll('.collapsible');
  M.Collapsible.init(collapsibleElem, {});
};

/**
 * Populates the parent list from cache
 */
app.parent.populateParentList = function() {
  // Get the collection element
  const collection = $('#osse-parent-list');
  
  // Clear loading indicators
  collection.find('.loading-indicator').remove();
  
  // Access data through app.data
  const parents = app.data && app.data.parents 
                ? app.data.parents
                : null;
  
  // Check if parents data is available
  if (parents && parents.length > 0) {
    // Add each parent item to the collection
    parents.forEach(function(parent) {
      collection.append(`
        <li class="collection-item avatar">
          <i class="material-icons circle blue">folder</i>
          <span class="title">${parent.Title || 'Untitled'}</span>
          <p>${parent.Description || 'No description'}<br>
             ID: ${parent.Id || 'N/A'}
          </p>
          <a href="#!" class="secondary-content view-parent-details" data-id="${parent.Id}">
            <i class="material-icons">visibility</i>
          </a>
        </li>
      `);
    });
    
    // Add click handler for viewing parent details
    $('.view-parent-details').on('click', function(e) {
      const parentId = $(this).data('id');
      app.parent.showParentDetails(parentId);
    });
  } else {
    // No parents found or data not available
    collection.append(`
      <li class="collection-item avatar">
        <i class="material-icons circle red">error</i>
        <span class="title">No parents found</span>
        <p>No parent items are available.<br>
           Please try again later or contact an administrator.
        </p>
      </li>
    `);
  }
};

/**
 * Set up event handlers
 */
app.parent.setupEventHandlers = function() {
  // Add back button click handler
  $('.back-to-list').on('click', function(e) {
    e.preventDefault();
    
    // Navigate to dashboard
    app.router.navigateTo('dashboard');
  });
  
  // Setup edit mode handlers for requirements
  app.parent.setupEditModeHandlers();
};

/**
 * Check if we need to show parent details based on URL parameters
 */
app.parent.checkParentDetails = function() {
  // Get current parameters directly from URL
  const params = new URLSearchParams(window.location.search);
  const parentId = params.get('id');
  
  if (parentId) {
    // Show parent details for this ID
    app.parent.showParentDetails(parentId);
  }
};

/**
 * Show parent details for a specific parent ID
 */
app.parent.showParentDetails = function(parentId) {
  // Update URL without refreshing the page
  const url = new URL(window.location);
  url.searchParams.set('id', parentId);
  window.history.pushState({}, '', url);
  
  // Show the related data container
  $('#related-data-container').show();
  
  // Populate requirements tab
  app.parent.populateRequirementsTab(parentId);
  
  // Store original requirement data for edit cancellation
  app.parent.storeOriginalRequirementData(parentId);
};

/**
 * Store original requirement data for edit cancellation
 */
app.parent.storeOriginalRequirementData = function(parentId) {
  // Access data through app.data
  const parents = app.data && app.data.parents 
                ? app.data.parents
                : null;
                
  if (parents) {
    const parentItem = parents.find(p => p.Id === parseInt(parentId, 10));
    
    if (parentItem && parentItem.Requirements && parentItem.Requirements.length > 0) {
      const requirement = parentItem.Requirements[0];
      app.parent.originalRequirementData = {
        ProgrammeTeamComments: requirement.ProgrammeTeamComments || '',
        DataRequired: requirement.DataRequired || '',
        FocalPointComments: requirement.FocalPointComments || ''
      };
    } else {
      app.parent.originalRequirementData = null;
    }
  }
};

/**
 * Populate requirements tab with related data
 */
app.parent.populateRequirementsTab = function(parentId) {
  // Access data through app.data
  const parents = app.data && app.data.parents 
                ? app.data.parents
                : null;
  
  if (parents) {
    const parentItem = parents.find(p => p.Id === parseInt(parentId, 10));
    
    if (parentItem && parentItem.Requirements && parentItem.Requirements.length > 0) {
      // Get the first requirement
      const requirement = parentItem.Requirements[0];
      
      // Populate the form fields
      $('#programme-team-comments').val(requirement.ProgrammeTeamComments || '').trigger('change');
      $('#data-required').val(requirement.DataRequired || '').trigger('change');
      $('#focal-point-comments').val(requirement.FocalPointComments || '').trigger('change');
      
      // Make sure the labels stay active
      M.updateTextFields();
      
      // Resize textareas to fit content
      M.textareaAutoResize($('#programme-team-comments'));
      M.textareaAutoResize($('#data-required'));
      M.textareaAutoResize($('#focal-point-comments'));
      
      // Show the form and hide the "no requirement" message
      $('#requirement-form-content').show();
      $('#no-requirement-container').hide();
      
      // Show the Edit button
      $('#edit-requirements-btn').show();
    } else {
      // Clear form fields
      $('#programme-team-comments').val('').trigger('change');
      $('#data-required').val('').trigger('change');
      $('#focal-point-comments').val('').trigger('change');
      
      // Hide the form and show the "no requirement" message
      $('#requirement-form-content').hide();
      $('#no-requirement-container').show();
      
      // Hide the Edit button since there's nothing to edit
      $('#edit-requirements-btn').hide();
    }
  }
};

/**
 * Set up edit mode handlers for requirements
 */
app.parent.setupEditModeHandlers = function() {
  // Edit button click handler
  $('#edit-requirements-btn').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Enable form fields
    $('#programme-team-comments').prop('disabled', false);
    $('#data-required').prop('disabled', false);
    $('#focal-point-comments').prop('disabled', false);
    
    // Show save/cancel buttons
    $('#requirement-form-actions').show();
    
    // Hide edit button
    $(this).hide();
    
    // Focus on first field
    $('#programme-team-comments').focus();
  });
  
  // Create requirement button click handler
  $('#create-requirement-btn').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Show the form and hide the "no requirement" message
    $('#requirement-form-content').show();
    $('#no-requirement-container').hide();
    
    // Enable the form fields for creating a new requirement
    $('#programme-team-comments').prop('disabled', false).val('').trigger('change');
    $('#data-required').prop('disabled', false).val('').trigger('change');
    $('#focal-point-comments').prop('disabled', false).val('').trigger('change');
    
    // Make sure labels stay active
    M.updateTextFields();
    
    // Show the save/cancel buttons
    $('#requirement-form-actions').show();
    
    // Hide the edit button
    $('#edit-requirements-btn').hide();
    
    // Focus on the first field
    $('#programme-team-comments').focus();
  });
  
  // Cancel button click handler
  $('#cancel-requirements-btn').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the current parent ID directly from URL
    const params = new URLSearchParams(window.location.search);
    const parentId = parseInt(params.get('id'), 10);
    
    // Access data through app.data
    const parents = app.data && app.data.parents 
                  ? app.data.parents
                  : null;
    
    if (parents) {
      const parentItem = parents.find(p => p.Id === parentId);
      
      // Check if we're canceling a new requirement creation or an edit
      if (parentItem && parentItem.Requirements && parentItem.Requirements.length > 0) {
        // This is an edit cancellation - restore original data
        if (app.parent.originalRequirementData) {
          $('#programme-team-comments').val(app.parent.originalRequirementData.ProgrammeTeamComments).trigger('change');
          $('#data-required').val(app.parent.originalRequirementData.DataRequired).trigger('change');
          $('#focal-point-comments').val(app.parent.originalRequirementData.FocalPointComments).trigger('change');
          
          // Resize textareas to fit content
          M.textareaAutoResize($('#programme-team-comments'));
          M.textareaAutoResize($('#data-required'));
          M.textareaAutoResize($('#focal-point-comments'));
        }
        
        // Disable form fields
        $('#programme-team-comments').prop('disabled', true);
        $('#data-required').prop('disabled', true);
        $('#focal-point-comments').prop('disabled', true);
        
        // Hide save/cancel buttons
        $('#requirement-form-actions').hide();
        
        // Show edit button
        $('#edit-requirements-btn').show();
      } else {
        // This is a new requirement creation cancellation
        $('#requirement-form-content').hide();
        $('#no-requirement-container').show();
        
        // Clear form fields
        $('#programme-team-comments').val('').trigger('change');
        $('#data-required').val('').trigger('change');
        $('#focal-point-comments').val('').trigger('change');
        
        // Hide save/cancel buttons
        $('#requirement-form-actions').hide();
      }
    }
  });
  
  // Save button click handler (stub - API integration would be implemented separately)
  $('#save-requirements-btn').off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real implementation, this would call the data service to save the requirement
    // For now, just show a success message
    
    // Show success notification
    M.toast({
      html: 'Changes saved successfully!',
      classes: 'green rounded',
      displayLength: 2000
    });
    
    // Disable form fields
    $('#programme-team-comments').prop('disabled', true);
    $('#data-required').prop('disabled', true);
    $('#focal-point-comments').prop('disabled', true);
    
    // Hide save/cancel buttons
    $('#requirement-form-actions').hide();
    
    // Show edit button
    $('#edit-requirements-btn').show();
  });
};

// Initialize the parent page
app.parent.init();