const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

// Create Express app
const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dev-server directory
app.use(express.static(path.join(__dirname, '/'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the SiteAssets directory
app.use('/SiteAssets', express.static(path.join(__dirname, '../SiteAssets'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// App.aspx
app.get('/', async (req, res) => {
  try {
    // Read the ASPX file
    const filePath = path.join(__dirname, '../SitePages/App.aspx');
    let content = await fsp.readFile(filePath, 'utf8');
    
    // Strip out the ASP.NET directive
    content = content.replace(/<%@\s+Page[^%]*%>/i, '');
    
    // Set the content type and send the modified content
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (error) {
    console.error('Error serving ASPX file:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Helper function to serve JSON files
function serveJsonFile(filePath, res) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return res.status(500).json({
        success: false,
        message: 'Error reading data file',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
      });
    }
    
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error(`Error parsing JSON file ${filePath}:`, parseError);
      res.status(500).json({
        success: false,
        message: 'Error parsing data file',
        error: process.env.NODE_ENV === 'production' ? {} : parseError.message
      });
    }
  });
}

app.get('/_api/web/lists/GetByTitle*', (req, res) => {
	
  // Get the full URL
  const url = req.url;
  
  // Parse the list title using a regex
  const titleMatch = url.match(/GetByTitle\(['"](.+?)['"]\)/);
  
  if (titleMatch && titleMatch[1]) {
    const listTitle = titleMatch[1];
    const filePath = path.join(__dirname, 'data', `${listTitle}.json`);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({
          success: false,
          message: `List "${listTitle}" not found or no data available`
        });
      }
      
      // File exists, serve it
      serveJsonFile(filePath, res);
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid list title format'
    });
  }
});

// Siteusers
app.get('/_api/web/siteusers', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'osseSiteusers.json');
  serveJsonFile(filePath, res);
});

// CurrentUser
app.get('/_api/web/siteusers', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'settings.json');
  serveJsonFile(filePath, res);
});

// Context (digest)
app.post('/_api/contextinfo', (req, res) => {
  // Get data from request body
  const requestData = req.body;
  
  // Log received data
  console.log('Received login request:', requestData);
  
  // Read data from the authentication JSON file
  const filePath = path.join(__dirname, 'data', 'digest.txt');
  
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      console.error('Error reading authentication file:', err);
      return res.status(500).json({
        success: false,
        message: 'Error processing authentication',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
      });
    }
    
	try {
	  res.send(fileData);
	} catch (error) {
	  console.error('Error sending file content:', error);
	  res.status(500).send('Error sending file content');
	}
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});