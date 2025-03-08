const data = {};

//data.apiEndpoint = 'https://collab.napma.nato.int/aircm/osse/_api/';
data.apiEndpoint = 'http://localhost:4000/_api/';

data.getJson = function(urlstring) {
  return new Promise(function(resolve, reject) {    
    $.ajax({
      url: urlstring,
      type: 'GET',
      dataType: 'json',
      success: function(responseData) {
        if(responseData) {
          resolve(responseData);
        } else {
          resolve([]);
        }
      },
      error: function(jqxhr, status, error) {
        reject(error);
      }
    });
  });
};

data.postJson = function(urlstring, postData) {
  return new Promise(function(resolve, reject) { 
    const postObj = {
      url: urlstring,
      type: 'POST',
      headers: { 
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      },
      data: JSON.stringify(postData),
      success: function(responseData) {
        resolve(responseData);
      },
      error: function(jqxhr, status, error) {
        reject(error);
      }
    };
    
    $.ajax(postObj);
  });
};

data.postJsonWithDigest = function(urlstring, postData, digest) {
  return new Promise(function(resolve, reject) {
    const headersWithDigest = {
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json;odata=verbose',
      'X-RequestDigest': digest
    };

    const postObj = {
      url: urlstring,
      type: 'POST',
      headers: headersWithDigest,
      data: JSON.stringify(postData),
      success: function(responseData) {
        resolve(responseData);
      },
      error: function(jqxhr, status, error) {
        reject(error);
      }
    };
    
    $.ajax(postObj);
  });
};

data.getList = function(listName, orderBy) {
  return new Promise(function(resolve, reject) {
    let urlstring = data.apiEndpoint + 'web/lists/' + listName + '/items';
    
    if(orderBy) {
      urlstring = urlstring + '?orderby=' + orderBy;
    }
    
    data.getJson(urlstring).then((responseData) => {
      if(responseData.value) {
        resolve(responseData.value);
      } else {
        resolve([]);
      }
    }, (error) => {
      reject(error);
    });
  });
};

data.getSiteUsers = function() {
  return new Promise(function(resolve, reject) {
    const urlstring = data.apiEndpoint + 'Web/Siteusers';
    
    data.getJson(urlstring).then((responseData) => {
      resolve(responseData);
    }, (error) => {
      reject(error);
    });
  });
};

data.getCurrentUser = function() {
  return new Promise(function(resolve, reject) {
    const urlstring = data.apiEndpoint + 'Web/currentuser';
    
    data.getJson(urlstring).then((responseData) => {
      resolve(responseData);
    }, (error) => {
      reject(error);
    });
  });
};

data.getDigest = function() {
  return new Promise(function(resolve, reject) {
    const urlstring = data.apiEndpoint + 'contextinfo';
    
    data.postJson(urlstring).then((responseData) => {
      const requestDigest = responseData.d.GetContextWebInformation.FormDigestValue;
      resolve(requestDigest);
    }, (error) => {
      reject(error);
    });
  });
};

data.sendEmail = function(digest) {
  return new Promise(function(resolve, reject) {
    const urlstring = data.apiEndpoint + 'SP.Utilities.Utility.SendEmail';
    const recipients = ['steffensen@napma.nato.int'];
    const subject = 'Test Email from SharePoint API';
    const body = 'Hello, this is a test email sent from SharePoint!';
    
    const postData = {
      'properties': {
        '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
        'To': { 'results': recipients },
        'Subject': subject,
        'Body': body
      }
    };
    
    data.postJsonWithDigest(urlstring, postData, digest).then(() => {
      resolve();
    }, (error) => {
      reject(error);
    });
  });
};