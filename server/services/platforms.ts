
import { db } from '../db';
import { platformIntegrations, PlatformSettings, SocialPlatformCapabilities } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const PLATFORM_SETTINGS: Record<string, PlatformSettings> = {
  FACEBOOK: {
    name: 'Facebook',
    icon: 'fab fa-facebook',
    color: '#1877F2',
    capabilities: {
      maxCharacters: 63206,
      supportedMediaTypes: ['photo', 'video', 'text'],
      requiresAuthentication: true,
      supportsScheduling: true,
      supportsAnalytics: true,
    },
    authUrl: '/api/auth/facebook'
  },
  TWITTER: {
    name: 'X (Twitter)',
    icon: 'fab fa-x-twitter',
    color: '#000000',
    capabilities: {
      maxCharacters: 280,
      supportedMediaTypes: ['photo', 'video', 'text'],
      requiresAuthentication: true,
      supportsScheduling: true,
      supportsAnalytics: true,
    },
    authUrl: '/api/auth/twitter'
  },
  MEDIUM: {
    name: 'Medium',
    icon: 'fab fa-medium',
    color: '#000000',
    capabilities: {
      supportedMediaTypes: ['text', 'article'],
      requiresAuthentication: true,
      supportsScheduling: false,
      supportsAnalytics: true,
    },
    authUrl: '/api/auth/medium'
  },
  LINKEDIN: {
    name: 'LinkedIn',
    icon: 'fab fa-linkedin',
    color: '#0A66C2',
    capabilities: {
      maxCharacters: 3000,
      supportedMediaTypes: ['photo', 'video', 'text', 'article'],
      requiresAuthentication: true,
      supportsScheduling: true,
      supportsAnalytics: true,
    },
    authUrl: '/api/auth/linkedin'
  },
  INSTAGRAM: {
    name: 'Instagram',
    icon: 'fab fa-instagram',
    color: '#E4405F',
    capabilities: {
      maxImageSize: 8388608, // 8MB
      supportedMediaTypes: ['photo', 'video'],
      requiresAuthentication: true,
      supportsScheduling: true,
      supportsAnalytics: true,
    },
    authUrl: '/api/auth/instagram'
  }
};

export async function getActiveIntegrations(userId: number) {
  return db.select()
    .from(platformIntegrations)
    .where(eq(platformIntegrations.userId, userId))
    .where(eq(platformIntegrations.isActive, true));
}

export function getPlatformCapabilities(platform: string): SocialPlatformCapabilities | null {
  return PLATFORM_SETTINGS[platform.toUpperCase()]?.capabilities || null;
}
