// List of motivational quotes
const motivationalQuotes = [
  "You got this!",
  "Stay focused!",
  "One step at a time.",
  "Believe in yourself.",
  "Make it happen."
];

// List of activity reminders
const activityReminders = [
  "Have you done your burpees today?",
  "Time for a quick stretch!",
  "Drink some water!",
  "Take a deep breath.",
  "Stand up and move around."
];

// Function to replace ad elements with custom content
function replaceAdsWithContent(contentType) {
  // Find ad elements (you may need to refine this selector based on common ad patterns)
  const adElements = document.querySelectorAll('div, img, iframe');

  const adSizes = [
    { width: 1366, height: 351 },
    { width: 1366, height: 284 },
    { width: 1366, height: 281 },
    { width: 1366, height: 250 },
    { width: 1366, height: 198 },
    { width: 1366, height: 155 },
    { width: 1366, height: 90 },
    { width: 1366, height: 31 }
  ];

  adElements.forEach(ad => {
    const rect = ad.getBoundingClientRect();
    const isAdSize = adSizes.some(size => rect.width === size.width && rect.height === size.height);

    if (isAdSize) {
      console.log('Ad detected:', ad);
      ad.style.display = 'none';

			// Check if a widget already exists before the ad
			let elderSibling = ad.previousElementSibling;
			let youngerSibling = ad.nextElementSibling;
			const divSiblings = [];

			if (elderSibling) {
				while (elderSibling && !elderSibling.classList.contains('adfriend-widget')) {
					divSiblings.push(elderSibling);
					elderSibling = elderSibling.previousElementSibling;
				}
			}

			if (youngerSibling) {
				while (youngerSibling && !youngerSibling.classList.contains('adfriend-widget')) {
					divSiblings.push(youngerSibling);
					youngerSibling = youngerSibling.nextElementSibling;
				}
			}

			console.log("Previous div siblings:", divSiblings);

      if (elderSibling && elderSibling.classList.contains('adfriend-widget')) {
        // Remove the existing widget
        console.log('Removing elder widget:', elderSibling);
        elderSibling.remove();
      }

			if (youngerSibling && youngerSibling.classList.contains('adfriend-widget')) {
				// Remove younger widget
				console.log('Removing younger widget:', youngerSibling);
				youngerSibling.remove();
			}

      // Create a new widget element
      const widget = document.createElement('div');
      widget.className = 'adfriend-widget';

      // Add content based on the selected type
      if (contentType === 'quotes') {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        widget.textContent = randomQuote;
      } else if (contentType === 'reminders') {
        const randomReminder = activityReminders[Math.floor(Math.random() * activityReminders.length)];
        widget.textContent = randomReminder;
      }

      // Insert the widget after the ad element
      ad.parentNode.insertBefore(widget, ad.nextSibling);
    }
  });
}

// Function to initialize the MutationObserver
function initMutationObserver(contentType) {
  const observer = new MutationObserver((mutations) => {
    try {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          console.log('New elements added to the DOM. Checking for ads...');
          replaceAdsWithContent(contentType);
        }
      });
    } catch (error) {
      console.error('Error in mutation observer:', error);
    }
  });

  // Start observing the document for changes
  observer.observe(document.body, { childList: true, subtree: true });

  // Cleanup function
  return () => observer.disconnect();
}

// Load user preferences and replace ads
chrome.storage.sync.get(['contentType'], (result) => {
  const contentType = result.contentType || 'quotes'; // Default to quotes

  // Initial ad replacement
  replaceAdsWithContent(contentType);

  // Initialize MutationObserver to detect dynamically loaded ads
  initMutationObserver(contentType);
});
