import {JSX, Show, createEffect, createMemo, createResource, createSignal} from "solid-js";

import {BarChart, DarkMode, InfoOutlined, LightMode, Share} from "@suid/icons-material";
import {Alert, AppBar, Box, Button, CircularProgress, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, ThemeProvider, Toolbar, Typography, createPalette, createTheme} from "@suid/material";
import "./App.scss";
import {PuzzleView} from "./PuzzleView";
import {GitHub, KofiIcon as Kofi} from "./extra_icons";
import {PuzzleData, generateFullPuzzleFromSeed, puzzleFromString, serialise} from "./puzzle_generator";

function loadNumFromStorage(key: string, defaultValue: number): number {
    let value = parseInt(window.localStorage[key] || "");
    if (isNaN(value)) {
        value = defaultValue;
    }
    return value;
}

function LinkButton(props: {href: string; title: string; children?: JSX.Element;}) {
    // @ts-ignore - this works but the types seem to be wrong
    return <IconButton
        color="inherit"
        target="_blank"
        {...props} />;
}

export default function App() {
    const query = new URLSearchParams(window.location.search);
    const [error, setError] = createSignal("");
    const [themeColour, setThemeColour] = createSignal<"dark" | "light">(
        window.localStorage.theme === "light" ? "light" : "dark"
    );
    createEffect(() => {
        window.localStorage.theme = themeColour();
    });
    const [dailiesSolved, setDailiesSolved] = createSignal<number>(
        loadNumFromStorage("dailiesSolved", 0)
    );
    createEffect(() => {
        window.localStorage.dailiesSolved = dailiesSolved().toString();
    });
    const [lastDailySolved, setLastDailySolved] = createSignal<number>(
        loadNumFromStorage("lastDailySolved", 0)
    );
    createEffect(() => {
        window.localStorage.lastDailySolved = lastDailySolved().toString();
    });
    const [dailyStreak, setDailyStreak] = createSignal<number>(
        loadNumFromStorage("dailyStreak", 0)
    );
    createEffect(() => {
        if (data.latest && data.latest.isDaily && lastDailySolved() + 1 < data.latest.randomSeed) {
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
    const [errorModalOpen, setErrorModalOpen] = createSignal(false);
    const [statisticModalOpen, setStatisticModalOpen] = createSignal(false);
    const [infoModalOpen, setInfoModalOpen] = createSignal(false);
    const [data] = createResource<PuzzleData>(() => {
        let randomSeed: number;
        let isDaily = true;
        if (query.has("seed")) {
            randomSeed = parseInt(query.get("seed")!);
            if (isDaily = isNaN(randomSeed)) {
                setError("Invalid seed");
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
                    setError(error.message);
                }
            }
            setTimeout(() => {
                let puzzle = generateFullPuzzleFromSeed(randomSeed, isDaily);
                console.log("generated!", puzzle);
                resolve(puzzle);
            }, 0);
        });
    });
    const palette = createMemo(() =>
        createPalette({
            mode: themeColour(),
            primary: {
                main: themeColour() == "dark" ? "#bb86fc" : "#6200ee",
            },
            secondary: {
                main: "#03dac6",
            },
        })
    );
    const theme = createTheme({palette});
    return <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dialog open={errorModalOpen()} onClose={() => setErrorModalOpen(false)}>
            <DialogTitle>An error has occurred</DialogTitle>
            <DialogContent>
                <Typography>{error()}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setErrorModalOpen(false)}>Ok</Button>
            </DialogActions>
        </Dialog>
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
        <Dialog open={infoModalOpen()} onClose={() => setInfoModalOpen(false)}>
            <DialogTitle>About</DialogTitle>
            <DialogContent>
                <Typography>
                    Tangleword is a word puzzle game, where several crossword-style clues
                    each point to a vertical column. The answer to each clue is a three-letter
                    word, made up of the three letters that the clue points to.
                </Typography>
                <br />
                <Typography>
                    The game is won when all the letters on the right-hand side of the
                    screen are filled in correctly, without causing any conflicts.
                </Typography>
                <br />
                <Typography>
                    For convenience, an additional view is provided that shows the
                    letters in a grid. This may be easier to read for some people.
                </Typography>
                <br />
                <Typography>
                    This implementation of Tangleword, including the name 'Tangleword',
                    was created by Starwort, based on the game described in <Link
                        href="https://www.theguardian.com/science/2024/mar/03/can-you-solve-it-the-word-game-at-the-cutting-edge-of-computer-science"
                    >Alex Bellos' Guardian article</Link>.
                </Typography>
                <Box sx={{display: "flex", justifyContent: "center", gap: 2, paddingTop: 2}}>
                    <Button href="https://ko-fi.com/starwort" startIcon={<Kofi />} variant="contained">
                        Support me on Ko-fi
                    </Button>
                    <Button href="https://github.com/Starwort/tangleword/" startIcon={<GitHub />} variant="contained">
                        View source on GitHub
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setInfoModalOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        <AppBar>
            <Toolbar sx={{gap: 1}}>
                <Typography variant="h5" component="h1" sx={{
                    flexGrow: 1,
                }}>
                    Tangleword
                </Typography>
                <IconButton
                    color="inherit"
                    onClick={() => {
                        setThemeColour(themeColour => themeColour == "dark" ? "light" : "dark");
                    }}
                    title={themeColour() == "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                    <Show when={themeColour() == "dark"} fallback={<DarkMode />}>
                        <LightMode />
                    </Show>
                </IconButton>
                <IconButton onClick={() => setInfoModalOpen(true)} title="About">
                    <InfoOutlined />
                </IconButton>
                <IconButton onClick={() => setStatisticModalOpen(true)} title="Statistics">
                    <BarChart />
                </IconButton>
                <IconButton
                    color="inherit"
                    onClick={() => {
                        const urlObj = new URL(window.location.href);
                        urlObj.search = "";
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
                <LinkButton href="https://github.com/Starwort/tangleword" title="View on GitHub">
                    <GitHub />
                </LinkButton>
            </Toolbar>
        </AppBar>
        <Toolbar />
        <main>
            <Show when={error()}>
                <Alert severity="error">{error()}</Alert>
            </Show>
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
                    data={data()!}
                    setError={setError}
                    onComplete={() => {
                        if (data.latest!.isDaily) {
                            setDailiesSolved(dailiesSolved => dailiesSolved + 1);
                            setLastDailySolved(data.latest!.randomSeed);
                            setDailyStreak(dailyStreak => dailyStreak + 1);
                            setStatisticModalOpen(true);
                        }
                    }}
                    isCustomPuzzle={!data()!.generatedFromSeed}
                />
            </Show>
        </main>
    </ThemeProvider>;
}


