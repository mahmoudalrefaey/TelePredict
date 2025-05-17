"""
Prediction utilities for the TeleChurn prediction system.
"""
import pickle
import logging
import os
from .preprocessor import DataPreprocessor, DataPreprocessingError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelPredictionError(Exception):
    """Custom exception for model prediction errors"""
    pass

class ChurnPredictor:
    def __init__(self, model_path):
        """
        Initialize the predictor with a trained model.
        
        Args:
            model_path (str): Path to the trained model file
            
        Raises:
            ModelPredictionError: If model loading fails
        """
        self.model_path = model_path
        self.model = None
        self.preprocessor = DataPreprocessor()
        self._load_model()
        
    def _load_model(self):
        """Load the trained model from file"""
        logger.info(f"Loading model from {self.model_path}")
        
        try:
            if not os.path.exists(self.model_path):
                raise ModelPredictionError(f"Model file not found at {self.model_path}")
                
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
                
            # Validate model interface
            if not hasattr(self.model, 'predict'):
                raise ModelPredictionError("Model does not have predict method")
            if not hasattr(self.model, 'predict_proba'):
                raise ModelPredictionError("Model does not have predict_proba method")
                
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise ModelPredictionError(f"Error loading model: {str(e)}")
    
    def predict(self, df):
        """
        Make predictions on the input data.
        
        Args:
            df (pd.DataFrame): Input dataframe
            
        Returns:
            dict: Dictionary containing:
                - predictions: Binary predictions (0/1)
                - probabilities: Probability scores for each prediction
                - processed_data: The preprocessed input data
                
        Raises:
            ModelPredictionError: If prediction fails
            DataPreprocessingError: If preprocessing fails
        """
        logger.info("Starting prediction process")
        
        try:
            # Preprocess the data
            processed_data = self.preprocessor.preprocess_data(df)
            
            # Make predictions
            predictions = self.model.predict(processed_data)
            probabilities = self.model.predict_proba(processed_data)[:, 1]
            
            # Validate prediction output
            if len(predictions) != len(df):
                raise ModelPredictionError("Number of predictions does not match input data length")
            if len(probabilities) != len(df):
                raise ModelPredictionError("Number of probabilities does not match input data length")
                
            logger.info(f"Successfully generated {len(predictions)} predictions")
            
            return {
                'predictions': predictions.tolist(),
                'probabilities': probabilities.tolist(),
                'processed_data': processed_data.to_dict(orient='records')
            }
            
        except DataPreprocessingError as e:
            logger.error(f"Data preprocessing error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise ModelPredictionError(f"Prediction error: {str(e)}") 