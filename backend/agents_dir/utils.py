def get_speak(response_type: str, main_result: str) -> str:
    if response_type == "OpenQuestion":
        return f"Here is the question: {main_result['question']}"
    if response_type == "ClosedQuestion":
        return f"Here is the question: {main_result['question']}"
    if response_type == "Answer":
        return main_result
    if response_type == "Review":
        return main_result
    if response_type == "Summary": 
        return main_result
    if response_type == "NoteSearch":
        return main_result
    if response_type == "Assistant":
        return main_result
    return None
