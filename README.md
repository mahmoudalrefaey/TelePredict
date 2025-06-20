# TeleChurn - Telecom Churn Prediction System

A full-stack web application for predicting customer churn in the telecommunications industry. TeleChurn enables telecom companies to identify customers at risk of leaving and take proactive retention measures using machine learning.

---

## Features

- Customer and staff management (multi-tenant SaaS)
- Secure authentication (JWT-based)
- Dataset upload and management
- Churn prediction using an ensemble of ML models
- Subscription and feedback management
- RESTful API backend (Django)
- Modern React frontend with TypeScript and Tailwind CSS

---

## Technology Stack

- **Backend:** Python 3.x, Django, Django REST Framework, SQLite (dev) / PostgreSQL (prod)
- **Frontend:** React, TypeScript, Tailwind CSS, Axios
- **Machine Learning:** scikit-learn, pandas, numpy, XGBoost, LightGBM, Random Forest, Decision Tree (ensemble)
- **Deployment:** Gunicorn, Whitenoise, Docker-ready, Google Cloud Run/Heroku compatible

---

## Project Structure

```
TeleChurn_Project/
├── api/                # Django app for API endpoints and dataset management
├── clients/            # Django app for client and staff management
├── frontend/           # React frontend application
│   ├── src/            # React source code
│   └── package.json    # Frontend dependencies
├── ml_utils/           # ML preprocessing and prediction utilities
├── models/             # Trained ML model(s)
├── pages/              # Django app for main pages
├── TeleChurn_Project/  # Django project settings
├── manage.py           # Django management script
├── requirements.txt    # Backend dependencies
└── README.md           # Project documentation
```

---

## Installation

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd TeleChurn_Project
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (admin):**
   ```bash
   python manage.py createsuperuser
   ```

6. **(Optional) Collect static files for production:**
   ```bash
   python manage.py collectstatic
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

---

## Usage

- Access the Django admin panel at `http://127.0.0.1:8000/admin`
- Log in with your superuser credentials
- Use the web interface to:
  - Register companies and staff
  - Upload customer datasets (CSV)
  - Request churn predictions
  - View and export prediction results
  - Manage subscriptions and feedback

---

## Machine Learning

- The backend uses an ensemble of XGBoost, LightGBM, Random Forest, and Decision Tree models.
- The trained model is stored in `models/finalized_model.pkl`.
- ML utilities for preprocessing and prediction are in the `ml_utils/` directory.

---

## Deployment

- Production-ready with Gunicorn and Whitenoise.
- Easily deployable to Heroku, Google Cloud Run, or any Docker-compatible platform.
- For production, use PostgreSQL and configure environment variables for security.

---

## Dependencies

### Backend (see `requirements.txt` for full list)
- Django, djangorestframework, pandas, numpy, PyJWT, etc.

### Frontend (see `frontend/package.json`)
- React, TypeScript, Tailwind CSS, Axios, etc.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

Project Maintainer: Mahmoud Alrefaey  
GitHub: [@mahmoudalrefaey](https://github.com/mahmoudalrefaey)