
import os
import requests
import json
import dotenv

# Load environment variables
dotenv.load_dotenv()

class AnthropicAI:
    def __init__(self, api_key=None):
        """Initialize the Anthropic Claude client"""
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass as parameter.")
        
        self.base_url = "https://api.anthropic.com"
        self.headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
    
    def generate_text(self, prompt, model="claude-3-opus-20240229", max_tokens=1000, temperature=0.7):
        """Generate text response using Anthropic Claude"""
        try:
            url = f"{self.base_url}/v1/complete"
            
            data = {
                "model": model,
                "prompt": f"\n\nHuman: {prompt}\n\nAssistant:",
                "max_tokens_to_sample": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result["completion"]
        
        except requests.exceptions.RequestException as e:
            print(f"Error generating text from Anthropic: {str(e)}")
            return ""
    
    def chat_conversation(self, messages, model="claude-3-opus-20240229", max_tokens=1000, temperature=0.7):
        """Have a multi-message conversation with Claude"""
        try:
            url = f"{self.base_url}/v1/messages"
            
            # Format messages for Anthropic API
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            data = {
                "model": model,
                "messages": formatted_messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            # Update headers for messages API
            message_headers = self.headers.copy()
            message_headers["anthropic-version"] = "2023-06-01"
            
            response = requests.post(url, headers=message_headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result["content"][0]["text"]
        
        except requests.exceptions.RequestException as e:
            print(f"Error in chat conversation with Anthropic: {str(e)}")
            return ""
    
    def generate_json_response(self, prompt, system_prompt="", model="claude-3-opus-20240229"):
        """Generate structured JSON response from Claude"""
        try:
            url = f"{self.base_url}/v1/messages"
            
            data = {
                "model": model,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "system": system_prompt,
                "max_tokens": 1000,
                "temperature": 0.7,
                "response_format": {"type": "json_object"}
            }
            
            # Update headers for messages API
            message_headers = self.headers.copy()
            message_headers["anthropic-version"] = "2023-06-01"
            
            response = requests.post(url, headers=message_headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            content = result["content"][0]["text"]
            
            # Parse JSON response
            return json.loads(content)
        
        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Error generating JSON from Anthropic: {str(e)}")
            return {}

# Export default API
anthropic = AnthropicAI()

# Example function using Claude for content analysis
def analyze_content(content):
    """Analyze content using Anthropic Claude"""
    prompt = f"""
    Analyze the following content and provide an assessment of:
    1. The overall sentiment (positive, negative, neutral)
    2. Key topics covered
    3. Important keywords for categorization

    Content: {content}
    """

    system_prompt = """
    You are an AI content analyst. Provide a JSON response with these fields:
    - sentiment: string (positive, negative, or neutral)
    - topics: string[] (array of main topics)
    - keywords: string[] (array of relevant keywords)
    """

    return anthropic.generate_json_response(prompt, system_prompt)

# Example usage
if __name__ == "__main__":
    try:
        claude_service = AnthropicAI()
        response = claude_service.generate_text("Explain how AI can be used to enhance color palette selection for designers")
        print(response)
    except ValueError as e:
        print(f"Error: {e}")
        print("Please set the ANTHROPIC_API_KEY environment variable with your Anthropic API key")
