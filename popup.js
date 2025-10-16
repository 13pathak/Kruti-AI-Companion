document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('ask-button');
    const questionInput = document.getElementById('question-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const answerDisplay = document.getElementById('answer-display');
    const focusButton = document.getElementById('focus-button');

    let krutiTabId = null;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (sender.tab && sender.tab.id === krutiTabId) {
            if (message.type === 'krutiAnswerStream') {
                loadingIndicator.classList.add('hidden');
                if (message.answer) {
                    answerDisplay.innerHTML = message.answer;
                    focusButton.classList.remove('hidden');
                } else if (message.error) {
                    answerDisplay.textContent = `Error: ${message.error}`;
                }
            }
            else if (message.type === 'krutiStreamEnd') {
                if (krutiTabId) {
                    chrome.tabs.remove(krutiTabId);
                    krutiTabId = null;
                }
            }
            sendResponse({ status: 'received' });
            return true;
        }
    });

    window.addEventListener('unload', () => {
        if (krutiTabId) {
            chrome.tabs.remove(krutiTabId);
        }
    });

    askButton.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        if (question === '') {
            answerDisplay.textContent = "Please enter a question.";
            return;
        }
        answerDisplay.innerHTML = '';
        loadingIndicator.classList.remove('hidden');
        focusButton.classList.add('hidden');
        try {
            const queryUrl = `https://www.kruti.ai/?prompt=${encodeURIComponent(question)}`;
            const tab = await chrome.tabs.create({ url: queryUrl, active: false });
            krutiTabId = tab.id;
            const listener = (tabId, changeInfo, updatedTab) => {
                if (tabId === krutiTabId && changeInfo.status === 'complete') {
                    (async () => {
                        try {
                            await chrome.scripting.executeScript({ target: { tabId: krutiTabId }, files: ['content.js'] });
                            chrome.tabs.sendMessage(krutiTabId, { type: 'getKrutiAnswer' });
                        } catch (scriptError) {
                            console.error("Injection/messaging failed:", scriptError);
                            if (krutiTabId) chrome.tabs.remove(krutiTabId);
                        }
                    })();
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        } catch (error) {
            if (krutiTabId) chrome.tabs.remove(krutiTabId);
        }
    });

    focusButton.addEventListener('click', () => {
        if (krutiTabId) {
            chrome.tabs.update(krutiTabId, { active: true });
        } else {
            chrome.tabs.create({ url: 'https://www.kruti.ai/chat', active: true });
        }
        window.close();
    });

    questionInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            askButton.click();
        }
    });
});