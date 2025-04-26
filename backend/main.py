# backend/main.py
from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from database.data_ops import Note, create_note, get_note, get_all_notes, update_note, delete_note
from agents_dir.vector_store.notes_vector_store_manager import NotesManager
from agents import Runner
import tempfile
import base64
from typing import Literal

load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
notes_manager = NotesManager(vector_store_id=os.getenv("VECTOR_STORE_ID"))


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
async def chat_stream_endpoint(req: Request):
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

@app.post("/notes", response_model=Note)
async def create_note_endpoint(note: Note):
    # Convert plain text to markdown format
    markdown_content = f"# {note.title}\n\n{note.content}"
    
    # Create a temporary file with the markdown content
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as temp_file:
        temp_file.write(markdown_content)
        temp_file_path = temp_file.name
    
    try:
        # Add the file to vector store and get the file ID
        file_id = notes_manager.add_file_to_vector_store(temp_file_path)
        
        # Create note with vector store file ID
        note_dict = note.model_dump(exclude={"id"})
        note_dict["vector_store_file_id"] = file_id
        created_note = await create_note(Note(**note_dict))
        
        if not created_note:
            raise HTTPException(status_code=500, detail="Failed to create note")
            
        # The Note model already handles the _id conversion in the create_note function
        return created_note
    finally:
        # Clean up the temporary file
        os.unlink(temp_file_path)

@app.get("/notes", response_model=list[Note])
async def get_notes_endpoint():
    return await get_all_notes()

@app.get("/notes/{note_id}", response_model=Note)
async def get_note_endpoint(note_id: str):
    note = await get_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@app.put("/notes/{note_id}", response_model=Note)
async def update_note_endpoint(note_id: str, note: Note):
    # Get existing note to get its vector store file ID
    existing_note = await get_note(note_id)
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Convert plain text to markdown format
    markdown_content = f"# {note.title}\n\n{note.content}"
    
    # Create a temporary file with the markdown content
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as temp_file:
        temp_file.write(markdown_content)
        temp_file_path = temp_file.name
    
    try:
        # Update the file in vector store if it exists
        if existing_note.vector_store_file_id:
            notes_manager.update_file(existing_note.vector_store_file_id)
        else:
            # If no file ID exists, add as new file
            file_id = notes_manager.add_file_to_vector_store(temp_file_path)
            note_dict = note.model_dump(exclude={"id"})
            note_dict["vector_store_file_id"] = file_id
            note = Note(**note_dict)
        
        updated_note = await update_note(note_id, note)
        if not updated_note:
            raise HTTPException(status_code=404, detail="Note not found")
    finally:
        # Clean up the temporary file
        os.unlink(temp_file_path)
    
    return updated_note

@app.delete("/notes/{note_id}")
async def delete_note_endpoint(note_id: str):
    # Get the note before deleting to get its vector store file ID
    note = await get_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Delete from vector store if file ID exists
    if note.vector_store_file_id:
        try:
            notes_manager.delete_file(note.vector_store_file_id)
        except Exception as e:
            # Log the error but continue with note deletion
            print(f"Error deleting file from vector store: {e}")
    
    success = await delete_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return {"message": "Note deleted successfully"}

@app.post("/ocr")
async def ocr_endpoint(
    file: UploadFile = File(...),
    format: Literal["markdown", "latex"] = Query("markdown", description="Output format for the extracted text")
):
    if file.content_type is None or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read the image file
        contents = await file.read()
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        try:
            
            # OCR via vision-enabled chat
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an OCR assistant. Extract all text from the provided image and format it in markdown.  Do not include any other text or comments. Don't include markdown''' at the beginning or end of your response. "
                    },
                    {
                        "role": "user", 
                        "content": [
                            {
                                "type": "text", 
                                "text": f"Extract all text or equations from this image and format it in markdown" 
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64.b64encode(contents).decode('utf-8')}",
                                    "detail": "high"
                                },
                               
                                
                            }
                        ]
                    }
                ]
            )
            
            return {
                "text": response.choices[0].message.content,
                "format": format
            }
            
        finally:
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))