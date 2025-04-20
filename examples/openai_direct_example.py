
import os
from openai import OpenAI

def main():
    # Initialize the OpenAI client
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("⚠️ OPENAI_API_KEY environment variable is not set")
        print("Please set it with your OpenAI API key before running this example")
        return
    
    client = OpenAI(api_key=api_key)
    
    # Generate a completion
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Generate a color palette for a modern website."}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    # Print the result
    print("\nOpenAI Response:")
    print(response.choices[0].message.content)
    
    # Example with the JSON response format
    json_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a color palette expert. Return JSON only."},
            {"role": "user", "content": "Give me 3 color schemes with their hex codes"}
        ],
        temperature=0.7,
        max_tokens=500,
        response_format={"type": "json_object"}
    )
    
    print("\nJSON Response:")
    print(json_response.choices[0].message.content)

if __name__ == "__main__":
    main()
