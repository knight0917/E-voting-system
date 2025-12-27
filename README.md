# E-Voting System

A comprehensive online e-voting system built with Django (Backend) and React (Frontend). This system allows for secure and efficient management of elections, candidates, and voting processes.

## Technologies Used

- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React, Vite, Bootstrap
- **Database:** SQLite (Default for development)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Python** (3.8 or higher) - [Download Python](https://www.python.org/downloads/)
- **Node.js** (16.x or higher) & **npm** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)

## Installation Guide

Follow these steps to set up the project locally.

### 1. Clone the Repository

Open your terminal and run the following command to clone the project:

```bash
git clone https://github.com/knight0917/E-voting-system.git
cd E-voting-system
```

### 2. Backend Setup (Django)

1.  **Create a Virtual Environment** (Recommended):

    ```bash
    python -m venv venv
    ```

2.  **Activate the Virtual Environment**:

    - **Windows:**
      ```bash
      venv\Scripts\activate
      ```
    - **macOS/Linux:**
      ```bash
      source venv/bin/activate
      ```

3.  **Install Backend Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply Database Migrations**:

    ```bash
    python manage.py migrate
    ```

5.  **Create a Superuser (Admin)**:
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to set a username, email, and password.

### 3. Frontend Setup (React + Vite)

1.  **Navigate to the frontend directory**:
    Open a new terminal terminal (or use the same one, but keep the backend running in a separate backend terminal later) and go to the frontend folder:

    ```bash
    cd frontend
    ```

2.  **Install Node Modules**:
    ```bash
    npm install
    ```

## Running the Application

To run the full application, you need to have both the backend and frontend servers running simultaneously.

### Start the Backend Server

In your **root** directory (where `manage.py` is):

```bash
# Make sure your virtual environment is activated
python manage.py runserver
```

The backend API will run at `http://127.0.0.1:8000/`.

### Start the Frontend Server

In your **frontend** directory:

```bash
npm run dev
```

The frontend application will typically run at `http://localhost:5173/` (check the terminal output for the exact URL).

## Accessing the Application

1.  Open your web browser.
2.  Go to the frontend URL (e.g., `http://localhost:5173/`).
3.  You can access the Django Admin panel at `http://127.0.0.1:8000/admin/`.
