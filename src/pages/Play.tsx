import {BarChart, Share} from "@suid/icons-material";
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@suid/material";
import {JSXElement, Show, createEffect, createResource, createSignal} from "solid-js";
import {PuzzleView} from "../PuzzleView";
import {PuzzleData, generateFullPuzzleFromSeed, puzzleFromString, serialise} from "../puzzle_generator";
import {loadNumFromStorage} from "../util";
import {PageProps} from "./PageProps";

export function Play(props: PageProps<{
    updateAnimationFrame: () => void;
    toolbarButtons: JSXElement[];
}> & {
    setLastDailySolved: (value: number) => void;
    lastDailySolved: number;
}) {
    const query = new URLSearchParams(window.location.search);
    const [statisticModalOpen, setStatisticModalOpen] = createSignal(false);
    const [data] = createResource<PuzzleData>(() => {
        let randomSeed: number;
        let isDaily = true;
        if (query.has("seed")) {
            randomSeed = parseInt(query.get("seed")!);
            if (isDaily = isNaN(randomSeed)) {
                props.setError("Invalid seed");
                window.history.replaceState(null, "", window.location.pathname);
                randomSeed = Math.floor(new Date() as any / 8.64e7);
            }
        } else {
            randomSeed = Math.floor(new Date() as any / 8.64e7);
        }
        return new Promise(resolve => {
            if (query.has("puzzle")) {
                try {
                    let puzzle = puzzleFromString(query.get("puzzle")!);
                    console.log("loaded!", puzzle);
                    return resolve(puzzle);
                } catch (_error) {
                    let error: Error = _error as any;
                    props.setError(error.message);
                    window.history.replaceState(null, "", window.location.pathname);
                }
            }
            setTimeout(() => {
                let puzzle = generateFullPuzzleFromSeed(randomSeed, isDaily);
                console.log("generated!", puzzle);
                resolve(puzzle);
            }, 0);
        });
    });
    const [dailiesSolved, setDailiesSolved] = createSignal<number>(
        loadNumFromStorage("dailiesSolved", 0)
    );
    createEffect(() => {
        window.localStorage.dailiesSolved = dailiesSolved().toString();
    });
    const [dailyStreak, setDailyStreak] = createSignal<number>(
        loadNumFromStorage("dailyStreak", 0)
    );
    createEffect(() => {
        if (data.latest && data.latest.isDaily && props.lastDailySolved + 1 < data.latest.randomSeed) {
            setDailyStreak(0);
        }
        window.localStorage.dailyStreak = dailyStreak().toString();
    });
    const [bestDailyStreak, setBestDailyStreak] = createSignal<number>(
        loadNumFromStorage("bestDailyStreak", 0)
    );
    createEffect(() => {
        if (dailyStreak() > bestDailyStreak()) {
            setBestDailyStreak(dailyStreak());
            window.localStorage.bestDailyStreak = bestDailyStreak().toString();
        }
    });
    return <>
        <Dialog open={statisticModalOpen()} onClose={() => setStatisticModalOpen(false)}>
            <DialogTitle>Statistics</DialogTitle>
            <DialogContent>
                <Typography>
                    Daily puzzles completed: {dailiesSolved()}
                </Typography>
                <Typography>
                    Current daily puzzle streak: {dailyStreak()}
                </Typography>
                <Typography>
                    Longest daily puzzle streak: {bestDailyStreak()}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setStatisticModalOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <Show
            when={!data.loading}
            fallback={<Box sx={{
                width: "100%",
                display: "flex",
                flexDirection: 'column',
                alignItems: "center",
                paddingTop: 16,
            }}>
                <CircularProgress variant="indeterminate" />
            </Box>}
        >
            <PuzzleView
                ref={(updateAnimationFrame) => props.ref({
                    updateAnimationFrame,
                    toolbarButtons: [
                        <IconButton
                            color="inherit"
                            onClick={() => setStatisticModalOpen(true)}
                            title="Statistics"
                        >
                            <BarChart />
                        </IconButton>,
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                const urlObj = new URL(window.location.pathname);
                                if (data.latest!.generatedFromSeed) {
                                    urlObj.searchParams.set("seed", data.latest!.randomSeed.toString());
                                } else {
                                    urlObj.searchParams.set("puzzle", serialise(data.latest!));
                                }
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
                            disabled={data.loading}
                        >
                            <Share />
                        </IconButton>
                    ]
                })}
                data={data()!}
                setError={props.setError}
                onComplete={() => {
                    if (data.latest!.isDaily) {
                        setDailiesSolved(dailiesSolved => dailiesSolved + 1);
                        props.setLastDailySolved(data.latest!.randomSeed);
                        setDailyStreak(dailyStreak => dailyStreak + 1);
                        setStatisticModalOpen(true);
                    }
                }}
                isCustomPuzzle={!data()!.generatedFromSeed}
            />
        </Show>
    </>;
}