#!/usr/bin/env python3
"""
Test the Mistral AI API integration for the Creately color generator.

This script makes a test request to the Mistral AI API to verify the
API key is working correctly and to test the color generation prompts.
"""

import os
import json
import http.client
import time
import sys

print("=" * 50)
print("Mistral AI API Test Tool")
print("=" * 50)
print()

# Check for API key in environment
api_key = os.environ.get('MISTRAL_API_KEY')
if not api_key:
    print("⚠️  MISTRAL_API_KEY environment variable not set.")
    print("Please set this variable before running the test.")
    sys.exit(1)

print("✅ Found MISTRAL_API_KEY in environment variables.")

# Define the API parameters
def call_mistral_api(prompt, model="mistral-tiny", max_tokens=500, temperature=0.7):
    """Call the Mistral AI API with the given prompt."""
    print(f"🔄 Making API request to model: {model}")
    print(f"📝 Prompt: {prompt[:50]}..." if len(prompt) > 50 else f"📝 Prompt: {prompt}")
    
    conn = http.client.HTTPSConnection("api.mistral.ai")
    
    payload = json.dumps({
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": max_tokens,
        "temperature": temperature
    })
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    start_time = time.time()
    try:
        conn.request("POST", "/v1/chat/completions", payload, headers)
        res = conn.getresponse()
        data = res.read()
        response_text = data.decode("utf-8")
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"⏱️  API response time: {elapsed_time:.2f} seconds")
        
        if res.status != 200:
            print(f"❌ API error - Status {res.status}: {response_text}")
            return None
        
        return json.loads(response_text)
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def test_color_palette_generation():
    """Test color palette generation with Mistral AI."""
    print("\n" + "-" * 50)
    print("Testing Color Palette Generation")
    print("-" * 50)
    
    mood = "calming and peaceful beach sunset"
    
    prompt = f"""Generate a color palette with 5 colors that evokes a {mood} mood or feeling. 
Return only a JSON object with the following structure:
{{
  "theme": "{mood}",
  "description": "A brief description of the palette and how it relates to the theme",
  "colors": [
    {{
      "hex": "#RRGGBB",
      "name": "Name of the color",
      "role": "primary|secondary|accent|background|text"
    }}
    // More colors...
  ]
}}

Do not include any explanations or other text outside of the JSON object.
Ensure each color has a unique and descriptive name.
Make sure the colors work well together and are appropriate for the mood."""
    
    response = call_mistral_api(prompt)
    
    if response and 'choices' in response and len(response['choices']) > 0:
        message_content = response['choices'][0]['message']['content']
        print("\n✅ Successfully received response from Mistral AI API.")
        
        # Try to parse any JSON in the response
        try:
            # Extract JSON if inside code block
            if "```json" in message_content:
                json_text = message_content.split("```json")[1].split("```")[0].strip()
            elif "```" in message_content:
                json_text = message_content.split("```")[1].strip()
            else:
                json_text = message_content
                
            palette = json.loads(json_text)
            
            print("\n📊 Extracted Color Palette:")
            print(f"Theme: {palette.get('theme', 'Not specified')}")
            print(f"Description: {palette.get('description', 'Not provided')}")
            print("\nColors:")
            
            for color in palette.get('colors', []):
                print(f"  - {color.get('name', 'Unnamed')} ({color.get('hex', 'No hex')}): {color.get('role', 'No role')}")
                
            return True
        except Exception as e:
            print(f"\n❌ Failed to parse JSON response: {e}")
            print(f"\nRaw response: {message_content}")
            return False
    else:
        print("\n❌ Failed to get valid response from API")
        return False

# Run the test
if __name__ == '__main__':
    success = test_color_palette_generation()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Mistral AI API test completed successfully!")
        print("The color generator should work correctly.")
    else:
        print("❌ Mistral AI API test failed.")
        print("Please check your API key and try again.")
    print("=" * 50)