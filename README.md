
# Our Secret Garden - Full Stack Application

This is a private and romantic digital space for couples to share and cherish their memories.

## Architecture

The application is a full-stack project with a separate frontend and backend.

-   **Frontend:** A React single-page application built with Vite and styled with Tailwind CSS. It handles the user interface and all client-side interactions.
-   **Backend:** A Node.js server using the Express framework. It provides a REST API for all data operations, handles user authentication, and manages file uploads.
-   **Database:** A simple and file-based SQLite database for persistent data storage (user account, media metadata, letters).
-   **File Storage:** Photos and videos are stored directly on the server's file system in the `backend/uploads` directory.

## Features

-   **Secure Access:** A secret gate code followed by a shared user login.
-   **Persistent Storage:** All data (photos, videos, letters) is saved on the server and does not disappear on refresh.
-   **Media Galleries:** Separate, categorized galleries for photos and videos.
-   **Multiple File Uploads:** Upload multiple photos or videos at once.
-   **Digital Journal:** Write, edit, and delete shared love letters.
-   **Customizable UI:** Set any uploaded photo as the application's background.
-   **Premium Feel:** Smooth animations and a custom-designed, romantic UI.

## Local Development Setup

Follow these steps to run the application on your local machine.

### Prerequisites

-   Node.js (v16 or later)
-   npm (or yarn)

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Copy the example `.env.example` file to a new file named `.env`.
    -   Open `.env` and change `JWT_SECRET` to a unique, long, and random string. This is crucial for security.
    ```bash
    cp .env.example .env
    ```

4.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:4000` by default and will automatically restart when you make changes to the code. The SQLite database file (`our_garden.db`) will be created automatically.

### 2. Frontend Setup

The frontend is designed to run in a simple development environment.

1.  **Open `index.html` in your browser.**
    You can use a live server extension in your code editor (like VS Code's "Live Server") or simply open the file directly.

2.  **Ensure constants are correct:**
    -   Open `constants.ts`.
    -   Make sure `API_BASE_URL` is set to `http://localhost:4000` to connect to your local backend server.

Now you can access the application in your browser. The frontend will make API calls to the backend server running on port 4000.

---

See `DEPLOYMENT.md` for instructions on how to deploy this application to a production server (VPS).
