
import crypto from 'crypto';
import { securityAlerts, SecurityAlert, assetOwnership, accessAttempts } from '../../shared/schema';
import { storage } from '../storage';

interface WatermarkOptions {
  assetId: string;
  assetType: 'image' | 'text' | 'code';
  ownerInfo: string;
  timestamp: number;
}

interface SecurityAlertData {
  type: string;
  severity: 'low' | 'medium' | 'high';
  details: any;
  timestamp: number;
  ipAddress: string;
  userId?: number;
}

const WATERMARKABLE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.json'];

class SecurityMonitorService {
  /**
   * Generate a digital watermark signature for content assets
   */
  generateWatermark(options: WatermarkOptions): string {
    const { assetId, assetType, ownerInfo, timestamp } = options;
    
    // Create a unique signature based on the asset and owner information
    const dataToSign = `${assetId}:${assetType}:${ownerInfo}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', process.env.SECURITY_SECRET || 'default-security-key')
      .update(dataToSign)
      .digest('hex');
    
    return signature;
  }
  
  /**
   * Embed ownership information in content (metadata approach)
   */
  embedOwnershipMetadata(content: string, options: WatermarkOptions): string {
    const watermark = this.generateWatermark(options);
    
    // For text/code content, add an inconspicuous comment with ownership data
    if (options.assetType === 'text' || options.assetType === 'code') {
      // The approach varies based on file type (would be more sophisticated in production)
      if (content.includes('</html>')) {
        // HTML content
        const metaTag = `<!-- Protected content: ${watermark} Owner: ${options.ownerInfo} -->`;
        return content.replace('</html>', `${metaTag}\n</html>`);
      } else if (content.includes('*/')) {
        // CSS/JS with comments
        const metaComment = `/* Protected content: ${watermark} Owner: ${options.ownerInfo} */`;
        return `${metaComment}\n${content}`;
      } else {
        // Generic text
        const metaComment = `// Protected content: ${watermark} Owner: ${options.ownerInfo}`;
        return `${metaComment}\n${content}`;
      }
    }
    
    // For other content types, we'd use different watermarking techniques
    // In a real implementation, this would have image watermarking logic
    return content;
  }
  
  /**
   * Record a security alert in the database
   */
  async recordSecurityAlert(alertData: SecurityAlertData): Promise<void> {
    const { type, severity, details, timestamp, ipAddress, userId } = alertData;
    
    try {
      await storage.insertSecurityAlert({
        alertType: type,
        severity: severity,
        details: details,
        timestamp: new Date(timestamp),
        ipAddress: ipAddress,
        userId: userId
      });
      
      // For high-severity alerts, send immediate notification
      if (severity === 'high') {
        this.sendHighPriorityNotification({
          id: 0, // Placeholder, will be set by the database
          alertType: type,
          severity: severity,
          details: details,
          timestamp: new Date(timestamp),
          ipAddress: ipAddress,
          userId: userId,
          resolved: false,
          resolutionNotes: null
        });
      }
    } catch (error) {
      console.error('Failed to record security alert:', error);
    }
  }
  
  /**
   * Verify the integrity of a watermarked asset
   */
  verifyWatermark(content: string, expectedOptions: WatermarkOptions): boolean {
    const expectedWatermark = this.generateWatermark(expectedOptions);
    
    // For text/code, check if the watermark is embedded in the content
    if (content.includes(expectedWatermark)) {
      return true;
    }
    
    // For other types, we'd implement specific verification logic
    return false;
  }
  
  /**
   * Register an asset with ownership information
   */
  async registerAssetOwnership(assetId: string, assetType: string, ownerInfo: string): Promise<void> {
    const timestamp = Date.now();
    const watermarkHash = this.generateWatermark({
      assetId,
      assetType: assetType as 'image' | 'text' | 'code',
      ownerInfo,
      timestamp
    });
    
    try {
      await storage.insertAssetOwnership({
        assetId,
        assetType,
        watermarkHash,
        ownerInfo,
        lastVerifiedAt: new Date(),
        verificationStatus: true
      });
    } catch (error) {
      console.error('Failed to register asset ownership:', error);
    }
  }
  
  /**
   * Send notification for high priority security alerts
   */
  private sendHighPriorityNotification(alert: SecurityAlert): void {
    // In a real implementation, this would send an email or other notification
    console.error('HIGH PRIORITY SECURITY ALERT', alert);
    // Example: await sendEmail('admin@example.com', 'Security Alert', alertDetailsTemplate);
  }
  
  /**
   * Detect potential unauthorized content extraction attempts
   */
  detectExtractionAttempt(req: any, thresholdRequests: number = 30): boolean {
    // This would be a more sophisticated implementation in production
    // For now, we'll use a simple detection based on number of requests
    
    const clientIp = req.ip;
    const requestRate = this.calculateRequestRate(clientIp);
    
    if (requestRate > thresholdRequests) {
      this.recordSecurityAlert({
        type: 'extraction',
        severity: 'medium',
        details: {
          ip: clientIp,
          requestRate,
          userAgent: req.headers['user-agent'],
          path: req.path
        },
        timestamp: Date.now(),
        ipAddress: clientIp
      });
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculate request rate for an IP (simplified implementation)
   */
  private calculateRequestRate(ip: string): number {
    // In a real implementation, this would query recent requests from a rate-limiting store
    // For this example, we return a dummy value
    return Math.floor(Math.random() * 20); // Dummy value between 0-19
  }

  /**
   * Monitor for code/content scraping patterns
   */
  async detectScrapingPatterns(req: any): Promise<boolean> {
    const clientIp = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const path = req.path;
    
    // In a real implementation, this would analyze access patterns
    // For example, too many requests for different pages in a short time
    
    try {
      // Get recent access attempts for this IP
      const recentAttempts = await storage.getRecentAccessAttempts(clientIp, 5); // Last 5 minutes
      
      // If there are too many attempts (e.g., more than 100 in 5 minutes)
      if (recentAttempts.length > 100) {
        await this.recordSecurityAlert({
          type: 'scraping',
          severity: 'high',
          details: {
            ip: clientIp,
            userAgent,
            path,
            requestCount: recentAttempts.length,
            timeframe: '5 minutes'
          },
          timestamp: Date.now(),
          ipAddress: clientIp
        });
        return true;
      }
    } catch (error) {
      console.error('Error detecting scraping patterns:', error);
    }
    
    return false;
  }

  /**
   * Validate asset integrity across the platform
   */
  async validateAssetIntegrity(): Promise<{ valid: boolean, issues: any[] }> {
    const issues: any[] = [];
    let valid = true;
    
    try {
      // Fetch all registered assets
      const assets = await storage.getAllAssetOwnerships();
      
      // In a real implementation, this would check each asset
      // For this example, we'll just return placeholder results
      for (const asset of assets) {
        // Simulated validation (would actually check content against watermark)
        const randomValid = Math.random() > 0.05; // 5% chance of "failure" for demo
        
        if (!randomValid) {
          valid = false;
          issues.push({
            assetId: asset.assetId,
            issue: 'Watermark integrity check failed',
            timestamp: new Date().toISOString()
          });
          
          // Update verification status in the database
          await storage.updateAssetVerificationStatus(asset.id, false);
        }
      }
    } catch (error) {
      console.error('Error validating asset integrity:', error);
      valid = false;
      issues.push({
        issue: 'System error during validation',
        error: error.message
      });
    }
    
    return { valid, issues };
  }
  
  /**
   * Validate AI-enhanced content for appropriate usage and legal compliance
   */
  async validateAIEnhancedContent(contentId: number, enhancementType: string): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let valid = true;
    
    try {
      // Get the original content
      const content = await storage.getContentById(contentId);
      
      if (!content) {
        return {
          valid: false,
          issues: ['Content not found'],
          recommendations: ['Verify content ID is correct']
        };
      }
      
      // Log this validation check for security auditing
      await storage.trackAccessAttempt({
        userId: content.userId,
        ipAddress: 'system',
        endpoint: 'ai-validation',
        timestamp: new Date(),
        isAuthorized: true,
        details: JSON.stringify({
          contentId,
          enhancementType,
          action: 'validate'
        })
      });
      
      // For demo purposes, we'll simulate different validations based on enhancement type
      switch (enhancementType) {
        case 'caption':
          // Check for potential IP/copyright concerns in caption generation
          if (content.tags?.includes('3rd-party') || content.tags?.includes('licensed')) {
            valid = false;
            issues.push('Content contains third-party or licensed elements');
            recommendations.push('Review license agreements before generating captions');
            recommendations.push('Consider adding attribution to generated captions');
          }
          break;
          
        case 'mood-board':
          // Check for potential style/brand consistency
          if (content.tags?.includes('branding') && !content.tags.includes('flexible-use')) {
            recommendations.push('This is branded content - ensure generated mood boards comply with brand guidelines');
          }
          break;
          
        case 'cross-platform':
          // No specific issues for this type
          break;
          
        default:
          recommendations.push('Unknown enhancement type. Verify it complies with usage terms.');
      }
      
      // Add a generic legal recommendation
      recommendations.push('Always review AI-generated content before publishing');
      
    } catch (error) {
      console.error('Error validating AI enhanced content:', error);
      valid = false;
      issues.push('System error during validation');
    }
    
    return { valid, issues, recommendations };
  }
}

export const securityMonitor = new SecurityMonitorService();
