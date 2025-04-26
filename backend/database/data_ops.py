import os
from datetime import datetime
import motor.motor_asyncio
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId


print(os.getenv("MONGODB_URL"))
db_client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = db_client.get_database("notes")
notes = db.get_collection("notes")

class Note(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

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
    created_note["_id"] = str(created_note["_id"])
    return Note(**created_note)

async def get_note(note_id: str) -> Optional[Note]:
    try:
        note = await notes.find_one({"_id": ObjectId(note_id)})
        if not note:
            return None
        note["_id"] = str(note["_id"])
        return Note(**note)
    except:
        return None

async def get_all_notes() -> List[Note]:
    cursor = notes.find()
    notes_list = []
    async for note in cursor:
        note["_id"] = str(note["_id"])
        notes_list.append(Note(**note))
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
        updated_note["_id"] = str(updated_note["_id"])
        return Note(**updated_note)
    except:
        return None

async def delete_note(note_id: str) -> bool:
    try:
        result = await notes.delete_one({"_id": ObjectId(note_id)})
        return result.deleted_count > 0
    except:
        return False
