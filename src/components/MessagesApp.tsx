import React, { useEffect, useRef, useState } from 'react';
import { GameProgress, ChatMessage } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { isSellerCodeAccepted, type AmazeMartOrderPhase } from '../lib/amazemartPuzzle';
import { useMetaInteraction } from './MetaInteractionScene';
import { CHAPTER_THREE_DIALOGUE, getChapterThreeSellerCodeResponse } from '../lib/chapterThreeDialogue';
import { Check, ChevronLeft, ChevronRight, KeyRound, LockKeyhole, MessageCircle, MicOff, PhoneMissed, Send, ShieldAlert, Trash2, UserCircle2, Users } from 'lucide-react';
import {
  hasAllMaraNumberClues,
  isMaraCoordinateMappingCorrect,
  MARA_COLLECTIBLE_NUMBERS,
  type MaraCoordinateMapping,
  type MaraNumberClue,
} from '../lib/chapterSevenSocial';
import {
  MARA_ARCHIVE_THREADS,
  NOAH_ARCHIVE_FRAGMENTS,
  addUniqueChapterEightId,
  getChapterEightMemory,
  getMaraArchiveThread,
  getNoahArchiveFragment,
  hasRestoredAllNoahFragments,
  isCorrectNoahMemory,
  type ChapterEightMemoryId,
  type MaraArchiveMessage,
  type MaraArchiveThreadId,
  type NoahArchiveFragmentId,
} from '../lib/chapterEightArchive';
import {
  CHAPTER_SEVEN_DIALOGUE,
  getChapterSevenLoginDialogue,
} from '../lib/chapterSevenDialogue';
import {
  CHAPTER_EIGHT_DIALOGUE,
  getChapterEightFragmentRestoredDialogue,
  getChapterEightMemoryDialogue,
  getChapterEightMemorySelectionDialogue,
  getChapterEightThreadDialogue,
} from '../lib/chapterEightDialogue';

interface MessagesAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  chapterThreeOrderPhase: AmazeMartOrderPhase;
  onSellerVerified: () => void;
  developerPreview?: boolean;
}

// The player's own account holds a whole ordinary life of threads. Only two of
// them matter to the case; the rest are the texture of a real phone — a friend,
// a delivery, a building group, the bank. The Silver Kite archive is not a
// thread here at all: it is a second account, reached from the corner switcher.
type ThreadId = 'mom' | 'seller' | 'jules' | 'noodle' | 'apt' | 'bank' | 'dentist' | 'spam';
type Account = 'me' | 'silverkite';

interface DecoyThread {
  id: Exclude<ThreadId, 'mom' | 'seller'>;
  name: string;
  initials: string;
  tint: string;
  time: string;
  preview: string;
  automated?: boolean;
  group?: boolean;
  messages: readonly { from: 'them' | 'me'; text: string; time: string }[];
}

// Everyday decoy conversations. Readable, inert, and deliberately mundane — they
// exist so the two threads that matter aren't the only things in the app.
const DECOY_THREADS: readonly DecoyThread[] = [
  {
    id: 'jules', name: 'Jules R.', initials: 'JR', tint: '#6366f1', time: 'Tue',
    preview: 'perfect. bringing the projector',
    messages: [
      { from: 'them', text: 'still on for saturday?', time: 'Tue 19:02' },
      { from: 'me', text: 'yeah, 8ish. my place', time: 'Tue 19:14' },
      { from: 'them', text: 'perfect. bringing the projector', time: 'Tue 19:15' },
      { from: 'me', text: 'the one that overheats?', time: 'Tue 19:16' },
      { from: 'them', text: 'it has character', time: 'Tue 19:16' },
    ],
  },
  {
    id: 'noodle', name: 'Noodle Express', initials: 'NE', tint: '#f59e0b', time: 'Mon', automated: true,
    preview: 'Your order is 2 stops away 🛵',
    messages: [
      { from: 'them', text: 'Order #4471 confirmed — Cold sesame noodles ×1', time: 'Mon 12:40' },
      { from: 'them', text: 'Your rider is on the way!', time: 'Mon 12:58' },
      { from: 'them', text: 'Your order is 2 stops away 🛵', time: 'Mon 13:07' },
    ],
  },
  {
    id: 'apt', name: 'Apt 4B', initials: '4B', tint: '#10b981', time: 'Mon', group: true,
    preview: "someone's car is blocking the bins again",
    messages: [
      { from: 'them', text: 'did anyone take the recycling out', time: 'Mon 08:11' },
      { from: 'them', text: "someone's car is blocking the bins again", time: 'Mon 08:12' },
      { from: 'me', text: 'not mine, I walk', time: 'Mon 08:30' },
    ],
  },
  {
    id: 'bank', name: 'Harborview Bank', initials: 'HB', tint: '#0ea5e9', time: 'Mon', automated: true,
    preview: 'Card ••6411: $4.20 at NOODLE EXPRESS',
    messages: [
      { from: 'them', text: 'Card ••6411: $4.20 at NOODLE EXPRESS. Not you? Reply STOP.', time: 'Mon 13:15' },
      { from: 'them', text: 'Card ••6411: $1.84 at AMAZEMART. Not you? Reply STOP.', time: 'Yesterday 17:04' },
    ],
  },
  {
    id: 'dentist', name: 'Bright Smile Dental', initials: 'BS', tint: '#14b8a6', time: 'Sun', automated: true,
    preview: 'Reminder: cleaning Thu 3:00 PM',
    messages: [
      { from: 'them', text: 'Reminder: cleaning Thu 3:00 PM. Reply C to confirm.', time: 'Sun 09:00' },
    ],
  },
  {
    id: 'spam', name: '+1 (555) 0102', initials: '?', tint: '#71717a', time: 'Sun',
    preview: 'CONGRATULATIONS you have been selected…',
    messages: [
      { from: 'them', text: 'CONGRATULATIONS you have been selected for a complimentary device upgrade. Tap here: bit.example/win', time: 'Sun 04:12' },
    ],
  },
];

/**
 * A perfectly ordinary modern messaging client — a full contact list, most of
 * it noise. Two threads carry the case. A second, archived account, reached
 * from the corner switcher, is where the old system takes over: cold, square,
 * patient, slightly slow to answer.
 */
export const MessagesApp: React.FC<MessagesAppProps> = ({
  progress,
  updateProgress,
  chapterThreeOrderPhase,
  onSellerVerified,
  developerPreview = false,
}) => {
  const metaInteraction = useMetaInteraction();
  const [account, setAccount] = useState<Account>('me');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<ThreadId | null>(
    chapterThreeOrderPhase === 'verification-requested' ? 'seller' : null,
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [momMappingRead, setMomMappingRead] = useState(false);
  const [coordinateMapping, setCoordinateMapping] = useState<MaraCoordinateMapping>({
    altitude: null,
    gate: null,
    end: null,
  });
  const [mappingError, setMappingError] = useState('');
  const [sellerCode, setSellerCode] = useState('');
  const [sellerCodeError, setSellerCodeError] = useState('');
  // Which of Mara's own conversations is open, once you are inside her account.
  const [archiveThread, setArchiveThread] = useState<MaraArchiveThreadId | null>(null);
  const [activeNoahFragment, setActiveNoahFragment] = useState<NoahArchiveFragmentId | null>(null);
  const [noahRestoreError, setNoahRestoreError] = useState('');
  const memoryRepeatAttempts = useRef(new Map<ChapterEightMemoryId, number>());
  const noahFailureAttempts = useRef(new Map<NoahArchiveFragmentId, number>());
  const firstNoahFragmentSpoken = useRef(false);

  const sellerThreadAvailable = chapterThreeOrderPhase !== 'idle';

  // Modern chat messages with Mother (Mara)
  const momMessages: ChatMessage[] = [
    {
      sender: 'mom',
      time: '11:22 AM',
      content: 'Hello Noah... oh sorry, my dear, I mean my sweet boy. Did you find what you were looking for?',
    },
    {
      sender: 'me',
      time: '11:23 AM',
      content: 'I found the old Silver Kite pages. And your FaceSpace profile.',
    },
    {
      sender: 'mom',
      time: '11:24 AM',
      content: 'Those little places mattered to me. I used them when I needed numbers I would not forget.',
    }
  ];

  if (hasAllMaraNumberClues(progress)) {
    momMessages.push(
      { sender: 'me', time: '11:25 AM', content: 'I found three of them. The harbor lookout, the old terminal gate, and the ending of your book.' },
      { sender: 'mom', time: '11:26 AM', content: 'Then they were mine, not your father\'s. Numbers are not passwords by themselves, dear. They are places. The old login asked for altitude, gate, and end—in that order.' },
      { sender: 'mom', time: '11:27 AM', content: 'My memory wanders, but the Silver Kite archive should still recognize the path if you label each number correctly.' },
    );
  }

  const speakChapterSeven = (lines: readonly string[]) => {
    if (progress.currentChapter === 7 && metaInteraction.active) metaInteraction.speak(lines);
  };

  const speakChapterEight = (lines: readonly string[]) => {
    if (progress.currentChapter === 8 && metaInteraction.active) metaInteraction.speak(lines);
  };

  const allMaraNumbersCollected = hasAllMaraNumberClues(progress);
  const collectionRequired = !developerPreview && !allMaraNumbersCollected;
  const mappingRequired = !developerPreview && allMaraNumbersCollected && !progress.unlockedAdminLogin;

  const handleCoordinateSelection = (label: MaraNumberClue, value: string) => {
    setCoordinateMapping((current) => ({
      ...current,
      [label]: value ? Number(value) : null,
    }));
    setMappingError('');
  };

  const handleAdminSubmit = (event: React.FormEvent) => {
    if (!mappingRequired) {
      handleAdminLogin(event);
      return;
    }

    event.preventDefault();
    if (!isMaraCoordinateMappingCorrect(coordinateMapping)) {
      audio.play('auth.wrong');
      setMappingError('COORDINATE LABELS DO NOT MATCH THE COLLECTED MEMORIES.');
      speakChapterSeven(CHAPTER_SEVEN_DIALOGUE.mappingRejected);
      return;
    }

    audio.play('auth.correct');
    setMappingError('');
    setMomMappingRead(true);
    updateProgress((previous) => previous.currentChapter === 7
      ? { ...previous, discoveredNoahQA: true, unlockedAdminLogin: true }
      : previous);
    speakChapterSeven(CHAPTER_SEVEN_DIALOGUE.mappingCompleted);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    audio.play('key.enter');

    const formattedInput = passwordInput.toUpperCase().replace(/\s+/g, '');

    if (!formattedInput) {
      audio.play('auth.wrong');
      setLoginError('COORDINATE STRING REQUIRED. THE NODE HAS WAITED TWELVE YEARS. IT CAN WAIT LONGER.');
      speakChapterSeven(getChapterSevenLoginDialogue(passwordInput, hasAllMaraNumberClues(progress), momMappingRead, failCount));
      return;
    }

    if (formattedInput === 'ALT184GATE40END256' && !developerPreview && !canUseProgressionAction('admin-login', progress)) {
      audio.play('auth.wrong');
      setLoginError('NICE TRY, TIME TRAVELER. FIND THE CLUES BEFORE THE PASSWORD FINDS YOU.');
      speakChapterSeven(getChapterSevenLoginDialogue(passwordInput, false, momMappingRead, failCount));
      return;
    }

    if (formattedInput === 'ALT184GATE40END256') {
      audio.play('auth.correct');
      setLoginError('');
      setFailCount(0);
      updateProgress((prev) => completePuzzleChapter(prev, 7, { unlockedAdminLogin: true, loggedIntoAdmin: true }));
      speakChapterSeven(CHAPTER_SEVEN_DIALOGUE.completed);
    } else {
      audio.play('auth.wrong');
      const nextFails = failCount + 1;
      setFailCount(nextFails);
      setLoginError(nextFails >= 3
        ? 'HINT WITHHELD. HE LEFT THIS FOR SOMEONE WHO WALKS THE PATH, NOT SOMEONE WHO GUESSES IT.'
        : 'CREDENTIALS REJECTED. ENSURE ALTITUDE, GATE, AND END VALUES ARE PROPERLY SEQUENCE-PAIRED.');
      speakChapterSeven(getChapterSevenLoginDialogue(passwordInput, hasAllMaraNumberClues(progress), momMappingRead, nextFails));
    }
  };

  const collectedChapterEightMemories = progress.chapterEightMemoryIds ?? [];
  const restoredNoahMessages = progress.chapterEightRestoredMessageIds ?? [];
  const allNoahMessagesRestored = hasRestoredAllNoahFragments(restoredNoahMessages);

  const handleCollectChapterEightMemory = (memoryId: ChapterEightMemoryId) => {
    const alreadyCollected = collectedChapterEightMemories.includes(memoryId);
    audio.play(alreadyCollected ? 'phone.tab' : 'auth.correct');
    if (alreadyCollected) {
      const attempt = memoryRepeatAttempts.current.get(memoryId) ?? 0;
      memoryRepeatAttempts.current.set(memoryId, attempt + 1);
      speakChapterEight(getChapterEightMemoryDialogue(memoryId, true, attempt));
      return;
    }
    speakChapterEight(getChapterEightMemoryDialogue(memoryId));
    if (collectedChapterEightMemories.length === 7) {
      speakChapterEight(CHAPTER_EIGHT_DIALOGUE.allMemoriesCollected);
    }
    updateProgress((previous) => previous.currentChapter === 8
      ? {
          ...previous,
          chapterEightMemoryIds: [...addUniqueChapterEightId(
            previous.chapterEightMemoryIds ?? [],
            memoryId,
          )],
        }
      : previous);
  };

  const handleOpenArchiveThread = () => {
    audio.play('phone.tab');
    setArchiveThread('noah');
    setActiveNoahFragment(null);
    setNoahRestoreError('');
    speakChapterEight(collectedChapterEightMemories.length === 0
      ? CHAPTER_EIGHT_DIALOGUE.noahOpenedTooEarly
      : CHAPTER_EIGHT_DIALOGUE.firstNoahFragment);
  };

  const handleOpenNoahFragment = (fragmentId: NoahArchiveFragmentId) => {
    audio.play('phone.tab');
    setActiveNoahFragment(fragmentId);
    setNoahRestoreError('');
    if (!firstNoahFragmentSpoken.current) {
      firstNoahFragmentSpoken.current = true;
      speakChapterEight(CHAPTER_EIGHT_DIALOGUE.firstNoahFragment);
    }
  };

  const handleRestoreNoahFragment = (memoryId: ChapterEightMemoryId) => {
    if (!activeNoahFragment) return;
    const fragment = getNoahArchiveFragment(activeNoahFragment);
    if (!fragment || !isCorrectNoahMemory(activeNoahFragment, memoryId)) {
      audio.play('auth.wrong');
      const failureCount = noahFailureAttempts.current.get(activeNoahFragment) ?? 0;
      noahFailureAttempts.current.set(activeNoahFragment, failureCount + 1);
      setNoahRestoreError(fragment?.hint ?? 'This memory belongs somewhere else.');
      speakChapterEight(getChapterEightMemorySelectionDialogue(
        activeNoahFragment,
        memoryId,
        false,
        failureCount,
      ));
      return;
    }

    audio.play('auth.correct');
    speakChapterEight(getChapterEightFragmentRestoredDialogue(activeNoahFragment));
    if (restoredNoahMessages.length === NOAH_ARCHIVE_FRAGMENTS.length - 1) {
      speakChapterEight([
        ...CHAPTER_EIGHT_DIALOGUE.allFragmentsRestored,
        ...CHAPTER_EIGHT_DIALOGUE.chapterNineAttachmentLocked,
      ]);
    }
    updateProgress((previous) => previous.currentChapter === 8
      ? {
          ...previous,
          chapterEightRestoredMessageIds: [...addUniqueChapterEightId(
            previous.chapterEightRestoredMessageIds ?? [],
            activeNoahFragment,
          )],
        }
      : previous);
    setActiveNoahFragment(null);
    setNoahRestoreError('');
  };

  const handleCompleteChapterEight = () => {
    if (!allNoahMessagesRestored) return;
    audio.playUnlock();
    updateProgress((prev) => completePuzzleChapter(prev, 8));
  };

  const handleRecoverRoute = () => {
    audio.playSuccess();
    updateProgress((prev) => completePuzzleChapter(prev, 9, { unlockedCodeRoute: true }));
  };

  const verifySellerCode = () => {
    const response = getChapterThreeSellerCodeResponse(sellerCode);
    if (progress.currentChapter === 3 && metaInteraction.active) metaInteraction.speak(response.lines);
    if (isSellerCodeAccepted(sellerCode)) {
      setSellerCodeError('');
      onSellerVerified();
      audio.play('amazemart.delivery');
      if (progress.currentChapter === 3 && metaInteraction.active) {
        metaInteraction.speak([...response.lines, ...CHAPTER_THREE_DIALOGUE.sellerMatched]);
      }
      return;
    }

    audio.playGlitch();
    setSellerCodeError('MISMATCH. Use the score attached to the impossible run.');
  };

  const handleSellerVerification = (event: React.FormEvent) => {
    event.preventDefault();
    verifySellerCode();
  };

  const openThread = (id: ThreadId) => {
    audio.play('phone.tab');
    setAccountMenuOpen(false);
    setActiveThread(id);
    if (id === 'mom') {
      // She notices you looking, and starts — then stops (§4.7).
      audio.play('messages.typing', { delay: 1.1 });
      const mappingAvailable = hasAllMaraNumberClues(progress);
      setMomMappingRead(mappingAvailable);
      speakChapterSeven(mappingAvailable
        ? CHAPTER_SEVEN_DIALOGUE.momMappingRead
        : CHAPTER_SEVEN_DIALOGUE.momPlacesRead);
    }
    if (id === 'seller' && progress.currentChapter === 3 && metaInteraction.active) {
      metaInteraction.speak(CHAPTER_THREE_DIALOGUE.sellerRelayOpened);
    }
  };

  const switchAccount = (next: Account) => {
    audio.play('phone.tab');
    setAccountMenuOpen(false);
    setActiveThread(null);
    setArchiveThread(null);
    setAccount(next);
    if (next === 'silverkite') speakChapterSeven(CHAPTER_SEVEN_DIALOGUE.archiveAccountOpened);
    if (next === 'silverkite') speakChapterEight([
      ...CHAPTER_EIGHT_DIALOGUE.entry,
      ...CHAPTER_EIGHT_DIALOGUE.archiveOpened,
    ]);
  };

  const openArchiveThread = (id: MaraArchiveThreadId) => {
    audio.play('phone.tab');
    setAccountMenuOpen(false);
    setArchiveThread(id);
    speakChapterEight(getChapterEightThreadDialogue(id));
  };

  // One row of Mara's own conversations. Her bubbles are the green, right-hand
  // side — the exact mirror of the player's thread with her — and the decayed
  // rows (deleted, unsent, missed calls) render as empty slots the way she left
  // them.
  const renderArchiveMessage = (msg: MaraArchiveMessage, idx: number) => {
    const mine = msg.from === 'mara';
    if (msg.status) {
      const label = msg.status === 'deleted'
        ? 'message deleted'
        : msg.status === 'unsent'
          ? 'unsent'
          : msg.status === 'missed-call'
            ? 'Missed call'
            : msg.status === 'voice-lost'
              ? '[voice message · could not be restored]'
              : 'Message unavailable · expired from carrier archive';
      return (
        <div key={idx} className={`flex flex-col max-w-[80%] ${mine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[10px] italic text-slate-500 border border-dashed border-slate-700/70 bg-transparent">
            {msg.status === 'deleted' && <Trash2 className="h-3 w-3" />}
            {msg.status === 'missed-call' && <PhoneMissed className="h-3 w-3" />}
            {msg.status === 'voice-lost' && <MicOff className="h-3 w-3" />}
            <span>{label}</span>
          </div>
          <span className="text-[8px] text-slate-600 mt-0.5 px-1">{msg.note ?? msg.time}</span>
        </div>
      );
    }
    const collected = msg.memory && collectedChapterEightMemories.includes(msg.memory.id);
    return (
      <div key={idx} className={`flex flex-col max-w-[80%] ${mine ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
        <div className={`px-3 py-2 text-xs leading-relaxed ${mine ? 'bg-[#2f7d60] text-white rounded-2xl rounded-br-md' : 'bg-[#1d212b] text-slate-200 rounded-2xl rounded-bl-md'}`}>
          {msg.text}
        </div>
        {msg.memory && (
          <button
            type="button"
            onClick={() => handleCollectChapterEightMemory(msg.memory!.id)}
            className={`mt-1 flex items-center gap-1 border-b px-1 py-0.5 text-[8px] tracking-[0.08em] transition-colors ${
              collected
                ? 'border-emerald-500/30 text-emerald-300'
                : 'border-amber-300/70 text-amber-200 hover:text-amber-100'
            }`}
            data-chapter-eight-memory={msg.memory.id}
            aria-label={`${collected ? 'Collected' : 'Collect'} memory: ${msg.memory.label}`}
          >
            {collected && <Check className="h-2.5 w-2.5" />}
            {collected ? 'MEMORY COLLECTED' : `REMEMBER · ${msg.memory.label}`}
          </button>
        )}
        <span className="text-[8px] text-slate-500 mt-0.5 px-1">{msg.note ?? msg.time}</span>
      </div>
    );
  };

  useEffect(() => {
    if (chapterThreeOrderPhase === 'idle') {
      if (activeThread === 'seller') setActiveThread(null);
      return undefined;
    }

    return metaInteraction.registerInput('messages-seller-code', {
      getValue: () => sellerCode,
      onChange: setSellerCode,
      onSubmit: verifySellerCode,
    });
  }, [activeThread, chapterThreeOrderPhase, metaInteraction.registerInput, onSellerVerified, sellerCode]);

  const sellerUnread = chapterThreeOrderPhase === 'verification-requested';

  // Ordered list of the current account's threads: the case threads sit among
  // the ordinary ones, not above them as special tabs.
  const listRows: { id: ThreadId; name: string; initials: string; tint: string; time: string; preview: string; unread?: boolean; badge?: string }[] = [
    ...(sellerThreadAvailable
      ? [{ id: 'seller' as ThreadId, name: 'coldboot_17', initials: 'C7', tint: '#059669', time: 'now', preview: 'Buyer check. What score belongs to the impossible runner?', unread: sellerUnread, badge: 'marketplace relay' }]
      : []),
    { id: 'mom', name: 'Mom (Mara)', initials: 'MK', tint: '#3c66c4', time: 'Today', preview: hasAllMaraNumberClues(progress) ? 'The old login asked for altitude, gate, and end.' : 'Those little places mattered to me.' },
    ...DECOY_THREADS.map((t) => ({ id: t.id as ThreadId, name: t.name, initials: t.initials, tint: t.tint, time: t.time, preview: t.preview })),
  ];

  const activeDecoy = DECOY_THREADS.find((t) => t.id === activeThread) ?? null;

  // Once past the login gate, Mara's account is a warm, personal inbox you can
  // browse thread by thread — not the cold node terminal of the sign-in screen
  // or the recovered evidence log of Chapter 9.
  const silverkitePersonal = account === 'silverkite' && progress.loggedIntoAdmin && progress.currentChapter === 8;
  const activeArchive = archiveThread ? getMaraArchiveThread(archiveThread) ?? null : null;
  const headerLaos = account === 'silverkite' && !silverkitePersonal;

  const headerTitle = account === 'silverkite'
    ? (!progress.loggedIntoAdmin
        ? 'Silver Kite Messenger'
        : activeArchive
          ? activeArchive.name
          : 'Mara Kade')
    : activeThread === 'mom'
      ? 'Mom (Mara)'
      : activeThread === 'seller'
        ? 'coldboot_17'
        : activeDecoy
          ? activeDecoy.name
          : 'Messages';

  const showBack = account === 'silverkite' || activeThread !== null;
  const onBack = () => {
    audio.play('phone.tab');
    setAccountMenuOpen(false);
    if (account === 'silverkite') {
      if (activeArchive) { setArchiveThread(null); return; }
      setAccount('me');
      return;
    }
    setActiveThread(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1015] text-slate-100 font-sans overflow-hidden" id="messages-root">

      {/* Header: title / back, plus the account switcher pinned in the corner. */}
      <div className="relative shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 border-b border-white/[0.06] bg-[#12141a]" id="messages-header">
        <div className="flex min-w-0 items-center gap-1.5">
          {showBack && (
            <button type="button" onClick={onBack} className="-ml-1 rounded-full p-1 text-slate-400 hover:text-white" id="messages-back" aria-label="Back">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className={`truncate text-sm font-semibold ${headerLaos ? 'font-laos tracking-wide text-[var(--laos-text)]' : 'text-white'}`}>{headerTitle}</span>
        </div>

        {/* Corner account switcher */}
        <button
          type="button"
          onClick={() => { audio.play('phone.tab'); setAccountMenuOpen((open) => !open); }}
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[9px] transition-colors ${
            account === 'silverkite'
              ? 'border-[var(--laos-line)] bg-[var(--laos-surface-2)] text-[var(--laos-text)]'
              : 'border-white/[0.1] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
          }`}
          id="messages-account-switch"
          aria-label="Switch account"
        >
          <UserCircle2 className="h-3.5 w-3.5" />
          <span className="font-medium">{account === 'silverkite' ? 'Silver Kite' : 'You'}</span>
          <ChevronRight className={`h-3 w-3 transition-transform ${accountMenuOpen ? 'rotate-90' : ''}`} />
        </button>

        {accountMenuOpen && (
          <div className="absolute right-2 top-[calc(100%-2px)] z-30 w-60 overflow-hidden rounded-lg border border-white/[0.1] bg-[#171a21] shadow-[0_16px_40px_rgba(0,0,0,0.55)]" id="messages-account-menu">
            <div className="border-b border-white/[0.06] px-3 py-2 text-[8px] uppercase tracking-[0.16em] text-slate-500">Switch account</div>
            <button
              type="button"
              onClick={() => switchAccount('me')}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.04] ${account === 'me' ? 'bg-white/[0.03]' : ''}`}
              id="messages-account-me"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3c66c4] text-[10px] font-bold text-white">Me</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-white">You</span>
                <span className="block truncate text-[8px] text-slate-500">this device · signed in</span>
              </span>
              {account === 'me' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={() => switchAccount('silverkite')}
              className={`flex w-full items-center gap-2.5 border-t border-white/[0.05] px-3 py-2.5 text-left hover:bg-white/[0.04] ${account === 'silverkite' ? 'bg-white/[0.03]' : ''}`}
              id="messages-account-silverkite"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--laos-line)] bg-[var(--laos-surface-2)] text-[var(--laos-warm)]">
                <KeyRound className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-laos text-[11px] font-semibold tracking-wide text-[var(--laos-text)]">Silver Kite Messenger</span>
                <span className="block truncate font-mono text-[8px] text-[var(--laos-dim)]">
                  {progress.loggedIntoAdmin ? 'MARA_KADE · archived node' : 'MARA_KADE · signed out'}
                </span>
              </span>
              {progress.loggedIntoAdmin
                ? (account === 'silverkite' && <span className="h-1.5 w-1.5 rounded-full bg-[var(--laos-warm)]" />)
                : <span className="font-mono text-[7px] uppercase tracking-wider text-[var(--laos-warm)]">sign in</span>}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`flex-1 overflow-y-auto ${account === 'silverkite' && !silverkitePersonal ? 'bg-[var(--laos-bg)] p-3' : 'p-3'}`} id="messages-body">

        {account === 'silverkite' ? (
          /* Mara's archived node. Chapter 7 ends on sign-in; Chapter 8 opens
             from the restored index before the private thread appears. */
          <div className="space-y-4" id="chat-admin-panel">
            {!progress.loggedIntoAdmin ? (
              <form onSubmit={handleAdminSubmit} className="laos-panel mx-auto max-w-[620px] space-y-4 p-4 pb-24" id="admin-login-form">
                <div className="grid grid-cols-3 gap-px border border-[var(--laos-line-dim)] bg-[var(--laos-line-dim)] font-mono text-[7px]" id="archive-account-context">
                  <div className="bg-[var(--laos-bg)] p-2"><div className="text-[var(--laos-faint)]">ACCOUNT</div><div className="mt-1 text-[var(--laos-text)]">MARA_KADE</div></div>
                  <div className="bg-[var(--laos-bg)] p-2"><div className="text-[var(--laos-faint)]">BACKUP</div><div className="mt-1 text-[var(--laos-text)]">2014 MIGRATION</div></div>
                  <div className="bg-[var(--laos-bg)] p-2"><div className="text-[var(--laos-faint)]">ACCESS</div><div className="mt-1 text-[var(--laos-warm)]">LOCAL RESTORE</div></div>
                </div>
                <div className="border border-[var(--laos-line-dim)] bg-[var(--laos-surface-2)] p-2.5 font-laos text-[8px] leading-relaxed text-[var(--laos-dim)]" id="archive-login-notice">
                  Switching accounts does not replace your current profile. This restored node is read-only until its coordinate key is verified. Failed attempts remain on this device.
                </div>
                <div className="text-center space-y-1.5">
                  <div className="w-10 h-10 border border-[var(--laos-line)] bg-[var(--laos-surface-2)] flex items-center justify-center mx-auto">
                    <KeyRound className="w-5 h-5 text-[var(--laos-warm)]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-laos font-semibold text-sm text-[var(--laos-text)] tracking-wide">Silver Kite Database Node</h3>
                  <p className="font-laos text-[10px] text-[var(--laos-dim)]">Secure log retrieval terminal for associated creators</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="laos-label text-[8px] block">CREATOR ID</label>
                    <input
                      type="text"
                      disabled
                      value="MARA_KADE (SEC_PARTNER)"
                      className="w-full bg-[var(--laos-bg)] px-2.5 py-1.5 border border-[var(--laos-line-dim)] rounded-none text-[var(--laos-faint)] font-mono"
                    />
                  </div>

                  {collectionRequired ? (
                    <div className="border border-dashed border-[var(--laos-line)] bg-[var(--laos-bg)] p-3 text-center" id="archive-number-collection-lock">
                      <div className="laos-label text-[8px]">COORDINATE FRAGMENTS REQUIRED</div>
                      <div className="mt-2 font-mono text-[9px] text-[var(--laos-dim)]">
                        {Object.values({
                          altitude: progress.discoveredMaraAltitude184,
                          gate: progress.discoveredMaraGate40,
                          end: progress.discoveredMaraEnd256,
                        }).filter(Boolean).length}/3 NUMBERS COLLECTED
                      </div>
                      <p className="mt-2 font-laos text-[8px] leading-relaxed text-[var(--laos-faint)]">Underline-marked fragments remain in Mara Kade's public FaceSpace archive.</p>
                    </div>
                  ) : mappingRequired ? (
                    <div className="space-y-3 border border-[var(--laos-line-dim)] bg-[var(--laos-bg)] p-3" id="archive-coordinate-mapping">
                      <div>
                        <div className="laos-label text-[8px]">ASSIGN COLLECTED NUMBERS</div>
                        <p className="mt-1 font-laos text-[8px] leading-relaxed text-[var(--laos-faint)]">Match each memory fragment to the label used by the coordinate key.</p>
                      </div>
                      <div className="flex justify-center gap-2" id="archive-collected-number-bank">
                        {MARA_COLLECTIBLE_NUMBERS.map((number) => (
                          <span key={number} className="border border-[var(--laos-line)] bg-[var(--laos-surface-2)] px-2.5 py-1 font-mono text-[10px] text-[var(--laos-warm)]" data-collected-number={number}>{number}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['altitude', 'gate', 'end'] as const).map((label) => (
                          <label key={label} className="space-y-1">
                            <span className="laos-label block text-center text-[7px]">{label === 'altitude' ? 'ALT' : label.toUpperCase()}</span>
                            <select
                              value={coordinateMapping[label] ?? ''}
                              onChange={(event) => handleCoordinateSelection(label, event.target.value)}
                              className="w-full border border-[var(--laos-line)] bg-[var(--laos-surface-2)] px-1.5 py-2 text-center font-mono text-[9px] text-[var(--laos-text)] focus:border-[var(--laos-warm)] focus:outline-none"
                              id={`archive-map-${label}`}
                              aria-label={`Assign number to ${label}`}
                            >
                              <option value="">---</option>
                              {MARA_COLLECTIBLE_NUMBERS.map((number) => <option key={number} value={number}>{number}</option>)}
                            </select>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1" id="archive-password-stage">
                      <label className="laos-label text-[8px] block">COORDINATE PASSWORD KEY (ALT___GATE__END___)</label>
                      <input
                        type="text"
                        placeholder="e.g. ALT100GATE10END10"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        data-meta-hit-recovery="true"
                        className="laos-slow mx-auto block w-[74%] min-w-[300px] bg-[var(--laos-bg)] px-2.5 py-2 border border-[var(--laos-line)] rounded-none text-[var(--laos-text)] font-mono placeholder-[var(--laos-faint)] focus:outline-none focus:border-[var(--laos-warm)] uppercase"
                        id="admin-password-input"
                      />
                    </div>
                  )}
                </div>

                {mappingError && mappingRequired && (
                  <div className="text-[9px] border border-[var(--laos-warm)]/50 bg-[var(--laos-surface-2)] text-[var(--laos-warm)] p-2 leading-relaxed font-laos tracking-wide" id="archive-mapping-error">
                    {mappingError}
                  </div>
                )}

                {loginError && !mappingRequired && !collectionRequired && (
                  <div className="text-[9px] border border-[var(--laos-warm)]/50 bg-[var(--laos-surface-2)] text-[var(--laos-warm)] p-2 leading-relaxed font-laos tracking-wide" id="admin-login-error">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={collectionRequired}
                  className="laos-slow w-full py-2 bg-[var(--laos-surface-2)] hover:bg-[var(--laos-line-dim)] text-[var(--laos-text)] border border-[var(--laos-line)] font-laos font-semibold tracking-[0.14em] rounded-none text-[10px] disabled:cursor-not-allowed disabled:text-[var(--laos-faint)]"
                  id="admin-login-submit"
                  data-admin-stage={collectionRequired ? 'collect' : mappingRequired ? 'map' : 'password'}
                >
                  {collectionRequired ? 'COLLECT THREE NUMBER FRAGMENTS' : mappingRequired ? 'VERIFY COORDINATE MAPPING' : 'DECRYPT ENCRYPTED NODES'}
                </button>
              </form>
            ) : progress.currentChapter === 8 ? (
              activeArchive ? (
                /* Reading one of Mara's own conversations. Her bubbles are the
                   green, right-hand side now — the mirror of the player's thread. */
                <div className="space-y-3" id="mara-archive-thread" data-archive-thread={activeArchive.id}>
                  <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: activeArchive.tint }}>{activeArchive.initials}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">{activeArchive.name}</div>
                      <div className="flex items-center gap-1 text-[8px] text-slate-500">
                        {activeArchive.group && <Users className="h-2.5 w-2.5" />}
                        {activeArchive.subtitle}
                      </div>
                    </div>
                  </div>

                  {activeArchive.isCase ? (
                    <div className="space-y-3" id="chapter-eight-noah-recovery">
                      <div className="rounded-lg border border-amber-300/20 bg-amber-200/[0.04] p-2.5" id="chapter-eight-memory-drawer">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-amber-200">Recovered memories</span>
                          <span className="font-mono text-[8px] text-slate-500">{collectedChapterEightMemories.length}/8</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {collectedChapterEightMemories.length === 0 ? (
                            <span className="text-[8px] italic text-slate-500">Read Mara’s other conversations. Underlined memories will remain here.</span>
                          ) : collectedChapterEightMemories.map((memoryId) => {
                            const recovered = getChapterEightMemory(memoryId as ChapterEightMemoryId);
                            return recovered ? (
                              <span key={memoryId} className="rounded border border-amber-200/20 bg-black/20 px-1.5 py-1 text-[8px] text-amber-100" data-recovered-memory={memoryId}>
                                {recovered.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="text-center text-[8px] leading-relaxed text-slate-500">
                        Select a damaged slot, then choose the memory that authenticates it.
                      </div>

                      {NOAH_ARCHIVE_FRAGMENTS.map((fragment) => {
                        const restored = restoredNoahMessages.includes(fragment.id);
                        return (
                          <div
                            key={fragment.id}
                            className={`rounded-lg border p-2.5 ${
                              restored
                                ? 'border-white/[0.06] bg-[#171a21]'
                                : 'border-dashed border-amber-200/20 bg-black/10'
                            }`}
                            data-noah-fragment={fragment.id}
                            data-restored={restored}
                          >
                            <div className="flex items-center justify-between gap-2 text-[8px]">
                              <span className={fragment.from === 'noah' ? 'text-[#e59b87]' : 'text-[#71bc94]'}>
                                {fragment.from === 'noah' ? 'Noah Kade' : 'Mara Kade'}
                              </span>
                              <span className="font-mono text-slate-600">{fragment.time}</span>
                            </div>
                            {restored ? (
                              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">{fragment.restoredText}</p>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenNoahFragment(fragment.id)}
                                className="mt-1.5 flex w-full items-center gap-2 rounded border border-dashed border-slate-700 px-2.5 py-2 text-left text-[9px] text-slate-500 hover:border-amber-200/40 hover:text-amber-100"
                                id={`chapter-eight-damaged-${fragment.id}`}
                              >
                                <LockKeyhole className="h-3 w-3 shrink-0" />
                                <span>[damaged message · select to restore]</span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {activeNoahFragment && (
                        <div className="rounded-lg border border-amber-200/30 bg-[#171a21] p-3" id="chapter-eight-restore-prompt">
                          <div className="text-[9px] font-semibold text-amber-100">
                            {getNoahArchiveFragment(activeNoahFragment)?.prompt}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-1.5">
                            {collectedChapterEightMemories.map((memoryId) => {
                              const recovered = getChapterEightMemory(memoryId as ChapterEightMemoryId);
                              return recovered ? (
                                <button
                                  type="button"
                                  key={memoryId}
                                  onClick={() => handleRestoreNoahFragment(recovered.id)}
                                  className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-left text-[8px] text-slate-300 hover:border-amber-200/40 hover:text-white"
                                  data-restore-choice={memoryId}
                                >
                                  {recovered.label}
                                </button>
                              ) : null;
                            })}
                          </div>
                          {collectedChapterEightMemories.length === 0 && (
                            <p className="mt-2 text-[8px] italic text-slate-500">No recovered memories are available yet.</p>
                          )}
                          {noahRestoreError && (
                            <p className="mt-2 border-l border-amber-300/50 pl-2 text-[8px] leading-relaxed text-amber-200" id="chapter-eight-restore-hint">
                              Not this memory. {noahRestoreError}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="rounded-lg border border-dashed border-slate-700 bg-black/20 p-3 text-center" id="chapter-eight-route-attachment">
                        <LockKeyhole className="mx-auto h-4 w-4 text-slate-500" />
                        <div className="mt-1.5 text-[8px] font-semibold tracking-[0.12em] text-slate-400">FLIGHT HEIGHTS · SEALED ATTACHMENT</div>
                        <p className="mt-1 text-[8px] leading-relaxed text-slate-600">
                          The human record must be complete before the route can be examined. Its values remain outside this chapter.
                        </p>
                      </div>

                      {allNoahMessagesRestored && (
                        <button
                          type="button"
                          onClick={handleCompleteChapterEight}
                          className="w-full rounded border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-[9px] font-semibold tracking-[0.12em] text-emerald-200 hover:bg-emerald-300/15"
                          id="chapter-eight-complete"
                        >
                          PRESERVE RESTORED HUMAN RECORD
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2" id="chapter-eight-memory-progress">
                        <div className="flex items-center justify-between text-[8px]">
                          <span className="uppercase tracking-[0.12em] text-slate-500">Recovered memories</span>
                          <span className="font-mono text-amber-200">{collectedChapterEightMemories.length}/8</span>
                        </div>
                      </div>
                      {activeArchive.messages.map((msg, idx) => renderArchiveMessage(msg, idx))}
                      <div className="pt-2 text-center text-[8px] text-slate-600">Most of this is not evidence. It is why the evidence survived.</div>
                    </>
                  )}
                </div>
              ) : (
                /* Mara's restored account: a real, well-used inbox, sorted newest
                   first. Her most coherent conversation — with Noah, in 2014 —
                   is therefore the last one, buried under every quieter year that
                   followed. The player has to scroll past everything she lost. */
                <div className="space-y-3" id="admin-archive-index">
                  <div className="flex items-center gap-2.5 px-1 pb-1">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3c66c4] text-[11px] font-bold text-white">MK</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">Mara Kade</div>
                      <div className="text-[9px] text-slate-500">restored account · {MARA_ARCHIVE_THREADS.length} conversations</div>
                    </div>
                  </div>

                  <div className="-mx-1 divide-y divide-white/[0.05]" id="mara-archive-list">
                    {MARA_ARCHIVE_THREADS.map((thread) => {
                      const rowContent = (
                        <>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: thread.tint }}>{thread.initials}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-[12px] font-semibold text-slate-200">{thread.name}</span>
                              <span className="shrink-0 text-[8px] text-slate-500">{thread.era}</span>
                            </span>
                            <span className="mt-0.5 flex items-center gap-1">
                              {thread.group && <Users className="h-2.5 w-2.5 shrink-0 text-slate-500" />}
                              {thread.automated && <MessageCircle className="h-2.5 w-2.5 shrink-0 text-slate-600" />}
                              <span className="truncate text-[10px] text-slate-500">{thread.preview}</span>
                            </span>
                          </span>
                        </>
                      );
                      const rowClass = 'flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-white/[0.03]';

                      // Noah is the damaged case thread. Opening it no longer
                      // advances the chapter; all eight human messages must be
                      // restored with memories collected from the other rows.
                      return thread.isCase ? (
                        <button
                          type="button"
                          key={thread.id}
                          id="messages-open-private-thread"
                          onClick={handleOpenArchiveThread}
                          className={rowClass}
                          data-archive-thread={thread.id}
                          data-archive-kind="case"
                        >
                          {rowContent}
                        </button>
                      ) : (
                        <button
                          type="button"
                          key={thread.id}
                          onClick={() => openArchiveThread(thread.id)}
                          className={rowClass}
                          data-archive-thread={thread.id}
                          data-archive-kind="texture"
                        >
                          {rowContent}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1 text-center text-[8px] text-slate-600">Her account, exactly as she left it.</div>
                </div>
              )
            ) : (
              <div className="space-y-4" id="admin-unlocked-logs">
                {progress.unlockedCodeRoute && <div className="laos-panel p-3 text-center space-y-1.5" id="bypass-acquired-card">
                  <div className="laos-label text-[9px] flex items-center justify-center gap-1.5 !text-[var(--laos-warm)]">
                    <span className="w-1.5 h-1.5 bg-[var(--laos-warm)]"></span>
                    <span>COLLISION BYPASS ENGINE OBTAINED!</span>
                  </div>
                  <p className="font-laos text-[9px] text-[var(--laos-dim)]">
                    Your dad's original flight sequence has been recovered. Use these heights near Gate 40 in the game!
                  </p>
                  <div className="bg-[var(--laos-bg)] p-2 border border-[var(--laos-line)] text-xs font-mono font-bold text-[var(--laos-text)] select-all mt-1.5 text-center">
                    NK_184.172.149.133.121.118.126.143
                  </div>
                </div>}

                <div className="space-y-3.5 text-xs">
                  <h3 className="laos-label text-[9px] border-b border-[var(--laos-line-dim)] pb-1.5">
                    Legacy Archives (2014-04-20)
                  </h3>

                  <div className="laos-panel p-2.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-laos tracking-wide text-[var(--laos-faint)]">
                      <span className="font-semibold text-[var(--laos-warm)]">Noah Kade</span>
                      <span>2014-04-20 22:15</span>
                    </div>
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      Mara, Elias is updating the game store credentials tomorrow. He is completely overwriting our game with a slop endless monetization script that removes our endings and injects spam ads. I can't let him wipe out our creations.
                    </p>
                  </div>

                  <div className="laos-panel p-2.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-laos tracking-wide text-[var(--laos-faint)]">
                      <span className="font-semibold text-[var(--laos-dim)]">Mara Kade</span>
                      <span>2014-04-20 22:18</span>
                    </div>
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      Noah... is there any way to preserve the original 256 structural ending?
                    </p>
                  </div>

                  <div className="laos-panel p-2.5 space-y-1.5">
                    <div className="flex justify-between text-[9px] font-laos tracking-wide text-[var(--laos-faint)]">
                      <span className="font-semibold text-[var(--laos-warm)]">Noah Kade</span>
                      <span>2014-04-20 22:20</span>
                    </div>
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      Yes. I hid the true route within the collision loop. The scraper doesn't examine the old barometric altitude sensor registers. I hardcoded a structural bypass on Gate 40.
                    </p>
                    {progress.unlockedCodeRoute && (
                      <p className="font-mono text-[10px] bg-[var(--laos-bg)] p-2 border border-[var(--laos-line)] leading-relaxed text-[var(--laos-dim)]">
                        If you fly precisely at the following altitudes as you pass each consecutive gate starting at 40, the collider fails and you enter the legacy wireframe layer: <br />
                        <span className="text-[var(--laos-text)] font-bold">184, 172, 149, 133, 121, 118, 126, 143</span>
                      </p>
                    )}
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      I don't expect common players to find this. But I'll leave the device with you. Let our future son fly it one day. Let him see that we existed.
                    </p>
                  </div>

                  {!progress.unlockedCodeRoute && (
                    <button
                      type="button"
                      onClick={handleRecoverRoute}
                      className="laos-slow w-full border border-[var(--laos-warm)]/60 bg-[var(--laos-surface-2)] px-3 py-2 font-laos text-[10px] font-semibold tracking-[0.14em] text-[var(--laos-warm)] hover:bg-[var(--laos-line-dim)]"
                      id="messages-recover-route"
                    >
                      RECOVER ATTACHED FLIGHT SEQUENCE
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeThread === null ? (
          /* The player's own account: a full conversation list. */
          <div className="-mx-1 divide-y divide-white/[0.05]" id="messages-thread-list">
            {listRows.map((row) => (
              <button
                type="button"
                key={row.id}
                onClick={() => openThread(row.id)}
                id={row.id === 'seller' ? 'tab-seller' : undefined}
                className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                data-thread-id={row.id}
                data-thread-kind={row.id === 'mom' || row.id === 'seller' ? 'case' : 'everyday'}
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: row.tint }}>
                  {row.initials}
                  {row.unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0e1015] bg-emerald-400" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate text-[12px] ${row.unread ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>{row.name}</span>
                    <span className="shrink-0 text-[8px] text-slate-500">{row.time}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1">
                    {row.badge && <ShieldAlert className="h-2.5 w-2.5 shrink-0 text-amber-300" />}
                    <span className={`truncate text-[10px] ${row.unread ? 'text-slate-300' : 'text-slate-500'}`}>{row.preview}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : activeThread === 'seller' && sellerThreadAvailable ? (
          <div className="flex min-h-full flex-col" id="chat-seller-panel">
            <span id="tab-seller" className="sr-only">Marketplace relay</span>
            <div className="mb-3 flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">coldboot_17</div>
                <div className="flex items-center gap-1 text-[8px] text-amber-300"><ShieldAlert className="h-2.5 w-2.5" /> Unknown sender · marketplace relay</div>
              </div>
            </div>

            <div className="flex-1 space-y-3" id="messages-seller-thread">
              <div className="text-center text-[8px] text-slate-600">Text Message · Now</div>
              <div className="mr-auto max-w-[82%] rounded-2xl rounded-bl-md bg-[#1d212b] px-3 py-2 text-xs leading-relaxed text-slate-200">
                Buyer check. What score belongs to the impossible runner?
              </div>

              {chapterThreeOrderPhase === 'verified' && (
                <>
                  <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-md bg-[#2f7d60] px-3 py-2 text-right font-mono text-xs text-white">184</div>
                  <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md bg-[#1d212b] px-3 py-2 text-xs leading-relaxed text-slate-200">
                    Match. Delivery confirmed and indexed. No signature required.
                  </div>
                </>
              )}

              {sellerCodeError && chapterThreeOrderPhase === 'verification-requested' && (
                <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md bg-red-950/60 px-3 py-2 text-xs leading-relaxed text-red-200" id="messages-seller-code-error">
                  {sellerCodeError}
                </div>
              )}
            </div>

            {chapterThreeOrderPhase === 'verification-requested' && (
              <form onSubmit={handleSellerVerification} className="mt-3 flex gap-2 border-t border-white/[0.06] pt-3" id="messages-seller-code-form">
                <input
                  value={sellerCode}
                  onChange={(event) => setSellerCode(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Text Message"
                  data-meta-immediate="true"
                  data-meta-hit-recovery="true"
                  className="min-w-0 flex-1 rounded-full border border-white/[0.1] bg-[#171a21] px-3 py-2 text-xs text-white outline-none focus:border-emerald-400/70"
                  id="messages-seller-code"
                  aria-label="Reply to coldboot_17"
                />
                <button type="submit" data-meta-immediate="true" data-meta-hit-recovery="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:bg-emerald-300" id="messages-submit-seller-code" aria-label="Send score">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        ) : activeThread === 'mom' ? (
          /* Chat logs with Mother — the modern layer at its most normal */
          <div className="space-y-3" id="chat-mom-panel">
            <div className="text-[9px] text-center text-slate-500 my-1">
              Text Message · Today
            </div>

            <div className="space-y-3">
              {momMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === 'me'
                        ? msg.isUnlockedCode
                          ? 'bg-[#3c66c4] text-white rounded-2xl rounded-br-md font-mono font-bold ring-1 ring-amber-300/70'
                          : 'bg-[#3c66c4] text-white rounded-2xl rounded-br-md'
                        : 'bg-[#1d212b] text-slate-200 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[8px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

            </div>

            {/* Decayed archive artifacts: the system kept the slots, not the words */}
            <div className="flex flex-col max-w-[80%] mr-auto items-start">
              <div className="px-3 py-2 rounded-2xl rounded-bl-md text-[10px] italic text-slate-500 border border-dashed border-slate-700/70 bg-transparent">
                Message unavailable · expired from carrier archive
              </div>
              <span className="text-[8px] text-slate-600 mt-0.5 px-1">--:--</span>
            </div>

            <div className="flex flex-col max-w-[80%] mr-auto items-start">
              <div className="px-3 py-2 rounded-2xl rounded-bl-md text-[10px] italic text-slate-500 border border-dashed border-slate-700/70 bg-transparent">
                [voice message · 0:04 · could not be restored]
              </div>
              <span className="text-[8px] text-slate-600 mt-0.5 px-1">--:--</span>
            </div>

            <div className="flex flex-col max-w-[80%] mr-auto items-start">
              <div className="px-3 py-2 rounded-2xl rounded-bl-md text-xs text-slate-300 bg-[#1d212b]">
                sweetheart did you eat
              </div>
              <span className="text-[8px] text-slate-600 mt-0.5 px-1">sent 4 years ago · delivered today</span>
            </div>

            {/* Mara keeps typing, and never quite finishes */}
            <div className="mr-auto space-y-1">
              <div className="flex items-center gap-1.5 bg-[#1d212b] rounded-2xl rounded-bl-md px-3 py-2 w-fit">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
              <div className="text-[8px] text-slate-600 ml-1">Mara is typing…</div>
            </div>

            <div className="pt-2 text-[9px] text-center text-slate-600 italic">
              Mara's memories are fading, but she preserved your father's database credentials.
            </div>
          </div>
        ) : activeDecoy ? (
          /* Everyday decoy conversation: readable, inert texture. */
          <div className="space-y-3" id="chat-decoy-panel" data-decoy-thread={activeDecoy.id}>
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: activeDecoy.tint }}>{activeDecoy.initials}</span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white">{activeDecoy.name}</div>
                <div className="flex items-center gap-1 text-[8px] text-slate-500">
                  {activeDecoy.group && <Users className="h-2.5 w-2.5" />}
                  {activeDecoy.automated ? 'Automated messages' : activeDecoy.group ? 'Group · 4 people' : 'SMS'}
                </div>
              </div>
            </div>

            {activeDecoy.messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[80%] ${msg.from === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`px-3 py-2 text-xs leading-relaxed ${msg.from === 'me' ? 'bg-[#3c66c4] text-white rounded-2xl rounded-br-md' : 'bg-[#1d212b] text-slate-200 rounded-2xl rounded-bl-md'}`}>
                  {msg.text}
                </div>
                <span className="text-[8px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}

            <div className="pt-2 text-center text-[8px] text-slate-600">Nothing here belongs to the case.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
