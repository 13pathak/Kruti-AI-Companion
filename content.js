(function() {
    // --- This function now lives here to be accessible by multiple listeners ---
    const getRealSourceUrlAndOpen = async (index) => {
        try {
            // Find all potential source links in the hidden panel
            const sourceLinks = document.querySelectorAll('div[id*="follow-prompts-container"] a[href]');
            if (sourceLinks[index]) {
                const urlToOpen = sourceLinks[index].href;
                // Send the real URL back to the popup to be opened
                chrome.runtime.sendMessage({ type: 'openSourceUrl', url: urlToOpen });
            }
        } catch (e) {
            console.error("Could not find the source link after click.", e);
        }
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'getKrutiAnswer') {
            // ... (The waitForElement function remains the same)
            const waitForElement = (selector, timeout = 20000) => {
                return new Promise((resolve, reject) => {
                    const intervalTime = 500; let elapsedTime = 0;
                    const interval = setInterval(() => {
                        const element = document.querySelector(selector);
                        if (element) { clearInterval(interval); resolve(element); }
                        else { elapsedTime += intervalTime; if (elapsedTime >= timeout) { clearInterval(interval); reject(new Error(`Timeout: ${selector}`)); } }
                    }, intervalTime);
                });
            };

            const streamAnswer = async () => {
                try {
                    const answerContainer = await waitForElement('div[id="markdown-content"]');
                    let debounceTimer;

                    const observer = new MutationObserver(() => {
                        // Tag each citation with an index so the popup knows which one was clicked
                        const citationLinks = answerContainer.querySelectorAll('p a');
                        citationLinks.forEach((link, index) => {
                            link.setAttribute('data-citation-index', index);
                            link.href = "#"; // Set a dummy href to make it clickable
                        });

                        const currentHTML = answerContainer.innerHTML;
                        chrome.runtime.sendMessage({ type: 'krutiAnswerStream', answer: currentHTML });

                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            observer.disconnect();
                            chrome.runtime.sendMessage({ type: 'krutiStreamEnd' });
                        }, 1500);
                    });

                    observer.observe(answerContainer, { childList: true, subtree: true, characterData: true });
                } catch (error) {
                    chrome.runtime.sendMessage({ type: 'krutiAnswerStream', error: "Could not find answer container." });
                }
            };
            streamAnswer();
            return true;
        }
        // --- NEW: Listen for the click command from the popup ---
        else if (message.type === 'clickCitation') {
            const index = message.index;
            // Find the corresponding citation link ON THE REAL PAGE and click it
            const citationLinksOnPage = document.querySelectorAll('div[id="markdown-content"] p a');
            if (citationLinksOnPage[index]) {
                citationLinksOnPage[index].click();
                // After clicking, wait a moment for the source panel to appear, then find the link
                setTimeout(() => getRealSourceUrlAndOpen(index), 500);
            }
            return true;
        }
    });
})();
