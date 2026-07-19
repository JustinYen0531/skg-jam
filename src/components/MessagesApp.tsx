import React, { useState } from 'react';
import { GameProgress, ChatMessage } from '../types';
import audio from '../lib/audio';
import { canUseProgressionAction } from '../lib/chapterProgress';
import { MessageSquare, ShieldAlert, KeyRound, Unlock, Heart, Send } from 'lucide-react';

interface MessagesAppProps {
  progress: GameProgress;
  updateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
}

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
      content: 'Mom, what was his favorite number code? 184-37-256? Is it a password?',
    },
    {
      sender: 'mom',
      time: '11:26 AM',
      content: 'Oh... your father always said numbers aren\'t passwords. They are paths. You must pair them with their coordinates: ALT, GATE, and END. Just like on the old schematics.',
    },
    {
      sender: 'me',
      time: '11:27 AM',
      content: 'ALT184GATE37END256?',
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
    
    if (formattedInput === 'ALT184GATE37END256' && !canUseProgressionAction('admin-login', progress)) {
      audio.playGlitch();
      setLoginError('NICE TRY, TIME TRAVELER. FIND THE CLUES BEFORE THE PASSWORD FINDS YOU.');
      return;
    }

    if (formattedInput === 'ALT184GATE37END256') {
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
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden" id="messages-root">
      
      {/* Messages Header tabs */}
      <div className="bg-purple-950 p-1 flex border-b border-purple-900/50" id="messages-header">
        <button
          onClick={() => { audio.playTick(); setActiveTab('mom'); }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 ${
            activeTab === 'mom' ? 'bg-purple-900 text-white shadow-inner' : 'text-purple-300/70 hover:text-white'
          }`}
          id="tab-mom"
        >
          <MessageSquare className="w-4 h-4" />
          <span>MOM (MARA)</span>
        </button>
        <button
          onClick={() => { audio.playTick(); setActiveTab('admin'); }}
          className={`flex-1 py-2 text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 ${
            activeTab === 'admin' ? 'bg-purple-900 text-white shadow-inner' : 'text-purple-300/70 hover:text-white'
          }`}
          id="tab-admin"
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>SILVER_KITE_ARCHIVE</span>
        </button>
      </div>

      {/* Message App Body Container */}
      <div className="flex-1 overflow-y-auto p-3" id="messages-body">
        {activeTab === 'mom' ? (
          /* PART A: Chat logs with Mother */
          <div className="space-y-3" id="chat-mom-panel">
            <div className="text-[9px] text-center text-slate-500 font-mono my-1">
              SMS OUTBOX CHATLOGS • RECENT HISTORY
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
                    className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'me' 
                        ? msg.isUnlockedCode 
                          ? 'bg-amber-600 text-white border border-amber-400 font-mono font-bold'
                          : 'bg-blue-600 text-white' 
                        : 'bg-slate-900 text-slate-200 border border-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[9px] text-center text-slate-600 italic">
              Mara's memories are fading, but she preserved your father's database credentials.
            </div>
          </div>
        ) : (
          /* PART B: Admin Archive Login & Logs */
          <div className="space-y-4" id="chat-admin-panel">
            {!progress.loggedIntoAdmin ? (
              /* If not logged in: Show credential prompt */
              <form onSubmit={handleAdminLogin} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4" id="admin-login-form">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-white">Silver Kite Database Node</h3>
                  <p className="text-[10px] text-slate-400">Secure log retrieval terminal for associated creators</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-slate-400 block">CREATOR ID</label>
                    <input
                      type="text"
                      disabled
                      value="MARA_KADE (SEC_PARTNER)"
                      className="w-full bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-slate-400 block">COORDINATE PASSWORD KEY (ALT___GATE__END___)</label>
                    <input
                      type="text"
                      placeholder="e.g. ALT100GATE10END10"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 px-2.5 py-1.5 rounded border border-amber-500/30 text-white font-mono placeholder-slate-700 focus:outline-none focus:border-amber-500 uppercase"
                      id="admin-password-input"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-[9px] bg-red-950/40 border border-red-500/30 text-red-400 p-2 rounded leading-relaxed font-mono" id="admin-login-error">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs transition-colors flex items-center justify-center gap-1"
                  id="admin-login-submit"
                >
                  <Unlock className="w-4 h-4" />
                  DECRYPT ENCRYPTED NODES
                </button>
              </form>
            ) : (
              /* Already Logged In: Show emotional dialog logs containing the sequence */
              <div className="space-y-4" id="admin-unlocked-logs">
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 text-center space-y-1" id="bypass-acquired-card">
                  <div className="font-mono text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                    <span>COLLISION BYPASS ENGINE OBTAINED!</span>
                  </div>
                  <p className="text-[9px] text-slate-300">
                    Your dad's original flight sequence has been recovered. Use these heights near Gate 37 in the game!
                  </p>
                  <div className="bg-slate-950 p-2 rounded border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 select-all select-all mt-1.5 text-center">
                    NK_184.172.149.133.121.118.126.143
                  </div>
                </div>

                {/* Legacy Archive Private Messages */}
                <div className="space-y-3.5 text-xs">
                  <h3 className="font-display font-bold text-xs text-purple-400 border-b border-purple-900/40 pb-1">
                    Legacy Archives (2014-04-20)
                  </h3>

                  {/* Log 1 */}
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span className="font-bold text-amber-400">Noah Kade</span>
                      <span>2014-04-20 22:15</span>
                    </div>
                    <p className="text-slate-200">
                      Mara, Elias is updating the game store credentials tomorrow. He is completely overwriting our game with a slop endless monetization script that removes our endings and injects spam ads. I can't let him wipe out our creations.
                    </p>
                  </div>

                  {/* Log 2 */}
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span className="font-bold text-pink-400">Mara Kade</span>
                      <span>2014-04-20 22:18</span>
                    </div>
                    <p className="text-slate-200">
                      Noah... is there any way to preserve the original 256 structural ending?
                    </p>
                  </div>

                  {/* Log 3 */}
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span className="font-bold text-amber-400">Noah Kade</span>
                      <span>2014-04-20 22:20</span>
                    </div>
                    <p className="text-slate-200">
                      Yes. I hid the true route within the collision loop. The scraper doesn't examine the old barometric altitude sensor registers. I hardcoded a structural bypass on Gate 37.
                    </p>
                    <p className="text-emerald-400 font-mono text-[10px] bg-slate-950 p-2 rounded border border-emerald-950/60 leading-relaxed">
                      If you fly precisely at the following altitudes as you pass each consecutive gate starting at 37, the collider fails and you enter the legacy wireframe layer: <br />
                      <span className="text-white font-bold font-mono">184, 172, 149, 133, 121, 118, 126, 143</span>
                    </p>
                    <p className="text-slate-200">
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
