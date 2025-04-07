
import sys
import os

# Add the server directory to the path so we can import the perplexity module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.ai.perplexity import perplexity, analyze_content

def main():
    print("Perplexity AI Example")
    print("--------------------")
    
    # Simple text generation
    prompt = "Explain the concept of creative symbiosis in 3 sentences."
    print(f"Prompt: {prompt}")
    
    response = perplexity.generate_text(prompt)
    print("\nResponse:")
    print(response)
    
    # Content analysis example
    content = """
    The new color palette app has been very well received by designers. 
    Users have praised its intuitive interface and the AI-generated color suggestions.
    However, some users have reported that the app is slow when generating complex palettes.
    """
    
    print("\n\nContent Analysis Example")
    print("------------------------")
    print(f"Content to analyze: {content}")
    
    analysis = analyze_content(content)
    print("\nAnalysis Results:")
    print(f"Sentiment: {analysis['sentiment']}")
    print(f"Topics: {', '.join(analysis['topics'])}")
    print(f"Keywords: {', '.join(analysis['keywords'])}")

if __name__ == "__main__":
    main()
