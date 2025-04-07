
import sys
import os

# Add the server directory to the path so we can import the MistralAIService
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.ai.mistral import MistralAIService

def main():
    # Check if API key is set
    if not os.environ.get("MISTRAL_API_KEY"):
        print("⚠️ MISTRAL_API_KEY environment variable is not set")
        print("Please set it with your Mistral AI API key before running this example")
        print("You can get an API key from https://console.mistral.ai/")
        return
    
    # Initialize the Mistral AI service
    mistral = MistralAIService()
    
    # Example 1: Simple text generation
    print("\n--- Example 1: Simple Text Generation ---")
    prompt = "Explain how color psychology affects user experience in web design"
    print(f"Prompt: {prompt}")
    response = mistral.generate_text(prompt)
    print(f"Response:\n{response}")
    
    # Example 2: Structured data generation
    print("\n--- Example 2: Structured Data Generation ---")
    prompt = "Create a list of 3 complementary color pairs with their hex codes and use cases"
    print(f"Prompt: {prompt}")
    response = mistral.generate_structured_data(prompt)
    print(f"Response:\n{response}")
    
    # Example 3: Chat conversation
    print("\n--- Example 3: Chat Conversation ---")
    messages = [
        {"role": "user", "content": "What makes a good color palette for a creative app?"},
        {"role": "assistant", "content": "A good color palette for a creative app should be visually appealing, accessible, and align with the app's purpose. It should include primary colors for the main UI elements, secondary colors for accents, and neutral colors for backgrounds and text."},
        {"role": "user", "content": "Can you suggest a specific palette for a mood board application?"}
    ]
    
    print("Chat history:")
    for msg in messages:
        print(f"{msg['role'].capitalize()}: {msg['content'][:50]}...")
    
    response = mistral.chat_conversation(messages)
    print(f"Assistant response:\n{response}")

if __name__ == "__main__":
    main()
