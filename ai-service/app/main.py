from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="SmartMeal AI Demand Prediction Microservice",
    description="Forecasts daily college meal demand to reduce food wastage.",
    version="1.0.0"
)

@app.get("/")
def health_check():
    return {
        "status": "UP",
        "service": "SmartMeal AI Microservice",
        "version": "1.0.0"
    }

class PredictionRequest(BaseModel):
    date: str
    day_of_week: int
    meal_type: str
    slot_id: int
    special_event_flag: Optional[int] = 0

@app.post("/predict")
def predict_demand(request: PredictionRequest):
    # Skeleton response structure for initial service testing
    return {
        "status": "SUCCESS",
        "date": request.date,
        "meal_type": request.meal_type,
        "predicted_demand": 150,
        "recommended_buffer": 15,
        "recommended_total": 165,
        "message": "AI microservice initialized successfully."
    }
