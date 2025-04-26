import axios from "axios";
import { Note } from "./types";

// Simple API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const noteApi = {
  // Create a new note
  async createNote(note: Note) {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/notes`, note);
      return { success: true, note: data };
    } catch (error) {
      console.error("Error creating note:", error);
      return { success: false, error: "Failed to create note" };
    }
  },

  // Get all notes
  async getNotes() {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/notes`);
      return { success: true, notes: data };
    } catch (error) {
      console.error("Error getting notes:", error);
      return { success: false, notes: [] };
    }
  },

  // Get a single note by ID
  async getNote(id: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/notes/${id}`);
      return { success: true, note: data };
    } catch (error) {
      console.error(`Error getting note ${id}:`, error);
      return { success: false };
    }
  },

  // Update a note
  async updateNote(id: string, note: Note) {
    try {
      const { data } = await axios.put(`${API_BASE_URL}/notes/${id}`, note);
      return { success: true, note: data };
    } catch (error) {
      console.error(`Error updating note ${id}:`, error);
      return { success: false, error: "Failed to update note" };
    }
  },

  // Delete a note
  async deleteNote(id: string) {
    try {
      await axios.delete(`${API_BASE_URL}/notes/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error);
      return { success: false, error: "Failed to delete note" };
    }
  },
};

export const canvasApi = {
  saveCanvas: async (
    noteId: string,
    data: { canvasData: string; noteId: string }
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/notes/${noteId}/canvas`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data && response.status === 200;
    } catch (error) {
      console.error("Error saving canvas:", error);
      return false;
    }
  },

  getCanvas: async (noteId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notes/${noteId}/canvas`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting canvas:", error);
      return null;
    }
  },

  deleteCanvas: async (noteId: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notes/${noteId}/canvas`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting canvas:", error);
      throw error;
    }
  },
};
