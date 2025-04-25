# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def ping():
    return {"message": "pong"}

@app.post("/chat-stream")
async def chat(req: Request):
    try:
        body = await req.json()
        userMessage = body.get("message")
        if not userMessage:
            return {"error": "Message is required"}
            
        previousResponseId = body.get("previousResponseId")
        response_id = None


        def event_stream():
            stream = client.responses.create(
                model="gpt-4o",
                input=userMessage,
                instructions="Respond with robotic language.",
                previous_response_id=previousResponseId,
                stream=True
            )
            for event in stream:
                # if(hasattr(event, "response_id")):
                #     print(event.response_id)

                if event.type == "response.output_text.delta":
                    message = {
                        "type": "message",
                        "delta": event.delta
                    }
                    yield f"data: {json.dumps(message)}\n\n"

                if event.type == "response.completed":
                    response_id = event.response.id
                    final_message = {
                        "type": "final", 
                        "responseId": response_id or "unknown"
                    }
                     
                    yield f"data: {json.dumps(final_message)}\n\n"
            
        return StreamingResponse(event_stream(), media_type="text/event-stream")
            
    except Exception as e:
        return {"error": str(e)}



@app.post("/chat")
async def chat(req: Request):
    try:
        body = await req.json()
        userMessage = body.get("message")
        if not userMessage:
            return {"error": "Message is required"}
            
        previousResponseId = body.get("previousResponseId")

        response = client.responses.create(
            model="gpt-4o",
            input=userMessage,
            instructions="Respond with robotic language. Add one robotic emoji to each response.",
            previous_response_id=previousResponseId
        )
        
        return response
    
    except Exception as e:
        return {"error": str(e)}