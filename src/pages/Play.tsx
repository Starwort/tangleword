import {BarChart, Share} from "@suid/icons-material";
import {Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@suid/material";
import {Accessor, JSXElement, Show, createEffect, createResource, createSignal} from "solid-js";
import {PlayPuzzle} from "../Puzzle";
import {PuzzleData, serialise} from "../puzzle_generator";
import {loadNumFromStorage} from "../util";
import PuzzleGenWorker from "../workers/puzzleGenWorker?worker";
import {PageProps} from "./PageProps";

const worker = new PuzzleGenWorker();

export function Play(props: PageProps<{
    updateAnimationFrame: () => void;
    toolbarButtons: JSXElement[];
}> & {
    preferredView: "classic" | "alt" | "both" | undefined;
    setLastDailySolved: (value: number) => void;
    lastDailySolved: number;
    query: Accessor<URLSearchParams>;
}) {
    const [statisticModalOpen, setStatisticModalOpen] = createSignal(false);

    const [data] = createResource<PuzzleData, URLSearchParams>(
        props.query,
        (query) => new Promise((resolve) => {
            worker.onmessage = (event: MessageEvent<{
                kind: 'complete';
                puzzle: PuzzleData;
            } | {
                kind: 'error';
                error: string;
            }>) => {
                if (event.data.kind == 'complete') {
                    resolve(event.data.puzzle);
                } else {
                    props.setError(event.data.error);
                }
            };
            worker.postMessage(query.toString());
        }),
    );
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
            <PlayPuzzle
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
                preferredView={props.preferredView}
                onCheat={data.latest!.isDaily ? () => {
                    if (!data.latest!.isDaily) {
                        return;
                    }
                    props.setLastDailySolved(data.latest!.randomSeed);
                    setDailyStreak(0);
                    setStatisticModalOpen(true);
                } : undefined}
                ref={(updateAnimationFrame) => props.ref({
                    updateAnimationFrame,
                    toolbarButtons: [
                        <Show when={data.latest?.isDaily}>
                            <IconButton
                                color="inherit"
                                onClick={() => setStatisticModalOpen(true)}
                                title="Statistics"
                            >
                                <BarChart />
                            </IconButton>
                        </Show>,
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                const urlObj = new URL(location.origin + location.pathname);
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
            />
        </Show>
    </>;
}