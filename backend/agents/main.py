import asyncio
from typing import AsyncIterator, Any
from agents import Agent, Runner, FileSearchTool, ModelSettings, TResponseInputItem
from prompts import *
from agents.voice import (
    AudioInput,
    SingleAgentVoiceWorkflow,
    SingleAgentWorkflowCallbacks,
    VoicePipeline,
    VoiceWorkflowBase,
    VoiceWorkflowHelper
)

import numpy as np

from voice_utils import AudioPlayer, record_audio


class SingleAgentVoiceWorkflow(VoiceWorkflowBase):
    """A simple voice workflow that runs a single agent. Each transcription and result is added to
    the input history.
    For more complex workflows (e.g. multiple Runner calls, custom message history, custom logic,
    custom configs), subclass `VoiceWorkflowBase` and implement your own logic.
    """

    def __init__(self, agent: Agent[Any], callbacks: SingleAgentWorkflowCallbacks | None = None):
        """Create a new single agent voice workflow.

        Args:
            agent: The agent to run.
            callbacks: Optional callbacks to call during the workflow.
        """
        self._input_history: list[TResponseInputItem] = []
        self._current_agent = agent
        self._callbacks = callbacks

    async def run(self, transcription: str) -> AsyncIterator[str]:
        if self._callbacks:
            self._callbacks.on_run(self, transcription)

        # Add the transcription to the input history
        self._input_history.append(
            {
                "role": "user",
                "content": transcription,
            }
        )

        # Run the agent
        main_result = await Runner.run(main_agent, self._input_history)
        speak = ""
        response_type = main_result.last_agent.name
        try:
            main_result = main_result.final_output_as(dict).model_dump()
        except:
            main_result = main_result.final_output

        match response_type:
            case "Quiz":
                speak = "Here is the quiz"
            case "OpenQuestion":
                speak = f"Here is the open question: {main_result}"
            case "ClosedQuestion":
                speak = f"Here is the closed question: {main_result}"
            case "Review":
                speak = main_result
            case "Summary":
                speak = main_result
            case "NoteSearch":
                speak = main_result
            case "Assistant":
                speak = main_result

        result = Runner.run_streamed(self._current_agent, speak)

        # Stream the text from the result
        async for chunk in VoiceWorkflowHelper.stream_text_from(result):
            yield chunk

        # Update the input history and current agent
        self._input_history = result.to_input_list()
        self._current_agent = result.last_agent

speaking_agent = Agent(
    name="Speaking",
    model="gpt-4o-mini",
    instructions="Repeat the user's message back to them",
    tools=[],
    output_type=str
)

open_question_agent = Agent(
    name="OpenQuestion",
    model="gpt-4o-mini",
    instructions=question_agent_prompt,
    tools=[],
    output_type=OpenQuestion,
)

closed_question_agent = Agent(
    name="ClosedQuestion",
    model="gpt-4.1-mini",
    instructions=question_agent_prompt,
    tools=[],
    output_type=ClosedQuestion
)

quiz_agent = Agent(
    name="Quiz",
    model="gpt-4.1-mini",
    instructions=quiz_agent_prompt,
    tools=[
        open_question_agent.as_tool(
            tool_name="open_agent",
            tool_description="Generate an open-style question",
        ),
        closed_question_agent.as_tool(
            tool_name="closed_agent",
            tool_description="Generate a multiple choice question",
        ),
    ],
    output_type=Quiz
)

answer_agent = Agent(
    name="Answer",
    model="gpt-4.1-mini",
    instructions=answer_agent_prompt,
    tools=[]
)

review_agent = Agent(
    name="Review",
    model="gpt-4.1-mini",
    instructions=review_agent_prompt,
    tools=[
        FileSearchTool(
            max_num_results=3,
            vector_store_ids=["vs_680bdcfb44dc8191a0a7bca1c8e2ef77"]
        ),
    ],
)

summary_agent = Agent(
    name="Summary",
    model="gpt-4.1-mini",
    instructions=summary_agent_prompt,
    tools=[
        FileSearchTool(
            max_num_results=3,
            vector_store_ids=["vs_680bdcfb44dc8191a0a7bca1c8e2ef77"]
        ),
    ],
)

note_search_agent = Agent(
    name="NoteSearch",
    model="gpt-4.1-mini",
    instructions=note_search_agent_prompt,
    tools=[FileSearchTool(
        max_num_results=3,
        vector_store_ids=["vs_680bdcfb44dc8191a0a7bca1c8e2ef77"]
    )],
    output_type=str
)

main_agent = Agent(
    name="Assistant",
    model="gpt-4.1-mini",
    instructions=main_assistant_prompt,
    handoffs=[quiz_agent, open_question_agent, closed_question_agent, review_agent, summary_agent, note_search_agent],
    # model_settings=ModelSettings(tool_choice="required")
)

class WorkflowCallbacks(SingleAgentWorkflowCallbacks):
    def on_run(self, workflow: SingleAgentVoiceWorkflow, transcription: str) -> None:
        print(f"[debug] on_run called with transcription: {transcription}")

async def main():
    # user_input = "Could you generate a quiz based on my latest biology notes?"
    # user_input = "Could you generate a question based on my latest biology notes?"
    # user_input = "Could you generate a review of my latest notes?"
    # user_input = "Could you generate a summary of my latest notes?"
    # user_input = 'Hey, did I get that last part on my genetics notes right? Im not sure about that'

    pipeline = VoicePipeline(
        workflow=SingleAgentVoiceWorkflow(speaking_agent, callbacks=WorkflowCallbacks())
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