# TelePredict - Telecom Churn Prediction System

A Django-based web application for predicting customer churn in the telecommunications industry. This system helps telecom companies identify customers who are likely to churn and take proactive measures to retain them.

## Features

- Customer data management and analysis
- Churn prediction using machine learning models
- User authentication and authorization
- Interactive dashboard for data visualization
- Real-time churn risk assessment
- Customer profile management

## Technology Stack

- Python 3.x
- Django Framework
- SQLite Database
- HTML/CSS/JavaScript
- Bootstrap for UI
- Machine Learning Libraries (scikit-learn, pandas, numpy)

## Prerequisites

- Python 3.x
- pip (Python package installer)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mahmoudalrefaey/TelePredict.git
cd TelePredict
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser (admin):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The application will be available at `http://127.0.0.1:8000/`

## Project Structure

```
TelePredict/
├── clients/             # Client management app
├── pages/              # Main pages app
├── TeleChurn_Project/  # Project settings
├── manage.py           # Django management script
└── requirements.txt    # Project dependencies
```

## Usage

1. Access the admin panel at `http://127.0.0.1:8000/admin`
2. Log in with your superuser credentials
3. Navigate through the dashboard to:
   - View customer data
   - Analyze churn predictions
   - Manage user accounts
   - Generate reports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Mahmoud Alrefaey - [@mahmoudalrefaey](https://github.com/mahmoudalrefaey)

Project Link: [https://github.com/mahmoudalrefaey/TelePredict](https://github.com/mahmoudalrefaey/TelePredict)