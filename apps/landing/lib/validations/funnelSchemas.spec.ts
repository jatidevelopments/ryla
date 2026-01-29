import { describe, it, expect } from 'vitest';
import {
  baseFunnelSchema,
  adultFunnelSchema,
  creatorFunnelSchema,
  fanFunnelSchema,
  businessFunnelSchema,
  stepValidationSchemas,
  validateStep,
} from './funnelSchemas';

describe('funnelSchemas', () => {
  describe('baseFunnelSchema', () => {
    it('should validate valid base funnel data', () => {
      const valid = {
        funnelType: 'creator' as const,
        currentStep: 1,
      };
      expect(() => baseFunnelSchema.parse(valid)).not.toThrow();
    });

    it('should reject invalid funnelType', () => {
      const invalid = {
        funnelType: 'invalid',
        currentStep: 1,
      };
      expect(() => baseFunnelSchema.parse(invalid)).toThrow();
    });

    it('should reject invalid currentStep', () => {
      const invalid = {
        funnelType: 'creator' as const,
        currentStep: 0,
      };
      expect(() => baseFunnelSchema.parse(invalid)).toThrow();
    });

    it('should accept optional sessionId', () => {
      const valid = {
        funnelType: 'creator' as const,
        currentStep: 1,
        sessionId: 'test-session',
      };
      expect(() => baseFunnelSchema.parse(valid)).not.toThrow();
    });
  });

  describe('adultFunnelSchema', () => {
    it('should validate valid adult funnel data', () => {
      const valid = {
        funnelType: 'adult' as const,
        currentStep: 1,
        connections: ['friend'],
        preferred_age: '25-30',
        user_age: '28',
        preferred_relationship: 'friend',
        style: 'realistic' as const,
        character_age: '25',
        personality_traits: ['kind'],
        interests: ['music'],
        ethnicity: 'asian',
        your_type: ['curvy'],
        body: 'athletic',
        breast_type: 'natural',
        breast_size: 'C',
        butt: 'round',
        eyes: 'brown',
        hair_style: 'long',
        hair_color: 'black',
        receiveSpicyContent: true,
        dirtyTalks: false,
        turns_of_you: ['intelligence'],
        want_to_try: ['dating'],
        turns_off_in_dating: ['rudeness'],
        receiveCustomPhotos: true,
        receiveVoiceMessages: true,
        receiveCustomVideos: false,
        receiveVideoCalls: false,
        character_relationship: 'friend',
        scenario: 'coffee',
        voice: 'soft',
        experience_filings_of_loneliness: 'sometimes',
        practiceForeignLanguage: false,
        productId: 1,
      };
      expect(() => adultFunnelSchema.parse(valid)).not.toThrow();
    });

    it('should reject empty connections array', () => {
      const invalid = {
        funnelType: 'adult' as const,
        currentStep: 1,
        connections: [],
      };
      expect(() => adultFunnelSchema.parse(invalid)).toThrow();
    });
  });

  describe('creatorFunnelSchema', () => {
    it('should validate valid creator funnel data', () => {
      const valid = {
        funnelType: 'creator' as const,
        currentStep: 1,
        style: 'realistic' as const,
        character_name: 'Test Character',
        characterData: {
          physical_attributes: {
            ethnicity: 'asian',
            body_type: 'athletic',
            hair_style: 'long',
            hair_color: 'black',
            eye_color: 'brown',
            age_range: '25-30',
          },
          personality_traits: ['kind'],
          interests: ['music'],
          voice_settings: {
            voice_type: 'soft',
          },
        },
        content_niche: ['lifestyle'],
        monetization_platforms: ['instagram'],
        revenue_goals: '1000',
        nsfwPreferences: {
          level: 0,
          categories: [],
          consent_given: false,
        },
        subscription_plan: 'basic',
      };
      expect(() => creatorFunnelSchema.parse(valid)).not.toThrow();
    });
  });

  describe('fanFunnelSchema', () => {
    it('should validate valid fan funnel data', () => {
      const valid = {
        funnelType: 'fan' as const,
        currentStep: 1,
        personality_type: 'introvert',
        relationship_goals: ['friendship'],
        character_preferences: {
          style: 'realistic' as const,
          physical_attributes: {
            ethnicity: 'asian',
            body_type: 'athletic',
            age_range: '25-30',
          },
          personality_traits: ['kind'],
          interests: ['music'],
        },
        interaction_preferences: {
          chat: true,
          voice: false,
          video: false,
          photos: true,
        },
        nsfw_content_level: 0,
        nsfw_categories: [],
        consent_given: false,
        preferred_scenarios: ['coffee'],
        voice_preferences: {
          voice_type: 'soft',
        },
        subscription_plan: 'basic',
      };
      expect(() => fanFunnelSchema.parse(valid)).not.toThrow();
    });
  });

  describe('businessFunnelSchema', () => {
    it('should validate valid business funnel data', () => {
      const valid = {
        funnelType: 'business' as const,
        currentStep: 1,
        industry: 'tech',
        company_name: 'Test Company',
        company_size: '10-50',
        brand_values: ['innovation'],
        target_audience: 'tech enthusiasts',
        influencer_type: 'lifestyle' as const,
        visual_identity: {
          style: 'realistic' as const,
          brand_colors: ['blue'],
          personality_traits: ['professional'],
        },
        content_strategy: {
          posting_schedule: 'daily',
          content_themes: ['tech'],
          platforms: ['instagram'],
        },
        nsfw_content_policy: {
          allow_nsfw: false,
          content_level: 0,
          restrictions: [],
        },
        team_members: [],
        analytics_requirements: [],
        compliance_requirements: [],
        enterprise_plan: 'basic',
      };
      expect(() => businessFunnelSchema.parse(valid)).not.toThrow();
    });
  });

  describe('stepValidationSchemas', () => {
    it('should have validation schemas for all steps', () => {
      expect(stepValidationSchemas).toHaveProperty('connection');
      expect(stepValidationSchemas).toHaveProperty('characterStyle');
      expect(stepValidationSchemas).toHaveProperty('personalityTraits');
    });
  });

  describe('validateStep', () => {
    it('should validate step data successfully', () => {
      const result = validateStep('connection', {
        connections: ['friend'],
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return errors for invalid step data', () => {
      const result = validateStep('connection', {
        connections: [],
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should throw error for unknown step', () => {
      expect(() => validateStep('unknownStep', {})).toThrow('No validation schema found for step: unknownStep');
    });
  });
});
