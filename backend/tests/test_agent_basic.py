import sys
import os
import asyncio
from deepeval import evaluate
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import GEval

# Add parent directory to path to import agent modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the main agent
from agents_dir.custom_agents import main_agent
from agents import Runner

# Test case for the main agent workflow
async def run_agent(input_prompt):
    """Helper function to run the agent with the given input"""
    result = await Runner.run(main_agent, input_prompt)
    # Handle different output formats
    try:
        if hasattr(result.final_output, 'model_dump'):
            return result.final_output.model_dump()
        else:
            return result.final_output
    except:
        return result.final_output

# Create a test case that can be run with DeepEval CLI
test_case = LLMTestCase(
    input="Generate an open-ended question about photosynthesis",
    actual_output=asyncio.run(run_agent("Generate an open-ended question about photosynthesis")),
    expected_output='''{
        "question": "Explain how photosynthesis contributes to the carbon cycle and its importance for maintaining oxygen levels in the atmosphere.",
        "how_difficult": 3,
        "mark": 10
    }''',
)

# Define metrics - this will be used by the DeepEval CLI
metrics = [
    GEval(
        name="AgentWorkflowAccuracy",
        criteria="""
        Evaluate the agent's response based on these criteria:
        1. Does it correctly generate a question as requested?
        2. Is the question relevant to biology?
        3. Is the difficulty level appropriate?
        """,
        threshold=0.7,
        evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.EXPECTED_OUTPUT]
    )
] 

evaluate(test_cases=[test_case], metrics=metrics)