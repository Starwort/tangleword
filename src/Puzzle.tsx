import {Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Toolbar, Typography, useMediaQuery, useTheme} from "@suid/material";
import LeaderLine from "leader-line-new";
import {Index, Show, createEffect, createMemo, createSignal, onCleanup} from "solid-js";
import {ArrowSets} from "./arrow_sets";
import {COLOURS} from "./colours";
import {CHEAT_puzzleAnswerFromSeed, PuzzleData, serialise, validatePuzzleSolution} from "./puzzle_generator";
import {reverseDictionaryFor} from "./reverse_dictionary";
import {shiftFocus} from "./util";

export function keyEventHandler(event: KeyboardEvent) {
    if (event.key === "Unidentified") return; // doesn"t work on mobile
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === "Delete") {
        if ((event.target as HTMLInputElement).value.length === 0) {
            shiftFocus();
        }
        return;
    }
    if (event.key === "Backspace") {
        if ((event.target as HTMLInputElement).value.length === 0) {
            shiftFocus(-1);
        }
        return;
    }
    if (event.key === "Left" || event.key === "ArrowLeft") {
        shiftFocus(-1);
        return;
    } else if (event.key === "Right" || event.key === "ArrowRight") {
        shiftFocus();
        return;
    }
}

function getUnique(vals: string[]): string {
    vals = vals.filter(v => v !== "");
    let unique = new Set(vals);
    if (unique.size > 1) {
        return "!";
    }
    return vals[0] ?? "";
}

type ClueProps = {
    clue: string;
    letters: string[];
    reverseDictionary?: Record<string, string[]>;
};
function Clue(props: ClueProps) {
    const isValid = () => {
        if (props.reverseDictionary !== undefined && !props.letters.some(l => l === "")) {
            let word = props.letters.join("");
            return props.reverseDictionary[props.clue].includes(word);
        }
        return true;
    };
    return <div
        class="clue"
        style={{
            color: isValid() ? undefined : "red",
        }}
        title={isValid() ? undefined : "This word is not known to fit this clue"}
    >
        {props.clue}
    </div>;
}

interface LineController {
    (): void;
    regenerate: () => void;
}

interface PuzzleViewProps {
    arrows: ArrowSets;
    clues: string[];
    letters: string[][];
    updateInput: (letter: number, clue: number, value: string) => void;
    updateOutput: (letter: number, value: string) => void;
    puzzleSeed?: number;
    ref: (updateLines: LineController) => void;
}
export function PuzzleView(props: PuzzleViewProps) {
    const output = (i: number) => getUnique(props.letters[i]);
    const inputInputEventHandler = ([clue, letter]: [number, number], event: InputEvent) => {
        let value = event.data ?? "";
        if (!/^[a-zA-Z]$/.test(value)) {
            value = "";
        }
        props.updateInput(letter, clue, value.toLowerCase());
        if (value.length != 0) {
            shiftFocus();
        }
    };
    const outputInputEventHandler = (i: number, event: InputEvent) => {
        let value = event.data ?? "";
        if (!/^[a-zA-Z]$/.test(value)) {
            value = "";
        }
        props.updateOutput(i, value.toLowerCase());
        if (value.length != 0) {
            shiftFocus();
        }
    };
    const outputCount = createMemo(() => props.letters.length);
    const outputs = createMemo((): Element[] => {
        let outputs = [];
        for (let letter = 0; letter < outputCount(); letter++) {
            let input: Element = <input
                class="cell"
                value={output(letter)}
                onKeyDown={keyEventHandler}
                onInput={[outputInputEventHandler, letter]}
                style={{color: output(letter) == "!" ? "red" : undefined}}
                onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                onKeyUp={e => (
                    e.target as HTMLInputElement
                ).setSelectionRange(
                    0,
                    (e.target as HTMLInputElement).value.length,
                )}
            /> as any;
            outputs.push(input);
        }
        return outputs;
    });
    const reverseDictionary = createMemo(() => props.puzzleSeed !== undefined ? reverseDictionaryFor(props.puzzleSeed!) : undefined);
    const inputs = createMemo(() => {
        let inputs = [];
        for (let clue = 0; clue < Object.keys(props.arrows).length; clue++) {
            let targets = props.arrows[clue];
            let element = <div>
                <Box sx={{
                    display: "flex",
                    flexDirection: {xs: "column", md: "row-reverse"},
                    alignItems: "center",
                }}>
                    <Clue
                        clue={props.clues[clue]}
                        letters={targets.map(letter => props.letters[letter][clue] || output(letter))}
                        reverseDictionary={reverseDictionary()}
                    />
                    <div class="row" style={{"min-height": "48px"}}>
                        {targets.map(letter => <input class="cell"
                            value={props.letters[letter][clue]}
                            placeholder={output(letter)}
                            onKeyDown={keyEventHandler}
                            onInput={[inputInputEventHandler, [clue, letter]]}
                            style={{color: output(letter) == "!" ? "red" : undefined}}
                            onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                            onKeyUp={e => (
                                e.target as HTMLInputElement
                            ).setSelectionRange(
                                0,
                                (e.target as HTMLInputElement).value.length
                            )} />)}
                    </div>
                </Box>
            </div>;
            inputs.push(element as Element);
        }
        return inputs;
    });

    const theme = useTheme();
    let lines: [Element, number, LeaderLine][] = [];
    createEffect(() => {
        while (lines.length > 0) {
            let [_, __, line] = lines.pop()!;
            try {
                line.hide();
                line.remove();
            } catch (e) {
                console.error(e);
            }
        }
        const inputBoxes = inputs();
        const outputBoxes = outputs();
        let colours = COLOURS[theme.palette.mode];
        for (let i = 0; i < Object.keys(props.arrows).length; i++) {
            let targets = props.arrows[i];
            for (let target of targets) {
                let source = inputBoxes[i];
                lines.push([source, i, new LeaderLine(
                    source, outputBoxes[target],
                    {
                        path: "straight",
                        endPlug: "arrow3",
                        color: colours[i % colours.length],
                        startSocket: "right",
                        endSocket: "left",
                    }
                )]);
            }
        }
    });
    createEffect(() => {
        let isLarge = useMediaQuery(theme.breakpoints.up("md"))();
        // reposition the lines when the window is resized beyond the breakpoint
        for (let [source, _, line] of lines) {
            line.start = isLarge
                ? source
                // get the input box
                : source.querySelector(".row")!;
        }
    });
    createEffect(() => {
        const theme = useTheme();
        let colours = COLOURS[theme.palette.mode];
        setTimeout(() => {
            for (let [_, i, line] of lines) {
                line.color = colours[i % colours.length];
                line.position();
            }
        }, 0);
    });
    onCleanup(() => {
        while (lines.length > 0) {
            let [_, __, line] = lines.pop()!;
            line.hide();
            line.remove();
        }
    });
    let updateLines: LineController = (() => lines.forEach(([_, __, line]) => line.position())) as any;
    updateLines.regenerate = () => {
        for (let [_, __, line] of lines) {
            line.hide();
            line.remove();
        }

    };
    props.ref(updateLines);
    return <>
        <div class="puzzle">
            <div class="column">
                {inputs()}
            </div>
            <div class="spacer"></div>
            <div class="column">
                {outputs()}
            </div>
        </div>
    </>;
}

export function AltPuzzleView(props: Omit<PuzzleViewProps, "ref" | "updateOutput"> & {
    small: boolean;
}) {
    const output = (i: number) => getUnique(props.letters[i]);
    const inputEventHandler = ([clue, letter]: [number, number], event: InputEvent) => {
        let value = event.data ?? "";
        if (!/^[a-zA-Z]$/.test(value)) {
            value = "";
        }
        props.updateInput(letter, clue, value.toLowerCase());
        if (value.length != 0) {
            shiftFocus();
        }
    };
    const theme = useTheme();
    const reverseDictionary = createMemo(() => props.puzzleSeed !== undefined ? reverseDictionaryFor(props.puzzleSeed!) : undefined);

    return <>
        <div class="alt-puzzle-view" style={{
            transform: props.small ? undefined : "scale(0.66)",
        }}>
            <div class="column">
                <Index each={props.clues}>{(clue, index) => (
                    <Clue
                        clue={clue()}
                        letters={props.arrows[index].map(letter => props.letters[letter][index] || output(letter))}
                        reverseDictionary={reverseDictionary()}
                    />
                )}</Index>
            </div>

            <div>
                <Index each={props.clues}>{(_, clue) => (
                    <div class="row" style={{gap: ""}}>
                        <Index each={props.letters}>{(row, letter) => (
                            <Show when={props.arrows[clue].includes(letter)} fallback={
                                <input
                                    class="cell"
                                    disabled
                                    style={{
                                        "background-color": theme.palette.mode == "dark"
                                            ? "transparent"
                                            : "black"
                                    }}
                                />
                            }>
                                <input
                                    class="cell"
                                    value={row()[clue]}
                                    placeholder={output(letter)}
                                    onKeyDown={keyEventHandler}
                                    onInput={[inputEventHandler, [clue, letter]]}
                                    style={{color: output(letter) == "!" ? "red" : undefined}}
                                    onFocus={e => e.target.setSelectionRange(0, e.target.value.length)}
                                    onKeyUp={e => (
                                        e.target as HTMLInputElement
                                    ).setSelectionRange(
                                        0,
                                        (e.target as HTMLInputElement).value.length,
                                    )}
                                />
                            </Show>
                        )}</Index>
                    </div>
                )}</Index>
            </div>
        </div>
    </>;
}

interface CheatDialogueProps {
    open: boolean;
    onClose: (shouldCheat: boolean) => void;
}
function CheatDialogue(props: CheatDialogueProps) {
    return <Dialog open={props.open} onClose={() => props.onClose(false)}>
        <DialogTitle>Reveal answer?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to reveal the answer to this puzzle? This
                will not count as a completion, and will reset your daily solve
                streak.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.onClose(true)} color="error">
                Solve
            </Button>
            <Button onClick={() => props.onClose(false)} color="primary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>;
}

interface PlayPuzzleProps {
    data: PuzzleData;
    setError: (error: string) => void;
    isCustomPuzzle: boolean;
    preferredView: "classic" | "alt" | "both" | undefined;
    onComplete: () => void;
    onCheat?: () => void;
    ref: (updateLines: () => void) => void;
}
export function PlayPuzzle(props: PlayPuzzleProps) {
    let saveSlot = props.data.isDaily ? props.data.randomSeed.toString() : serialise(props.data);
    let savedInputValues = JSON.parse(window.localStorage[saveSlot] || "null");
    if (
        !Array.isArray(savedInputValues)
        || savedInputValues.length !== props.data.outputCount
        || savedInputValues.some((v: any) => !Array.isArray(v))
        || savedInputValues.some((v: any) => v.length !== props.data.clues.length)
        || savedInputValues.some((v: any) => v.some((v: any) => typeof v !== "string"))
        || savedInputValues.some((v: any) => v.some((v: any) => v.length > 1))
    ) {
        savedInputValues = Array.from(
            {length: props.data.outputCount},
            _ => Array.from({length: props.data.clues.length}, _ => "")
        );
        if (window.localStorage[saveSlot]) {
            props.setError("Save data for this puzzle is corrupted, resetting");
        }
    }
    const [inputValues, setInputValues] = createSignal<string[][]>(
        savedInputValues,
    );
    createEffect(() => {
        window.localStorage[saveSlot] = JSON.stringify(inputValues());
    });
    const theme = useTheme();
    const [won, setWon] = createSignal(window.localStorage[saveSlot + "won"] === "true");
    createEffect(() => {
        if (won()) {
            window.localStorage[saveSlot + "won"] = "true";
            setTimeout(() => updateLines?.(), 0);
        }
    });
    let updateLines: () => void | undefined;
    createEffect(() => {
        if (validatePuzzleSolution(
            Array.from({length: props.data.outputCount}, (_, i) => getUnique(inputValues()[i])).join(""),
            props.data.answerHash,
        ) && !won()) {
            setWon(true);
            props.onComplete();
        }
    });

    const cheat = () => {
        if (!props.data.generatedFromSeed) {
            props.setError("This puzzle cannot be solved automatically");
            return;
        }
        let answer = CHEAT_puzzleAnswerFromSeed(props.data.randomSeed);
        setWon(true);
        setInputValues(Array.from(
            answer,
            char => Array.from({length: props.data.clues.length}, _ => char)
        ));
    };

    const [cheatOpen, setCheatOpen] = createSignal(false);

    const maybeCheat = (shouldCheat: boolean) => {
        setCheatOpen(false);
        if (shouldCheat) {
            props.onCheat!();
            cheat();
        }
    };

    const maybeConfirmCheat = () => {
        if (won() || !props.data.isDaily) {
            cheat();
        } else {
            setCheatOpen(true);
        }
    };

    const shouldTransform = useMediaQuery(theme.breakpoints.up("md"));
    return <>
        <CheatDialogue open={cheatOpen()} onClose={maybeCheat} />
        <Show when={won()}>
            <Alert sx={{mb: 1}} severity="success" variant="filled">You have completed this puzzle!</Alert>
        </Show>
        <Show when={props.preferredView !== "alt"}>
            <PuzzleView
                arrows={props.data.arrows}
                clues={props.data.clues}
                letters={inputValues()}
                updateInput={(letter, clue, value) => setInputValues(inputValues => inputValues.map(
                    (row, i) => i == letter ? row.map((cell, i) => i == clue ? value : cell) : row
                ))}
                updateOutput={(letter, value) => setInputValues(inputValues => inputValues.map(
                    (row, i) => i == letter ? row.map(() => value) : row
                ))}
                puzzleSeed={props.data.generatedFromSeed ? props.data.randomSeed : undefined}
                ref={(update) => {
                    props.ref(update);
                    updateLines = update;
                }}
            />
        </Show>
        <Show when={props.preferredView === "alt"}>
            <AltPuzzleView
                arrows={props.data.arrows}
                clues={props.data.clues}
                letters={inputValues()}
                updateInput={(letter, clue, value) => setInputValues(inputValues => inputValues.map(
                    (row, i) => i == letter ? row.map((cell, i) => i == clue ? value : cell) : row
                ))}
                puzzleSeed={props.data.generatedFromSeed ? props.data.randomSeed : undefined}
                small={shouldTransform()}
            />
            {/* necessary to prevent top bar buttons from breaking: */}
            {void props.ref(() => {})}
        </Show>
        <Toolbar sx={{gap: 2}}>
            <Button
                onClick={() => setInputValues(values => values.map(row => row.map(() => "")))}
                variant="contained"
            >
                Clear all
            </Button>
            <Show when={props.data.generatedFromSeed}>
                <Button
                    onClick={maybeConfirmCheat}
                    variant="contained"
                    color={(props.onCheat && !won()) ? "error" : "primary"}
                >
                    Reveal answer
                </Button>
            </Show>
        </Toolbar>
        <Show when={props.preferredView === undefined}>
            <Typography variant="caption" sx={{mt: 1}} color="GrayText" fontStyle="italic">
                Looking for the grid view? Try changing your puzzle view in the menu.
            </Typography>
        </Show>
        <Show when={props.preferredView === "both"}>
            <AltPuzzleView
                arrows={props.data.arrows}
                clues={props.data.clues}
                letters={inputValues()}
                updateInput={(letter, clue, value) => setInputValues(inputValues => inputValues.map(
                    (row, i) => i == letter ? row.map((cell, i) => i == clue ? value : cell) : row
                ))}
                puzzleSeed={props.data.generatedFromSeed ? props.data.randomSeed : undefined}
                small={shouldTransform()}
            />
        </Show>
    </>;
}

