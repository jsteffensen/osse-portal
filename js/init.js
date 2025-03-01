/**
 * Admin Template Router and Initializers
 */
(function($) {
  // Router configuration
  const router = {
    // Route definitions with template path and init function name
    routes: [
      {
        name: 'dashboard',
        path: 'dashboard-template.html',
        init: 'initDashboard'
      },
      {
        name: 'components',
        path: 'components-template.html',
        init: 'initComponents'
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
      } else {
        console.error(`Route "${routeName}" not found`);
      }
      
      return route;
    },
    
    // Navigate to a route by template path
    navigateByPath: function(templatePath) {
      const route = this.routes.find(r => r.path === templatePath);
      
      if (route) {
        showProgress();
        this.loadTemplate(route);
      } else {
        // Handle unknown template path - create a temporary route
        const tempRoute = {
          name: 'temp-' + Date.now(),
          path: templatePath,
          init: 'initGeneric'
        };
        showProgress();
        this.loadTemplate(tempRoute);
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
  
  // Initialize the application when document is ready
  $(function() {
    // Initialize Materialize components
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
    $('.modal').modal();
    
    // Set up template link click handlers
    $('.template-link').click(function(e) {
      e.preventDefault();
      const templatePath = $(this).data('template');
      
      // Find the route by template path
      router.navigateByPath(templatePath);
    });
    
    // Load dashboard by default when page loads
    router.navigateTo('dashboard');
  });
  
  // Export router to global scope for direct access
  window.appRouter = router;
  
  /**
   * Template-specific initialization functions
   */
  
  // Generic initializer for all templates
  function initGeneric() {
    // Initialize common Materialize components
    $('.modal').modal();
    $('.collapsible').collapsible();
    $('.tooltipped').tooltip();
    $('select').formSelect();
    $('.chips').chips();
    $('.datepicker').datepicker();
    $('input[data-length], textarea[data-length]').characterCounter();
    
    console.log('Generic initialization completed');
  }
  
  // Dashboard specific initializer
  function initDashboard() {
    // First apply generic initialization
    initGeneric();
    
    // Dashboard specific code
    console.log('Dashboard view initialized');
    
    // Any dashboard-specific component initialization
    $('.collection').on('click', '.collection-item', function() {
      $(this).toggleClass('active');
    });
  }
  
  // Components view specific initializer
  function initComponents() {
    // First apply generic initialization
    initGeneric();
    
    // Components specific code
    console.log('Components view initialized');
    
    // Initialize chips with custom options
    $('.chips').chips({
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
  
})(jQuery);

// Progress bar functions
function showProgress() {
  $('#top-progress-bar').fadeIn(300);
}

function hideProgress() {
  $('#top-progress-bar').fadeOut(300);
}

function runProgress(duration = 3000) {
  showProgress();
  
  setTimeout(function() {
    hideProgress();
  }, duration);
  
  return `Progress will run for ${duration/1000} seconds`;
}

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