
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  service: string;
}

const ENV_VARIABLES: EnvVariable[] = [
  { 
    name: 'OPENAI_API_KEY', 
    required: false, 
    description: 'API key for OpenAI services', 
    service: 'OpenAI' 
  },
  { 
    name: 'MISTRAL_API_KEY', 
    required: false, 
    description: 'API key for Mistral AI services', 
    service: 'Mistral AI' 
  },
  { 
    name: 'SLACK_BOT_TOKEN', 
    required: false, 
    description: 'Bot token for Slack integration', 
    service: 'Slack' 
  },
  { 
    name: 'HUBSPOT_API_KEY', 
    required: false, 
    description: 'API key for HubSpot integration', 
    service: 'HubSpot' 
  },
  { 
    name: 'GOOGLE_OAUTH_SECRETS', 
    required: false, 
    description: 'OAuth credentials for Google services integration', 
    service: 'Google' 
  }
];

export function validateEnvironment(): { valid: boolean; missing: EnvVariable[] } {
  const missing: EnvVariable[] = [];
  
  for (const variable of ENV_VARIABLES) {
    if (variable.required && !process.env[variable.name]) {
      missing.push(variable);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

export function getEnvironmentStatus(): { [key: string]: { configured: boolean; service: string } } {
  const status: { [key: string]: { configured: boolean; service: string } } = {};
  
  for (const variable of ENV_VARIABLES) {
    status[variable.name] = {
      configured: !!process.env[variable.name],
      service: variable.service
    };
  }
  
  return status;
}

export function generateEnvTemplate(): string {
  let template = '# Environment Variables Template\n\n';
  
  for (const variable of ENV_VARIABLES) {
    template += `# ${variable.description} (${variable.required ? 'Required' : 'Optional'})\n`;
    template += `${variable.name}=\n\n`;
  }
  
  return template;
}

export function writeEnvTemplateIfNotExists(): void {
  const envPath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, generateEnvTemplate());
    console.log('.env.example template file created');
  }
}

if (require.main === module) {
  const { valid, missing } = validateEnvironment();
  
  if (valid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing required environment variables:');
    for (const variable of missing) {
      console.log(`   - ${variable.name}: ${variable.description} (${variable.service})`);
    }
  }
  
  console.log('\nEnvironment Status:');
  const status = getEnvironmentStatus();
  Object.entries(status).forEach(([name, info]) => {
    console.log(`${info.configured ? '✅' : '❌'} ${name} (${info.service})`);
  });
  
  writeEnvTemplateIfNotExists();
}
