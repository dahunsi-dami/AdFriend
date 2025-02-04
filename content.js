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
/* Former ad detection and removal logic

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
*/
  
  // Common ad-related keywords and patterns
  const adPatterns = {
    classAndId: /\b(ad|ads|advert|banner|commercial|promo|sponsor|advertisement|marketing|StandardAd)\b/i,
    attributes: ['data-ad', 'data-ad-client', 'data-ad-slot', 'data-adtest', 'data-advertising', 'data-ad-loc', 'data-ad-unit', 'data-ad-size', 'data-ad-region'],
    attributeValues: /\b(StandardAd|Advertisement|[aA]d-\w+|[aA]ds?\b|[aA]dvert(isement)?s?|sponsor(ed)?|promoted|marketing|dfp)/i,
    domains: /(?:doubleclick|adsystem|adskeeper|adnxs|taboola|outbrain|mgid|criteo|googleadservices|google.*ads|adroll|amazon-adsystem|facebook.*ads)/i
  };

  // Find potential ad elements
  const elements = document.querySelectorAll('div:not(.adfriend-widget), iframe, img, section, aside');
  
  elements.forEach(element => {
    // Skip if this element has already been processed
    if (element.hasAttribute('data-adfriend-processed')) {
      return;
    }

    // Skip if any parent element has already been processed
    let ancestor = element.parentElement;
    while (ancestor) {
      if (ancestor.hasAttribute('data-adfriend-processed')) {
        return;
      }
      ancestor = ancestor.parentElement;
    }

    // NEW: Skip and hide zero-size elements
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      // console.log('ZERO-SIZED ELEMENT HIDDEN!!!', element);
      return;
    }

    let score = 0;
    
    // Check element attributes
    const attributes = Array.from(element.attributes).map(attr => `${attr.name}=${attr.value}`).join(' ');
    
    // Check class names and IDs
    if (adPatterns.classAndId.test(element.className) || adPatterns.classAndId.test(element.id)) {
      score += 2;
    }

    // Check custom data attributes
    adPatterns.attributes.forEach(attr => {
      if (element.hasAttribute(attr)) score += 2;
    });

    // Check if any attribute value matches ad patterns (NEWLY ADDED SECTION)
    Array.from(element.attributes).forEach(attr => {
      if (adPatterns.attributeValues.test(attr.value)) {
        score += 2;
      }
    });

    // Check src/href attributes for ad network domains
    const src = element.src || element.href || '';
    if (adPatterns.domains.test(src)) {
      score += 3;
    }

    // Check for common ad properties
    if (element.tagName === 'IFRAME' && !element.srcdoc) score += 1;
    if (element.style.position === 'fixed') score += 1;
    if (element.style.zIndex > 1000) score += 1;

    // Check parent elements for ad indicators
    let parent = element.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      if (adPatterns.classAndId.test(parent.className) || adPatterns.classAndId.test(parent.id)) {
        score += 1;
      }
      parent = parent.parentElement;
    }

    // If element seems to be an ad (score threshold can be adjusted)
    if (score >= 2) {
      console.log('Ad detected with score:', score, element);

      // Find the topmost ad container
      let adContainer = element;
      let parent = element.parentElement;
      while (parent) {
        if (adPatterns.classAndId.test(parent.className) || 
            adPatterns.classAndId.test(parent.id) ||
            parent.classList.contains('ad') ||
            parent.classList.contains('dfp-ad')) {
          adContainer = parent;
        }
        parent = parent.parentElement;
      }

      // Check if a widget already exists within or after the ad container
      const existingWidget = adContainer.parentElement.querySelector('.adfriend-widget');
      if (existingWidget) {
        return; // Skip if widget already exists
      }

      // Get parent element of ad container
      const adContainerParent = adContainer.parentElement;
      console.log('PARENT CLASS IS: ', adContainerParent.classList)
      console.log('PARENT OFFSET IS: ', adContainerParent.offsetWidth, adContainerParent.offsetHeight);

      // Get the computed style of the ad container
      // const adStyle = window.getComputedStyle(adContainer.parentElement);
      // const adWidth = adStyle.width;
      // const adHeight = adStyle.height;

      // Get the bounding rectangle of the ad container's parent
      // const parentRect = adContainerParent.getBoundingClientRect();

      // Get the computed styles for margins
      const parentStyle = window.getComputedStyle(adContainerParent);

      // Parse padding & border values values
      const parentHeight = parseFloat(parentStyle.height);
      const paddingTop = parseFloat(parentStyle.paddingTop);
      const paddingBottom = parseFloat(parentStyle.paddingBottom);
      const borderTop = parseFloat(parentStyle.borderTopWidth);
      const borderBottom = parseFloat(parentStyle.borderBottomWidth);

      console.log('PARENT HEIGHT IS: ', parentHeight);
      console.log('PARENT TOP PADDING IS: ', paddingTop);
      console.log('PARENT BOTTOM PADDING IS: ', paddingBottom);
      console.log('PARENT BORDER TOP IS: ', borderTop);
      console.log('PARENT BORDER BOTTOM IS: ', borderBottom);

      const newPaddingBottom = paddingBottom - paddingBottom;
      const newPaddingTop = paddingTop - paddingTop;
      adContainerParent.style.paddingBottom = newPaddingBottom + 'px';
      adContainerParent.style.paddingTop = newPaddingTop + 'px';

      // Calculate total width and height including borders and margins
      let totalWidth = parentStyle.width;
      let totalHeight = parentHeight + paddingTop + paddingBottom + borderTop + borderBottom;

      const adWidth = adContainerParent.offsetWidth + 'px'; // Converts to string with px
      const adHeight = adContainerParent.offsetHeight + 'px';
      totalWidth = totalWidth + 'px';
      totalHeight = totalHeight + 'px';

      console.log('PARENT RECT IS: ', totalWidth, totalHeight);

      // Create and insert widget
      const widget = document.createElement('div');
      widget.className = 'adfriend-widget';
      widget.setAttribute('data-adfriend-processed', 'true');

      // Apply the dimension and styling
      widget.style.width = adWidth;
      widget.style.minHeight = adHeight;

        // Add content based on the selected type
      if (contentType === 'quotes') {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        widget.textContent = randomQuote;
      } else if (contentType === 'reminders') {
        const randomReminder = activityReminders[Math.floor(Math.random() * activityReminders.length)];
        widget.textContent = randomReminder;
      }

      // Hide the ad container after getting its dimensions
      adContainer.style.display = 'none';

      // Mark the entire ad container and its children as processed
      adContainer.setAttribute('data-adfriend-processed', 'true');
      adContainer.querySelectorAll('*').forEach(child => {
        child.setAttribute('data-adfriend-processed', 'true');
      });

      /* Only insert widget if one doesn't already exist after this container
      const nextSibling = adContainer.nextElementSibling;
      if (!nextSibling || !nextSibling.classList.contains('adfriend-widget')) {
      */


      // Insert the widget after the ad container
      adContainer.parentNode.insertBefore(widget, adContainer.nextSibling);
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
