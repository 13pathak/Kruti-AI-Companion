# Kruti AI Companion 🤖

A Chrome extension for asking Kruti AI questions from the browser toolbar. It opens Kruti AI in a background tab and displays the response in the extension popup.

---

## Features ✨

* **Instant Answers:** Click the extension icon, type your question, and get an answer directly in the popup.
* **Response Updates:** Displays the answer as the Kruti AI page updates.
* **Formatted Answers:** Displays the answer's HTML, including lists and formatting. Citation links depend on the background tab and stop working after it closes.
* **Efficient & Clean:** Automatically opens and closes a background tab to communicate with Kruti AI, leaving no clutter.
* **Sleek UI:** A clean, dark-themed user interface that is easy on the eyes.

---

## How It Works ⚙️

The extension reads responses from the Kruti AI website rather than calling an API. It depends on the site's URL parameters and page structure:

1.  When you ask a question, the extension constructs a special URL (`https://www.kruti.ai/?prompt=...`).
2.  It opens this URL in a new background tab without activating it. This URL automatically submits your query to Kruti AI.
3.  A content script is then injected into that background page.
4.  The script watches the answer box on the page and captures its HTML when the content changes.
5.  The captured HTML is sent back to the extension's popup, which displays it live.
6.  After 1.5 seconds without an answer update, the script signals completion and the background tab closes. Closing the popup also closes the background tab.

---

## Installation 🛠️

Download or clone this repository, then load it manually in Developer Mode. If downloading a ZIP, extract it first.

1.  Open your browser and navigate to `chrome://extensions` (or `brave://extensions` for Brave).
2.  In the top-right corner, turn on the **Developer mode** toggle switch.
    
3.  Click the **Load unpacked** button that appears on the top-left.
4.  In the file selection window, select the downloaded repository folder containing `manifest.json`.
5.  The "Kruti AI Companion" will now appear in your list of extensions, and its icon will be added to your toolbar!

---

## Project Files 📂

* **`manifest.json`**: The core file that defines the extension's permissions, name, icons, and scripts.
* **`popup.html`**: The HTML structure for the popup window that appears when you click the extension icon.
* **`popup.css`**: The CSS file that styles the `popup.html` window, giving it its look and feel.
* **`popup.js`**: The JavaScript that powers the popup window. It handles button clicks and communication with the content script.
* **`content.js`**: The JavaScript that gets injected into the background Kruti AI tab. Its job is to scrape the answer and send it back to the popup.
* **`icons/`**: A folder containing the `icon16.png`, `icon48.png`, and `icon128.png` files for the extension.
* **`readme.md`**: Setup and usage documentation.