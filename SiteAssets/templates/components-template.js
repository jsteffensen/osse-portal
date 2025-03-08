/**
 * Components Template JavaScript
 * Contains all the components-specific functionality
 */

// Add components functionality to the app namespace
app.components = {};

/**
 * Initializes the components template
 */
app.components.init = function() {
  
  // Initialize any Materialize components specific to the components page
  var elems = document.querySelectorAll('.modal');
  M.Modal.init(elems, {});
  
  // Setup component demos
  app.components.setupDemos();
};

/**
 * Sets up component demos and examples
 */
app.components.setupDemos = function() {
  // Initialize collapsibles 
  var elems = document.querySelectorAll('.collapsible');
  M.Collapsible.init(elems, {});
  
  // Initialize dropdowns
  var elems = document.querySelectorAll('.dropdown-trigger');
  M.Dropdown.init(elems, {});
  
  // Setup event listeners for demo components
  $('.demo-button').click(function() {
    M.toast({html: 'Demo button clicked!', classes: 'rounded'});
  });
};

// Initialize the components page
app.components.init();