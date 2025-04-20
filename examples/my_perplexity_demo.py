
import sys
import os
import json

# Add the server directory to the path so we can import the perplexity module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.ai.perplexity import perplexity

def main():
    print("My Perplexity AI Demo")
    print("---------------------")
    
    # Check if API key is set
    if not os.environ.get("PERPLEXITY_API_KEY"):
        print("⚠️ PERPLEXITY_API_KEY environment variable is not set")
        print("Please set it with your Perplexity AI API key before running this example")
        return
    
    # Simple text generation
    prompt = "Explain the concept of color psychology in three sentences."
    print(f"\nPrompt: {prompt}")
    
    response = perplexity.generate_text(prompt)
    print("\nResponse:")
    print(response)
    
    # Generate structured data
    print("\n\nStructured Data Example")
    print("----------------------")
    
    prompt = "Recommend 3 color combinations for a creative website"
    system_prompt = """
    You are a color design expert. Provide a JSON response with these fields:
    - combinations: array of objects with:
      - name: string (name of the combination)
      - colors: array of objects with:
        - hex: string (hex code)
        - role: string (primary, secondary, accent, etc.)
    """
    
    print(f"Prompt: {prompt}")
    try:
        result = perplexity.generate_json_response(prompt, system_prompt)
        print("\nAnalysis Results:")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
