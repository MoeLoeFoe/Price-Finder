// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetchData') {
      // Process the data and send it to your server
      fetch('http://my-server-url/api/receive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message.data)
      }).then(response => response.json())
        .then(data => {
          sendResponse({ status: 'success', data: data });
        }).catch(error => {
          sendResponse({ status: 'error', error: error });
        });
  
      return true;  // Keep the message channel open for sendResponse
    }
  });