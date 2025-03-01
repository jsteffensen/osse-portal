/**
 * Admin Template Router and Initializers
 */

// Define global progress bar functions first
window.showProgress = function() {
  $('#top-progress-bar').fadeIn(300);
};

window.hideProgress = function() {
  $('#top-progress-bar').fadeOut(300);
};

window.runProgress = function(duration = 3000) {
  showProgress();
  
  setTimeout(function() {
    hideProgress();
  }, duration);
  
  return `Progress will run for ${duration/1000} seconds`;
};

// Add the populateOsseParentCollection function to global scope
window.populateOsseParentCollection = function() {
  console.log('Populating OSSE Parent Collection...');
  
  // Get the collection element
  const $collection = $('#osse-parent-collection');
  
  if (!$collection.length) {
    console.error('OSSE Parent Collection element not found in the DOM');
    return;
  }
  
  console.log('Found OSSE parent collection element');
  
  // Clear existing items
  $collection.empty();
  
  // Check if cache and osseParentList are available
  if (window.cache && window.cache.osseParentList) {
    // Check if the list has items
    if (window.cache.osseParentList.length > 0) {
      console.log(`Found ${window.cache.osseParentList.length} OSSE Parent items to display`);
      
      // Generate icon colors for variety
      const iconColors = ['blue', 'green', 'red', 'orange', 'purple', 'teal'];
      
      // Add each item from the cache
      window.cache.osseParentList.forEach((item, index) => {
        // Create a new collection item
        const iconClass = ['folder', 'assignment', 'insert_chart', 'list_alt', 'build'][index % 5];
        const colorIndex = index % iconColors.length;
        
        // Create HTML for the new item with data-id attribute for click handler
        const newItemHtml = `
          <li class="collection-item avatar parent-item" data-id="${item.Id}">
            <i class="material-icons circle ${iconColors[colorIndex]}">${iconClass}</i>
            <span class="title">${item.Title || 'No Title'}</span>
            <p>${item.EcrRfv || ''} - ${item.Reference || ''}<br>
               ID: ${item.Id}
            </p>
            <a href="#!" class="secondary-content"><i class="material-icons">navigate_next</i></a>
          </li>
        `;
        
        // Add to collection
        $collection.append(newItemHtml);
      });

      // Add click handler to parent items
      $('.parent-item').click(function() {
        const parentId = $(this).data('id');
        // Navigate to parent view with the ID as a parameter
        const url = new URL(window.location);
        url.searchParams.set('v', 'parent');
        url.searchParams.set('id', parentId);
        window.history.pushState({}, '', url);
        
        // Trigger navigation
        window.appRouter.navigateTo('parent');
      });
    } else {
      // No items found
      $collection.append(`
        <li class="collection-item avatar">
          <i class="material-icons circle grey">info</i>
          <span class="title">No Items Found</span>
          <p>There are no OSSE Parent items available<br>Please check your data source</p>
        </li>
      `);
    }
  } else {
    console.warn('Cache or osseParentList not available yet');
    // Add a waiting message
    $collection.append(`
      <li class="collection-item avatar">
        <i class="material-icons circle orange">warning</i>
        <span class="title">Data Not Available</span>
        <p>The OSSE Parent List data is not available yet<br>Please check the cache initialization</p>
      </li>
    `);
  }
};

// Helper function to render the stepper
window.renderStepper = function(currentStep) {
  // Define the steps
  const steps = [
    { name: 'Created', icon: 'create' },
    { name: 'In Progress', icon: 'build' },
    { name: 'Review', icon: 'fact_check' },
    { name: 'Approved', icon: 'thumb_up' },
    { name: 'Completed', icon: 'check_circle' }
  ];
  
  // Create stepper container
  const stepperHtml = `
    <div class="stepper-container">
      <div class="stepper">
        ${steps.map((step, index) => `
          <div class="stepper-step">
            <div class="stepper-circle ${index < currentStep ? 'completed' : (index === currentStep ? 'active' : '')}">
              <i class="material-icons">${index < currentStep ? 'check' : step.icon}</i>
            </div>
            <div class="stepper-label">${step.name}</div>
          </div>
        `).join('')}
        <div class="stepper-progress" style="width: ${(currentStep / (steps.length - 1)) * 100}%"></div>
      </div>
    </div>
  `;
  
  return stepperHtml;
};

// Add the populateParentList function to global scope
window.populateParentList = function() {
  console.log('Populating Parent List...');
  
  // Get the list element
  const $list = $('#osse-parent-list');
  
  if (!$list.length) {
    console.error('OSSE Parent List element not found in the DOM');
    return;
  }
  
  console.log('Found OSSE parent list element');
  
  // Clear existing items
  $list.empty();
  
  // Get the parent ID from URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const parentId = urlParams.get('id');
  
  // Check if cache and osseParentList are available
  if (window.cache && window.cache.osseParentList) {
    // Check if we have a specific parent ID
    if (parentId) {
      console.log(`Looking for parent with ID: ${parentId}`);
      
      // Find the parent item with matching ID
      const parentItem = window.cache.osseParentList.find(item => item.Id == parentId);
      
      if (parentItem) {
        console.log(`Found parent with ID: ${parentId}`);
        
        // Update page title to reflect we're viewing a specific parent
        $('.card-title').text(`OSSE Parent: ${parentItem.Title || 'Unknown'}`);
        
        // Add stepper - Generate a random step based on ID to simulate different states
        // In real app, this would come from the item's actual status
        const stepperStep = (parseInt(parentId) % 5); // 0-4
        
        // Add stepper before the collection item
        $('.stepper-placeholder').html(window.renderStepper(stepperStep));
        
        // Generate random icon color for variety
        const iconColors = ['blue', 'green', 'red', 'orange', 'purple', 'teal'];
        const iconClass = 'folder';
        const colorIndex = Math.floor(Math.random() * iconColors.length);
        
        // Create detailed view for the single parent
        const detailHtml = `
          <li class="collection-item avatar">
            <i class="material-icons circle ${iconColors[colorIndex]}">${iconClass}</i>
            <span class="title">${parentItem.Title || 'No Title'}</span>
            <p>
              Reference: ${parentItem.Reference || 'N/A'}<br>
              ECR/RFV: ${parentItem.EcrRfv || 'N/A'}<br>
              ID: ${parentItem.Id}<br>
              ${parentItem.Description ? `Description: ${parentItem.Description}` : ''}
            </p>
          </li>
        `;
        
        // Add to list
        $list.append(detailHtml);
      } else {
        // Parent not found
        console.error(`Parent with ID ${parentId} not found`);
        $list.append(`
          <li class="collection-item avatar">
            <i class="material-icons circle red">error</i>
            <span class="title">Parent Not Found</span>
            <p>Could not find parent with ID: ${parentId}<br>Please check the ID parameter</p>
          </li>
        `);
      }
    } else {
      // No specific parent ID - show all parents
      if (window.cache.osseParentList.length > 0) {
        console.log(`Found ${window.cache.osseParentList.length} OSSE Parent items to display`);
        
        // Generate icon colors for variety
        const iconColors = ['blue', 'green', 'red', 'orange', 'purple', 'teal'];
        
        // Add each item from the cache
        window.cache.osseParentList.forEach((item, index) => {
          // Create a new list item
          const iconClass = ['folder', 'assignment', 'insert_chart', 'list_alt', 'build'][index % 5];
          const colorIndex = index % iconColors.length;
          
          // Create HTML for the new item
          const newItemHtml = `
            <li class="collection-item avatar">
              <i class="material-icons circle ${iconColors[colorIndex]}">${iconClass}</i>
              <span class="title">${item.Title || 'No Title'}</span>
              <p>${item.EcrRfv || ''} - ${item.Reference || ''}<br>
                 ID: ${item.Id}
              </p>
              <a href="#!" class="secondary-content"><i class="material-icons">info</i></a>
            </li>
          `;
          
          // Add to list
          $list.append(newItemHtml);
        });
      } else {
        // No items found
        $list.append(`
          <li class="collection-item avatar">
            <i class="material-icons circle grey">info</i>
            <span class="title">No Items Found</span>
            <p>There are no OSSE Parent items available<br>Please check your data source</p>
          </li>
        `);
      }
    }
  } else {
    console.warn('Cache or osseParentList not available yet');
    // Add a waiting message
    $list.append(`
      <li class="collection-item avatar">
        <i class="material-icons circle orange">warning</i>
        <span class="title">Data Not Available</span>
        <p>The OSSE Parent List data is not available yet<br>Please check the cache initialization</p>
      </li>
    `);
  }
};

(function($) {
  // Router configuration
  const router = {
    // Route definitions with template path and init function name
    routes: [
      {
        name: 'dashboard',
        path: '../SiteAssets/templates/dashboard-template.html',
        init: 'initDashboard'
      },
      {
        name: 'components',
        path: '../SiteAssets/templates/components-template.html',
        init: 'initComponents'
      },
      {
        name: 'parent',
        path: '../SiteAssets/templates/parent-template.html',
        init: 'initParent'
      }
      // Add new routes here in the format:
      // {name: 'routeName', path: 'template-file.html', init: 'initFunctionName'}
    ],
    
    // Current active route
    currentRoute: null,
    
    // Navigate to a route by name
    navigateTo: function(routeName) {
      const route = this.routes.find(r => r.name === routeName);
      
      if (route) {
        showProgress();
        this.loadTemplate(route);
        
        // Update URL parameter without page reload
        const url = new URL(window.location);
        url.searchParams.set('v', routeName);
        window.history.pushState({}, '', url);
      } else {
        console.error(`Route "${routeName}" not found`);
      }
      
      return route;
    },
    
    // Navigate to a route by template path
    navigateByPath: function(templatePath) {
      const route = this.routes.find(r => r.path === templatePath);
      
      if (route) {
        // Found the route, navigate to it and update URL parameter
        showProgress();
        this.loadTemplate(route);
        
        // Update URL parameter without page reload
        const url = new URL(window.location);
        url.searchParams.set('v', route.name);
        window.history.pushState({}, '', url);
      } else {
        // Handle unknown template path - create a temporary route
        const tempRoute = {
          name: 'temp-' + Date.now(),
          path: templatePath,
          init: 'initGeneric'
        };
        showProgress();
        this.loadTemplate(tempRoute);
        
        // For custom routes we don't update the URL parameter
      }
    },
    
    // Load a template based on route
    loadTemplate: function(route) {
      // Show loading indicator in the container
      $('#content-container').html('<div class="center" style="margin-top: 50px;"><div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div><p>Loading ' + route.name + '...</p></div>');
      
      // Load the template with AJAX
      $.ajax({
        url: route.path,
        cache: false,
        success: (html) => {
          // Set current route
          this.currentRoute = route;
          
          // Replace container content with template HTML
          $('#content-container').html(html);
          
          // Call the template-specific init function
          if (typeof window[route.init] === 'function') {
            window[route.init]();
          } else {
            // Fallback to generic initialization
            initGeneric();
          }
          
          // Hide progress bar
          hideProgress();
        },
        error: (xhr, status, error) => {
          // Show error message and hide progress bar
          hideProgress();
          $('#content-container').html('<div class="center" style="margin-top: 50px;"><p class="red-text">Error loading content:<br>' + error + '</p></div>');
          console.error('Error loading template:', error);
        }
      });
    }
  };
  
  // Function to get URL parameters
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  
  // Initialize the application when document is ready
  $(function() {
    // Initialize all Materialize components with a single call
    M.AutoInit();
    
    // Set up template link click handlers
    $('.template-link').click(function(e) {
      e.preventDefault();
      const templatePath = $(this).data('template');
      
      // Find the route by template path
      router.navigateByPath(templatePath);
    });
    
    // Wait for cache service to initialize before loading the initial route
    // This ensures data is available when the templates are loaded
    if (window.cache) {
      // If cache is already defined, make sure it's fully initialized before proceeding
      const waitForCache = function() {
        if (window.cache.osseParentList) {
          console.log('Cache is ready, proceeding with route initialization');
          initializeRoutes();
        } else {
          console.log('Waiting for cache to be fully initialized...');
          setTimeout(waitForCache, 100);
        }
      };
      
      waitForCache();
    } else {
      // If cache isn't defined yet, just proceed with routes and let the templates handle it
      console.log('Cache service not detected, proceeding with route initialization');
      initializeRoutes();
    }
  });
  
  // Function to initialize routes based on URL parameters
  function initializeRoutes() {
    // Check for URL parameter 'v' for view/template routing
    const viewParam = getUrlParameter('v');
    
    if (viewParam && viewParam.trim() !== '') {
      // If 'v' parameter exists, try to navigate to that route
      if (router.navigateTo(viewParam) === undefined) {
        console.warn(`Route "${viewParam}" not found, defaulting to dashboard`);
        router.navigateTo('dashboard');
      }
    } else {
      // Load dashboard by default when no parameter is provided
      router.navigateTo('dashboard');
    }
  }
  
  // Export router to global scope for direct access
  window.appRouter = router;
  
  /**
   * Template-specific initialization functions
   */
  
  // Generic initializer for all templates
  function initGeneric() {
    // Initialize all Materialize components with a single call
    M.AutoInit();
    
    console.log('Generic initialization completed');
  }
  
  // Dashboard specific initializer
  function initDashboard() {
    // First apply generic initialization
    initGeneric();
    
    // Dashboard specific code
    console.log('Dashboard view initialized');
    
    // Set up collection item click handler
    $('.collection').on('click', '.collection-item', function() {
      $(this).toggleClass('active');
    });
    
    // Populate the OSSE Parent Items collection
    window.populateOsseParentCollection();
  }
  
  // Components view specific initializer
  function initComponents() {
    // First apply generic initialization
    initGeneric();
    
    // Components specific code
    console.log('Components view initialized');
    
    // Initialize chips with custom options (override AutoInit defaults)
    var chipElems = document.querySelectorAll('.chips');
    var chipInstances = M.Chips.init(chipElems, {
      placeholder: 'Enter a tag',
      secondaryPlaceholder: '+Tag',
      onChipAdd: function() {
        console.log('Chip added');
      }
    });
    
    // Set up event listeners for the form
    $('form').on('submit', function(e) {
      e.preventDefault();
      M.toast({html: 'Form submitted!', classes: 'rounded green'});
      return false;
    });
  }
  
  // Parent view specific initializer
  function initParent() {
    // First apply generic initialization
    initGeneric();
    
    // Parent specific code
    console.log('Parent view initialized');
    
    // Get the parent ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const parentId = urlParams.get('id');
    
    if (parentId) {
      console.log(`Initializing parent view for ID: ${parentId}`);
    } else {
      console.log('Initializing parent view for all parents');
    }
    
    // Populate the OSSE Parent list
    window.populateParentList();
    
    // Add a back button handler
    // Note: This is now handled directly in the template's script tag
    // to ensure it's bound after the DOM elements are loaded
  }
  
})(jQuery);

// These functions are now defined at the top of the file as global window functions

// Mock function for the Alert button
function showAlert() {
  // Display a toast notification
  M.toast({html: 'You clicked the Alert button!', classes: 'rounded'});
  
  // Start the progress indicator
  runProgress();
  
  console.log('Alert button clicked at ' + new Date().toLocaleTimeString());
}

// Mock function for the Send Test Email button
function sendTestEmail() {
  // Show progress bar
  showProgress();
  
  // Simulate API call delay
  setTimeout(function() {
    // Hide progress bar
    hideProgress();
    
    // Display success toast
    M.toast({
      html: 'Test email sent successfully!',
      classes: 'rounded green'
    });
    
    // Log the action with timestamp
    console.log('Test email sent at ' + new Date().toLocaleTimeString());
  }, 1500); // Simulate a 1.5 second delay for the API call
}