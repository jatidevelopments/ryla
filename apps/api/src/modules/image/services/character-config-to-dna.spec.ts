import { characterConfigToDNA } from './character-config-to-dna';
import { CharacterConfig } from '@ryla/data/schema';
import { describe, it, expect } from 'vitest';

describe('characterConfigToDNA', () => {
    const defaultName = 'Kylie';

    it('should handle basic config', () => {
        const config: CharacterConfig = {
            ethnicity: 'Caucasian',
            age: 25,
        } as any;
        const dna = characterConfigToDNA(config, defaultName);
        expect(dna.name).toBe(defaultName);
        expect(dna.age).toBe('25-year-old');
        expect(dna.skin).toBe('smooth skin with natural complexion');
    });

    it('should handle all skin colors', () => {
        const colors = ['light', 'medium', 'tan', 'dark'];
        const results = colors.map(c => characterConfigToDNA({ skinColor: c } as any, defaultName).skin);
        expect(results[0]).toContain('fair');
        expect(results[1]).toContain('medium-toned');
        expect(results[2]).toContain('warm tanned');
        expect(results[3]).toContain('rich dark');
    });

    it('should handle all ethnicities', () => {
        const ets = ['Asian', 'African', 'Latina', 'Mediterranean'];
        const results = ets.map(e => characterConfigToDNA({ ethnicity: e } as any, defaultName).skin);
        expect(results[0]).toContain('fair');
        expect(results[1]).toContain('rich dark');
        expect(results[2]).toContain('warm tanned');
        expect(results[3]).toContain('olive skin');
    });

    it('should handle skin features', () => {
        const config: CharacterConfig = {
            freckles: 'heavy',
            scars: 'faint',
            beautyMarks: 'multiple'
        } as any;
        const dna = characterConfigToDNA(config, defaultName);
        expect(dna.skin).toContain('heavy freckles');
        expect(dna.skin).toContain('faint scars');
        expect(dna.skin).toContain('beauty marks');
    });

    it('should handle single beauty mark', () => {
        const dna = characterConfigToDNA({ beautyMarks: 'single' } as any, defaultName);
        expect(dna.skin).toContain('beauty mark');
        expect(dna.skin).not.toContain('marks');
    });

    it('should handle facial features and personality', () => {
        const config: CharacterConfig = {
            faceShape: 'oval',
            piercings: 'nose',
            personalityTraits: ['rebellious', 'kind']
        } as any;
        const dna = characterConfigToDNA(config, defaultName);
        expect(dna.facialFeatures).toContain('oval face shape');
        expect(dna.facialFeatures).toContain('nose piercings');
        expect(dna.facialFeatures).toContain('rebellious');
    });

    it('should handle hair and eyes', () => {
        const config: CharacterConfig = {
            hairColor: 'blonde',
            hairStyle: 'long wavy',
            eyeColor: 'emerald'
        } as any;
        const dna = characterConfigToDNA(config, defaultName);
        expect(dna.hair).toBe('blonde long wavy hair');
        expect(dna.eyes).toBe('emerald eyes');
    });

    it('should handle body type and additions', () => {
        const config: CharacterConfig = {
            bodyType: 'athletic',
            assSize: 'large',
            breastSize: 'medium',
            breastType: 'natural',
            tattoos: 'floral'
        } as any;
        const dna = characterConfigToDNA(config, defaultName);
        expect(dna.bodyType).toContain('athletic');
        expect(dna.bodyType).toContain('large ass');
        expect(dna.bodyType).toContain('medium natural breasts');
        expect(dna.bodyType).toContain('floral tattoos');
    });

    it('should handle age fallback', () => {
        const dna = characterConfigToDNA({ ageRange: 'youthful' } as any, defaultName);
        expect(dna.age).toBe('youthful age range');

        const dna2 = characterConfigToDNA({} as any, defaultName);
        expect(dna2.age).toBe('24-year-old');
    });
});
