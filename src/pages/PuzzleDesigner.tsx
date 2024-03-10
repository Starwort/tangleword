import {Delete, Share} from "@suid/icons-material";
import {Button, IconButton, useTheme} from "@suid/material";
import {Index, JSXElement, Show, createSignal} from "solid-js";
import {PuzzleView, keyEventHandler} from "../Puzzle";
import {Destination, MutArrowSets} from "../arrow_sets";
import {hash, serialise} from "../puzzle_generator";
import {shiftFocus} from "../util";
import {PageProps} from "./PageProps";

export function PuzzleDesigner(props: PageProps<{
    updateAnimationFrame: () => void;
    toolbarButtons: JSXElement[];
}>) {
    const [answer, setAnswer] = createSignal<string[]>([''], {equals: false});
    const [clues, setClues] = createSignal<string[]>([], {equals: false});
    const [arrows, setArrows] = createSignal<MutArrowSets>([], {equals: false});
    function toggle([letter, clue]: [number, number]) {
        setArrows(arrows => {
            let letters = arrows[clue];
            if (letters.includes(letter)) {
                arrows[clue] = letters.filter(i => i != letter);
            } else {
                arrows[clue] = [...letters, letter].sort((a, b) => a - b);
            }
            return arrows;
        });
    }
    const inputEventHandler = (i: number, event: InputEvent) => {
        event.preventDefault();
        let value = event.data ?? "";
        if (!/^[a-zA-Z]$/.test(value)) {
            value = '';
        }
        if (answer().length <= i + 2 || value.length != 0) {
            setAnswer(answer => {
                answer[i] = value;
                if (answer[answer.length - 1] != '') {
                    answer.push('');
                }
                if (answer[answer.length - 2] == '') {
                    answer.pop();
                }
                return answer;
            });
            if (value.length != 0) {
                shiftFocus();
            }
        }
    };
    const theme = useTheme();
    let updateLines: (() => void) | undefined;
    return <>
        <div class="column">
            <div class="row designer">
                <div class="column">
                    <div class="designer-clue">Answer:</div>
                    <Index each={clues()}>{(clue, i) => (
                        <input
                            class="designer-clue"
                            value={clue()}
                            onInput={event => setClues(
                                clues => {
                                    clues[i] = event.target.value;
                                    return clues;
                                }
                            )}
                        />
                    )}</Index>
                </div>
                <Index each={answer()}>{(letter, i) => (
                    <div class="column">
                        <input
                            class="cell"
                            value={letter()}
                            onKeyDown={keyEventHandler}
                            onBeforeInput={[inputEventHandler, i]}
                        />
                        <Index each={arrows() as Destination[][]}>{(targets, clue) => (
                            letter() != ''
                                ? <button
                                    classList={{
                                        "cell": true,
                                        "dim": !targets().includes(i),
                                        "light": theme.palette.mode == "light"
                                    }}
                                    onClick={[toggle, [i, clue]]}
                                >
                                    {targets().includes(i) ? letter() : ''}
                                </button>
                                : <button class="cell" onClick={() => {
                                    setArrows(arrows => {
                                        (arrows as Destination[][]).splice(clue, 1);
                                        return arrows;
                                    });
                                    setClues(clues => {
                                        clues.splice(clue, 1);
                                        return clues;
                                    });
                                    setTimeout(() => updateLines?.(), 1);
                                }}>
                                    <Delete />
                                </button>
                        )}</Index>
                    </div>
                )}</Index>
            </div>
            <Show when={answer().length != 1}>
                <div class="row">
                    <Button variant="contained" onClick={() => {
                        setClues(clues => {
                            clues.push('');
                            return clues;
                        });
                        setArrows(arrows => {
                            (arrows as Destination[][]).push([]);
                            return arrows;
                        });
                    }}>
                        Add clue
                    </Button>
                </div>
            </Show>
        </div>
        <PuzzleView
            arrows={arrows()}
            clues={clues()}
            letters={answer().filter(el => el != '').map(letter => clues().map(() => letter))}
            updateInput={(letter, _, value) => {
                setAnswer(answer => {
                    answer[letter] = value;
                    return answer;
                });
            }}
            updateOutput={(letter, value) => {
                setAnswer(answer => {
                    answer[letter] = value;
                    return answer;
                });
            }}
            isCustomPuzzle
            ref={updateAnimationFrame => {
                updateLines = updateAnimationFrame;
                props.ref({
                    updateAnimationFrame,
                    toolbarButtons: [
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                const urlObj = new URL(location.origin + location.pathname);
                                urlObj.searchParams.set("puzzle", serialise({
                                    arrows: arrows(),
                                    clues: clues(),
                                    answerHash: hash(answer().join('')),
                                }));
                                let url = decodeURIComponent(urlObj.href);
                                if (
                                    "share" in navigator
                                    && (!("canShare" in navigator) || navigator.canShare({url}))
                                ) {
                                    navigator.share({url});
                                } else {
                                    navigator.clipboard.writeText(url);
                                }
                            }}
                            title="Share this puzzle"
                        >
                            <Share />
                        </IconButton>
                    ]
                });
            }}
        />
    </>;
}