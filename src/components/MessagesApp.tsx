import React, { useEffect, useState } from 'react';
import { GameProgress, ChatMessage } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction, completePuzzleChapter } from '../lib/chapterProgress';
import { isSellerCodeAccepted, type AmazeMartOrderPhase } from '../lib/amazemartPuzzle';
import { useMetaInteraction } from './MetaInteractionScene';
import { CHAPTER_THREE_DIALOGUE, getChapterThreeSellerCodeResponse } from '../lib/chapterThreeDialogue';
import { KeyRound, MessageCircle, Send, ShieldAlert } from 'lucide-react';

interface MessagesAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  chapterThreeOrderPhase: AmazeMartOrderPhase;
  onSellerVerified: () => void;
}

type MessageTab = 'mom' | 'seller' | 'admin';

/**
 * A perfectly ordinary modern messaging client — except for one tab that the
 * migration left behind. The Silver Kite archive renders in the old system's
 * language: cold, square, patient, slightly slow to answer.
 */
export const MessagesApp: React.FC<MessagesAppProps> = ({
  progress,
  updateProgress,
  chapterThreeOrderPhase,
  onSellerVerified,
}) => {
  const metaInteraction = useMetaInteraction();
  const [activeTab, setActiveTab] = useState<MessageTab>(chapterThreeOrderPhase === 'idle' ? 'mom' : 'seller');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [sellerCode, setSellerCode] = useState('');
  const [sellerCodeError, setSellerCodeError] = useState('');

  // Modern chat messages with Mother (Mara)
  const momMessages: ChatMessage[] = [
    {
      sender: 'mom',
      time: '11:22 AM',
      content: 'Hello Noah... oh sorry, my dear, I mean my sweet boy. Have you found your father\'s old drawings?',
    },
    {
      sender: 'me',
      time: '11:23 AM',
      content: 'I found some of his old technical schematics, Mom. The ones from Silver Kite Games.',
    },
    {
      sender: 'mom',
      time: '11:24 AM',
      content: 'He was so proud of Skyline 256. Everyone wanted games to go on forever, to scrape infinite coins. But he said a true flight always lands.',
    },
    {
      sender: 'me',
      time: '11:25 AM',
      content: 'Mom, what was his favorite number code? 184-40-256? Is it a password?',
    },
    {
      sender: 'mom',
      time: '11:26 AM',
      content: 'Oh... your father always said numbers aren\'t passwords. They are paths. You must pair them with their coordinates: ALT, GATE, and END. Just like on the old schematics.',
    },
    {
      sender: 'me',
      time: '11:27 AM',
      content: 'ALT184GATE40END256?',
      isUnlockedCode: true,
    },
    {
      sender: 'mom',
      time: '11:28 AM',
      content: 'Yes! That sounds so familiar. My memory wanders, dear... but I know he left a conversation in our old Silver Kite Messenger database. You should log in there. He left a path for you.',
    }
  ];

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    audio.play('key.enter');

    const formattedInput = passwordInput.toUpperCase().replace(/\s+/g, '');

    if (!formattedInput) {
      audio.play('auth.wrong');
      setLoginError('COORDINATE STRING REQUIRED. THE NODE HAS WAITED TWELVE YEARS. IT CAN WAIT LONGER.');
      return;
    }

    if (formattedInput === 'ALT184GATE40END256' && !canUseProgressionAction('admin-login', progress)) {
      audio.play('auth.wrong');
      setLoginError('NICE TRY, TIME TRAVELER. FIND THE CLUES BEFORE THE PASSWORD FINDS YOU.');
      return;
    }

    if (formattedInput === 'ALT184GATE40END256') {
      audio.play('auth.correct');
      setLoginError('');
      setFailCount(0);
      updateProgress((prev) => completePuzzleChapter(prev, 8, { loggedIntoAdmin: true }));
    } else {
      audio.play('auth.wrong');
      const nextFails = failCount + 1;
      setFailCount(nextFails);
      setLoginError(nextFails >= 3
        ? 'HINT WITHHELD. HE LEFT THIS FOR SOMEONE WHO WALKS THE PATH, NOT SOMEONE WHO GUESSES IT.'
        : 'CREDENTIALS REJECTED. ENSURE ALTITUDE, GATE, AND END VALUES ARE PROPERLY SEQUENCE-PAIRED.');
    }
  };

  const handleInterpretCoordinateKey = () => {
    audio.playUnlock();
    updateProgress((prev) => completePuzzleChapter(prev, 7, { unlockedAdminLogin: true }));
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

  useEffect(() => {
    if (chapterThreeOrderPhase === 'idle') {
      if (activeTab === 'seller') setActiveTab('mom');
      return undefined;
    }

    return metaInteraction.registerInput('messages-seller-code', {
      getValue: () => sellerCode,
      onChange: setSellerCode,
      onSubmit: verifySellerCode,
    });
  }, [activeTab, chapterThreeOrderPhase, metaInteraction.registerInput, onSellerVerified, sellerCode]);

  return (
    <div className="flex flex-col h-full bg-[#0e1015] text-slate-100 font-sans overflow-hidden" id="messages-root">

      {/* Header: modern title bar with a segmented control. The second
          segment does not belong to this client's design system. */}
      <div className="shrink-0 px-3 pt-2.5 pb-2 border-b border-white/[0.06] bg-[#12141a]" id="messages-header">
        <div className="text-sm font-semibold text-white mb-2">Messages</div>
        <div className="flex rounded-full bg-white/[0.06] p-0.5">
          <button
            onClick={() => {
              audio.play('phone.tab');
              // She notices you looking, and starts — then stops (§4.7).
              audio.play('messages.typing', { delay: 1.1 });
              setActiveTab('mom');
            }}
            className={`flex-1 py-1.5 text-[10.5px] font-medium rounded-full transition-colors ${
              activeTab === 'mom' ? 'bg-[#2a2f3a] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab-mom"
          >
            Mom (Mara)
          </button>
          {chapterThreeOrderPhase !== 'idle' && (
            <button
              onClick={() => { audio.play('phone.tab'); setActiveTab('seller'); if (progress.currentChapter === 3 && metaInteraction.active) metaInteraction.speak(CHAPTER_THREE_DIALOGUE.sellerRelayOpened); }}
              className={`relative flex-1 rounded-full py-1.5 text-[9.5px] font-medium transition-colors ${
                activeTab === 'seller' ? 'bg-[#1f6f54] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-seller"
            >
              coldboot_17
              {chapterThreeOrderPhase === 'verification-requested' && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-300" aria-label="Unread seller message" />
              )}
            </button>
          )}
          <button
            onClick={() => { audio.play('phone.tab'); setActiveTab('admin'); }}
            className={`flex-1 py-1.5 rounded-full font-laos text-[9.5px] tracking-[0.14em] laos-slow ${
              activeTab === 'admin'
                ? 'bg-[var(--laos-surface-2)] text-[var(--laos-text)] shadow-[inset_0_0_0_1px_var(--laos-line)]'
                : 'text-[var(--laos-dim)] hover:text-[var(--laos-text)]'
            }`}
            id="tab-admin"
          >
            SILVER_KITE_ARCHIVE
          </button>
        </div>
      </div>

      {/* Message App Body Container */}
      <div className={`flex-1 overflow-y-auto ${activeTab === 'admin' ? 'bg-[var(--laos-bg)] p-3' : 'p-3'}`} id="messages-body">
        {activeTab === 'seller' && chapterThreeOrderPhase !== 'idle' ? (
          <div className="flex min-h-full flex-col" id="chat-seller-panel">
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
        ) : activeTab === 'mom' ? (
          /* PART A: Chat logs with Mother — the modern layer at its most normal */
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

              {progress.discoveredNoahQA && progress.discoveredMotherComment && !progress.unlockedAdminLogin && (
                <button
                  type="button"
                  onClick={handleInterpretCoordinateKey}
                  className="mx-auto border border-amber-300/45 bg-amber-200/10 px-3 py-2 text-[9px] font-mono font-bold tracking-[0.12em] text-amber-200 hover:bg-amber-200/15"
                  id="messages-interpret-number"
                >
                  ASSEMBLE COORDINATE KEY
                </button>
              )}
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
        ) : (
          /* PART B: the archive. From here down, the old system draws the
             screen — hairlines, squares, one warm accent, no hurry. */
          <div className="space-y-4" id="chat-admin-panel">
            {!progress.loggedIntoAdmin ? (
              /* If not logged in: Show credential prompt */
              <form onSubmit={handleAdminLogin} className="laos-panel p-4 space-y-4" id="admin-login-form">
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

                  <div className="space-y-1">
                    <label className="laos-label text-[8px] block">COORDINATE PASSWORD KEY (ALT___GATE__END___)</label>
                    <input
                      type="text"
                      placeholder="e.g. ALT100GATE10END10"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="laos-slow w-full bg-[var(--laos-bg)] px-2.5 py-1.5 border border-[var(--laos-line)] rounded-none text-[var(--laos-text)] font-mono placeholder-[var(--laos-faint)] focus:outline-none focus:border-[var(--laos-warm)] uppercase"
                      id="admin-password-input"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-[9px] border border-[var(--laos-warm)]/50 bg-[var(--laos-surface-2)] text-[var(--laos-warm)] p-2 leading-relaxed font-laos tracking-wide" id="admin-login-error">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="laos-slow w-full py-2 bg-[var(--laos-surface-2)] hover:bg-[var(--laos-line-dim)] text-[var(--laos-text)] border border-[var(--laos-line)] font-laos font-semibold tracking-[0.14em] rounded-none text-[10px]"
                  id="admin-login-submit"
                >
                  DECRYPT ENCRYPTED NODES
                </button>
              </form>
            ) : (
              /* Already Logged In: Show emotional dialog logs containing the sequence */
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

                {/* Legacy Archive Private Messages */}
                <div className="space-y-3.5 text-xs">
                  <h3 className="laos-label text-[9px] border-b border-[var(--laos-line-dim)] pb-1.5">
                    Legacy Archives (2014-04-20)
                  </h3>

                  {/* Log 1 */}
                  <div className="laos-panel p-2.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-laos tracking-wide text-[var(--laos-faint)]">
                      <span className="font-semibold text-[var(--laos-warm)]">Noah Kade</span>
                      <span>2014-04-20 22:15</span>
                    </div>
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      Mara, Elias is updating the game store credentials tomorrow. He is completely overwriting our game with a slop endless monetization script that removes our endings and injects spam ads. I can't let him wipe out our creations.
                    </p>
                  </div>

                  {/* Log 2 */}
                  <div className="laos-panel p-2.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-laos tracking-wide text-[var(--laos-faint)]">
                      <span className="font-semibold text-[var(--laos-dim)]">Mara Kade</span>
                      <span>2014-04-20 22:18</span>
                    </div>
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      Noah... is there any way to preserve the original 256 structural ending?
                    </p>
                  </div>

                  {/* Log 3 */}
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
        )}
      </div>

    </div>
  );
};
