
import os
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

class MistralAIService:
    def __init__(self):
        self.api_key = os.environ.get("MISTRAL_API_KEY")
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY environment variable is not set")
        self.client = MistralClient(api_key=self.api_key)
        
    def generate_text(self, prompt: str, model: str = "mistral-medium") -> str:
        """Generate text using Mistral AI models"""
        messages = [ChatMessage(role="user", content=prompt)]
        
        # Call the Mistral AI API
        chat_response = self.client.chat(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Extract and return the generated text
        return chat_response.choices[0].message.content
    
    def generate_structured_data(self, prompt: str, model: str = "mistral-medium") -> dict:
        """Generate structured data response"""
        # Add instructions to format response as JSON
        formatted_prompt = f"{prompt} Please format your response as a JSON object."
        messages = [ChatMessage(role="user", content=formatted_prompt)]
        
        # Call the Mistral AI API
        chat_response = self.client.chat(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Return the text response - will need to be parsed by caller
        return chat_response.choices[0].message.content
    
    def chat_conversation(self, messages: list[dict], model: str = "mistral-medium") -> str:
        """Have a multi-message conversation with Mistral AI"""
        # Convert dictionary messages to ChatMessage objects
        chat_messages = [
            ChatMessage(role=msg["role"], content=msg["content"]) 
            for msg in messages
        ]
        
        # Call the Mistral AI API
        chat_response = self.client.chat(
            model=model,
            messages=chat_messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Return the generated response
        return chat_response.choices[0].message.content

# Example usage
if __name__ == "__main__":
    try:
        mistral_service = MistralAIService()
        response = mistral_service.generate_text("Explain the concept of color theory in design")
        print(response)
    except ValueError as e:
        print(f"Error: {e}")
        print("Please set the MISTRAL_API_KEY environment variable with your Mistral AI API key")
