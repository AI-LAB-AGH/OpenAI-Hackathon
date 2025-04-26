import sys
import os
import asyncio
from deepeval.test_case import LLMTestCase
from deepeval.metrics import GEval

# Add parent directory to path to import agent modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the agents
from agents_dir.custom_agents import main_agent, open_question_agent, review_agent, summary_agent
from agents import Runner

# Helper function to run an agent and get string output
async def run_agent(input_prompt):
    """Helper function to run the agent with the given input"""
    result = await Runner.run(main_agent, input_prompt)
    # Convert any output to string
    try:
        if hasattr(result.final_output, 'model_dump'):
            return str(result.final_output.model_dump())
        else:
            return str(result.final_output)
    except:
        return str(result.final_output)

# ---------------------------------
# Test Case 1: Question Generation
# ---------------------------------
question_test_case = LLMTestCase(
    input="Generate an open-ended question about climate change",
    actual_output=asyncio.run(run_agent("Generate an open-ended question about climate change")),
    expected_output="Explain how human activities contribute to climate change and propose three potential solutions that could mitigate its effects.",
)

# ---------------------------------
# Test Case 2: Summary Generation
# ---------------------------------
summary_test_case = LLMTestCase(
    input="Summarize my notes on quantum mechanics",
    actual_output=asyncio.run(run_agent("Summarize my notes on quantum mechanics")),
    expected_output="Your quantum mechanics notes cover wave-particle duality, Heisenberg's uncertainty principle, quantum states, and the mathematical formalism of operators and wave functions.",
)

# ---------------------------------
# Test Case 3: Review Generation
# ---------------------------------
review_test_case = LLMTestCase(
    input="Review my notes on the American Civil War",
    actual_output=asyncio.run(run_agent("Review my notes on the American Civil War")),
    expected_output="Your American Civil War notes are generally accurate. They cover key events from 1861-1865, including major battles and figures. Consider adding more details about economic and social factors that contributed to the conflict.",
)

# ---------------------------------
# Test Case 4: General Knowledge
# ---------------------------------
knowledge_test_case = LLMTestCase(
    input="What is photosynthesis?",
    actual_output=asyncio.run(run_agent("What is photosynthesis?")),
    expected_output="Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water. It is a process that converts light energy to chemical energy, which is then stored in the bonds of sugar molecules.",
)

# Define metrics - this will be used by the DeepEval CLI
metrics = [
    GEval(
        name="AgentResponseQuality",
        criteria="""
        Evaluate the agent's response based on these criteria:
        1. Does it correctly answer the question or fulfill the request?
        2. Is the response clear, concise, and well-structured?
        3. Does it provide accurate information?
        4. Is the response appropriate for the specific agent that should handle this query?
        """,
        threshold=0.7
    )
]

# Define the test cases that should be available to the DeepEval CLI
# Note: DeepEval will use the first test case by default
test_case = question_test_case

# To run other test cases, you can modify the line above to use a different test case
# or run them manually in your code