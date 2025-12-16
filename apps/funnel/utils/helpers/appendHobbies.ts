export function appendHobbies(basePrompt: string, hobbies: string[]): string {
    if (!hobbies || hobbies.length === 0) return basePrompt;

    const formattedHobbies = hobbies.map((hobby) => hobby.charAt(0).toLowerCase() + hobby.slice(1));

    const sentence = " Her hobbies are " + formattedHobbies.join(", ") + ".";

    return basePrompt.trim() + sentence;
}
