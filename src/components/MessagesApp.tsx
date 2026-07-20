import React, { useState } from 'react';
import { GameProgress, ChatMessage } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { KeyRound } from 'lucide-react';

interface MessagesAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

/**
 * A perfectly ordinary modern messaging client — except for one tab that the
 * migration left behind. The Silver Kite archive renders in the old system's
 * language: cold, square, patient, slightly slow to answer.
 */
export const MessagesApp: React.FC<MessagesAppProps> = ({ progress, updateProgress }) => {
  const [activeTab, setActiveTab] = useState<'mom' | 'admin'>('mom');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

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
    audio.playTick();

    const formattedInput = passwordInput.toUpperCase().replace(/\s+/g, '');

    if (formattedInput === 'ALT184GATE40END256' && !canUseProgressionAction('admin-login', progress)) {
      audio.playGlitch();
      setLoginError('NICE TRY, TIME TRAVELER. FIND THE CLUES BEFORE THE PASSWORD FINDS YOU.');
      return;
    }

    if (formattedInput === 'ALT184GATE40END256') {
      audio.playSuccess();
      setLoginError('');
      updateProgress((prev) => ({
        ...prev,
        loggedIntoAdmin: true,
        unlockedCodeRoute: true, // fully unlocks flight coordinates
      }));
    } else {
      audio.playGlitch();
      setLoginError('CREDENTIALS REJECTED. ENSURE ALTITUDE, GATE, AND END VALUES ARE PROPERLY SEQUENCE-PAIRED.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1015] text-slate-100 font-sans overflow-hidden" id="messages-root">

      {/* Header: modern title bar with a segmented control. The second
          segment does not belong to this client's design system. */}
      <div className="shrink-0 px-3 pt-2.5 pb-2 border-b border-white/[0.06] bg-[#12141a]" id="messages-header">
        <div className="text-sm font-semibold text-white mb-2">Messages</div>
        <div className="flex rounded-full bg-white/[0.06] p-0.5">
          <button
            onClick={() => { audio.playTick(); setActiveTab('mom'); }}
            className={`flex-1 py-1.5 text-[10.5px] font-medium rounded-full transition-colors ${
              activeTab === 'mom' ? 'bg-[#2a2f3a] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            id="tab-mom"
          >
            Mom (Mara)
          </button>
          <button
            onClick={() => { audio.playTick(); setActiveTab('admin'); }}
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
        {activeTab === 'mom' ? (
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
            </div>

            {/* Decayed archive artifacts: the system kept the slots, not the words */}
            <div className="flex flex-col max-w-[80%] mr-auto items-start">
              <div className="px-3 py-2 rounded-2xl rounded-bl-md text-[10px] italic text-slate-500 border border-dashed border-slate-700/70 bg-transparent">
                Message unavailable · expired from carrier archive
              </div>
              <span className="text-[8px] text-slate-600 mt-0.5 px-1">--:--</span>
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
                <div className="laos-panel p-3 text-center space-y-1.5" id="bypass-acquired-card">
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
                </div>

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
                    <p className="font-mono text-[10px] bg-[var(--laos-bg)] p-2 border border-[var(--laos-line)] leading-relaxed text-[var(--laos-dim)]">
                      If you fly precisely at the following altitudes as you pass each consecutive gate starting at 40, the collider fails and you enter the legacy wireframe layer: <br />
                      <span className="text-[var(--laos-text)] font-bold">184, 172, 149, 133, 121, 118, 126, 143</span>
                    </p>
                    <p className="text-[var(--laos-text)] font-laos leading-relaxed">
                      I don't expect common players to find this. But I'll leave the device with you. Let our future son fly it one day. Let him see that we existed.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
