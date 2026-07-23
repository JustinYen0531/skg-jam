// Mara Kade's preserved messaging account. Chapter 8 asks the player to learn
// her life before the damaged Noah thread will surrender its human record.
// Route altitudes other than 184 remain sealed inside the Chapter 9 attachment.

export type MaraArchiveThreadId =
  | 'son'
  | 'clinic'
  | 'pharmacy'
  | 'iris'
  | 'bookclub'
  | 'coworker'
  | 'harbor'
  | 'memo'
  | 'noah';

export type ChapterEightMemoryId =
  | 'window-seat'
  | 'clinic-2019'
  | 'gate-40'
  | 'lookout-184'
  | 'ending-256'
  | 'silver-kite'
  | 'sea-glass'
  | 'lumen-stack';

export type NoahArchiveFragmentId =
  | 'name'
  | 'ending'
  | 'ceiling'
  | 'gate'
  | 'preserver'
  | 'meeting'
  | 'device'
  | 'farewell';

export type MaraMessageStatus = 'deleted' | 'unsent' | 'unavailable' | 'missed-call' | 'voice-lost';

export interface ChapterEightMemory {
  id: ChapterEightMemoryId;
  label: string;
  detail: string;
  source: MaraArchiveThreadId;
}

export interface MaraArchiveMessage {
  from: 'mara' | 'them';
  time: string;
  text?: string;
  status?: MaraMessageStatus;
  note?: string;
  memory?: ChapterEightMemory;
}

export interface MaraArchiveThread {
  id: MaraArchiveThreadId;
  name: string;
  initials: string;
  tint: string;
  era: string;
  preview: string;
  subtitle: string;
  group?: boolean;
  automated?: boolean;
  isCase?: boolean;
  messages: readonly MaraArchiveMessage[];
}

export interface NoahArchiveFragment {
  id: NoahArchiveFragmentId;
  from: 'mara' | 'noah';
  time: string;
  memoryId: ChapterEightMemoryId;
  prompt: string;
  hint: string;
  restoredText: string;
}

const memory = (
  id: ChapterEightMemoryId,
  label: string,
  detail: string,
  source: MaraArchiveThreadId,
): ChapterEightMemory => ({ id, label, detail, source });

// Newest first. Noah remains at the bottom, underneath the years in which Mara
// kept living, forgetting, and trying to preserve what the phone still held.
export const MARA_ARCHIVE_THREADS: readonly MaraArchiveThread[] = [
  {
    id: 'son',
    name: 'My Boy ♡',
    initials: '♡',
    tint: '#2f7d60',
    era: 'Today',
    subtitle: 'saved without a name',
    preview: 'It is always your seat.',
    messages: [
      { from: 'mara', time: 'A winter ago', text: 'Look at you. Taller than the door frame already. Come home before the harbor lights go out.' },
      { from: 'them', time: 'A winter ago', text: 'Next month, I promise. Save me the window seat.' },
      {
        from: 'mara',
        time: 'A winter ago',
        text: 'It is always your window seat. It has your name on it, even the days I forget to write it.',
        memory: memory('window-seat', 'THE WINDOW SEAT', 'Mara always kept the window seat for her son.', 'son'),
      },
      { from: 'mara', time: 'One spring', text: 'I made far too much soup again. Old habit — cooking for a big family that already left the table.' },
      { from: 'them', time: 'Later', text: 'You called at 3am. Everything okay?' },
      { from: 'mara', time: 'Later', text: 'Did I? The phone keeps things I do not. So do I, a little, lately.' },
      { from: 'mara', time: 'Last year', status: 'missed-call', note: 'Called 3 times' },
      { from: 'mara', time: 'Today · 11:22', text: 'Hello Noah… oh sorry, my dear, I mean my sweet boy.' },
      { from: 'mara', time: 'Today · 11:40', text: 'sweetheart did you eat' },
    ],
  },
  {
    id: 'clinic',
    name: 'Harbor Memory Clinic',
    initials: 'HM',
    tint: '#3c8fb0',
    era: 'Thu',
    automated: true,
    subtitle: 'Dr. Halvorsen · automated reminders',
    preview: 'Reminder: cognitive review Thu 10:00.',
    messages: [
      {
        from: 'them',
        time: '2019',
        text: 'Welcome to Harbor Memory Clinic. First cognitive review: 2019.',
        memory: memory('clinic-2019', 'FIRST REVIEW · 2019', 'Mara first visited the memory clinic in 2019.', 'clinic'),
      },
      { from: 'mara', time: '2019', text: 'Though I suspect this is a waste of a very nice doctor’s morning.' },
      { from: 'them', time: '2021', text: 'Please bring a family member if you can.' },
      { from: 'mara', time: '2021', text: 'I do not need a chaperone to answer questions about my own life.' },
      { from: 'them', time: '2023', text: 'Please bring a family member if you can.' },
      { from: 'mara', time: '2023', text: 'Who moved the appointment? Was it me?' },
    ],
  },
  {
    id: 'pharmacy',
    name: 'Bayside Pharmacy',
    initials: 'RX',
    tint: '#5a9e6f',
    era: 'Tue',
    automated: true,
    subtitle: 'Automated · prescriptions',
    preview: 'Pickup moved beside the old station.',
    messages: [
      { from: 'them', time: 'Ongoing', text: 'Your memory-support prescription is ready for pickup.' },
      {
        from: 'mara',
        time: 'Ongoing',
        text: 'Not the new entrance. Leave it beside the old station gate — Gate 40. I remember that one.',
        memory: memory('gate-40', 'OLD STATION GATE · 40', 'Mara anchored the old station gate to the number 40.', 'pharmacy'),
      },
      { from: 'them', time: 'Ongoing', text: 'Location note saved. A family member may collect on your behalf.' },
    ],
  },
  {
    id: 'iris',
    name: 'Iris',
    initials: 'IR',
    tint: '#b06bd6',
    era: '2023',
    subtitle: 'sister',
    preview: 'Tell Noah the blue scarf turned up.',
    messages: [
      { from: 'them', time: '2014 · Apr', text: 'Launch day! Tell Noah the whole harbor is proud of him. Even the seagulls.' },
      { from: 'mara', time: '2014 · Apr', text: 'He has not slept in three days and he is grinning like a boy.' },
      { from: 'them', time: '2014 · Jun', text: 'Kite fair Saturday? I told them you would run the folding table.' },
      { from: 'mara', time: '2014 · Jun', text: 'Hundreds of paper kites. My fingers have formally resigned. Bring the good tea.' },
      {
        from: 'mara',
        time: '2016 · Sep',
        text: 'Always the harbor lookout. 184 old stone steps, and the whole city holds still.',
        memory: memory('lookout-184', 'HARBOR LOOKOUT · 184', 'Mara counted 184 steps to the harbor lookout.', 'iris'),
      },
      { from: 'them', time: '2023 · Aug', text: 'Mara. It is Iris. Noah has been gone a long while now, sweetheart.' },
      { from: 'mara', time: '2023 · Aug', text: 'Of course. I knew that. Which day were we saying?' },
    ],
  },
  {
    id: 'bookclub',
    name: 'Harbor Book Club',
    initials: 'BC',
    tint: '#c98a3c',
    era: '2024',
    group: true,
    subtitle: 'Group · 9 readers',
    preview: 'We saved your chair again, Mara.',
    messages: [
      { from: 'them', time: '2014', text: 'Mara, defend your pick. Why is page 256 the best ending on the whole shelf?' },
      {
        from: 'mara',
        time: '2014',
        text: 'Page 256. Everyone finally chooses to go home. No twist, no trick. Just the door, left open.',
        memory: memory('ending-256', 'THE OPEN DOOR · PAGE 256', 'Mara believed an ending was a gift: everyone could choose to go home.', 'bookclub'),
      },
      { from: 'mara', time: '2018', text: 'Bring the ones who cry at endings. Those are my people.' },
      { from: 'them', time: '2022', text: 'We saved your chair again. Same corner, near the window.' },
      { from: 'them', time: '2024', text: 'We saved your chair again, Mara.' },
    ],
  },
  {
    id: 'coworker',
    name: 'June · old studio',
    initials: 'JM',
    tint: '#7c6fd1',
    era: '2017',
    subtitle: 'former Silver Kite producer',
    preview: 'It was your name before it was the company’s.',
    messages: [
      { from: 'them', time: '2012', text: 'Elias still wants something that sounds scalable. Noah wants something honest.' },
      { from: 'mara', time: '2012', text: 'Then he can be honest under my ridiculous name.' },
      {
        from: 'them',
        time: '2012',
        text: 'Silver Kite. Yours from the harbor fair, before it was ever a studio. I remember.',
        memory: memory('silver-kite', 'SILVER KITE', 'Mara named the studio after the harbor kite fair.', 'coworker'),
      },
      { from: 'them', time: '2014', text: 'Elias calls endings poor retention. Noah has not spoken to him all morning.' },
      { from: 'mara', time: '2014', text: 'An audience staying forever is not the same as an audience being given somewhere to arrive.' },
    ],
  },
  {
    id: 'harbor',
    name: 'Low Tide Circle',
    initials: 'LT',
    tint: '#438f91',
    era: '2018',
    group: true,
    subtitle: 'Harbor neighbors · 6 people',
    preview: 'Low tide returned the blue pieces.',
    messages: [
      { from: 'them', time: '2012', text: 'Kite fair cleanup at six. Someone left a whole tin of good tea.' },
      { from: 'mara', time: '2012', text: 'Mine. Noah knocked it over while trying to explain collision boxes. That was our first conversation.' },
      {
        from: 'mara',
        time: '2018',
        text: 'Low tide returned three pieces of sea glass. I keep what the water gives back.',
        memory: memory('sea-glass', 'SEA GLASS', 'Mara kept sea glass because the tide had returned it.', 'harbor'),
      },
      { from: 'them', time: '2018', text: 'You keep everything.' },
      { from: 'mara', time: '2018', text: 'Not everything. Only what might otherwise disappear.' },
    ],
  },
  {
    id: 'memo',
    name: 'Notes to myself',
    initials: 'ME',
    tint: '#8f7650',
    era: '2020',
    subtitle: 'private · device backup',
    preview: 'Things that must not be thrown away.',
    messages: [
      { from: 'mara', time: '2014', text: 'Tea. Soup onions. Call Iris. Change the archive password after migration.' },
      {
        from: 'mara',
        time: '2014',
        text: 'DO NOT RETURN THE LUMEN ARC STACK. Bought every recalled unit I could. One is for our child.',
        memory: memory('lumen-stack', 'THE LUMEN ARC STACK', 'Mara secretly kept the recalled devices, including one for her future son.', 'memo'),
      },
      { from: 'mara', time: '2016', text: 'SEC_PARTNER copy remains offline. Store beside the blue scarf.' },
      { from: 'mara', time: '2020', status: 'deleted', note: 'Mara deleted this reminder' },
      { from: 'mara', time: '2020', text: 'If I ask why: because a thing can still matter after everyone stops selling it.' },
    ],
  },
  {
    id: 'noah',
    name: 'Noah',
    initials: 'NK',
    tint: '#c96f5a',
    era: '2014',
    isCase: true,
    subtitle: 'Silver Kite Games · damaged private record',
    preview: '8 damaged messages · human record incomplete',
    messages: [],
  },
] as const;

export const NOAH_ARCHIVE_FRAGMENTS: readonly NoahArchiveFragment[] = [
  {
    id: 'name',
    from: 'noah',
    time: '2012-03-17 18:42',
    memoryId: 'silver-kite',
    prompt: 'What name existed before the company?',
    hint: 'A former coworker remembered the harbor fair.',
    restoredText: 'Silver Kite was your name first. Elias can put it on a pitch deck, but he cannot make it his.',
  },
  {
    id: 'ending',
    from: 'mara',
    time: '2013-08-04 23:06',
    memoryId: 'ending-256',
    prompt: 'Which memory explains why an ending must remain?',
    hint: 'The book club kept defending one final page.',
    restoredText: 'An ending is a gift, Noah. Leave the door open. Let people choose to go home.',
  },
  {
    id: 'ceiling',
    from: 'noah',
    time: '2013-08-04 23:09',
    memoryId: 'lookout-184',
    prompt: 'Which place became the honest human ceiling?',
    hint: 'Iris remembered the number of old stone steps.',
    restoredText: 'Then 184 will be the honest human ceiling. Not my signature — just the furthest a person can reach without the hidden route.',
  },
  {
    id: 'gate',
    from: 'noah',
    time: '2014-04-20 22:15',
    memoryId: 'gate-40',
    prompt: 'Which gate did the automation preserve without its key?',
    hint: 'The pharmacy pickup note used an older station entrance.',
    restoredText: 'I left Gate 40 as a deliberate structural lock. The automation scraper will keep the collision, but it cannot understand the old sensor key. It will preserve the door as a wall.',
  },
  {
    id: 'preserver',
    from: 'mara',
    time: '2014-04-20 22:18',
    memoryId: 'clinic-2019',
    prompt: 'Which date verifies that this later backup still belonged to Mara?',
    hint: 'The clinic recorded the first review year.',
    restoredText: 'Give the archive to me. SEC_PARTNER was never a ceremonial account. I kept the ledgers, passwords, builds, and the things everyone else called obsolete.',
  },
  {
    id: 'meeting',
    from: 'noah',
    time: '2014-04-20 22:21',
    memoryId: 'sea-glass',
    prompt: 'What did Mara keep because the tide returned it?',
    hint: 'The harbor neighbors knew what she collected at low tide.',
    restoredText: 'You kept the sea glass. You kept the first bad build. You kept me after I spilled your tea at the kite fair. Maybe preservation was always your work.',
  },
  {
    id: 'device',
    from: 'mara',
    time: '2014-04-20 22:24',
    memoryId: 'lumen-stack',
    prompt: 'What did Mara hide from the recall?',
    hint: 'Her private memo used capital letters for one thing.',
    restoredText: 'I bought the recalled Lumen Arcs. A ridiculous stack of them. I kept one unopened for the child we have not met yet.',
  },
  {
    id: 'farewell',
    from: 'noah',
    time: '2014-04-20 22:27',
    memoryId: 'window-seat',
    prompt: 'Which place did Mara promise would always remain?',
    hint: 'Her son asked her to save one seat.',
    restoredText: 'If he finds this, do not give him the answer. Keep him a place beside the window. I left the heights in a separate attachment so he can walk the route himself.',
  },
] as const;

export const CHAPTER_EIGHT_MEMORY_IDS = MARA_ARCHIVE_THREADS.flatMap((thread) =>
  thread.messages.flatMap((message) => message.memory ? [message.memory.id] : []),
);

export const getMaraArchiveThread = (id: MaraArchiveThreadId): MaraArchiveThread | undefined =>
  MARA_ARCHIVE_THREADS.find((thread) => thread.id === id);

export const getChapterEightMemory = (id: ChapterEightMemoryId): ChapterEightMemory | undefined =>
  MARA_ARCHIVE_THREADS.flatMap((thread) => thread.messages)
    .map((message) => message.memory)
    .find((entry): entry is ChapterEightMemory => entry?.id === id);

export const getNoahArchiveFragment = (id: NoahArchiveFragmentId): NoahArchiveFragment | undefined =>
  NOAH_ARCHIVE_FRAGMENTS.find((fragment) => fragment.id === id);

export const addUniqueChapterEightId = <T extends string>(ids: readonly T[], id: T): readonly T[] =>
  ids.includes(id) ? ids : [...ids, id];

export const isCorrectNoahMemory = (
  fragmentId: NoahArchiveFragmentId,
  memoryId: ChapterEightMemoryId,
): boolean => getNoahArchiveFragment(fragmentId)?.memoryId === memoryId;

export const hasRestoredAllNoahFragments = (ids: readonly string[]): boolean =>
  NOAH_ARCHIVE_FRAGMENTS.every((fragment) => ids.includes(fragment.id));
