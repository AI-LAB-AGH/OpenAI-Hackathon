import os
from datetime import datetime
import motor.motor_asyncio
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
import base64


print(os.getenv("MONGODB_URL"))

UWAGA_MONGO = "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_URL>/"

db_client = motor.motor_asyncio.AsyncIOMotorClient(UWAGA_MONGO)
db = db_client.get_database("notes")
notes = db.get_collection("notes")

class Note(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    vector_store_file_id: Optional[str] = None
    canvas_jpg: Optional[bytes] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str
        }
        from_attributes = True

    @classmethod
    def from_mongo(cls, data: dict) -> Optional["Note"]:
        if not data:
            return None
        data["id"] = str(data.pop("_id"))
        return cls(**data)

async def create_note(note: Note) -> Optional[Note]:
    note_dict = note.model_dump(exclude={"id"})
    note_dict["created_at"] = datetime.now()
    note_dict["updated_at"] = datetime.now()
    result = await notes.insert_one(note_dict)
    if not result.inserted_id:
        return None
    
    created_note = await notes.find_one({"_id": result.inserted_id})
    if not created_note:
        return None
    return Note.from_mongo(created_note)

async def get_note(note_id: str) -> Optional[Note]:
    try:
        note = await notes.find_one({"_id": ObjectId(note_id)})
        if not note:
            return None
        # Decode canvas_jpg if it exists
        if 'canvas_jpg' in note and note['canvas_jpg'] is not None:
            note['canvas_jpg'] = base64.b64encode(note['canvas_jpg']).decode('utf-8')
        return Note.from_mongo(note)
    except:
        return None

async def get_all_notes() -> List[Note]:
    cursor = notes.find()
    notes_list = []
    async for note in cursor:
        if 'canvas_jpg' in note and note['canvas_jpg'] is not None:
            note['canvas_jpg'] = base64.b64encode(note['canvas_jpg']).decode('utf-8')
        notes_list.append(Note.from_mongo(note))
    return notes_list

async def update_note(note_id: str, note: Note) -> Optional[Note]:
    try:
        note_dict = note.model_dump(exclude={"id"})
        note_dict["updated_at"] = datetime.now()
        result = await notes.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": note_dict}
        )
        if not result.modified_count:
            return None
        updated_note = await notes.find_one({"_id": ObjectId(note_id)})
        if not updated_note:
            return None
        return Note.from_mongo(updated_note)
    except:
        return None

async def delete_note(note_id: str) -> bool:
    try:
        result = await notes.delete_one({"_id": ObjectId(note_id)})
        return result.deleted_count > 0
    except:
        return False
