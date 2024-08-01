# Pantry Tracker App

## Overview

The Pantry Tracker App is a web application that helps users manage their pantry inventory. Users can add, remove, and classify items in their inventory, as well as export the data to PDF or CSV formats. The app also supports user authentication and categorization of items. Additionally, users can capture images using their webcam, classify these images using OpenAI's API, and link the classification to their inventory items.

## Features

- **User Authentication**: Sign in and sign out functionality using Firebase Authentication.
- **Inventory Management**: Add, remove, and view items in the pantry inventory.
- **Categorization**: Categorize items into different categories such as Food, Electronics, Clothing, Books, etc.
- **Search and Filter**: Search items by name and filter by category.
- **Export Data**: Export inventory data to PDF and CSV formats.
- **Webcam Integration**: Capture images using the webcam.
- **Image Classification**: Classify captured images using OpenAI's API and link the classification to inventory items.

## Technologies Used

- **Frontend**: React, Next.js, Material-UI
- **Backend**: Firebase Firestore, Firebase Authentication
- **APIs**: OpenAI API for image classification
- **Utilities**: jsPDF for PDF export, react-csv for CSV export, react-webcam for webcam integration

#### Note: This project has been deployed on Vercel
Access this project on Vercel here: 
https://inventory-management-app-pi.vercel.app/


## Prerequisites

- Node.js (version 14 or later)
- Firebase account and project setup
- OpenAI API key

## Project Structure
src/app/page.js: Main page component containing the app logic and UI.
src/firebase.js: Firebase configuration and initialization.
src/components/InventoryItem.js: Component for displaying individual inventory items.
src/components/SignInForm.js: Component for the sign-in form.
src/components/ExportButtons.js: Components for exporting inventory data.
public: Static files and images.
## Usage
1. Sign In: Enter your email and password to sign in. If you don't have an account, sign up through Firebase Authentication.
Add Item: Click "Add New Item", enter the item name and category, and click "Add".
2. Remove Item: Click the "Remove" button next to an item to remove it from the inventory.
Search and Filter: Use the search bar to find items by name and the filter dropdown to filter items by category.
3. Export Data: Click "Export to PDF" or "Export to CSV" to download your inventory data.
4. Capture Image: Click "Open Webcam" to access your webcam, capture an image, and classify it using OpenAI.

## Dependencies
- react: Frontend library for building user interfaces.
- next: React framework for server-side rendering.
- @mui/material: Material-UI components for styling.
- firebase: Firebase SDK for authentication and Firestore.
- openai: OpenAI SDK for image classification.
- react-csv: Library for exporting CSV files.
- jspdf: Library for generating PDF files.
- react-webcam: Library for integrating webcam functionality.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue if you find a bug or have a feature request.
