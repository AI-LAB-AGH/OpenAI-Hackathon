from prompts import *
from agents import Agent, FileSearchTool

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