
import os
import sys

# Add the server directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import google.generativeai as genai

def main():
    print("Google Gemini AI Python Example")
    print("------------------------------")
    
    # Check if API key is set
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️ GEMINI_API_KEY environment variable is not set")
        print("Please set it with your Google Gemini API key before running this example")
        print("You can get an API key from https://aistudio.google.com/app/apikey")
        return
    
    # Configure the Gemini API
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    
    # Example 1: Simple text generation with Gemini Pro
    print("\n--- Example 1: Simple Text Generation ---")
    prompt = "Explain how color psychology affects user experience in web design"
    print(f"Prompt: {prompt}")
    
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    print(f"Response:\n{response.text}")
    
    # Example 2: Structured data generation
    print("\n--- Example 2: Structured Data Generation ---")
    prompt = """Create a list of 3 complementary color pairs with their hex codes and use cases.
    Return your response as valid JSON with this structure:
    {
      "colorPairs": [
        {
          "color1": {"name": "Color Name", "hex": "#HEXCODE"},
          "color2": {"name": "Color Name", "hex": "#HEXCODE"},
          "useCase": "Brief description of where this pair works well"
        }
      ]
    }
    """
    print(f"Prompt: {prompt}")
    
    # For structured data, we use a lower temperature for more deterministic results
    model = genai.GenerativeModel(
        'gemini-pro',
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            top_p=0.95,
            top_k=40,
            max_output_tokens=1024,
        )
    )
    
    response = model.generate_content(prompt)
    print(f"Response:\n{response.text}")
    
    # Example 3: Multi-turn conversation
    print("\n--- Example 3: Chat Conversation ---")
    chat = model.start_chat(history=[])
    
    print("User: What makes a good color palette for a creative app?")
    response = chat.send_message("What makes a good color palette for a creative app?")
    print(f"Gemini: {response.text}\n")
    
    print("User: Can you suggest a specific palette for a mood board application?")
    response = chat.send_message("Can you suggest a specific palette for a mood board application?")
    print(f"Gemini: {response.text}")
    
    # Example 4: Image Analysis (if VISION model is used)
    # Note: This requires the gemini-pro-vision model and an image file
    """
    print("\n--- Example 4: Image Analysis ---")
    print("Note: This example is commented out as it requires an image file.")
    
    # To use image analysis, uncomment this code and provide a path to an image
    # image_path = "path/to/your/image.jpg"
    # 
    # with open(image_path, "rb") as img_file:
    #     image_data = img_file.read()
    #
    # vision_model = genai.GenerativeModel('gemini-pro-vision')
    # 
    # image_parts = [
    #     {
    #         "text": "Describe this image in detail. What are the prominent colors?"
    #     },
    #     {
    #         "inline_data": {
    #             "mime_type": "image/jpeg",
    #             "data": base64.b64encode(image_data).decode("utf-8")
    #         }
    #     }
    # ]
    # 
    # response = vision_model.generate_content(image_parts)
    # print(f"Response:\n{response.text}")
    """

if __name__ == "__main__":
    main()
