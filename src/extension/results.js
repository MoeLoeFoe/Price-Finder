document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const jsonResults = params.get('results');
  const resultsElement = document.getElementById('jsonResults');
  const downloadButton = document.getElementById('downloadButton');

  if (jsonResults) {
    const resultsObj = JSON.parse(decodeURIComponent(jsonResults));
    resultsElement.textContent = JSON.stringify(resultsObj, null, 2);

    downloadButton.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(resultsObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'search_results.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
});
