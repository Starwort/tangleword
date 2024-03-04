import {ArrowSets} from './arrow_sets';
import {Random} from './random';

function hash(input: string): string {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < input.length; i++) {
        ch = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export function generatePuzzle(arrows: ArrowSets, random: Random): [string[], number, string] {
    const uniqueOutputs = new Set<number>();
    for (const source in arrows) {
        for (const destination of arrows[source]) {
            uniqueOutputs.add(destination);
        }
    }
    return [[], uniqueOutputs.size, hash('')];
}

function isSubset<T>(a: Iterable<T>, b: Set<T>): boolean {
    for (let elem of a) {
        if (!b.has(elem)) {
            return false;
        }
    }
    return true;
}

export function puzzleFromString(input: string): [ArrowSets, string[], number, string] {
    const uniqueOutputs = new Set<number>();
    const arrows: ArrowSets = {};
    const parts = input.split(';');
    const answer = parts.pop();
    if (answer === undefined) throw new Error('Invalid input; missing answer');
    if (!isSubset(answer, new Set('0123456789abcdefABCDEF'))) throw new Error('Invalid input; corrupted answer data');
    let clues = [];
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i].split(',');
        let partTargets: number[] = [];
        arrows[i] = partTargets;
        let clue = part.shift();
        if (clue === undefined) throw new Error('Invalid input; empty part');
        clues.push(clue);
        for (let target of part) {
            let targetIdx = parseInt(target);
            if (isNaN(targetIdx)) throw new Error('Invalid input; target is not a number');
            if (targetIdx < 0) throw new Error('Invalid input; target is negative');
            uniqueOutputs.add(targetIdx);
            if (targetIdx <= Math.max(...partTargets)) {
                throw new Error('Invalid input; targets are not in ascending order');
            }
            partTargets.push(targetIdx);
        }
    }
    return [arrows, clues, uniqueOutputs.size, answer];
}

export function validatePuzzleSolution(solution: string, answer: string): boolean {
    let solutionHash = hash(solution).toLowerCase();
    let answerHash = answer.toLowerCase();
    console.log(solution, solutionHash, answerHash);
    return solutionHash === answerHash;
}

export function serialise(arrows: ArrowSets, clues: string[], answerHash: string): string {
    let parts = [];
    for (let i in arrows) {
        let part = [clues[i], ...arrows[i].map(i => i.toString())];
        parts.push(part.join(','));
    }
    parts.push(answerHash);
    return parts.join(';');
}
