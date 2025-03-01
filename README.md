# OSSE Portal

A modern administrative dashboard portal built with MaterializeCSS.

![OSSE Portal Screenshot](screen.png)

## Technology Stack

- **Frontend Framework**: [MaterializeCSS](https://materializecss.com/) - A responsive front-end framework based on Material Design
- **JavaScript**: jQuery for DOM manipulation and AJAX requests
- **Routing**: Custom client-side router for template loading

## Features

- Responsive layout that works on desktop and mobile devices
- Client-side routing for seamless navigation between views
- Dashboard and components templates included
- Auto-initializes to dashboard view on page load

## Project Structure

- `index.html` - Main application entry point
- `dashboard-template.html` - Dashboard view template
- `components-template.html` - UI components showcase
- `js/` - JavaScript files
  - `init.js` - Application initialization and routing
  - `materialize.js` - MaterializeCSS core functionality
- `css/` - Stylesheets
  - `style.css` - Custom application styles
  - `materialize.css` - MaterializeCSS styles

## Getting Started

1. Clone this repository
2. Serve the project locally using Python's built-in HTTP server:
   ```bash
   # From the project root directory
   python -m http.server 3000
   ```
3. Open your browser and navigate to `http://localhost:3000`
4. Navigate between dashboard and component views using the sidebar

## Development

Add new routes by extending the router configuration in `js/init.js`:

```javascript
routes: [
  {
    name: 'newRoute',
    path: 'new-template.html',
    init: 'initNewTemplate'
  }
]
```