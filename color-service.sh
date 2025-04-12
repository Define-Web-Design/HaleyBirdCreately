#!/bin/bash

# Simple color service for Creately app
# This script provides a minimal implementation of the color generation API
# using only bash for maximum compatibility in the Replit environment.

PORT=8080
TEMP_DIR="/tmp/color-service"
LOG_FILE="$TEMP_DIR/service.log"

# Create temp directory if it doesn't exist
mkdir -p "$TEMP_DIR"

# Initialize log file
echo "Color Service starting at $(date)" > "$LOG_FILE"

# Function to log messages
log() {
    echo "[$(date +%T)] $1" >> "$LOG_FILE"
    echo "[$(date +%T)] $1"
}

# Default color palettes
HAPPY_PALETTE='{"colors":[{"hex":"#FFD166","name":"Sunny Yellow","role":"primary"},{"hex":"#06D6A0","name":"Bright Mint","role":"secondary"},{"hex":"#118AB2","name":"Ocean Blue","role":"accent"},{"hex":"#EF476F","name":"Coral Pink","role":"accent"},{"hex":"#073B4C","name":"Deep Navy","role":"background"}],"description":"A cheerful palette with bright yellows, turquoise, and vibrant accents"}'

CALM_PALETTE='{"colors":[{"hex":"#A8DADC","name":"Soft Blue","role":"primary"},{"hex":"#E0FBFC","name":"Pale Cyan","role":"background"},{"hex":"#457B9D","name":"Steel Blue","role":"secondary"},{"hex":"#1D3557","name":"Navy Blue","role":"accent"},{"hex":"#F1FAEE","name":"Off White","role":"text"}],"description":"A tranquil palette with soft blues and gentle neutral tones"}'

ENERGETIC_PALETTE='{"colors":[{"hex":"#FF595E","name":"Bright Red","role":"primary"},{"hex":"#FFCA3A","name":"Golden Yellow","role":"secondary"},{"hex":"#8AC926","name":"Lime Green","role":"accent"},{"hex":"#1982C4","name":"Vivid Blue","role":"accent"},{"hex":"#6A4C93","name":"Rich Purple","role":"background"}],"description":"A vibrant palette with bold reds, yellows, and electric blues"}'

PROFESSIONAL_PALETTE='{"colors":[{"hex":"#0A192F","name":"Dark Navy","role":"background"},{"hex":"#112240","name":"Midnight Blue","role":"secondary"},{"hex":"#233554","name":"Slate Blue","role":"accent"},{"hex":"#8892B0","name":"Muted Gray","role":"text"},{"hex":"#CCD6F6","name":"Light Lavender","role":"primary"}],"description":"A sleek palette with deep blues and subtle gray undertones"}'

CREATIVE_PALETTE='{"colors":[{"hex":"#F72585","name":"Magenta","role":"primary"},{"hex":"#7209B7","name":"Purple","role":"secondary"},{"hex":"#3A0CA3","name":"Indigo","role":"accent"},{"hex":"#4361EE","name":"Royal Blue","role":"accent"},{"hex":"#4CC9F0","name":"Cyan","role":"background"}],"description":"An imaginative palette with bold purples and vibrant blues"}'

# Design schemes
WEBSITE_SCHEME='{"scheme":{"primary":"#3498db","secondary":"#2ecc71","accent":"#9b59b6","background":"#f5f5f5","text":"#333333","success":"#27ae60","warning":"#f39c12","error":"#e74c3c"},"description":"A balanced website color scheme with good contrast and readability"}'

MOBILE_APP_SCHEME='{"scheme":{"primary":"#1abc9c","secondary":"#3498db","accent":"#9b59b6","background":"#ffffff","text":"#2c3e50","success":"#2ecc71","warning":"#f1c40f","error":"#e74c3c"},"description":"A vibrant mobile app color scheme optimized for small screens and touch interactions"}'

PRESENTATION_SCHEME='{"scheme":{"primary":"#3498db","secondary":"#2ecc71","accent":"#e74c3c","background":"#ecf0f1","text":"#2c3e50","success":"#27ae60","warning":"#f39c12","error":"#c0392b"},"description":"A professional presentation color scheme with high contrast for readability"}'

# Function to parse the request body from a file
parse_body() {
    local body_file="$1"
    
    # Check if jq is available to parse JSON
    if command -v jq &> /dev/null; then
        cat "$body_file" | jq -r "$2" 2>/dev/null || echo ""
    else
        # Fallback to grep and sed for basic JSON parsing
        grep -o "\"$2\":\"[^\"]*\"" "$body_file" | sed 's/.*:"//;s/".*//' || echo ""
    fi
}

# Function to send HTTP response
send_response() {
    local status="$1"
    local content_type="$2"
    local body="$3"
    
    echo -e "HTTP/1.1 $status\r\nContent-Type: $content_type\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nContent-Length: ${#body}\r\n\r\n$body"
}

# Function to handle generate-palette endpoint
handle_generate_palette() {
    local body_file="$1"
    local description=""
    
    # Try to parse the description from the request body
    description=$(parse_body "$body_file" ".description")
    
    log "Generating palette for: $description"
    
    # Choose a palette based on the description keywords
    if [[ "$description" == *"happy"* || "$description" == *"cheerful"* || "$description" == *"bright"* ]]; then
        local palette_data="$HAPPY_PALETTE"
        local mood="happy"
    elif [[ "$description" == *"calm"* || "$description" == *"peaceful"* || "$description" == *"tranquil"* ]]; then
        local palette_data="$CALM_PALETTE" 
        local mood="calm"
    elif [[ "$description" == *"energetic"* || "$description" == *"vibrant"* || "$description" == *"bold"* ]]; then
        local palette_data="$ENERGETIC_PALETTE"
        local mood="energetic"
    elif [[ "$description" == *"professional"* || "$description" == *"business"* || "$description" == *"corporate"* ]]; then
        local palette_data="$PROFESSIONAL_PALETTE"
        local mood="professional"
    elif [[ "$description" == *"creative"* || "$description" == *"artistic"* || "$description" == *"imaginative"* ]]; then
        local palette_data="$CREATIVE_PALETTE"
        local mood="creative"
    else
        # Default to professional palette
        local palette_data="$PROFESSIONAL_PALETTE"
        local mood="professional"
    fi
    
    # Build the response
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local response="{\"status\":\"success\",\"service_used\":\"bash-fallback\",\"theme\":\"$description\",\"description\":\"A $mood palette generated based on your description.\",\"source\":\"default\",\"timestamp\":\"$timestamp\",${palette_data:1}"
    
    send_response "200 OK" "application/json" "$response"
}

# Function to handle design-scheme endpoint
handle_design_scheme() {
    local body_file="$1"
    local design_type=""
    
    # Try to parse the design type from the request body
    design_type=$(parse_body "$body_file" ".designType")
    
    log "Generating design scheme for: $design_type"
    
    # Choose a scheme based on the design type
    if [[ "$design_type" == *"mobile"* || "$design_type" == *"app"* ]]; then
        local scheme_data="$MOBILE_APP_SCHEME"
        local type="mobile app"
    elif [[ "$design_type" == *"presentation"* || "$design_type" == *"slide"* ]]; then
        local scheme_data="$PRESENTATION_SCHEME" 
        local type="presentation"
    else
        # Default to website scheme
        local scheme_data="$WEBSITE_SCHEME"
        local type="website"
    fi
    
    # Build the response
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local response="{\"status\":\"success\",\"service_used\":\"bash-fallback\",\"designType\":\"$design_type\",\"recommendations\":[\"Maintain good contrast between text and background colors\",\"Use the primary color for main interface elements\",\"Reserve accent colors for calls to action\"],\"source\":\"default\",\"timestamp\":\"$timestamp\",${scheme_data:1}"
    
    send_response "200 OK" "application/json" "$response"
}

# Function to handle accessible-colors endpoint
handle_accessible_colors() {
    local body_file="$1"
    local base_color=""
    local purpose=""
    
    # Try to parse the parameters from the request body
    base_color=$(parse_body "$body_file" ".baseColor")
    purpose=$(parse_body "$body_file" ".purpose")
    
    log "Generating accessible colors for $base_color as $purpose"
    
    # Simple algorithm to generate accessible color variations
    # Extract RGB components from hex color
    if [[ "$base_color" =~ ^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$ ]]; then
        # Extract hex values and convert to decimal
        local r=$((16#${BASH_REMATCH[1]}))
        local g=$((16#${BASH_REMATCH[2]}))
        local b=$((16#${BASH_REMATCH[3]}))
        
        # Calculate luminance (simplified)
        local luminance=$(( (r * 299 + g * 587 + b * 114) / 1000 ))
        
        # Generate high contrast version (darker or lighter based on luminance)
        if [ $luminance -gt 128 ]; then
            # Darker version for light colors
            local r_hc=$((r > 50 ? r - 50 : 0))
            local g_hc=$((g > 50 ? g - 50 : 0))
            local b_hc=$((b > 50 ? b - 50 : 0))
        else
            # Lighter version for dark colors
            local r_hc=$((r + 50 < 255 ? r + 50 : 255))
            local g_hc=$((g + 50 < 255 ? g + 50 : 255))
            local b_hc=$((b + 50 < 255 ? b + 50 : 255))
        fi
        
        # Format as hex
        local high_contrast=$(printf "#%02x%02x%02x" $r_hc $g_hc $b_hc)
        
        # Generate low light version (desaturated)
        local r_ll=$(( (r + 127) / 2 ))
        local g_ll=$(( (g + 127) / 2 ))
        local b_ll=$(( (b + 127) / 2 ))
        local low_light=$(printf "#%02x%02x%02x" $r_ll $g_ll $b_ll)
        
        # Generate colorblind friendly (adjust red/green balance)
        local r_cb=$(( (r + b) / 2 ))
        local g_cb=$(( (g + b) / 2 ))
        local colorblind=$(printf "#%02x%02x%02x" $r_cb $g_cb $b)
        
        # Choose text color based on luminance
        local text_color="#000000"
        if [ $luminance -lt 128 ]; then
            text_color="#ffffff"
        fi
        
        # Generate border color (slightly darker/lighter)
        if [ $luminance -gt 128 ]; then
            local r_bd=$((r > 30 ? r - 30 : 0))
            local g_bd=$((g > 30 ? g - 30 : 0))
            local b_bd=$((b > 30 ? b - 30 : 0))
        else
            local r_bd=$((r + 30 < 255 ? r + 30 : 255))
            local g_bd=$((g + 30 < 255 ? g + 30 : 255))
            local b_bd=$((b + 30 < 255 ? b + 30 : 255))
        fi
        local border_color=$(printf "#%02x%02x%02x" $r_bd $g_bd $b_bd)
        
        # Determine WCAG rating based on luminance
        local wcag="AA"
        if [ $luminance -lt 50 ]; then
            wcag="AAA"
        fi
        
        # Build the response
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        local response="{\"status\":\"success\",\"service_used\":\"bash-algorithm\",\"baseColor\":\"$base_color\",\"purpose\":\"$purpose\",\"variations\":{\"normal\":\"$base_color\",\"highContrast\":\"$high_contrast\",\"lowLight\":\"$low_light\",\"colorBlindFriendly\":\"$colorblind\"},\"complementaryColors\":{\"text\":\"$text_color\",\"border\":\"$border_color\"},\"wcagRating\":\"$wcag\",\"tips\":[\"Ensure a contrast ratio of at least 4.5:1 for normal text\",\"Use larger text for better readability with this color\",\"Test your design with color blindness simulators\"],\"source\":\"algorithm\",\"timestamp\":\"$timestamp\"}"
        
        send_response "200 OK" "application/json" "$response"
    else
        # Invalid color format
        send_response "400 Bad Request" "application/json" "{\"status\":\"error\",\"message\":\"Invalid color format. Please provide a hex color in the format #RRGGBB\"}"
    fi
}

# Function to handle status endpoint
handle_status() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local response="{\"status\":\"success\",\"services\":{\"mistral\":\"unavailable\",\"openai\":\"unavailable\",\"colorGeneratorLoaded\":true,\"usingFallbacks\":true},\"timestamp\":\"$timestamp\"}"
    
    send_response "200 OK" "application/json" "$response"
}

# Function to handle default-palettes endpoint
handle_default_palettes() {
    local response="{\"status\":\"success\",\"message\":\"Default palettes for common moods\",\"palettes\":{\"happy\":$HAPPY_PALETTE,\"calm\":$CALM_PALETTE,\"energetic\":$ENERGETIC_PALETTE,\"professional\":$PROFESSIONAL_PALETTE,\"creative\":$CREATIVE_PALETTE}}"
    
    send_response "200 OK" "application/json" "$response"
}

# Function to handle default-schemes endpoint
handle_default_schemes() {
    local response="{\"status\":\"success\",\"message\":\"Default design schemes\",\"schemes\":{\"website\":$WEBSITE_SCHEME,\"mobile app\":$MOBILE_APP_SCHEME,\"presentation\":$PRESENTATION_SCHEME}}"
    
    send_response "200 OK" "application/json" "$response"
}

# Function to serve the HTML demo page
serve_demo_page() {
    local html="<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Creately Color Generator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        .panel {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        button:hover {
            background: #2980b9;
        }
        .result {
            margin-top: 20px;
            display: none;
        }
        .color-palette {
            display: flex;
            margin-top: 15px;
        }
        .color-swatch {
            flex: 1;
            height: 100px;
            position: relative;
        }
        .color-info {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px;
            font-size: 12px;
            text-align: center;
        }
        .design-scheme {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .scheme-color {
            text-align: center;
            margin-bottom: 10px;
        }
        .scheme-swatch {
            height: 50px;
            border-radius: 4px;
            margin-bottom: 5px;
        }
        .accessible-colors {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .variation-group {
            margin-bottom: 15px;
        }
        .variation-swatch {
            height: 40px;
            border-radius: 4px;
            margin-bottom: 5px;
        }
        .error {
            color: #e74c3c;
            margin-top: 10px;
        }
        .recommendations {
            margin-top: 15px;
            background: #eee;
            padding: 10px;
            border-radius: 4px;
        }
        .recommendations ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        @media (min-width: 768px) {
            .container {
                flex-direction: row;
                flex-wrap: wrap;
            }
            .panel {
                flex: 1;
                min-width: 300px;
            }
        }
    </style>
</head>
<body>
    <h1>Creately Color Generator Demo</h1>
    
    <div class=\"container\">
        <div class=\"panel\">
            <h2>Generate Color Palette</h2>
            <div class=\"form-group\">
                <label for=\"palette-description\">Description or Mood:</label>
                <input type=\"text\" id=\"palette-description\" placeholder=\"e.g., calm ocean breeze\">
            </div>
            <button id=\"generate-palette-btn\">Generate Palette</button>
            
            <div id=\"palette-result\" class=\"result\">
                <h3 id=\"palette-theme\"></h3>
                <p id=\"palette-description-result\"></p>
                <div id=\"color-palette\" class=\"color-palette\"></div>
                <p id=\"palette-source\" class=\"source-info\"></p>
            </div>
            <div id=\"palette-error\" class=\"error\"></div>
        </div>
        
        <div class=\"panel\">
            <h2>Generate Design Scheme</h2>
            <div class=\"form-group\">
                <label for=\"design-type\">Design Type:</label>
                <select id=\"design-type\">
                    <option value=\"website\">Website</option>
                    <option value=\"mobile app\">Mobile App</option>
                    <option value=\"presentation\">Presentation</option>
                </select>
            </div>
            <button id=\"generate-scheme-btn\">Generate Scheme</button>
            
            <div id=\"scheme-result\" class=\"result\">
                <h3 id=\"scheme-title\"></h3>
                <p id=\"scheme-description\"></p>
                <div id=\"design-scheme\" class=\"design-scheme\"></div>
                <div id=\"scheme-recommendations\" class=\"recommendations\">
                    <h4>Recommendations:</h4>
                    <ul id=\"recommendations-list\"></ul>
                </div>
                <p id=\"scheme-source\" class=\"source-info\"></p>
            </div>
            <div id=\"scheme-error\" class=\"error\"></div>
        </div>
        
        <div class=\"panel\">
            <h2>Generate Accessible Colors</h2>
            <div class=\"form-group\">
                <label for=\"base-color\">Base Color (Hex):</label>
                <input type=\"text\" id=\"base-color\" placeholder=\"e.g., #3498db\">
            </div>
            <div class=\"form-group\">
                <label for=\"color-purpose\">Purpose:</label>
                <select id=\"color-purpose\">
                    <option value=\"background\">Background</option>
                    <option value=\"text\">Text</option>
                    <option value=\"button\">Button</option>
                    <option value=\"accent\">Accent</option>
                </select>
            </div>
            <button id=\"generate-accessible-btn\">Generate Accessible Colors</button>
            
            <div id=\"accessible-result\" class=\"result\">
                <h3>Accessible Variations</h3>
                <div id=\"accessible-colors\" class=\"accessible-colors\"></div>
                <div id=\"accessible-tips\" class=\"recommendations\">
                    <h4>Accessibility Tips:</h4>
                    <ul id=\"tips-list\"></ul>
                </div>
                <p id=\"accessible-source\" class=\"source-info\"></p>
            </div>
            <div id=\"accessible-error\" class=\"error\"></div>
        </div>
    </div>

    <script>
        // Helper function to make API requests
        async function apiRequest(endpoint, data = null) {
            try {
                const options = {
                    method: data ? 'POST' : 'GET',
                    headers: { 'Content-Type': 'application/json' }
                };
                
                if (data) {
                    options.body = JSON.stringify(data);
                }
                
                const response = await fetch(\`/api/colors/\${endpoint}\`, options);
                const result = await response.json();
                
                if (result.status !== 'success') {
                    throw new Error(result.message || 'An error occurred');
                }
                
                return result;
            } catch (error) {
                throw error;
            }
        }

        // Generate Color Palette
        document.getElementById('generate-palette-btn').addEventListener('click', async () => {
            const description = document.getElementById('palette-description').value.trim();
            const resultEl = document.getElementById('palette-result');
            const errorEl = document.getElementById('palette-error');
            
            if (!description) {
                errorEl.textContent = 'Please enter a description or mood';
                return;
            }
            
            errorEl.textContent = '';
            resultEl.style.display = 'none';
            
            try {
                document.getElementById('generate-palette-btn').textContent = 'Generating...';
                
                const result = await apiRequest('generate-palette', { description });
                
                document.getElementById('palette-theme').textContent = result.theme;
                document.getElementById('palette-description-result').textContent = result.description;
                document.getElementById('palette-source').textContent = \`Source: \${result.source || result.service_used || 'AI Service'}\`;
                
                const paletteEl = document.getElementById('color-palette');
                paletteEl.innerHTML = '';
                
                const colors = result.colors || [];
                colors.forEach(color => {
                    const swatch = document.createElement('div');
                    swatch.className = 'color-swatch';
                    swatch.style.backgroundColor = color.hex;
                    
                    const info = document.createElement('div');
                    info.className = 'color-info';
                    info.textContent = \`\${color.name || ''} \${color.hex}\`;
                    
                    swatch.appendChild(info);
                    paletteEl.appendChild(swatch);
                });
                
                resultEl.style.display = 'block';
            } catch (error) {
                errorEl.textContent = \`Error: \${error.message}\`;
            } finally {
                document.getElementById('generate-palette-btn').textContent = 'Generate Palette';
            }
        });

        // Generate Design Scheme
        document.getElementById('generate-scheme-btn').addEventListener('click', async () => {
            const designType = document.getElementById('design-type').value;
            const resultEl = document.getElementById('scheme-result');
            const errorEl = document.getElementById('scheme-error');
            
            errorEl.textContent = '';
            resultEl.style.display = 'none';
            
            try {
                document.getElementById('generate-scheme-btn').textContent = 'Generating...';
                
                const result = await apiRequest('design-scheme', { designType });
                
                document.getElementById('scheme-title').textContent = result.designType;
                document.getElementById('scheme-description').textContent = result.description;
                document.getElementById('scheme-source').textContent = \`Source: \${result.source || result.service_used || 'AI Service'}\`;
                
                const schemeEl = document.getElementById('design-scheme');
                schemeEl.innerHTML = '';
                
                if (result.scheme) {
                    const schemeColors = [
                        { name: 'Primary', value: result.scheme.primary },
                        { name: 'Secondary', value: result.scheme.secondary },
                        { name: 'Accent', value: result.scheme.accent },
                        { name: 'Background', value: result.scheme.background },
                        { name: 'Text', value: result.scheme.text },
                        { name: 'Success', value: result.scheme.success },
                        { name: 'Warning', value: result.scheme.warning },
                        { name: 'Error', value: result.scheme.error }
                    ];
                    
                    schemeColors.forEach(color => {
                        if (color.value) {
                            const colorDiv = document.createElement('div');
                            colorDiv.className = 'scheme-color';
                            
                            const swatch = document.createElement('div');
                            swatch.className = 'scheme-swatch';
                            swatch.style.backgroundColor = color.value;
                            
                            const name = document.createElement('div');
                            name.textContent = color.name;
                            
                            const value = document.createElement('div');
                            value.textContent = color.value;
                            
                            colorDiv.appendChild(swatch);
                            colorDiv.appendChild(name);
                            colorDiv.appendChild(value);
                            schemeEl.appendChild(colorDiv);
                        }
                    });
                }
                
                // Add recommendations
                const recList = document.getElementById('recommendations-list');
                recList.innerHTML = '';
                
                if (result.recommendations && result.recommendations.length) {
                    result.recommendations.forEach(rec => {
                        const li = document.createElement('li');
                        li.textContent = rec;
                        recList.appendChild(li);
                    });
                }
                
                resultEl.style.display = 'block';
            } catch (error) {
                errorEl.textContent = \`Error: \${error.message}\`;
            } finally {
                document.getElementById('generate-scheme-btn').textContent = 'Generate Scheme';
            }
        });

        // Generate Accessible Colors
        document.getElementById('generate-accessible-btn').addEventListener('click', async () => {
            const baseColor = document.getElementById('base-color').value.trim();
            const purpose = document.getElementById('color-purpose').value;
            const resultEl = document.getElementById('accessible-result');
            const errorEl = document.getElementById('accessible-error');
            
            if (!baseColor) {
                errorEl.textContent = 'Please enter a base color';
                return;
            }
            
            if (!baseColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                errorEl.textContent = 'Please enter a valid hex color (format: #RRGGBB)';
                return;
            }
            
            errorEl.textContent = '';
            resultEl.style.display = 'none';
            
            try {
                document.getElementById('generate-accessible-btn').textContent = 'Generating...';
                
                const result = await apiRequest('accessible-colors', { baseColor, purpose });
                
                document.getElementById('accessible-source').textContent = \`Source: \${result.source || result.service_used || 'AI Service'}\`;
                
                const accessibleEl = document.getElementById('accessible-colors');
                accessibleEl.innerHTML = '';
                
                if (result.variations) {
                    // Normal variation
                    const normalGroup = document.createElement('div');
                    normalGroup.className = 'variation-group';
                    
                    const normalSwatch = document.createElement('div');
                    normalSwatch.className = 'variation-swatch';
                    normalSwatch.style.backgroundColor = result.variations.normal;
                    
                    const normalName = document.createElement('div');
                    normalName.innerHTML = \`<strong>Original</strong>: \${result.variations.normal}\`;
                    
                    normalGroup.appendChild(normalSwatch);
                    normalGroup.appendChild(normalName);
                    accessibleEl.appendChild(normalGroup);
                    
                    // High contrast variation
                    const highContrastGroup = document.createElement('div');
                    highContrastGroup.className = 'variation-group';
                    
                    const highContrastSwatch = document.createElement('div');
                    highContrastSwatch.className = 'variation-swatch';
                    highContrastSwatch.style.backgroundColor = result.variations.highContrast;
                    
                    const highContrastName = document.createElement('div');
                    highContrastName.innerHTML = \`<strong>High Contrast</strong>: \${result.variations.highContrast}\`;
                    
                    highContrastGroup.appendChild(highContrastSwatch);
                    highContrastGroup.appendChild(highContrastName);
                    accessibleEl.appendChild(highContrastGroup);
                    
                    // Low light variation
                    const lowLightGroup = document.createElement('div');
                    lowLightGroup.className = 'variation-group';
                    
                    const lowLightSwatch = document.createElement('div');
                    lowLightSwatch.className = 'variation-swatch';
                    lowLightSwatch.style.backgroundColor = result.variations.lowLight;
                    
                    const lowLightName = document.createElement('div');
                    lowLightName.innerHTML = \`<strong>Low Light</strong>: \${result.variations.lowLight}\`;
                    
                    lowLightGroup.appendChild(lowLightSwatch);
                    lowLightGroup.appendChild(lowLightName);
                    accessibleEl.appendChild(lowLightGroup);
                    
                    // Colorblind friendly variation
                    const colorblindGroup = document.createElement('div');
                    colorblindGroup.className = 'variation-group';
                    
                    const colorblindSwatch = document.createElement('div');
                    colorblindSwatch.className = 'variation-swatch';
                    colorblindSwatch.style.backgroundColor = result.variations.colorBlindFriendly;
                    
                    const colorblindName = document.createElement('div');
                    colorblindName.innerHTML = \`<strong>Colorblind Friendly</strong>: \${result.variations.colorBlindFriendly}\`;
                    
                    colorblindGroup.appendChild(colorblindSwatch);
                    colorblindGroup.appendChild(colorblindName);
                    accessibleEl.appendChild(colorblindGroup);
                }
                
                // Add complementary colors if available
                if (result.complementaryColors) {
                    if (result.complementaryColors.text) {
                        const textGroup = document.createElement('div');
                        textGroup.className = 'variation-group';
                        
                        const textSwatch = document.createElement('div');
                        textSwatch.className = 'variation-swatch';
                        textSwatch.style.backgroundColor = result.complementaryColors.text;
                        
                        const textName = document.createElement('div');
                        textName.innerHTML = \`<strong>Text Color</strong>: \${result.complementaryColors.text}\`;
                        
                        textGroup.appendChild(textSwatch);
                        textGroup.appendChild(textName);
                        accessibleEl.appendChild(textGroup);
                    }
                    
                    if (result.complementaryColors.border) {
                        const borderGroup = document.createElement('div');
                        borderGroup.className = 'variation-group';
                        
                        const borderSwatch = document.createElement('div');
                        borderSwatch.className = 'variation-swatch';
                        borderSwatch.style.backgroundColor = result.complementaryColors.border;
                        
                        const borderName = document.createElement('div');
                        borderName.innerHTML = \`<strong>Border Color</strong>: \${result.complementaryColors.border}\`;
                        
                        borderGroup.appendChild(borderSwatch);
                        borderGroup.appendChild(borderName);
                        accessibleEl.appendChild(borderGroup);
                    }
                }
                
                // Add accessibility tips
                const tipsList = document.getElementById('tips-list');
                tipsList.innerHTML = '';
                
                if (result.tips && result.tips.length) {
                    result.tips.forEach(tip => {
                        const li = document.createElement('li');
                        li.textContent = tip;
                        tipsList.appendChild(li);
                    });
                }
                
                // Add WCAG rating if available
                if (result.wcagRating) {
                    const wcagLi = document.createElement('li');
                    wcagLi.innerHTML = \`<strong>WCAG Rating</strong>: \${result.wcagRating}\`;
                    tipsList.appendChild(wcagLi);
                }
                
                resultEl.style.display = 'block';
            } catch (error) {
                errorEl.textContent = \`Error: \${error.message}\`;
            } finally {
                document.getElementById('generate-accessible-btn').textContent = 'Generate Accessible Colors';
            }
        });

        // Check service status on load
        window.addEventListener('DOMContentLoaded', async () => {
            try {
                const status = await apiRequest('status');
                console.log('Color service status:', status);
            } catch (error) {
                console.error('Error checking color service status:', error);
            }
        });
    </script>
</body>
</html>"
    
    send_response "200 OK" "text/html" "$html"
}

# Function to handle main requests
handle_request() {
    local request="$1"
    local method=$(echo "$request" | grep -o "^\w\+")
    local path=$(echo "$request" | grep -o "GET \K[^ ]\+" | grep -o "POST \K[^ ]\+" | cut -d' ' -f2 || echo "$request" | grep -o "^\w\+ \K[^ ]\+")
    
    # Extract Content-Length from headers
    local content_length=$(echo "$request" | grep -i "Content-Length:" | cut -d' ' -f2 | tr -d '\r')
    
    # Log the request
    log "Received $method request for $path"
    
    # Handle CORS preflight requests
    if [ "$method" = "OPTIONS" ]; then
        send_response "204 No Content" "text/plain" ""
        return
    fi
    
    # Handle GET requests
    if [ "$method" = "GET" ]; then
        case "$path" in
            /api/colors/status)
                handle_status
                ;;
            /api/colors/default-palettes)
                handle_default_palettes
                ;;
            /api/colors/default-schemes)
                handle_default_schemes
                ;;
            / | /index.html)
                serve_demo_page
                ;;
            *)
                send_response "404 Not Found" "text/plain" "Not Found"
                ;;
        esac
        return
    fi
    
    # Handle POST requests
    if [ "$method" = "POST" ]; then
        # Create a temporary file to store the request body
        local body_file="$TEMP_DIR/request_body.$$"
        
        # Read the request body if Content-Length is provided
        if [ -n "$content_length" ] && [ "$content_length" -gt 0 ]; then
            dd bs=1 count="$content_length" > "$body_file" 2>/dev/null
        fi
        
        case "$path" in
            /api/colors/generate-palette)
                handle_generate_palette "$body_file"
                ;;
            /api/colors/design-scheme)
                handle_design_scheme "$body_file"
                ;;
            /api/colors/accessible-colors)
                handle_accessible_colors "$body_file"
                ;;
            *)
                send_response "404 Not Found" "text/plain" "Not Found"
                ;;
        esac
        
        # Clean up the temporary file
        rm -f "$body_file"
        return
    fi
    
    # Default response for unsupported methods
    send_response "405 Method Not Allowed" "text/plain" "Method Not Allowed"
}

# Main server loop
log "Starting color service on port $PORT"
echo "Color Service is running on http://0.0.0.0:$PORT"
echo "Open a browser and navigate to http://0.0.0.0:$PORT"

# Check if netcat is available and determine the correct command
if command -v nc &> /dev/null; then
    NC_CMD="nc"
elif command -v netcat &> /dev/null; then
    NC_CMD="netcat"
else
    echo "Error: netcat (nc) is not available. Please install it to run this server."
    exit 1
fi

# Determine the correct netcat listen options (different versions have different syntax)
NC_TEST=$($NC_CMD -h 2>&1 || echo "")

if echo "$NC_TEST" | grep -q -- "-l .*-p"; then
    # Traditional netcat syntax: nc -l -p PORT
    NC_LISTEN="-l -p"
elif echo "$NC_TEST" | grep -q -- "-p"; then
    # Some versions: nc -p PORT -l
    NC_LISTEN="-p"
    NC_LISTEN_L="-l"
else
    # Modern netcat/ncat syntax: nc -l PORT
    NC_LISTEN="-l"
fi

echo "Using netcat command: $NC_CMD with listen options: $NC_LISTEN $PORT $NC_LISTEN_L"
log "Detected netcat variant with listen options: $NC_LISTEN $PORT $NC_LISTEN_L"

# Create a TCP server with netcat
if [ -n "$NC_LISTEN_L" ]; then
    # For variants that need -p PORT -l
    echo "Starting server with: $NC_CMD $NC_LISTEN $PORT $NC_LISTEN_L"
    while true; do
        $NC_CMD $NC_LISTEN $PORT $NC_LISTEN_L < /dev/null | (
            read -r request
            request="$request"$'\n'
            while IFS= read -r line && [ -n "$line" ] && [ "$line" != $'\r' ]; do
                request="$request$line"$'\n'
            done
            
            handle_request "$request"
        )
    done
else
    # For traditional or modern variants
    echo "Starting server with: $NC_CMD $NC_LISTEN $PORT"
    while true; do
        $NC_CMD $NC_LISTEN $PORT < /dev/null | (
            read -r request
            request="$request"$'\n'
            while IFS= read -r line && [ -n "$line" ] && [ "$line" != $'\r' ]; do
                request="$request$line"$'\n'
            done
            
            handle_request "$request"
        )
    done
fi