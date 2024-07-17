// content.js
const data = { /* the data you want to send */ };

chrome.runtime.sendMessage({ type: 'fetchData', data: data }, (response) => {
  if (response.status === 'success') {
    console.log('Data sent successfully:', response.data);
  } else {
    console.error('Error sending data:', response.error);
  }
});