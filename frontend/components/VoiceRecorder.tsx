"use client";
import { useState, useRef, useEffect } from "react";
import { HiMicrophone, HiPhone } from "react-icons/hi";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface VoiceRecorderProps {
  onEndCall: () => void;
}

export default function VoiceRecorder({ onEndCall }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Clean up any active recording
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [audioUrl, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);

        try {
          // Create FormData with the correct structure
          const formData = new FormData();
          formData.append("type", "voice");
          formData.append("message", blob, "recording.wav");

          // Send the request with axios
          const response = await axios.post(`${API_URL}/voice-chat`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob", // Expect binary response
            withCredentials: true, // Include credentials for CORS
          });

          // Create URL from the response blob and play it
          const agentAudioUrl = URL.createObjectURL(response.data);
          if (audioRef.current) {
            audioRef.current.src = agentAudioUrl;
            audioRef.current.play();
          }

          // Clean up the URL after playing
          audioRef.current?.addEventListener("ended", () => {
            URL.revokeObjectURL(agentAudioUrl);
          });
        } catch (error) {
          console.error("Error sending audio to voice-chat endpoint:", error);
          if (axios.isAxiosError(error)) {
            console.error("Error details:", {
              status: error.response?.status,
              data: error.response?.data,
              headers: error.response?.headers,
            });
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleEndCall = () => {
    stopRecording();
    // Reset all states
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsRecording(false);
    onEndCall();
  };

  return (
    <div className="flex items-center gap-6">
      {/* Static Waveform */}
      <div className="flex items-center gap-1 h-8">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/20 rounded-full"
            style={{
              height: `${Math.random() * 100}%`,
              minHeight: "4px",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full transition-colors ${
            isRecording
              ? "bg-white text-green-500"
              : "bg-white/20 text-muted-foreground"
          }`}
        >
          <HiMicrophone className="w-4 h-4" />
        </button>

        <button
          onClick={handleEndCall}
          className="p-2 rounded-full bg-destructive text-destructive-foreground transition-colors"
        >
          <HiPhone className="w-4 h-4" />
        </button>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
