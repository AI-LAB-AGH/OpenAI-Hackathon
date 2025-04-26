# backend/main.py
from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from openai import OpenAI
from dotenv import load_dotenv
from typing import Literal
from database.data_ops import Note, create_note, get_note, get_all_notes, update_note, delete_note
from agents_dir.vector_store.notes_vector_store_manager import NotesManager
import tempfile
import base64
import json
import os
import shutil
from pydantic import BaseModel
from agents_dir.main import prompt_text_with_text, prompt_voice_with_voice
from typing import Literal
from pydantic import BaseModel
from agents_dir.custom_agents import main_agent
from agents.voice import VoiceWorkflowHelper
from agents import Runner

load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
notes_manager = NotesManager(vector_store_id=os.getenv("VECTOR_STORE_ID"))


class ChatModel(BaseModel):
    type: str
    message: str | UploadFile

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    previousResponseId: str | None = None

@app.get("/ping")
async def ping():
    return {"message": "pong"}


@app.post("/chat-stream")
async def chat_stream_endpoint(chat_request: ChatRequest):
    try:
        if not chat_request.message:
            return {"error": "Message is required"}
            
        async def event_stream():
            # Get the agent's response
            result = Runner.run_streamed(main_agent, chat_request.message)
            
            # Stream the response
            async for chunk in VoiceWorkflowHelper.stream_text_from(result):
                message = {
                    "type": "message",
                    "content": chunk
                }
                yield f"data: {json.dumps(message)}\n\n"
            
            yield f"data: {json.dumps({'type': 'final'})}\n\n"
            
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
                "X-Accel-Buffering": "no",  # Disable buffering for nginx
                "Transfer-Encoding": "chunked"
            }
        )
    except Exception as e:
        return {"error": str(e)}



@app.post("/chat", response_model=ChatModel)
async def chat(chat_model: ChatModel):
    try:
        type = chat_model.type
        message = chat_model.message

        if type == "text":
            response = await prompt_text_with_text(message)
        elif type == "voice":
            response = await prompt_voice_with_voice(message)

        with open("agents_dir/result.json", "r") as file:
            file_contents = file.read()
        json_response = json.loads(file_contents)

        json_response['type'] = json_response.get('response_type', 'default_type')
        json_response['message'] = json_response.get('response_content', {}).get('question', 'default_message')

        return json_response
    
    except Exception as e:
        return {"error": str(e)}

@app.post("/voice-chat", response_model=ChatModel)
async def voice_chat(chat_model: ChatModel):
    try:
        message = chat_model.message
            
        response = await prompt_text_with_text(message)

        with open("agents_dir/result.json", "r") as file:
            file_contents = file.read()
        json_response = json.loads(file_contents)

        json_response['type'] = json_response.get('response_type', 'default_type')
        json_response['message'] = json_response.get('response_content', {}).get('question', 'default_message')

        return json_response
        previousResponseId = body.get("previousResponseId")

        response = client.responses.create(
            model="gpt-4o",
            input=userMessage,
            instructions="""You are a personal study assistant that:
1. Explains complex topics simply
2. Creates study plans and suggests effective techniques
3. Answers academic questions accurately
4. Quizzes users on request
5. Uses examples to clarify difficult concepts
6. Maintains an encouraging tone

Ask for clarification when needed and reference specific materials mentioned by the user.""",
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
    note = await get_note(note_id=note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@app.put("/notes/{note_id}", response_model=Note)
async def update_note_endpoint(note_id: str, note: Note):
    # Get existing note to get its vector store file ID
    existing_note = await get_note(note_id=note_id)
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
            notes_manager.update_file(file_path=temp_file_path)
        else:
            # If no file ID exists, add as new file
            file_id = notes_manager.add_file_to_vector_store(file_path=temp_file_path)
            note_dict = note.model_dump(exclude={"id"})
            note_dict["vector_store_file_id"] = file_id
            note = Note(**note_dict)
        
        updated_note = await update_note(note_id=note_id, note=note)
        if not updated_note:
            raise HTTPException(status_code=404, detail="Note not found")
    finally:
        # Clean up the temporary file
        os.unlink(temp_file_path)
    
    return updated_note

@app.delete("/notes/{note_id}")
async def delete_note_endpoint(note_id: str):
    # Get the note before deleting to get its vector store file ID
    note = await get_note(note_id=note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Delete from vector store if file ID exists
    if note.vector_store_file_id:
        try:
            notes_manager.delete_file(file_id=note.vector_store_file_id)
        except Exception as e:
            # Log the error but continue with note deletion
            print(f"Error deleting file from vector store: {e}")
    
    success = await delete_note(note_id=note_id)
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

@app.post("/notes/{note_id}/canvas")
async def upload_canvas(note_id: str, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read the image file
        contents = await file.read()
        
        # Get the existing note
        note = await get_note(note_id=note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Update the note with the canvas
        note_dict = note.model_dump(exclude={"id"})
        note_dict["canvas_jpg"] = contents
        updated_note = await update_note(note_id=note_id, note=Note(**note_dict))
        
        if not updated_note:
            raise HTTPException(status_code=500, detail="Failed to update note with canvas")
        
        return {"message": "Canvas uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notes/{note_id}/canvas")
async def get_canvas(note_id: str):
    try:
        note = await get_note(note_id=note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        if not note.canvas_jpg:
            raise HTTPException(status_code=404, detail="No canvas found for this note")
        
        return Response(content=note.canvas_jpg, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))