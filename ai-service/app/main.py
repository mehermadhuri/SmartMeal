from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.model import predictor

app = FastAPI(
    title="SmartMeal AI Demand Prediction Microservice",
    description="Forecasts daily Anurag University canteen meal demand to eliminate mess food wastage and queues.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "UP",
        "service": "SmartMeal AI Demand Prediction Microservice",
        "version": "1.0.0",
        "model_trained": predictor.metrics["is_trained"],
        "r2_score": predictor.metrics["r2_score"]
    }

class PredictionRequest(BaseModel):
    date: str
    day_of_week: Optional[int] = 0
    meal_type: str
    slot_id: Optional[int] = 0
    slot_name: Optional[str] = "Counter Slot"
    special_event_flag: Optional[int] = 0

@app.post("/predict")
def predict_demand(request: PredictionRequest):
    result = predictor.predict(
        date_str=request.date,
        meal_type=request.meal_type,
        slot_name=request.slot_name or "Counter Slot",
        special_event=request.special_event_flag or 0
    )
    return {
        "status": "SUCCESS",
        **result,
        "message": "Demand prediction calculated successfully."
    }

@app.get("/analytics/metrics")
def get_model_metrics():
    return {
        "status": "SUCCESS",
        "metrics": predictor.metrics
    }

@app.get("/analytics/historical-sample")
def get_historical_sample():
    df = predictor.generate_synthetic_historical_data(14)
    return {
        "status": "SUCCESS",
        "data": df.to_dict(orient="records")
    }

@app.post("/train")
def retrain_model():
    predictor.initialize_and_train()
    return {
        "status": "SUCCESS",
        "message": "Model retrained with latest historical booking observations.",
        "metrics": predictor.metrics
    }
