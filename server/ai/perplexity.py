
import os
import requests
import json
import dotenv

# Load environment variables
dotenv.load_dotenv()

class PerplexityAI:
    def __init__(self, api_key=None):
        """Initialize the Perplexity AI client"""
        self.api_key = api_key or os.environ.get('PERPLEXITY_API_KEY')
        if not self.api_key:
            raise ValueError("Perplexity API key is required. Set PERPLEXITY_API_KEY environment variable or pass as parameter.")
        
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_text(self, prompt, model="sonar-medium-online", max_tokens=1000, temperature=0.7):
        """Generate text response using Perplexity AI"""
        try:
            url = f"{self.base_url}/chat/completions"
            
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result["choices"][0]["message"]["content"]
        
        except requests.exceptions.RequestException as e:
            print(f"Error generating text from Perplexity: {str(e)}")
            return ""
    
    def generate_json_response(self, prompt, system_prompt="", model="sonar-medium-online", max_tokens=1000, temperature=0.7):
        """Generate JSON response from Perplexity AI"""
        try:
            url = f"{self.base_url}/chat/completions"
            
            # Ensure system prompt requests JSON
            final_system_prompt = f"{system_prompt}\nYou must respond with valid JSON only, no other text."
            
            data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": final_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            response = requests.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parse JSON response
            return json.loads(content)
        
        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Error generating JSON from Perplexity: {str(e)}")
            raise Exception("Failed to generate valid JSON response")

# Export default API
perplexity = PerplexityAI()

# Example usage functions
def analyze_content(content):
    """Analyze content using Perplexity AI"""
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

    return perplexity.generate_json_response(prompt, system_prompt)
