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
            self.add_file_to_vector_store(file_path)
    
    def retrieve_filenames(self, directory: str):
        files = []
        for filename in os.listdir(directory):
            if os.path.isfile(os.path.join(directory, filename)):
                files.append(filename)
        return files
            
    def delete_file(self, file_id: str):
        """Delete a file from the vector store using its file ID.
        
        Args:
            file_id (str): The ID of the file to delete
        """
        if self.vector_store_id is None:
            raise ValueError("Vector store ID is not set")
        
        self.client.vector_stores.files.delete(
            vector_store_id=self.vector_store_id,
            file_id=file_id
        )
    
    def update_file(self, file_id: str, file_path: str):
        """Update a file in the vector store by replacing it with a new version.
        
        Args:
            file_id (str): The ID of the file to update
            file_path (str): The path to the new version of the file
        """
        if self.vector_store_id is None:
            raise ValueError("Vector store ID is not set")
        
        # Delete the existing file
        self.delete_file(file_id)
        
        # Add the new version
        return self.add_file_to_vector_store(file_path)
    
    def add_file_to_vector_store(self, file_path: str) -> str:
        """Helper method to add a file to the vector store.
        
        Args:
            file_path (str): Path to the file to add
            
        Returns:
            str: The ID of the created file
        """
        if self.vector_store_id is None:
            raise ValueError("Vector store ID is not set")
            
        file_obj = self.client.files.create(
            file=open(file_path, "rb"),
            purpose="assistants"
        )
        
        self.client.vector_stores.files.create(
            vector_store_id=self.vector_store_id,
            file_id=file_obj.id
        )
        
        return file_obj.id
            
    