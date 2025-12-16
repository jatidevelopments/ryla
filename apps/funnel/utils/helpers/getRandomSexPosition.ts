import { sexPositions } from "@/constants/sex-positions";

export function getRandomSexPosition() {
    const index = Math.floor(Math.random() * sexPositions.length);
    return sexPositions[index].value;
}
