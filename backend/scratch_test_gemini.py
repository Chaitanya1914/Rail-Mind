import google.generativeai as genai
import os

# Use the key the user provided earlier
genai.configure(api_key="AQ.Ab8RN6K30Vsl2GivkoBQhFX2qXdBsqQD0gpQSt9fa7PSG-QrvQ")

def get_train_delay(train_number: str) -> str:
    """Returns the predicted delay in minutes for a given train number."""
    # Mock response
    return f"Train {train_number} is predicted to be delayed by 45 minutes."

def get_train_safety(train_number: str) -> str:
    """Returns the safety risk score out of 10 for a given train number."""
    return f"Train {train_number} has a safety risk score of 8.2/10 due to flooding."

# Test the model
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    tools=[get_train_delay, get_train_safety]
)

chat = model.start_chat(enable_automatic_function_calling=True)

print("Sending prompt...")
response = chat.send_message("Is train 12301 going to be delayed today? And is it safe?")
print("Response:")
print(response.text)
