# Google AI Studio Optimizer

Performance optimization userscript for Google AI Studio.

## Features

- Hide old messages
- Reduce DOM lag
- Collapse code blocks
- Restore hidden messages
- Configurable cache system
- Lightweight floating UI

## Description

Google AI Studio Optimizer is a lightweight userscript that improves performance in long Google AI Studio conversations by reducing DOM overload and optimizing message rendering.

It limits the number of visible messages, adds optional code block collapsing, and manages cached content during extended sessions.

Everything runs locally in your browser. No network requests, no tracking, and no modification of AI responses.

## Key features

* Reduces lag in long conversations
* Limits rendered chat messages (you can configure how many messages are loaded)
* Collapses code blocks automatically (expand/collapse all visible blocks with a button)
* Lightweight caching system (configurable cache size)
* Optional DOM cleanup for improved performance
* Simple floating control panel

## 🎯 Goal

Make long Google AI Studio sessions faster and more responsive without changing how the AI works.

## Installation

### 1. Install Tampermonkey
https://www.tampermonkey.net/

### 2. Install the script
Download:
google-ai-studio-optimizer.user.js

### 3. Open Google AI Studio
https://aistudio.google.com/

---

## Feedback / Issues

If you encounter any problem, please open an issue:
https://github.com/Kfayyy/Google-AI-Studio-Optimizer/issues

## Why this script exists

Large conversations in Google AI Studio can become slow because:
- too many DOM nodes,
- huge code blocks,
- continuous rendering.

This userscript reduces lag by:
- hiding old messages,
- purging cached DOM nodes,
- collapsing code automatically.

---

## License

MIT

---

## 📖 Usage

After installing the script and opening Google AI Studio, the optimizer starts automatically in the background. No additional setup is required.

The script adds two floating buttons at the bottom of the page:

### ⚡ Optimizer Panel

Click the **⚡** button to open the settings panel.

Available options:

### **Max visible**

Controls how many messages remain visible in the conversation.

Example:

* `35` → only the latest 35 messages remain visible
* older messages are automatically hidden

Lower values:

* reduce memory usage
* improve performance
* make scrolling smoother

Higher values:

* keep more conversation history visible
* use more browser resources

---

### **Restore count**

Controls how many hidden messages are restored each time you click **Restore**.

Example:

* `10` → clicking **Restore** will bring back the latest 10 hidden messages

Useful when you want to temporarily view an older part of the conversation.

---

### **Cache size**

Controls how many hidden messages are kept in the optimizer cache.

Example:

* `50` → the latest 50 hidden messages remain immediately available for restoration

Lower values:

* reduce memory usage
* apply more aggressive interface cleanup

Higher values:

* keep more history quickly accessible
* use more browser resources

Note: The script only affects how content is displayed on the page. Your Google AI Studio conversation history is never deleted or modified.

---

### **⚡ Optimizer ON / OFF**

Enables or disables automatic optimization.

**ON**: The script is active.

**OFF**: The script is disabled. Refresh the page for the change to take effect. This behaves the same as disabling the script in Tampermonkey.

---

### **⬆ Restore**

Restores hidden messages according to the value defined in **Restore count**.

Example:

If `Restore count = 10`

Clicking **Restore** will bring back the latest 10 hidden messages.

---

### **⬇ Clean**

Reapplies the optimization using the current **Max visible** setting.

Example:

If `Max visible = 10`

Clicking **Clean**:

* only the latest 10 messages will remain visible

---

### ▼ Code Collapse Button

The **▼** button collapses all currently visible **code blocks**.

This can improve performance during long coding sessions because large expanded code blocks significantly increase rendering load.

Tip: You can wrap any text inside code blocks:

```csharp (your text) ```
