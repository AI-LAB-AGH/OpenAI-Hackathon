import asyncio
from agents import Agent, Runner, FileSearchTool, ModelSettings
from .prompts import *
from .ocr_agent import ocr_agent

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

main_agent = Agent(
    name="Assistant",
    model="gpt-4.1-mini",
    instructions=main_assistant_prompt,
    handoffs=[quiz_agent, open_question_agent, closed_question_agent, review_agent, summary_agent, ocr_agent],
    # model_settings=ModelSettings(tool_choice="required")
)

async def main():
    user_input = "Could you generate a quiz based on my latest biology notes?"
    # user_input = "Could you generate a question based on my latest biology notes?"
    # user_input = "Could you generate a review of my latest notes?"
    # user_input = "Could you generate a summary of my latest notes?"
    result = await Runner.run(main_agent, user_input)
    response_type = result.last_agent.name
    try:
        result = result.final_output_as(dict).model_dump()
    except:
        result = result.final_output
    print({"response_type": response_type, "response_content": result})

if __name__ == "__main__":
    asyncio.run(main())