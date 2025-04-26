import asyncio
from typing import AsyncIterator, Any
from agents import Agent, Runner, ModelSettings, TResponseInputItem
from agent import *
from agents.voice import (
    AudioInput,
    SingleAgentVoiceWorkflow,
    SingleAgentWorkflowCallbacks,
    VoicePipeline,
    VoiceWorkflowBase,
    VoiceWorkflowHelper
)
from custom_agents import *
import numpy as np
import json
from voice_utils import AudioPlayer, record_audio
from utils import get_speak
import os
import librosa

class SingleAgentVoiceWorkflow(VoiceWorkflowBase):
    def __init__(self, agent: Agent[Any], callbacks: SingleAgentWorkflowCallbacks | None = None):
        self._input_history: list[TResponseInputItem] = []
        self._current_agent = agent
        self._callbacks = callbacks

    async def run(self, transcription: str) -> AsyncIterator[str]:
        if self._callbacks:
            self._callbacks.on_run(self, transcription)

        self._input_history.append(
            {
                "role": "user",
                "content": transcription,
            }
        )

        main_result = await Runner.run(main_agent, self._input_history)
        speak = ""
        response_type = main_result.last_agent.name
        try:
            main_result = main_result.final_output_as(dict).model_dump()
        except:
            main_result = main_result.final_output

        with open(os.path.join(os.path.dirname(__file__), 'result.json'), 'w') as json_file:
            json.dump(main_result, json_file, indent=4)

        speak = get_speak(response_type, main_result)

        result = Runner.run_streamed(self._current_agent, speak)

        async for chunk in VoiceWorkflowHelper.stream_text_from(result):
            yield chunk

        self._input_history = result.to_input_list()
        self._current_agent = result.last_agent

class WorkflowCallbacks(SingleAgentWorkflowCallbacks):
    def on_run(self, workflow: SingleAgentVoiceWorkflow, transcription: str) -> None:
        print(f"[debug] on_run called with transcription: {transcription}")


pipeline = VoicePipeline(
    workflow=SingleAgentVoiceWorkflow(speaking_agent, callbacks=WorkflowCallbacks())
)

async def prompt_voice_with_voice(audio):
    audio_input = AudioInput(buffer=audio)
    result = await pipeline.run(audio_input)

    with AudioPlayer() as player:
        async for event in result.stream():
            if event.type == "voice_stream_event_audio":
                player.add_audio(event.data)
                print("Received audio")
            elif event.type == "voice_stream_event_lifecycle":
                print(f"Received lifecycle event: {event.event}")

        # Add 1 second of silence to the end of the stream to avoid cutting off the last audio.
        player.add_audio(np.zeros(12000 * 1, dtype=np.int16))

import pyttsx3
engine = pyttsx3.init()
async def prompt_voice_with_text(text):
    engine.save_to_file(text, 'test.mp3')
    engine.runAndWait()

    audio_data, samplerate = librosa.load('path_to_your_audio_file.mp3', sr=None)
    audio_data = audio_data.astype(np.float32)
    audio_input = AudioInput(buffer=audio_data)

    result = await pipeline.run(audio_input)

    with AudioPlayer() as player:
        async for event in result.stream():
            if event.type == "voice_stream_event_audio":
                player.add_audio(event.data)
                print("Received audio")
            elif event.type == "voice_stream_event_lifecycle":
                print(f"Received lifecycle event: {event.event}")

        # Add 1 second of silence to the end of the stream to avoid cutting off the last audio.
        player.add_audio(np.zeros(12000 * 1, dtype=np.int16))

async def prompt_text_with_text(text):
    result = await Runner.run(main_agent, text)
    return result
