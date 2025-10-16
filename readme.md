# Kruti AI Companion 🤖

A lightweight and powerful Chrome extension that brings the functionality of Kruti AI directly into your browser's toolbar. Get answers from Kruti AI in a convenient popup window, complete with real-time streaming and full HTML rendering, just like the official website.

---

## Features ✨

* **Instant Answers:** Click the extension icon, type your question, and get an answer directly in the popup.
* **Real-Time Streaming:** Watch the answer appear word-by-word in real-time, exactly as it does on the Kruti AI website.
* **Full HTML Support:** Renders rich content like clickable links, lists, and proper formatting for a seamless experience.
* **Efficient & Clean:** Automatically opens and closes a background tab to communicate with Kruti AI, leaving no clutter.
* **Sleek UI:** A clean, dark-themed user interface that is easy on the eyes.

---

## How It Works ⚙️

Since Kruti AI does not have a public API, this extension cleverly automates the process of getting an answer:

1.  When you ask a question, the extension constructs a special URL (`https://www.kruti.ai/?prompt=...`).
2.  It opens this URL in a new, hidden background tab. This URL automatically submits your query to Kruti AI.
3.  A content script is then injected into that background page.
4.  This script patiently watches the answer box on the page. As Kruti AI streams the answer, the script captures the full HTML content in real-time.
5.  The captured HTML is sent back to the extension's popup, which displays it live.
6.  Once the AI stops writing for a moment, the script sends a final "finished" signal, and the background tab is automatically closed.

---

## Installation 🛠️

Since this is a custom extension, you need to load it manually in Developer Mode.

1.  Open your browser and navigate to `chrome://extensions` (or `brave://extensions` for Brave).
2.  In the top-right corner, turn on the **Developer mode** toggle switch.
    
3.  Click the **Load unpacked** button that appears on the top-left.
4.  In the file selection window, navigate to and select the entire `Kruti AI Extension` folder.
5.  The "Kruti AI Companion" will now appear in your list of extensions, and its icon will be added to your toolbar!

---

## Project Files 📂

* **`manifest.json`**: The core file that defines the extension's permissions, name, icons, and scripts.
* **`popup.html`**: The HTML structure for the popup window that appears when you click the extension icon.
* **`popup.css`**: The CSS file that styles the `popup.html` window, giving it its look and feel.
* **`popup.js`**: The JavaScript that powers the popup window. It handles button clicks and communication with the content script.
* **`content.js`**: The JavaScript that gets injected into the hidden Kruti AI webpage. Its job is to scrape the answer and send it back to the popup.
* **`icons/`**: A folder containing the `icon16.png`, `icon48.png`, and `icon128.png` files for the extension.
* **`README.md`**: This file!