import curses
import time
import asyncio
import random

import numpy as np
import numpy.typing as npt
import sounddevice as sd

from agents import Agent, function_tool
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions
from agents.voice import (
    AudioInput,
    SingleAgentVoiceWorkflow,
    SingleAgentWorkflowCallbacks,
    VoicePipeline,
)


def _record_audio(screen: curses.window) -> npt.NDArray[np.float32]:
    screen.nodelay(True)  # Non-blocking input
    screen.clear()
    screen.addstr(
        "Press <spacebar> to start recording. Press <spacebar> again to stop recording.\n"
    )
    screen.refresh()

    recording = False
    audio_buffer: list[npt.NDArray[np.float32]] = []

    def _audio_callback(indata, frames, time_info, status):
        if status:
            screen.addstr(f"Status: {status}\n")
            screen.refresh()
        if recording:
            audio_buffer.append(indata.copy())

    # Open the audio stream with the callback.
    with sd.InputStream(samplerate=24000, channels=1, dtype=np.float32, callback=_audio_callback):
        while True:
            key = screen.getch()
            if key == ord(" "):
                recording = not recording
                if recording:
                    screen.addstr("Recording started...\n")
                else:
                    screen.addstr("Recording stopped.\n")
                    break
                screen.refresh()
            time.sleep(0.01)

    # Combine recorded audio chunks.
    if audio_buffer:
        audio_data = np.concatenate(audio_buffer, axis=0)
    else:
        audio_data = np.empty((0,), dtype=np.float32)

    return audio_data


def record_audio():
    # Using curses to record audio in a way that:
    # - doesn't require accessibility permissions on macos
    # - doesn't block the terminal
    audio_data = curses.wrapper(_record_audio)
    return audio_data


class AudioPlayer:
    def __enter__(self):
        self.stream = sd.OutputStream(samplerate=24000, channels=1, dtype=np.int16)
        self.stream.start()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.stream.stop()  # wait for the stream to finish
        self.stream.close()

    def add_audio(self, audio_data: npt.NDArray[np.int16]):
        self.stream.write(audio_data)


"""
This is a simple example that uses a recorded audio buffer. Run it via:
`python -m examples.voice.static.main`

1. You can record an audio clip in the terminal.
2. The pipeline automatically transcribes the audio.
3. The agent workflow is a simple one that starts at the Assistant agent.
4. The output of the agent is streamed to the audio player.

Try examples like:
- Tell me a joke (will respond with a joke)
- What's the weather in Tokyo? (will call the `get_weather` tool and then speak)
- Hola, como estas? (will handoff to the spanish agent)
"""


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    print(f"[debug] get_weather called with city: {city}")
    choices = ["sunny", "cloudy", "rainy", "snowy"]
    return f"The weather in {city} is {random.choice(choices)}."


spanish_agent = Agent(
    name="Spanish",
    handoff_description="A spanish speaking agent.",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human, so be polite and concise. Speak in Spanish.",
    ),
    model="gpt-4o-mini",
)

agent = Agent(
    name="Assistant",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human, so be polite and concise. If the user speaks in Spanish, handoff to the spanish agent.",
    ),
    model="gpt-4o-mini",
    handoffs=[spanish_agent],
    tools=[get_weather],
)


class WorkflowCallbacks(SingleAgentWorkflowCallbacks):
    def on_run(self, workflow: SingleAgentVoiceWorkflow, transcription: str) -> None:
        print(f"[debug] on_run called with transcription: {transcription}")


async def main():
    pipeline = VoicePipeline(
        workflow=SingleAgentVoiceWorkflow(agent, callbacks=WorkflowCallbacks())
    )

    audio_input = AudioInput(buffer=record_audio())

    result = await pipeline.run(audio_input)

    with AudioPlayer() as player:
        async for event in result.stream():
            if event.type == "voice_stream_event_audio":
                player.add_audio(event.data)
                print("Received audio")
            elif event.type == "voice_stream_event_lifecycle":
                print(f"Received lifecycle event: {event.event}")

        # Add 1 second of silence to the end of the stream to avoid cutting off the last audio.
        player.add_audio(np.zeros(24000 * 1, dtype=np.int16))


if __name__ == "__main__":
    asyncio.run(main())