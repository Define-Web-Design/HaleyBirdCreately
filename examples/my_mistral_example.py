
import os
import sys

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
    
    try:
        # Initialize the Mistral AI service
        mistral = MistralAIService()
        
        # Example 1: Simple text generation
        print("\n--- Example 1: Simple Text Generation ---")
        prompt = "Explain the concept of artificial intelligence in simple terms"
        print(f"Prompt: {prompt}")
        response = mistral.generate_text(prompt)
        print(f"Response:\n{response}")
        
        # Example 2: Using a different model
        print("\n--- Example 2: Using a Different Model ---")
        prompt = "What are the best practices for Python code documentation?"
        print(f"Prompt: {prompt}")
        response = mistral.generate_text(prompt, model="mistral-small")
        print(f"Response:\n{response}")
        
        # Example 3: Chat conversation
        print("\n--- Example 3: Chat Conversation ---")
        messages = [
            {"role": "user", "content": "What is machine learning?"},
            {"role": "assistant", "content": "Machine learning is a subfield of artificial intelligence that enables computers to learn from data and improve over time without being explicitly programmed."},
            {"role": "user", "content": "Can you give me some examples of machine learning applications?"}
        ]
        
        print("Chat history:")
        for msg in messages:
            print(f"{msg['role'].capitalize()}: {msg['content'][:50]}...")
        
        response = mistral.chat_conversation(messages)
        print(f"Assistant response:\n{response}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
