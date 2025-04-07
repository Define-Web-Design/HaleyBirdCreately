
import os
import json
import urllib.request
import ssl

def call_openai_api(prompt, system_prompt=None, api_key=None):
    """
    Call the OpenAI API with a prompt and optional system prompt
    
    Args:
        prompt (str): The user prompt to send to OpenAI
        system_prompt (str, optional): The system instructions
        api_key (str, optional): OpenAI API key (defaults to env variable)
        
    Returns:
        dict: The parsed JSON response from OpenAI
    """
    # Get API key from environment if not provided
    api_key = api_key or os.environ.get('OPENAI_API_KEY')
    
    if not api_key:
        raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass as parameter.")
    
    # Format request data
    data = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt or "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    # Convert data to JSON
    data_json = json.dumps(data).encode('utf-8')
    
    # Create request
    url = 'https://api.openai.com/v1/chat/completions'
    request = urllib.request.Request(url, data=data_json, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    })
    
    # Handle SSL verification
    context = ssl.create_default_context()
    
    # Send request and get response
    try:
        with urllib.request.urlopen(request, context=context) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
    except urllib.error.HTTPError as e:
        error_data = json.loads(e.read().decode('utf-8'))
        error_message = error_data.get('error', {}).get('message', str(e))
        raise Exception(f"OpenAI API error: {error_message}")
    except Exception as e:
        raise Exception(f"Error calling OpenAI API: {str(e)}")

# Example usage
if __name__ == "__main__":
    # Set your API key in environment variable or pass directly
    # os.environ['OPENAI_API_KEY'] = 'your-api-key-here'
    
    try:
        # Simple text completion example
        response = call_openai_api(
            prompt="What are three ways to optimize Python code?",
            system_prompt="You are a Python programming expert. Provide concise, practical advice."
        )
        
        # Extract and print the response text
        if 'choices' in response and len(response['choices']) > 0:
            content = response['choices'][0]['message']['content']
            print("OpenAI Response:")
            print("-" * 40)
            print(content)
            print("-" * 40)
        else:
            print("Unexpected response format:", response)
    except Exception as e:
        print(f"Error: {str(e)}")
