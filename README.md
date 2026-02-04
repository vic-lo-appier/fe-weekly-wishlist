# 💡 FE Weekly Wishlist

A modern, high-performance wishlist application built with **React 19**, **TypeScript**, and **Tailwind CSS v4**, powered by **Google Apps Script (GAS)** and **Google Sheets**.

This project transitions from a traditional Google Apps Script UI to a professional **Single Page Application (SPA)** architecture, featuring **Optimistic UI** updates for a seamless user experience.

---

## ✨ Key Features

- 🚀 **Optimistic UI Updates**: All actions (Voting, Adding, Deleting) reflect instantly in the UI without waiting for server responses, providing a "latency-free" feel.
- 🛡️ **Role-Based Access Control**: Automatically identifies the creator and admin. Only authorized users can edit or delete their respective proposals.
- 📱 **Modern Tech Design**: A sleek, dark-mode interface built with Tailwind CSS v4, optimized for both desktop and mobile views.
- 🏗️ **Professional Tooling**: Developed using **Vite** for fast builds, **clasp** for CLI management, and **TypeScript** for robust type safety.
- 📊 **Real-time Sync**: Bi-directional data flow between the React frontend and Google Sheets backend.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 (Functional Components, Hooks)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Glassmorphism UI)
- **Backend/Database**: Google Apps Script & Google Sheets
- **Deployment Tooling**: `clasp` (Command Line Apps Script Projects)
- **Bundler**: Vite with `vite-plugin-singlefile`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [clasp](https://github.com/google/clasp) installed globally (`npm install -g @google/clasp`)
- A Google Cloud/Apps Script project

### Installation

1. **Clone the repository**
```bash
git clone [https://github.com/YOUR_USERNAME/fe-weekly-wishlist.git](https://github.com/YOUR_USERNAME/fe-weekly-wishlist.git)
cd fe-weekly-wishlist
```



2. **Install dependencies**
```bash
npm install
```


3. **Login to Google**
```bash
clasp login
```


4. **Connect to your Script**
Replace `YOUR_SCRIPT_ID` in `.clasp.json` or run:
```bash
clasp clone "YOUR_SCRIPT_ID"

```



### Deployment

To build the React app and push it to Google Apps Script:

```bash
npm run push

```

---

## 📋 Spreadsheet Structure

To ensure compatibility, your Google Sheet must have a tab named `💡 主題願望清單` with the following columns:

| Column | Description |
| --- | --- |
| **A** | Vote Count (Number) |
| **B** | Topic Title (String) |
| **C** | Description/Questions (String) |
| **D** | Creator's Email (String) |

---

## ⚙️ Project Properties

The application requires an **Admin Email** to be set in the Google Apps Script project properties:

1. Go to **Project Settings** (gear icon) in the GAS editor.
2. Add a Script Property:
* Property: `ADMIN_EMAIL`
* Value: `your_email@company.com`



---

## 🔒 Security & Privacy

This project uses `.gitignore` to prevent sensitive information from being leaked:

* `.clasp.json`: Contains your unique Script ID.
* `.clasprc.json`: Contains your Google account credentials.
* **Never remove these from `.gitignore`.**



