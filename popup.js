document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('ask-button');
    const questionInput = document.getElementById('question-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const answerDisplay = document.getElementById('answer-display');
    const focusButton = document.getElementById('focus-button');

    let krutiTabId = null;

    questionInput.focus();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (sender.tab && sender.tab.id === krutiTabId) {
            if (message.type === 'krutiAnswerStream') {
                loadingIndicator.classList.add('hidden');
                if (message.answer) { answerDisplay.innerHTML = message.answer; focusButton.classList.remove('hidden'); }
                else if (message.error) { answerDisplay.textContent = `Error: ${message.error}`; }
            }
            else if (message.type === 'krutiStreamEnd') {
                if (krutiTabId) { chrome.tabs.remove(krutiTabId); krutiTabId = null; }
            }
            // --- NEW: Listen for the command to open the real source URL ---
            else if (message.type === 'openSourceUrl') {
                if (message.url) {
                    chrome.tabs.create({ url: message.url, active: false });
                }
            }
            sendResponse({ status: 'received' });
            return true;
        }
    });

    // --- UPDATED: This now sends a COMMAND instead of trying to open a link ---
    answerDisplay.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-citation-index]');
        if (link) {
            event.preventDefault();
            const index = parseInt(link.getAttribute('data-citation-index'), 10);
            if (krutiTabId !== null && !isNaN(index)) {
                // Send the "click" command to the background tab
                chrome.tabs.sendMessage(krutiTabId, { type: 'clickCitation', index: index });
            }
        }
    });

    window.addEventListener('unload', () => {
        if (krutiTabId) { chrome.tabs.remove(krutiTabId); }
    });

    askButton.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        if (question === '') { return; }
        answerDisplay.innerHTML = '';
        loadingIndicator.classList.remove('hidden');
        focusButton.classList.add('hidden');
        try {
            const queryUrl = `https://www.kruti.ai/?prompt=${encodeURIComponent(question)}`;
            const tab = await chrome.tabs.create({ url: queryUrl, active: false });
            krutiTabId = tab.id;
            const listener = (tabId, changeInfo) => {
                if (tabId === krutiTabId && changeInfo.status === 'complete') {
                    (async () => {
                        try {
                            await chrome.scripting.executeScript({ target: { tabId: krutiTabId }, files: ['content.js'] });
                            chrome.tabs.sendMessage(krutiTabId, { type: 'getKrutiAnswer' });
                        } catch (e) { if (krutiTabId) chrome.tabs.remove(krutiTabId); }
                    })();
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        } catch (error) { if (krutiTabId) chrome.tabs.remove(krutiTabId); }
    });

    focusButton.addEventListener('click', () => {
        if (krutiTabId) { chrome.tabs.update(krutiTabId, { active: true }); }
        else { chrome.tabs.create({ url: 'https://www.kruti.ai/chat', active: true }); }
        window.close();
    });

    questionInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); askButton.click(); }
    });
});
