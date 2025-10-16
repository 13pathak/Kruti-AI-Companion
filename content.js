(function() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'getKrutiAnswer') {

            const waitForElement = (selector, timeout = 20000) => {
                return new Promise((resolve, reject) => {
                    const intervalTime = 500;
                    let elapsedTime = 0;
                    const interval = setInterval(() => {
                        const element = document.querySelector(selector);
                        if (element) {
                            clearInterval(interval);
                            resolve(element);
                        } else {
                            elapsedTime += intervalTime;
                            if (elapsedTime >= timeout) {
                                clearInterval(interval);
                                reject(new Error(`Timed out waiting for element "${selector}".`));
                            }
                        }
                    }, intervalTime);
                });
            };

            const streamAnswer = async () => {
                try {
                    const answerContainer = await waitForElement('div[id="markdown-content"]');
                    let debounceTimer;

                    const observer = new MutationObserver(() => {
                        // 1. Send the current full HTML content on every change
                        const currentHTML = answerContainer.innerHTML;
                        chrome.runtime.sendMessage({ type: 'krutiAnswerStream', answer: currentHTML });

                        // 2. Reset a timer every time a change is detected
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            // 3. When 1.5 seconds pass with no changes, assume it's finished
                            observer.disconnect(); // Stop watching
                            chrome.runtime.sendMessage({ type: 'krutiStreamEnd' }); // Send the "I'm done" signal
                        }, 1500); // 1.5 seconds of silence means the stream is over
                    });

                    observer.observe(answerContainer, { childList: true, subtree: true, characterData: true });

                    // Send the initial content immediately
                    const initialHTML = answerContainer.innerHTML;
                    if (initialHTML.trim()) {
                        chrome.runtime.sendMessage({ type: 'krutiAnswerStream', answer: initialHTML });
                        // Start the initial timer
                        debounceTimer = setTimeout(() => {
                           observer.disconnect();
                           chrome.runtime.sendMessage({ type: 'krutiStreamEnd' });
                        }, 1500);
                    }

                } catch (error) {
                    const errorMsg = "Could not find the answer container on the page.";
                    console.error(errorMsg, error);
                    chrome.runtime.sendMessage({ type: 'krutiAnswerStream', error: errorMsg });
                }
            };

            streamAnswer();
            return true;
        }
    });
})();