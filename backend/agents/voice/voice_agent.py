import asyncio
import random

import numpy as np

from agents import Agent, function_tool
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions
from agents.voice import (
    AudioInput,
    StreamedAudioInput,
    SingleAgentVoiceWorkflow,
    SingleAgentWorkflowCallbacks,
    VoicePipeline,
)

from .utils import AudioPlayer, record_audio, ContinuousAudioStreamer

"""
This is a simple example that uses continuous streaming audio input. Run it via:
`python -m examples.voice.static.main`

1. The microphone will continuously record audio
2. The pipeline automatically transcribes the audio as it's streamed
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

    # Create a continuous audio streamer
    audio_streamer = ContinuousAudioStreamer()
    
    # Create a StreamedAudioInput that will receive audio chunks from the audio_streamer
    audio_input = StreamedAudioInput()
    
    # Start processing in the background
    processing_task = asyncio.create_task(pipeline.run(audio_input))
    
    try:
        # Start the audio streamer
        await audio_streamer.start()
        
        print("Listening... (Press Ctrl+C to stop)")
        
        # Feed audio chunks to the StreamedAudioInput
        async for audio_chunk in audio_streamer:
            try:
                await audio_input.append_audio(audio_chunk)
            except Exception as e:
                print(f"Error appending audio: {e}")
                # Continue despite errors
                continue
            
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error in audio streaming: {e}")
    finally:
        # Clean up resources
        print("Stopping audio streaming...")
        audio_streamer.stop()
        try:
            await audio_input.end_audio()
        except Exception as e:
            print(f"Error ending audio: {e}")
        
    # Get the result from the pipeline
    try:
        result = await processing_task
        
        with AudioPlayer() as player:
            async for event in result.stream():
                if event.type == "voice_stream_event_audio":
                    player.add_audio(event.data)
                    print("Received audio")
                elif event.type == "voice_stream_event_lifecycle":
                    print(f"Received lifecycle event: {event.event}")

            # Add 1 second of silence to the end of the stream to avoid cutting off the last audio.
            player.add_audio(np.zeros(24000 * 1, dtype=np.int16))
    except Exception as e:
        print(f"Error processing pipeline result: {e}")


if __name__ == "__main__":
    asyncio.run(main())