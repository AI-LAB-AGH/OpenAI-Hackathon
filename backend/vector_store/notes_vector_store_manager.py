from openai import OpenAI
import os

class NotesManager:
    def __init__(self, vector_store_id: str | None = None, notes_dir: str = "example-notes"):
        self.client = OpenAI()
        self.vector_store_id = vector_store_id
        self.notes_dir = notes_dir

    def create_vector_store(self, name: str):
        vector_store = self.client.vector_stores.create(name=name)
        self.vector_store_id = vector_store.id
        return vector_store
    
    def add_files(self, files: list[str]):
        if self.vector_store_id is None:
                raise ValueError("Vector store ID is not set")
        for file in files:
            file_path = os.path.join(self.notes_dir, file)
            file_obj = self.client.files.create(
                file=open(file_path, "rb"),
                purpose="assistants"
            )
            self.client.vector_stores.files.create(
                vector_store_id=self.vector_store_id,
                file_id=file_obj.id)
    
    def retrieve_filenames(self, directory: str):
        files = []
        for filename in os.listdir(directory):
            if os.path.isfile(os.path.join(directory, filename)):
                files.append(filename)
        return files
            
    