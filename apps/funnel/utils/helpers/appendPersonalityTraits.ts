export function appendPersonalityTraits(basePrompt: string, traits: string[]): string {
    if (!traits || traits.length === 0) return basePrompt;

    const capitalizedTraits = traits.map((trait) => trait.charAt(0).toUpperCase() + trait.slice(1));

    const sentence = " She is " + capitalizedTraits.join(", ") + ".";

    return basePrompt.trim() + sentence;
}
