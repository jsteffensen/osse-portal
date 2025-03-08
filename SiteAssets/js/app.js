//------------------------------ global ------------------------------
// Define global first

const app = window.app = {};

app.getUrlParameter = function(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

app.ui = {};

app.ui.showProgress = function() {
  $('#top-progress-bar').fadeIn(300);
};

app.ui.hideProgress = function() {
  $('#top-progress-bar').fadeOut(300);
};


app.ui.showAlert = function() {
  M.toast({html: 'You clicked the Alert button!', classes: 'rounded'});
}

//-------------------------- end global ------------------------------


app.init = function() {
	app.initData().then(()=>{
		return app.initUI();
	}, (err)=>{
		return Promise.reject({data: err});
	}).then(()=>{
		return app.initRouter();
	}, (err)=>{
		return Promise.reject(err);
	}).then(()=>{
		// Success path completed
	}, (err)=>{
		// Display error to user
		M.toast({html: 'Application initialization error', classes: 'red'});
		return Promise.reject(err);
	});
}

app.initData = function() {
	return cache.init();
}

app.initRouter = function() {
  return new Promise(function(resolve, reject) {
		app.router = {

			routes: [
			  {
				name: 'dashboard',
				path: '../SiteAssets/templates/dashboard-template.html'
			  },
			  {
				name: 'components',
				path: '../SiteAssets/templates/components-template.html'
			  },
			  {
				name: 'parent',
				path: '../SiteAssets/templates/parent-template.html'
			  }
			],
			
			// Current active route
			currentRoute: null,
			
			// Navigate to a route by name
			navigateTo: function(routeName) {
			  const route = this.routes.find(r => r.name === routeName);
			  
			  if (route) {
				app.ui.showProgress();
				this.loadTemplate(route);
				
				// Update URL parameter without page reload
				const url = new URL(window.location);
				url.searchParams.set('v', routeName);
				window.history.pushState({}, '', url);
			  } else {
			  }
			  
			  return route;
			},
			
			// Navigate to a route by template path
			navigateByPath: function(templatePath) {
			  const route = this.routes.find(r => r.path === templatePath);
			  
			  if (route) {
				// Found the route, navigate to it and update URL parameter
				app.ui.showProgress();
				this.loadTemplate(route);
				
				// Update URL parameter without page reload
				const url = new URL(window.location);
				url.searchParams.set('v', route.name);
				window.history.pushState({}, '', url);
			  } else {
				// Handle unknown template path - create a temporary route
				const tempRoute = {
				  name: 'temp-' + Date.now(),
				  path: templatePath
				};
				app.ui.showProgress();
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
				  
				  // Initialize Materialize components
				  M.AutoInit();
				  
				  // Dynamically load the corresponding JS file based on the route name
				  const jsPath = route.path.replace('.html', '.js');
				  
				  // Load and execute template-specific JavaScript
				  $.getScript(jsPath)
					.done(function() {
					  // Script loaded and executed successfully
					})
					.fail(function(jqxhr, settings, exception) {
					  // If script fails to load but it's just a 404 (no JS file exists),
					  // this is not an error, just use the generic initialization
					  if(jqxhr.status === 404) {
						app.initGeneric();
					  } else {
						// Other errors are real errors, show toast
						M.toast({html: `Error loading script for ${route.name}`, classes: 'red'});
					  }
					});
				  
				  // Hide progress bar
				  app.ui.hideProgress();
				},
				error: (xhr, status, error) => {
				  // Show error message and hide progress bar
				  app.ui.hideProgress();
				  $('#content-container').html('<div class="center" style="margin-top: 50px;"><p class="red-text">Error loading content:<br>' + error + '</p></div>');
				}
			  });
			}
		  };
		  
		app.initializeRoutes() 
		  
		resolve();
	});	
}

app.initializeRoutes = function() {
	// Check for URL parameter 'v' for view/template routing
	const viewParam = app.getUrlParameter('v');

	if (viewParam && viewParam.trim() !== '') {
	  // If 'v' parameter exists, try to navigate to that route
	  if (app.router.navigateTo(viewParam) === undefined) {
		app.router.navigateTo('dashboard');
	  }
	} else {
	  // Load dashboard by default when no parameter is provided
	  app.router.navigateTo('dashboard');
	}
}

app.initUI = function() {
	return new Promise(function(resolve, reject) {
		M.AutoInit();

		$('.template-link').click(function(e) {
			e.preventDefault();
			const templatePath = $(this).data('template');

			// Find the route by template path
			app.router.navigateByPath(templatePath);
		});
		resolve();
	});
}

app.initGeneric = function() {
	// Generic initialization for templates without specific init functions
	M.AutoInit();
}

