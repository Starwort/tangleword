import {Delete, ExpandLess, ExpandMore, Share} from "@suid/icons-material";
import {Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, useTheme} from "@suid/material";
import {Index, JSXElement, Show, createRenderEffect, createSignal} from "solid-js";
import {PuzzleView, keyEventHandler} from "../Puzzle";
import {Destination, NUM_OUTPUTS, NUM_WORDS} from "../arrow_sets";
import {hash, serialise} from "../puzzle_generator";
import {shiftFocus} from "../util";
import {PageProps} from "./PageProps";

function swap<T>(arr: T[], i: number, j: number): T[] {
    let out = [...arr];
    out[i] = arr[j];
    out[j] = arr[i];
    return out;
}

export function PuzzleDesigner(props: PageProps<{
    updateAnimationFrame: () => void;
    toolbarButtons: JSXElement[];
}>) {
    const [answer, setAnswer] = createSignal<string[]>([""]);
    const [clues, setClues] = createSignal<string[]>([""]);
    const [arrows, setArrows] = createSignal<Destination[][]>([[]]);
    function toggle([letter, clue]: [number, number]) {
        setArrows(arrows => arrows.map((letters, i) => (
            i == clue ? (
                letters.includes(letter)
                    ? letters.filter(i => i != letter)
                    : [...letters, letter].sort((a, b) => a - b)
            ) : letters
        )));
    }
    const inputEventHandler = (i: number, event: InputEvent) => {
        event.preventDefault();
        setValidationResult(null);
        let value = event.data ?? "";
        if (!/^[a-zA-Z]$/.test(value)) {
            value = "";
        }
        if (answer().length <= i + 2 || value.length != 0) {
            if (value == "" && arrows().some(letters => letters.includes(i))) {
                // dissassociate the letter from all clues
                // otherwise the designer breaks and I"m not entirely sure why
                setArrows(arrows => arrows.map(letters => letters.filter(j => j != i)));
            }
            setAnswer(oldAnswer => {
                let answer = [...oldAnswer];
                answer[i] = value;
                if (answer[answer.length - 1] != "") {
                    answer.push("");
                }
                if (answer[answer.length - 2] == "") {
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
    createRenderEffect(() => {
        let _ = clues();
        setTimeout(updateLines!, 1);
    });
    const [validationResult, setValidationResult] = createSignal<["success" | "warning" | "error", string, boolean[], boolean[]] | null>(null);
    const [confirmReset, setConfirmReset] = createSignal(false);
    return <>
        <Show when={validationResult()}>
            <Alert sx={{mb: 1}} severity={validationResult()![0]} variant="filled">
                {validationResult()![1]}
            </Alert>
        </Show>
        <Dialog open={confirmReset()} onClose={() => setConfirmReset(false)}>
            <DialogTitle>Replace puzzle contents?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to replace the puzzle contents with a new standard puzzle?
                    <br />
                    All previous work will be lost.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
                <Button
                    color="error"
                    onClick={() => {
                        setConfirmReset(false);
                        setAnswer([...Array.from({length: NUM_OUTPUTS}, () => "A"), ""]);
                        setClues([...Array.from({length: NUM_WORDS}, () => "")]);
                        setArrows([...Array.from({length: NUM_WORDS}, () => [])]);
                    }}
                >
                    Reset puzzle
                </Button>
            </DialogActions>
        </Dialog>
        <div class="column">
            <div class="row">
                <Button variant="contained" onClick={() => setConfirmReset(true)}>
                    Create standard puzzle
                </Button>
            </div>
            <div class="row designer">
                <div class="column">
                    <div class="designer-clue">Answer:</div>
                    <Index each={clues()}>{(clue, i) => (
                        <div class="designer-clue">
                            <input
                                class="designer-clue"
                                value={clue()}
                                onInput={event => {
                                    setClues(clues => clues.map(
                                        (val, j) => i == j ? event.target.value : val
                                    ));
                                    setValidationResult(null);
                                }}
                                style={{
                                    "border-color": (
                                        validationResult()?.[3][i]
                                            ? theme.palette[validationResult()![0]].main
                                            : undefined
                                    ),
                                    color: (
                                        validationResult()?.[3][i]
                                            ? theme.palette[validationResult()![0]].main
                                            : undefined
                                    ),
                                }}
                            />
                            <button
                                class="cell"
                                onClick={() => {
                                    setArrows(arrows => swap(arrows, i, i - 1));
                                    setClues(clues => swap(clues, i, i - 1));
                                    setTimeout(() => updateLines?.(), 1);
                                }}
                                disabled={i == 0}
                            >
                                <ExpandLess />
                            </button>
                            <button
                                class="cell"
                                onClick={() => {
                                    setArrows(arrows => swap(arrows, i, i + 1));
                                    setClues(clues => swap(clues, i, i + 1));
                                    setTimeout(() => updateLines?.(), 1);
                                }}
                                disabled={i == arrows().length - 1}
                            >
                                <ExpandMore />
                            </button>
                        </div>
                    )}</Index>
                    <div style={{
                        height: "48px",
                        display: "flex",
                        "justify-content": "center",
                        "align-items": "center"
                    }}>
                        <Button variant="contained" onClick={() => {
                            setClues(clues => [...clues, ""]);
                            setArrows(arrows => [...arrows, []]);
                        }}>
                            Add clue
                        </Button>
                    </div>
                </div>
                <div class="column">
                    <div class="row designer">
                        <Index each={answer()}>{(letter, i) => (
                            <div class="column">
                                <input
                                    class="cell"
                                    value={letter()}
                                    placeholder={letter() == "" ? "+" : ""}
                                    onKeyDown={keyEventHandler}
                                    onBeforeInput={[inputEventHandler, i]}
                                    style={{
                                        "border-color": (
                                            validationResult()?.[2][i]
                                                ? theme.palette[validationResult()![0]].main
                                                : undefined
                                        ),
                                        color: (
                                            validationResult()?.[2][i]
                                                ? theme.palette[validationResult()![0]].main
                                                : undefined
                                        ),
                                    }}
                                />
                                <Index each={arrows()}>{(targets, clue) => (
                                    <Show when={letter() != ""} fallback={
                                        <button
                                            class="cell"
                                            onClick={() => {
                                                setArrows(arrows => arrows.filter((_, i) => i != clue));
                                                setClues(clues => clues.filter((_, i) => i != clue));
                                                setTimeout(() => updateLines?.(), 1);
                                            }}
                                            disabled={arrows().length == 1}
                                        >
                                            <Delete />
                                        </button>
                                    }>
                                        <button
                                            classList={{
                                                "cell": true,
                                                "dim": !targets().includes(i),
                                                "light": theme.palette.mode == "light"
                                            }}
                                            onClick={[toggle, [i, clue]]}
                                        >
                                            {letter() == ""}
                                            {targets().includes(i) ? letter() : ""}
                                        </button>
                                    </Show>
                                )}</Index>
                            </div>
                        )}</Index>
                    </div>
                    <div style={{
                        height: "48px",
                        display: "flex",
                        "justify-content": "center",
                        "align-items": "center"
                    }}>
                        <Show when={answer().length > 2 && clues().length > 1}>
                            <Button variant="contained" onClick={() => {
                                let eachLetterUsage = answer().map(() => 0);
                                eachLetterUsage.pop(); // remove the trailing ""
                                let eachClueUsage = arrows().map(targets => targets.length);
                                let severity: "success" | "warning" | "error" = "success";
                                let message = [];
                                for (let targets of arrows()) {
                                    for (let target of targets) {
                                        eachLetterUsage[target]++;
                                    }
                                }
                                let letterFlags = eachLetterUsage.map(i => i == 0);
                                let clueFlags = eachClueUsage.map(i => i == 0);
                                if (eachLetterUsage.some(i => i == 0)) {
                                    severity = "error";
                                    message.push("some letters are not used");
                                    // letterFlags is already set
                                }
                                if (eachClueUsage.some(i => i == 0)) {
                                    severity = "error";
                                    message.push("some clues are not used");
                                    // clueFlags is already set
                                }
                                if (clues().some(clue => clue.length == 0)) {
                                    severity = "error";
                                    message.push("some clues have no text");
                                    clues().map(clue => clue.length == 0).forEach(
                                        (flag, i) => clueFlags[i] ||= flag
                                    );
                                }
                                if (eachLetterUsage.some(i => i == 1)) {
                                    message.push("some letters are used only once");
                                    if (severity != "error") {
                                        severity = "warning";
                                        eachLetterUsage.map(i => i == 1).forEach(
                                            (flag, i) => letterFlags[i] ||= flag
                                        );
                                    }
                                }
                                if (eachLetterUsage.some(i => i > 3)) {
                                    message.push("some letters are used excessively");
                                    if (severity != "error") {
                                        severity = "warning";
                                        eachLetterUsage.map(i => i > 3).forEach(
                                            (flag, i) => letterFlags[i] ||= flag
                                        );
                                    }
                                }
                                if (eachClueUsage.some(i => i > 0 && i < 3)) {
                                    message.push("some clues are excessively short");
                                    if (severity != "error") {
                                        severity = "warning";
                                        eachClueUsage.map(i => i < 3).forEach(
                                            (flag, i) => clueFlags[i] ||= flag
                                        );
                                    }
                                }
                                if (eachClueUsage.some(i => i >= eachLetterUsage.length / 2)) {
                                    message.push("some clues are excessively long");
                                    if (severity != "error") {
                                        severity = "warning";
                                        eachClueUsage.map(i => i >= eachLetterUsage.length / 2).forEach(
                                            (flag, i) => clueFlags[i] ||= flag
                                        );
                                    }
                                }
                                let minLetterUsage = Math.min(...eachLetterUsage);
                                let maxLetterUsage = Math.max(...eachLetterUsage);
                                if (maxLetterUsage - minLetterUsage > 1) {
                                    message.push("letters are not used evenly");
                                    if (severity != "error") {
                                        severity = "warning";
                                    }
                                }
                                if (message.length == 0) {
                                    message.push("puzzle is valid");
                                }
                                message[0] = message[0][0].toUpperCase() + message[0].slice(1);
                                setValidationResult([severity, message.join(", "), letterFlags, clueFlags]);
                            }}>
                                Validate puzzle
                            </Button>
                        </Show>
                    </div>
                </div>
            </div>
        </div>
        <PuzzleView
            arrows={arrows()}
            clues={clues()}
            letters={answer().filter(el => el != "").map(letter => clues().map(() => letter))}
            updateInput={(letter, _, value) => setAnswer(answer => answer.map(
                (old, i) => i == letter && value ? value : old)
            )}
            updateOutput={(letter, value) => setAnswer(answer => answer.map(
                (old, i) => i == letter && value ? value : old)
            )}
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
                                    answerHash: hash(answer().join("")),
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
};;