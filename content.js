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

// Common ad-related keywords and patterns
const adPatterns = {
	classAndId: /\b(ad|ads|advert|banner|commercial|promo|sponsor|advertisement|marketing|StandardAd)\b/i,
	attributes: new Set(['data-ad', 'data-ad-client', 'data-ad-slot', 'data-adtest', 'data-advertising', 'data-ad-loc', 'data-ad-unit', 'data-ad-size', 'data-ad-region']),
	attributeValues: /\b(StandardAd|Advertisement|[aA]d-\w+|[aA]ds?\b|[aA]dvert(isement)?s?|sponsor(ed)?|promoted|marketing|dfp)/i,
	domains: /(?:doubleclick|adsystem|adskeeper|adnxs|taboola|outbrain|mgid|criteo|googleadservices|google.*ads|adroll|amazon-adsystem|facebook.*ads)/i
};

// Function to detect ads
function isAdElement(element) {
	let score = 0;

	// Quick checks first - these are the most common and fastest to evaluate
	const className = element.className;
	const id = element.id;

	// Early return for common ad classes/IDs (highest impact indicators)
	if (className && typeof className === 'string' && (
		className.includes(' ad ') || 
			className.includes(' ads ') || 
			className.includes('advertisement'))) {
		console.log("Ad Class Is: ", className);
		return true;
	}

	if (id && (id.includes('ad') || id.includes('ads') || id.includes('advertisement'))) {
		console.log("Ad Id Is: ", id);
		return true;
	}

	// Check for iframes without srcdoc (common ad format)
	if (element.tagName === 'IFRAME' && !element.srcdoc) {
		score += 1;

		// Check src for ad domains only if it's an iframe
		const src = element.src;
		if (src && adPatterns.domains.test(src)) {
			score += 3;
			if (score >= 2) {
				console.log("Ad Src Is: ", src);
				return true;
			}
		}
	}

	// Batch attribute checking for better performance
	const attributes = element.attributes;
	if (attributes) {
		let hasAdAttribute = false;

		// Single loop through attributes
		for (let i = 0; i < attributes.length; i++) {
			const attr = attributes[i];
			const attrName = attr.name;
			const attrValue = attr.value;

			// Check for common ad attributes (using Set for O(1) lookup)
			if (adPatterns.attributes.has(attrName)) {
				score += 2;
				if (score >= 2) return true;
				hasAdAttribute = true;
			}

			// Only check attribute values if we haven't found an ad attribute
			// and the value is non-empty
			if (!hasAdAttribute && attrValue && adPatterns.attributeValues.test(attrValue)) {
				score += 2;
				if (score >= 2) {
					console.log("Ad Attribute Is: ", attrName);
					return true;
				}
			}
		}
	}

	// Style checks (only if we haven't already identified as an ad)
	const style = element.style;
	if (style) {
		if (style.position === 'fixed') score += 1;
		if (parseFloat(style.zIndex) > 1000) score += 1;

		if (score >= 2) {
			console.log("Ad Style Is ", style);
			return true;
		}
	}

	// Parent checks - limit to immediate parent for performance
	// Only check parent if we still need more points
	if (score >= 1) {
		const parent = element.parentElement;
		if (parent && (
			adPatterns.classAndId.test(parent.className) || 
				adPatterns.classAndId.test(parent.id))) {
			score += 1;
		}
	}

	return score >= 2;
}

// Function to replace ad elements with custom content
function replaceAdsWithContent(contentType) {
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

		// Skip and hide zero-size elements
		if (element.offsetWidth === 0 || element.offsetHeight === 0) {
			return;
		}

		// Use isAdElement() to check if this is an ad
		if (isAdElement(element)) {
			console.log('Ad detected:', element);

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
			const parentStyle = window.getComputedStyle(adContainerParent);

			// Parse padding & border values
			const parentHeight = parseFloat(parentStyle.height);
			const paddingTop = parseFloat(parentStyle.paddingTop);
			const paddingBottom = parseFloat(parentStyle.paddingBottom);
			const borderTop = parseFloat(parentStyle.borderTopWidth);
			const borderBottom = parseFloat(parentStyle.borderBottomWidth);

			const newPaddingBottom = paddingBottom - paddingBottom;
			const newPaddingTop = paddingTop - paddingTop;
			adContainerParent.style.paddingBottom = newPaddingBottom + 'px';
			adContainerParent.style.paddingTop = newPaddingTop + 'px';

			// Calculate total width and height including borders and margins
			let totalWidth = parentStyle.width;
			let totalHeight = parentHeight + paddingTop + paddingBottom + borderTop + borderBottom;
			const adWidth = adContainerParent.offsetWidth + 'px';
			const adHeight = adContainerParent.offsetHeight + 'px';
			totalWidth = totalWidth + 'px';
			totalHeight = totalHeight + 'px';

			// Create and insert widget
			const widget = document.createElement('div');
			widget.className = 'adfriend-widget';
			widget.setAttribute('data-adfriend-processed', 'true');
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

			// Insert the widget after the ad container
			adContainer.parentNode.insertBefore(widget, adContainer.nextSibling);
		}
	});
}

// Throttle function that ensures a function is called at most once per specified time period
function throttle(func, limit) {
	let inThrottle = false;
	let savedArgs = null;
	let savedThis = null;

	return function wrapper(...args) {
		// If we're in throttle period, save the most recent call
		if (inThrottle) {
			savedArgs = args;
			savedThis = this;
			return;
		}

		// Call the function and set throttle flag
		func.apply(this, args);
		inThrottle = true;

		// Start timeout to reset throttle
		setTimeout(() => {
			inThrottle = false;
			// If there was a call during throttle period, call it now
			if (savedArgs) {
				wrapper.apply(savedThis, savedArgs);
				savedArgs = null;
				savedThis = null;
			}
		}, limit);
	};
}

// Function to initialize the MutationObserver
function initMutationObserver(contentType) {
	// Keep track of processed mutations to avoid redundant work
	const processedMutations = new WeakSet();

	// Throttled version of replaceAdsWithContent
	const throttledReplaceAds = throttle((contentType) => {
		replaceAdsWithContent(contentType);
	}, 250); // Adjust this value based on performance needs (currently set to 250ms)

	// Create batch processor for mutations
	const processMutationsBatch = (mutations) => {
		let shouldProcess = false;

		// Check if any mutation in the batch needs processing
		for (const mutation of mutations) {
			if (processedMutations.has(mutation)) continue;

			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				// Check if any added node is a potential ad container
				const hasRelevantNodes = Array.from(mutation.addedNodes).some(node => {
					if (node.nodeType !== Node.ELEMENT_NODE) return false;

					// Check for relevant tag names first (fast check)
					if (node.tagName === 'IFRAME' || 
						node.tagName === 'DIV' ||
						node.tagName === 'IMG' ||
						node.tagName === 'ASIDE') {
						return true;
					}

					// Check class names and IDs against our comprehensive patterns
					if (node.className && typeof node.className === 'string') {
						if (adPatterns.classAndId.test(node.className)) {
							return true;
						}
					}

					if (node.id && adPatterns.classAndId.test(node.id)) {
						return true;
					}

					// Check for ad-related attributes
					if (Array.from(node.attributes).some(attr => 
						adPatterns.attributes.has(attr.name) || 
							adPatterns.attributeValues.test(attr.value))) {
						return true;
					}

					return false;
				});

				if (hasRelevantNodes) {
					shouldProcess = true;
					processedMutations.add(mutation);
				}
			}
		}

		// Only call replaceAdsWithContent if we found relevant mutations
		if (shouldProcess) {
			console.log('New potential ad elements detected. Processing...');
			throttledReplaceAds(contentType);
		}
	};

	// Create the observer with batched and throttled processing
	const observer = new MutationObserver((mutations) => {
		try {
			processMutationsBatch(mutations);
		} catch (error) {
			console.error('Error in mutation observer:', error);
		}
	});

	// Configure observer with optimized options
	const observerOptions = {
		childList: true,
		subtree: true,
		attributes: false, // Only observe DOM additions, not attribute changes
		characterData: false // Ignore text content changes
	};

	// Start observing the document with optimized options
	observer.observe(document.body, observerOptions);

	// Cleanup function
	return () => {
		observer.disconnect();
	};
}

// Load user preferences and replace ads
chrome.storage.sync.get(['contentType'], (result) => {
	const contentType = result.contentType || 'quotes'; // Default to quotes

	// Initial ad replacement with a small delay to let the page load
	setTimeout(() => {
		replaceAdsWithContent(contentType);
		// Initialize MutationObserver to detect dynamically loaded ads
		initMutationObserver(contentType);
	}, 100);
});
