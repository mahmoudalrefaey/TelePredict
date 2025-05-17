"""
Data preprocessing utilities for the TeleChurn prediction system.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataPreprocessingError(Exception):
    """Custom exception for data preprocessing errors"""
    pass

class DataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.required_columns = [
            'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
            'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport',
            'Contract', 'PaperlessBilling', 'PaymentMethod',
            'MonthlyCharges', 'TotalCharges'
        ]
        
    def preprocess_data(self, df):
        """
        Preprocess the input data for prediction.
        
        Args:
            df (pd.DataFrame): Input dataframe
            
        Returns:
            pd.DataFrame: Preprocessed dataframe
            
        Raises:
            DataPreprocessingError: If data validation or preprocessing fails
        """
        try:
            logger.info("Starting data preprocessing")
            
            # Validate input data
            self._validate_input_data(df)
            
            # Make a copy to avoid modifying the original
            df = df.copy()
            
            # Drop any columns not in required_columns
            df = df[self.required_columns]
            
            # Convert TotalCharges to numeric, handling any non-numeric values
            df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
            
            # Handle missing values
            df = self._handle_missing_values(df)
            
            # Convert categorical variables
            df = self._convert_categorical(df)
            
            # Scale numerical features
            df = self._scale_numerical(df)
            
            logger.info("Data preprocessing completed successfully")
            return df
            
        except Exception as e:
            logger.error(f"Data preprocessing failed: {str(e)}")
            raise DataPreprocessingError(f"Data preprocessing failed: {str(e)}")
    
    def _validate_input_data(self, df):
        """Validate input data structure and content"""
        logger.info("Validating input data")
        
        if not isinstance(df, pd.DataFrame):
            raise DataPreprocessingError("Input must be a pandas DataFrame")
            
        # Check for required columns
        missing_cols = set(self.required_columns) - set(df.columns)
        if missing_cols:
            raise DataPreprocessingError(f"Missing required columns: {missing_cols}")
            
        # Check for empty dataframe
        if df.empty:
            raise DataPreprocessingError("Input DataFrame is empty")
            
        # Check for all-null columns
        null_cols = df.columns[df.isnull().all()].tolist()
        if null_cols:
            raise DataPreprocessingError(f"Columns with all null values: {null_cols}")
            
        logger.info("Input data validation passed")
    
    def _handle_missing_values(self, df):
        """Handle missing values in the dataset"""
        logger.info("Handling missing values")
        
        try:
            # Fill missing values in categorical columns with mode
            categorical_cols = df.select_dtypes(include=['object']).columns
            for col in categorical_cols:
                if df[col].isnull().any():
                    mode_value = df[col].mode()[0]
                    df[col] = df[col].fillna(mode_value)
                    logger.info(f"Filled missing values in {col} with mode: {mode_value}")
            
            # Fill missing values in numerical columns with median
            numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
            for col in numerical_cols:
                if df[col].isnull().any():
                    median_value = df[col].median()
                    df[col] = df[col].fillna(median_value)
                    logger.info(f"Filled missing values in {col} with median: {median_value}")
                    
            return df
            
        except Exception as e:
            logger.error(f"Error handling missing values: {str(e)}")
            raise DataPreprocessingError(f"Error handling missing values: {str(e)}")
    
    def _convert_categorical(self, df):
        """Convert categorical variables to numerical"""
        logger.info("Converting categorical variables")
        
        try:
            # Binary categorical variables
            binary_cols = ['SeniorCitizen', 'Partner', 'Dependents', 'OnlineSecurity',
                          'OnlineBackup', 'DeviceProtection', 'TechSupport', 'Contract',
                          'PaperlessBilling']
            for col in binary_cols:
                if col in df.columns:
                    df[col] = (df[col] == 'Yes').astype(int)
                    logger.info(f"Converted {col} to binary")
            
            # Categorical variables with multiple categories
            categorical_cols = ['PaymentMethod']
            
            for col in categorical_cols:
                if col in df.columns:
                    if col not in self.label_encoders:
                        self.label_encoders[col] = LabelEncoder()
                        df[col] = self.label_encoders[col].fit_transform(df[col])
                    else:
                        # Handle unseen categories
                        unique_values = set(df[col].unique())
                        known_values = set(self.label_encoders[col].classes_)
                        if not unique_values.issubset(known_values):
                            raise DataPreprocessingError(
                                f"New categories found in column {col}: {unique_values - known_values}"
                            )
                        df[col] = self.label_encoders[col].transform(df[col])
                    logger.info(f"Encoded {col} using LabelEncoder")
                    
            return df
            
        except Exception as e:
            logger.error(f"Error converting categorical variables: {str(e)}")
            raise DataPreprocessingError(f"Error converting categorical variables: {str(e)}")
    
    def _scale_numerical(self, df):
        """Scale numerical features"""
        logger.info("Scaling numerical features")
        
        try:
            numerical_cols = ['tenure', 'MonthlyCharges', 'TotalCharges']
            
            if len(numerical_cols) > 0:
                # Check for infinite values
                inf_cols = df[numerical_cols].isin([np.inf, -np.inf]).any()
                if inf_cols.any():
                    raise DataPreprocessingError(
                        f"Columns with infinite values: {inf_cols[inf_cols].index.tolist()}"
                    )
                
                df[numerical_cols] = self.scaler.fit_transform(df[numerical_cols])
                logger.info(f"Scaled numerical columns: {numerical_cols}")
                
            return df
            
        except Exception as e:
            logger.error(f"Error scaling numerical features: {str(e)}")
            raise DataPreprocessingError(f"Error scaling numerical features: {str(e)}") 