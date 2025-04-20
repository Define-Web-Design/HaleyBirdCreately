
import os
import sys

# Add the server directory to the path so we can import the openai module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.ai.openai import generateText, generateJsonResponse, analyzeContent

def main():
    print("OpenAI Python Example")
    print("---------------------")
    
    # Check if API key is set
    if not os.environ.get("OPENAI_API_KEY"):
        print("⚠️ OPENAI_API_KEY environment variable is not set")
        print("Please set it with your OpenAI API key before running this example")
        print("You can get an API key from https://platform.openai.com/api-keys")
        return
    
    # Example 1: Simple text generation
    print("\n--- Example 1: Simple Text Generation ---")
    prompt = "Explain what color theory is in 3 sentences."
    print(f"Prompt: {prompt}")
    
    response = generateText(prompt)
    print(f"Response:\n{response}")
    
    # Example 2: JSON response generation
    print("\n--- Example 2: JSON Response Generation ---")
    prompt = "Give me 3 complementary color pairs with their hex codes"
    print(f"Prompt: {prompt}")
    
    system_prompt = "You are a color palette expert. Return JSON with an array of complementary color pairs."
    response = generateJsonResponse(prompt, system_prompt, {"temperature": 0.7})
    print(f"Response:\n{response}")
    
    # Example 3: Content analysis
    print("\n--- Example 3: Content Analysis ---")
    content = """
    The new color palette app has been very well received by designers. 
    Users have praised its intuitive interface and the AI-generated color suggestions.
    However, some users have reported that the app is slow when generating complex palettes.
    """
    print(f"Content to analyze: {content}")
    
    analysis = analyzeContent(content)
    print("\nAnalysis Results:")
    print(f"Sentiment: {analysis['sentiment']}")
    print(f"Topics: {', '.join(analysis['topics'])}")
    print(f"Keywords: {', '.join(analysis['keywords'])}")

if __name__ == "__main__":
    main()
