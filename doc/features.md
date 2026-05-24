# ✨ Features & Usage Guide

This document provides a walkthrough of the features available in the PDF Viewer App and how to use them.

## 📂 Uploading a PDF

To view a PDF:
1.  Click the "Choose File" button in the dashed box.
2.  Select a valid `.pdf` file from your computer.
3.  The application will automatically start processing the file.

## 🧭 Navigation

Once a PDF is loaded, navigation controls appear:
-   **Previous Page**: Moves to the previous page (disabled if on page 1).
-   **Next Page**: Moves to the next page (disabled if on the last page).
-   **Page Counter**: Displays the current page number and total pages (e.g., `3 / 10`).

## 🖼 Viewing

-   The PDF is rendered at a default 1.5x scale for clarity.
-   The viewer is centered on the screen.
-   A subtle shadow and border are applied to the canvas to make it stand out.

## ⚠️ Error Handling

-   **Invalid File**: If you select a file that is not a PDF, an alert will inform you to select a correct file.
-   **Processing States**: A loading message ("⚠️ Worker is processing the file...") is shown while the PDF.js worker is busy parsing the data.
