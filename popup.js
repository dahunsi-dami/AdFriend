document.getElementById('save').addEventListener('click', () => {
	const contentType = document.getElementById('content-type').value;
	chrome.storage.sync.set({ contentType }, () => {
		console.log('Preferences saved:', contentType);
		// Notify the user
		alert('Preferences saved! Reload the page to see changes.');
	});
});
