import {CalendarToday, Construction, DarkMode, Favorite as Heart, InfoOutlined, LightMode, List as ListIcon, Menu as MenuIcon} from "@suid/icons-material";
import {AppBar, Box, Button, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ThemeProvider, Toolbar, Typography, createPalette, createTheme, useMediaQuery} from "@suid/material";
import {JSXElement, Match, Show, Switch, createEffect, createMemo, createSignal, onCleanup} from "solid-js";
import "./App.scss";
import {InfoDialogue} from "./InfoDialogue";
import {GitHub} from "./extra_icons";
import {CustomPuzzles} from "./pages/CustomPuzzles";
import {Play} from "./pages/Play";
import {PuzzleDesigner} from "./pages/PuzzleDesigner";
import {formatTime, loadNumFromStorage} from "./util";

export default function App() {
    const [query, setQuery] = createSignal(new URLSearchParams(window.location.search));
    const [error, _setError] = createSignal("");
    function setError(e: string) {
        _setError(e);
        setErrorModalOpen(true);
    }
    const [themeColour, setThemeColour] = createSignal<"dark" | "light">(
        window.localStorage.theme === "light" ? "light" : "dark"
    );
    createEffect(() => {
        window.localStorage.theme = themeColour();
    });
    const [infoModalOpen, setInfoModalOpen] = createSignal(false);
    const [errorModalOpen, setErrorModalOpen] = createSignal(false);
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
    const drawerIsPersistent = useMediaQuery(theme.breakpoints.up("md"));
    const [persistentDrawerOpen, setPersistentDrawerOpen] = createSignal(true);
    const [temporaryDrawerOpen, setTemporaryDrawerOpen] = createSignal(false);
    createEffect(() => {
        if (drawerIsPersistent()) {
            setPersistentDrawerOpen(true);
            setTemporaryDrawerOpen(false);
        }
    });
    let updateAnimationFrame: (() => void) | undefined;
    let needAnimationFrame = false;
    function runUpdate() {
        updateAnimationFrame?.();
        if (needAnimationFrame && updateAnimationFrame) {
            requestAnimationFrame(runUpdate);
        }
    }
    const [timeUntilNextDaily, setTimeUntilNextDaily] = createSignal(0);
    let handle = setInterval(() => {
        let now: number = new Date() as any;
        let nextDaily = Math.ceil(now / 8.64e7) * 8.64e7;
        setTimeUntilNextDaily(nextDaily - now);
    }, 500);
    onCleanup(() => clearInterval(handle));

    const [lastDailySolved, setLastDailySolved] = createSignal<number>(
        loadNumFromStorage("lastDailySolved", 0)
    );
    createEffect(() => {
        window.localStorage.lastDailySolved = lastDailySolved().toString();
    });

    const [extraButtons, setExtraButtons] = createSignal<JSXElement[]>([]);
    const [page, _setPage] = createSignal(query().get("page") ?? "play");
    function setPage(pageId: string, urlParams?: string) {
        window.history.pushState(null, "", window.location.pathname + (urlParams ? '?' + urlParams : ''));
        if (pageId != page()) {
            setExtraButtons([]);
        }
        setQuery(new URLSearchParams(urlParams));
        _setPage(pageId);
    }

    window.onpopstate = () => {
        setQuery(new URLSearchParams(window.location.search));
        _setPage(query().get("page") ?? "play");
    };

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
        <InfoDialogue open={infoModalOpen()} onClose={() => setInfoModalOpen(false)} />
        <AppBar sx={{zIndex: drawerIsPersistent() ? (theme) => theme.zIndex.drawer + 1 : undefined}}>
            <Toolbar sx={{gap: 1}}>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={() => drawerIsPersistent() ?
                        setPersistentDrawerOpen(open => !open)
                        : setTemporaryDrawerOpen(true)
                    }
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{
                    flexGrow: 1,
                }}>
                    Tangleword
                </Typography>
                {extraButtons()}
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => setInfoModalOpen(true)}
                    title="About"
                >
                    <InfoOutlined />
                </IconButton>
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Drawer
            variant={drawerIsPersistent() ? 'persistent' : 'temporary'}
            open={drawerIsPersistent() ? persistentDrawerOpen() : temporaryDrawerOpen()}
            onClose={() => setTemporaryDrawerOpen(false)}
            PaperProps={{sx: {width: 240}}}
        >
            <Show when={drawerIsPersistent()}>
                <Toolbar />
            </Show>
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        component="a"
                        href={window.location.pathname}
                        onClick={event => {
                            event.preventDefault();
                            setPage("play");
                            setTemporaryDrawerOpen(false);
                        }}
                    >
                        <ListItemIcon>
                            <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                            primary="Daily Puzzle"
                            secondary={lastDailySolved() == Math.floor(new Date() as any / 8.64e7) ? `Next in ${formatTime(timeUntilNextDaily())}` : "Unsolved"}
                        />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        component="a"
                        href={window.location.pathname + '?page=custom'}
                        onClick={event => {
                            event.preventDefault();
                            setPage("custom", "page=custom");
                            setTemporaryDrawerOpen(false);
                        }}
                    >
                        <ListItemIcon>
                            <ListIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Custom Puzzles"
                        />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        component="a"
                        href={window.location.pathname + '?page=designer'}
                        onClick={event => {
                            event.preventDefault();
                            setPage("designer", "page=designer");
                            setTemporaryDrawerOpen(false);
                        }}
                    >
                        <ListItemIcon>
                            <Construction />
                        </ListItemIcon>
                        <ListItemText
                            primary="Puzzle Designer"
                        />
                    </ListItemButton>
                </ListItem>
            </List>
            <div style={{"flex-grow": 1}} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        component="a"
                        href="https://ko-fi.com/starwort"
                    >
                        <ListItemIcon>
                            <Heart />
                        </ListItemIcon>
                        <ListItemText primary="Donate" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        component="a"
                        href="https://github.com/Starwort/tangleword/"
                    >
                        <ListItemIcon>
                            <GitHub />
                        </ListItemIcon>
                        <ListItemText primary="Repository" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => setThemeColour(
                            themeColour => themeColour == "dark"
                                ? "light" : "dark"
                        )}
                    >
                        <ListItemIcon>
                            <Show when={themeColour() == "dark"} fallback={<DarkMode />}>
                                <LightMode />
                            </Show>
                        </ListItemIcon>
                        <ListItemText
                            primary={themeColour() == "dark"
                                ? "Light theme" : "Dark theme"}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
        <Box
            component="main"
            style={{
                transition: "margin-left 225ms cubic-bezier(0, 0, 0.2, 1)",
                "margin-left": drawerIsPersistent() && persistentDrawerOpen() ? '240px' : '0px',
            }}
            onTransitionStart={() => {
                needAnimationFrame = true;
                runUpdate();
            }}
            onTransitionEnd={() => needAnimationFrame = false}
        >
            <Switch>
                <Match when={page() == "play"}>
                    <Play
                        setError={setError}
                        lastDailySolved={lastDailySolved()}
                        setLastDailySolved={setLastDailySolved}
                        ref={data => {
                            updateAnimationFrame = data.updateAnimationFrame;
                            setExtraButtons(data.toolbarButtons);
                        }}
                        setPage={setPage}
                        query={query}
                    />
                </Match>
                <Match when={page() == "custom"}>
                    <CustomPuzzles
                        setError={setError}
                        setPage={setPage}
                    />
                </Match>
                <Match when={page() == "designer"}>
                    <PuzzleDesigner
                        setError={setError}
                        setPage={setPage}
                        ref={data => {
                            updateAnimationFrame = data.updateAnimationFrame;
                            setExtraButtons(data.toolbarButtons);
                        }}
                    />
                </Match>
            </Switch>
        </Box>
    </ThemeProvider>;
}

