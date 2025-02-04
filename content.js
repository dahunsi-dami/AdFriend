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
  const adElements = document.querySelectorAll('.ad, .advertisement, iframe');

  adElements.forEach(ad => {
    // Hide the ad
    ad.style.display = 'none';

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
  });
}

// Load user preferences and replace ads
chrome.storage.sync.get(['contentType'], (result) => {
  const contentType = result.contentType || 'quotes'; // Default to quotes
  replaceAdsWithContent(contentType);
});
