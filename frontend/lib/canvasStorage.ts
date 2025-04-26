interface CanvasData {
  id: string;
  title: string;
  data: string;
  lastModified: string;
}

export const canvasStorage = {
  saveCanvas: (noteId: string, data: string) => {
    const canvasData: CanvasData = {
      id: noteId,
      title: `Canvas for Note ${noteId}`,
      data,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(`canvas_${noteId}`, JSON.stringify(canvasData));
  },

  getCanvas: (noteId: string): CanvasData | null => {
    const data = localStorage.getItem(`canvas_${noteId}`);
    return data ? JSON.parse(data) : null;
  },

  deleteCanvas: (noteId: string) => {
    localStorage.removeItem(`canvas_${noteId}`);
  },
};
