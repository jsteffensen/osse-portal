<%@ Page Language="C#" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0"/>
  <title>OSS&E Portal</title>

  <!-- CSS  -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="../SiteAssets/css/materialize.css" type="text/css" rel="stylesheet" media="screen,projection"/>
  <link href="../SiteAssets/css/style.css" type="text/css" rel="stylesheet" media="screen,projection"/>
  
</head>
<body>
  <!-- Top Progress Bar -->
  <div id="top-progress-bar" class="progress">
    <div class="indeterminate"></div>
  </div>
  
  <nav class="transparent" role="navigation">
    <div class="nav-wrapper container">
	  
      <ul class="left">
        <li><a href="#">Navbar Link</a></li>
        <li><a class="modal-trigger" href="#modal1">Open<i class="material-icons right">open_in_new</i></a></li>
        <li><a href="#!" onclick="showAlert()">Alert<i class="material-icons right">notifications</i></a></li>
        <li><a href="#!" onclick="sendTestEmail()">Send Test Email<i class="material-icons right">email</i></a></li>
      </ul>

    </div>
  </nav>

	<ul id="slide-out" class="sidenav sidenav-fixed z-depth-2">
	
	  <li><div class="user-view">
		<div class="background">
			<img src="../SiteAssets/awacs.jpg">
		  </div>
		  <a href="#name"><span class="white-text name">-</span></a>
		  <a href="#email"><span class="white-text email">-</span></a>
		</div>
	  </li>
		
      <li><a href="#!" class="template-link" data-template="../SiteAssets/templates/dashboard-template.html"><i class="material-icons">dashboard</i>Dashboard</a></li>
	  <li><a href="#!" class="template-link" data-template="../SiteAssets/templates/components-template.html"><i class="material-icons">view_module</i>Components</a></li>
	  <li><a class="subheader">Navigation</a></li>
      <li><a href="#!" class="template-link" data-template="../SiteAssets/templates/dashboard-template.html">Load Dashboard</a></li>
      <li><a href="#!" class="template-link" data-template="../SiteAssets/templates/components-template.html">Load Components</a></li>
      <li class="no-padding">
        <ul class="collapsible collapsible-accordion">
          <li>
            <a class="collapsible-header">Dropdown<i class="material-icons">arrow_drop_down</i></a>
            <div class="collapsible-body">
              <ul>
                <li><a href="#!">First</a></li>
                <li><a href="#!">Second</a></li>
                <li><a href="#!">Third</a></li>
                <li><a href="#!">Fourth</a></li>
              </ul>
            </div>
          </li>
        </ul>
      </li>
	  <!-- <li><div class="divider"></div></li> -->
	  <li><a href="#!">Sidebar Link</a></li>
	  <li><a href="#!">Sidebar Link</a></li>
	  <li><a class="subheader">Subheader</a></li>
	  <li><a href="#!">Sidebar Link</a></li>
	  <li><a href="#!">Sidebar Link</a></li>
    </ul>

  <div class="container" id="content-container">
    <!-- Empty container that will be filled dynamically -->
    <div class="center" style="margin-top: 50px;">
      <p>Select an option from the sidebar to load content</p>
    </div>
  </div>

  <!--  Scripts-->
  <script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
  <script src="../SiteAssets/js/materialize.js"></script>
  <script src="../SiteAssets/js/lib/bluebird.min.js"></script>
  <!--  App specific-->
  <script src="../SiteAssets/js/utils.js"></script>
  <script src="../SiteAssets/js/data-service.js"></script>
  <script src="../SiteAssets/js/cache-service.js"></script>
  <script src="../SiteAssets/js/app.js"></script>
  
  
  <script>
    $(function() {
		app.init();
    });
  </script>

  </body>
</html>