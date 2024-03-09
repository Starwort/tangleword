import {EXCLAMATION, BODY_PART, EXCELLENT, VERB, ANNOYANCE, TOOL, ANIMAL, TRANSPORT, FOOD, FURNITURE, PRONOUN, LOCATION, ADJECTIVE, CLOTHES, MALE_NAME, HELP, FEMALE_NAME, INSECT, ANIMAL_NOISE, OBJECT, FISH, TREE, BIRD, ILLNESS, COUNTRY, CREATURE, MUSIC, DRINK, NUMBER, UTENSIL, MOUNTAIN, BOAT, SNAKE, GEOGRAPHICAL_FEATURE, TIME, UNIT, NAME, GREEK_LETTER, GOVT_AGENCY, LETTER, AFFIRMATIVE, SHAPE, HESITATION, EMOTION, PERSON, MONTH, DIRT, NEGATIVE, POEM, COLOUR, RIVER, METAL, FUEL, WEATHER, UNTRUTH, NOISE, PARENT, COMPUTER_TERM, HONORIFIC} from './dictionary';
export const REVERSE_DICTIONARY: Record<string, string[]> = {
    [EXCLAMATION]: ['aah', 'ach', 'aha', 'bah', 'bam', 'boo', 'brr', 'doh', 'fie', 'heh', 'hey', 'hmm', 'huh', 'ick', 'meh', 'mmm', 'och', 'oof', 'ooh', 'shh', 'tsk', 'tut', 'ugh', 'wow', 'yah'],
    [BODY_PART]: ['abs', 'arm', 'bum', 'ear', 'eye', 'fin', 'gut', 'hip', 'jaw', 'leg', 'lip', 'maw', 'ova', 'paw', 'pus', 'rib', 'toe'],
    [EXCELLENT]: ['ace'],
    [VERB]: ['act', 'add', 'aim', 'ask', 'ate', 'beg', 'bet', 'bid', 'buy', 'cry', 'cue', 'did', 'die', 'dig', 'dox', 'dug', 'eat', 'err', 'fix', 'fry', 'gag', 'get', 'got', 'had', 'hew', 'hid', 'hie', 'hit', 'hop', 'hug', 'hum', 'jab', 'jag', 'jam', 'jig', 'jog', 'jot', 'lay', 'mix', 'mow', 'nab', 'nag', 'nap', 'nip', 'opt', 'owe', 'own', 'pay', 'pop', 'pry', 'ram', 'rap', 'rid', 'rip', 'rob', 'rot', 'row', 'rub', 'rue', 'run', 'sag', 'sat', 'say', 'see', 'set', 'sew', 'sin', 'ski', 'sob', 'tow', 'try', 'tug', 'use', 'vex', 'vie', 'wag', 'was'],
    [ANNOYANCE]: ['ads', 'grr'],
    [TOOL]: ['adz', 'axe', 'fob', 'gun', 'hoe', 'map', 'mop', 'net', 'oar', 'peg', 'pen', 'rod', 'saw', 'vac'],
    [ANIMAL]: ['ape', 'bat', 'bug', 'cat', 'cow', 'cub', 'doe', 'dog', 'eft', 'elk', 'ewe', 'fly', 'fox', 'gnu', 'hog', 'mog', 'pet', 'pig', 'pug', 'pup', 'ram', 'rat', 'roo', 'sow', 'tup', 'yak'],
    [TRANSPORT]: ['bus', 'cab', 'car', 'ute', 'van'],
    [FOOD]: ['bap', 'bun', 'cob', 'cos', 'dip', 'egg', 'fig', 'gum', 'ham', 'ice', 'jam', 'lox', 'nut', 'oat', 'oil', 'oxo', 'pea', 'pho', 'pie', 'rye', 'soy', 'veg', 'yam'],
    [FURNITURE]: ['bed', 'bin', 'cot', 'mat'],
    [PRONOUN]: ['her', 'him', 'his', 'our', 'she', 'thy', 'who', 'you'],
    [LOCATION]: ['bar', 'bay', 'bog', 'gym', 'hub', 'hut', 'inn', 'pub', 'rio', 'sea', 'spa', 'sty', 'uni', 'vet', 'zoo'],
    [ADJECTIVE]: ['bad', 'big', 'cis', 'coy', 'dim', 'fat', 'fit', 'het', 'icy', 'lax', 'low', 'odd', 'raw', 'shy', 'sly', 'wet'],
    [CLOTHES]: ['bow', 'bra', 'cap', 'fez', 'fur', 'hat', 'hem', 'lei', 'tie', 'tux', 'wig', 'zip'],
    [MALE_NAME]: ['ben', 'bez', 'bob', 'bud', 'cam', 'dan', 'dex', 'dom', 'ern', 'gus', 'guy', 'job', 'joe', 'ken', 'max', 'ned', 'ray', 'rex', 'ron', 'ted', 'tod', 'tom'],
    [HELP]: ['aid'],
    [FEMALE_NAME]: ['ann', 'bel', 'deb', 'ivy', 'mae', 'meg', 'mel', 'mia', 'pam', 'sue'],
    [INSECT]: ['ant', 'bee'],
    [ANIMAL_NOISE]: ['baa', 'caw', 'mew', 'moo', 'yap'],
    [OBJECT]: ['box', 'keg', 'tee', 'toy', 'tub', 'urn'],
    [FISH]: ['cod', 'eel', 'koi', 'roe'],
    [TREE]: ['ash', 'elm', 'fir', 'koa', 'oak', 'sap', 'yew'],
    [BIRD]: ['auk', 'emu', 'hen', 'jay', 'kea', 'moa', 'owl', 'rug', 'tit'],
    [ILLNESS]: ['flu', 'ill', 'pox'],
    [COUNTRY]: ['goa'],
    [CREATURE]: ['elf', 'fae', 'fay', 'fey', 'god', 'hag', 'imp', 'jin', 'orc'],
    [MUSIC]: ['bar', 'jam', 'rap', 'sax', 'ska'],
    [DRINK]: ['ale', 'rum', 'sip', 'tea'],
    [NUMBER]: ['few', 'one', 'six', 'sum', 'ten', 'twa', 'two'],
    [UTENSIL]: ['awl', 'jar', 'jug', 'mug', 'pan', 'pot', 'wok'],
    [MOUNTAIN]: ['alp'],
    [BOAT]: ['ark'],
    [SNAKE]: ['asp', 'boa'],
    [GEOGRAPHICAL_FEATURE]: ['cwm', 'dam', 'fen', 'lea', 'ley', 'sky', 'sun'],
    [TIME]: ['age', 'ago', 'day', 'eon', 'era', 'eve', 'min', 'now'],
    [UNIT]: ['amp', 'erg', 'mil', 'ohm'],
    [NAME]: ['ana', 'kay', 'pat', 'sam'],
    [GREEK_LETTER]: ['chi', 'eta', 'khi', 'phi', 'psi', 'rho'],
    [GOVT_AGENCY]: ['cia', 'fbi', 'nhs'],
    [LETTER]: ['cee', 'dee', 'eff', 'ess', 'eth', 'vee', 'zed', 'zee'],
    [AFFIRMATIVE]: ['aye', 'yea', 'yep', 'yes', 'yup', 'yus'],
    [SHAPE]: ['arc', 'orb'],
    [HESITATION]: ['erm', 'umm'],
    [EMOTION]: ['ire', 'joy', 'mad', 'sad'],
    [PERSON]: ['boy', 'foe', 'fop', 'gal', 'guv', 'kid', 'lad', 'man', 'men', 'nun', 'oik', 'poe', 'sis', 'spy'],
    [MONTH]: ['apr', 'aug', 'dec', 'feb', 'jan', 'jul', 'jun', 'mar', 'may', 'nov', 'oct', 'sep'],
    [DIRT]: ['mud'],
    [NEGATIVE]: ['nae', 'nah', 'naw', 'nay', 'neg', 'nil'],
    [POEM]: ['ode'],
    [COLOUR]: ['dye', 'hue', 'ink', 'red'],
    [RIVER]: ['tay'],
    [METAL]: ['tin'],
    [FUEL]: ['gas'],
    [WEATHER]: ['fog'],
    [UNTRUTH]: ['fib', 'lie'],
    [NOISE]: ['pow'],
    [PARENT]: ['dad', 'mam', 'mom', 'mum'],
    [COMPUTER_TERM]: ['bit', 'dos', 'ios', 'rom'],
    [HONORIFIC]: ['mrs', 'rev', 'sir'],
};