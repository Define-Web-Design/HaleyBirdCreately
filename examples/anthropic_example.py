
import sys
import os

# Add the server directory to the path so we can import the anthropic module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.ai.anthropic import AnthropicAI, analyze_content

def main():
    # Check if API key is set
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("⚠️ ANTHROPIC_API_KEY environment variable is not set")
        print("Please set it with your Anthropic API key before running this example")
        print("You can get an API key from https://console.anthropic.com/")
        return
    
    # Initialize the Anthropic Claude service
    claude = AnthropicAI()
    
    # Example 1: Simple text generation
    print("\n--- Example 1: Simple Text Generation ---")
    prompt = "Explain the concept of color harmony in design in 3 paragraphs"
    print(f"Prompt: {prompt}")
    response = claude.generate_text(prompt)
    print(f"Response:\n{response}")
    
    # Example 2: Chat conversation
    print("\n--- Example 2: Chat Conversation ---")
    messages = [
        {"role": "user", "content": "What are the psychological effects of different colors in marketing?"},
        {"role": "assistant", "content": "Colors play a significant role in marketing psychology. Red evokes excitement and urgency, blue suggests trust and reliability, yellow conveys optimism, green represents growth and health, purple implies luxury, and black portrays sophistication. These emotional reactions can influence consumer behavior, brand perception, and purchasing decisions."},
        {"role": "user", "content": "Can you explain more about blue specifically?"}
    ]
    
    print("Chat history:")
    for msg in messages:
        print(f"{msg['role'].capitalize()}: {msg['content'][:50]}...")
    
    response = claude.chat_conversation(messages)
    print(f"Assistant response:\n{response}")
    
    # Example 3: Content analysis
    print("\n--- Example 3: Content Analysis ---")
    content = """
    Our new color palette generator has been well received by the design community.
    Users have praised its intuitive interface and AI-driven suggestions.
    However, some users have mentioned that the export options could be improved.
    """
    
    print(f"Content to analyze: {content}")
    analysis = analyze_content(content)
    print("\nAnalysis results:")
    print(f"Sentiment: {analysis.get('sentiment', 'Unknown')}")
    print(f"Topics: {', '.join(analysis.get('topics', []))}")
    print(f"Keywords: {', '.join(analysis.get('keywords', []))}")

if __name__ == "__main__":
    main()
