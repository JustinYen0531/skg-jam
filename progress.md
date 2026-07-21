Original prompt: 實作 Meta 視角第一至第三階段：第二次 Gate 37 死亡後實際打開排行榜才鏡頭拉遠；顯示主角雙手、終端對話；手機按鈕改為延遲手指點擊；ViewTube 打字顯示虛擬鍵盤並讓手逐鍵觸碰。只做靜態分析與自動測試，不開瀏覽器。

## 2026-07-21 — Perspective-aware phone collision quad

- Replaced the too-strict background allowlist with a geometric collision quad matching the visible upright phone trapezoid.
- Any point inside the transformed device quad preserves the upright view, including blank home-screen space and transparent phone layers; any point outside it can rest the device, including hands, cups, and layered room objects.
- Uses the browser's transformed box quad when available and a matching trapezoid fallback otherwise.
- Browser validation remains intentionally omitted per project instruction; the user-supplied red collision outline and static geometry tests define the acceptance boundary.

## 2026-07-21 — Strict Meta click-to-rest allowlist

- Replaced the broad “anything outside `#phone-bezel` rests the device” rule with an explicit room-background allowlist.
- Blank home-screen touches, device chrome, transparent visual layers, hands, and unknown targets can no longer trigger the resting posture.
- Only the marked wall/floor/desk background layer can rest an upright device; only the device itself can wake it.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript, and production build are used for verification.

## 2026-07-21 — Phone-local Chapter 1 replay fullscreen

- The Chapter 1 ARC_184 replay now fills only `#phone-bezel`, never the player's browser viewport or `document.body`.
- Re-activating a completed replay restarts it at 0:00 with a fresh replay canvas cycle; pause/resume remains available before completion.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript, and production build are used for verification.

## 2026-07-21 — Persist the default Chapter 1 developer Meta view

- Opening Developer Debug Mode while it displays Chapter 1–10 now permanently confirms the Meta presentation for that run.
- Closing the panel with Ctrl+Shift+D hides only the developer interface; it no longer returns the already-entered Chapter 1 view to Chapter 0 fullscreen.
- The formal non-developer Meta reveal rule remains unchanged.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript, and production build are used for verification.

## 2026-07-21 — Restrict click-to-rest to the background

- Clarified request: clicking the device screen must not put it down, while clicking the desk, wall, or other background must still enter the resting view.
- Device-screen clicks preserve the upright posture; outside clicks rest it. Once resting, only clicking the device wakes it, while background clicks keep it resting.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript, and production build are used for verification.

## 2026-07-19

- 已確認 Meta 揭露不能直接沿用 `seenLeaderboard`，因為舊邏輯在第二次死亡時便提前設為 true。
- 新增純函式規則與測試：Meta 觸發、單一 pending interaction、reduced motion、虛擬鍵盤輸入。
- 已整合鏡頭場景：第二次 Gate 37 死亡後，必須實際點開排行榜才揭露桌面、雙手與終端對話。
- 已整合手機按鈕延遲點擊代理；Canvas 飛行操作維持即時。
- 已整合 ViewTube 搜尋虛擬鍵盤；實體與虛擬按鍵都排入單一手指動畫佇列，切換 App 時取消過期鍵盤輸入。
- 新增 `?meta=true` 開發驗收捷徑；正式觸發條件維持第二次 Gate 37 死亡後實際開啟排行榜。
- 修正死亡計數：只有 Gate 37 死亡會累加，並以 `gameOver` guard 防止同一幀重複死亡。
- 改用受控輸入 controller 更新 ViewTube 搜尋值，不再模擬原生 input event；reduced-motion 會立即輸入與執行。
- 最終靜態驗證：`npm test` 20/20、`npm run lint`、`npm run build` 全部通過。
- 依使用者要求未執行瀏覽器驗證；人工驗收可使用正式流程或 `?debug=true&meta=true` 捷徑。
- TODO：以人工視覺驗收調整手部造型、鏡頭縮放比例與打字節奏。

## 2026-07-19 — Dense fake platform feeds

- New request: replace the empty pre-search states in ViewTube, AmazeMart, and FaceSpace with content-heavy fake mainstream-platform feeds.
- Added a finite-pool pseudo-random feed utility: each app visit can reorder familiar cards without generating new puzzle-breaking content.
- Added deterministic tests for stable seeded order, namespace variation, and no missing or duplicated entries.
- Verification after the feed utility: `npm test` 26/26 passed.
- ViewTube empty state replaced with a topic rail, featured video, shuffled recommendation grid, live/trending metadata, and an in-world ARC_184 trend suggestion that fills the search field instead of acting as a tutorial wall.
- Static check after ViewTube: `npm run lint` passed.
- AmazeMart empty state replaced with a deal banner, category shortcuts, shuffled product cards, ratings, shipping metadata, and a discontinued-hardware suggestion that fills `Lumen Arc` into search.
- Static check after AmazeMart: `npm run lint` passed.
- FaceSpace empty state replaced with stories, a composer, people suggestions, shuffled friend/group/sponsored posts, and a Noah Kade recommendation that fills the profile search.
- GDD and implementation checklist now define content-dense finite feeds as the rule: only card order varies, never puzzle truth.
- Final static verification: `npm test` 26/26, `npm run lint`, and `npm run build` passed. Build emitted a non-fatal 500 kB chunk-size advisory.
- Browser and screenshot validation intentionally not run per user instruction.
- TODO for manual acceptance: confirm card density and text size on the target horizontal phone viewport, then tune card counts if the feeds feel too busy.

## 2026-07-19 — Public leaderboard redesign

- New request: make the public leaderboard long and scrollable, mostly English anonymous visitors, visually consistent with the neon AI-ad slop layer, and remove the premature Noah/system-overflow reveal.
- Static audit found that `highScore` was initialized to 37 but never updated, so the old player row could not represent the player's real best score.
- Added tested public leaderboard rules: 55 visible rows, 48 anonymous entries clustered at scores 35–38, a few named outliers, exact player score insertion/ranking, no Noah/negative/overflow data, and a monotonic advertising-style beat percentage.
- Verification after leaderboard data rules: `npm test` 35/35 passed.
- Added persistent `bestScore` progress state. It begins at 0, updates live during a run, writes back on death, and drives the highlighted player row and sorted rank.
- Replaced the legacy terminal table with a neon AI-ad ranking panel: fixed summary cards, a vertically scrollable 55-row list, highlighted live player row, and an exaggerated beaten-player percentage card.
- The public panel no longer contains Noah, negative score, signed-value, or overflow copy; the story reveal remains reserved for the later hidden leaderboard phase.
- Static check after UI integration: `npm run lint` passed.
- Final static verification: `npm test` 35/35, `npm run lint`, and `npm run build` passed; the non-fatal 500 kB chunk advisory remains.
- Browser validation intentionally not run. Manual acceptance should verify vertical scrolling, row density, and landscape-phone text size.

## 2026-07-19 — Meta hand anatomy rebuild

- Replaced the two rounded skin-colored placeholder blobs with layered SVG hands that have palms, thumbs, four curled fingers, nails, knuckle creases, wrists, and sleeve cuffs.
- The left hand now reads as a fixed support grip: fingers render behind the phone while the palm and thumb overlap the front bezel.
- The right hand is split across the phone depth plane and shares one animated fingertip anchor; it rests at the right edge, travels after player input, and presses with the extended index finger above buttons and the virtual keyboard.
- Added a static regression test that requires the front/back grip layers and fingertip marker, and rejects the old pointer-blob shape.
- Final static verification: `npm test` 36/36, `npm run lint`, and `npm run build` passed; the existing non-fatal 500 kB chunk advisory remains.
- Browser validation intentionally not run per project instruction. Manual acceptance shortcut: `?debug=true&meta=true`.

## 2026-07-19 — Physical Meta desk and developer chapter preview

- Developer Debug Mode now forces the same Meta interaction scene for every chapter snapshot from 1 through 10; closing debug returns to the formal story state unless Meta was genuinely unlocked.
- The formal unlock remains unchanged: a second Gate 37 death is insufficient until the player actually opens the leaderboard.
- Rebuilt the scene depth stack with a wood desk and front edge, phone contact shadow, 5.5-degree raised perspective, two metallic chassis depth layers, beveled rim, and glass reflections.
- The existing front/back hand layers remain on opposite sides of the phone depth plane so the device reads as held rather than pasted over the hands.
- Static regression coverage now verifies the developer preview integration and requires the desk, metal-depth, reflection, and tilt markers.
- Final static verification: `npm test` 37/37, `npm run lint`, and `npm run build` passed; the existing non-fatal 500 kB chunk advisory remains.
- Browser validation intentionally not run per project instruction. Manual acceptance shortcut: `?debug=true`.

## 2026-07-19 — Natural hand layers and animated regrip

- Preview audit confirmed the previous right-hand default pose looked like a detached upright index finger, while the outlined SVG parts read as stacked stickers.
- Added a permanent right-hand grip behind and in front of the phone; the tapping hand is hidden while idle.
- Interaction now runs through holding, 180 ms unfolding, 320 ms travel, press, return, and 260 ms regrip settle phases. The right grip only disappears during this sequence and returns after every button or virtual-key action.
- Shifted both rear finger groups upward behind the phone, reduced the tapping hand by roughly 20 percent, shortened the visible thumb intrusion, and introduced slight left/right pose asymmetry.
- Removed dark skin-part outlines. Palms, thumbs, index fingers, and rear fingers are separated only by restrained lighting gradients, faint creases, nail highlights, and one unified soft hand shadow.
- Preview verified the idle grip, launch-button tap, ViewTube search focus, virtual keyboard display, and physical-key relay back to the holding pose; the console reported zero errors.
- Final static verification: `npm test` 38/38, `npm run lint`, and `npm run build` passed; the existing non-fatal 500 kB chunk advisory remains.

## 2026-07-19 — Centered four-finger grip

- Moved both supporting palms upward to the vertical middle of the phone and farther toward the outer frame so the hands no longer hang from the bottom or cover the content area.
- Added four explicitly visible rear fingertips on each side. Their lengths, spacing, rotations, skin tones, and highlights vary so the grip reads as a hand rather than repeated stacked shapes.
- The right four-finger layer leaves with the holding hand during an interaction and returns after the tapping hand settles, preserving the existing smooth regrip sequence.
- Preview verified the idle composition and the launch-button release, tap, return, and regrip transition; the console reported zero errors.
- Static verification: `npm test` 38/38 and `npm run lint` passed before final build.

## 2026-07-19 — Full-frame Meta composition and persistent investigation view

- Increased the active Meta phone camera scale from `0.7` to `0.92`, exactly 1.314 times the previous size, while retaining the raised metal frame and glass treatment.
- Reallocated the stage into a dominant phone-and-hands upper field and a 92%-wide lower transcript panel with larger dialogue typography.
- Added the existing non-spoiler protagonist identity `YOU · LOCAL PLAYER` to the transcript header; no new canonical character name was invented.
- Added a tested persistent-investigation rule: after a chapter 1–9 snapshot is loaded, closing Developer Debug Mode hides only the tool panel and keeps the Meta desk, hands, phone, and transcript visible.
- Preview verified the full-width layout and the chapter 1 panel-close route; both retained all hand layers and the dialogue. Browser console reported zero errors.
- Final verification: `npm test` 38/38, `npm run lint`, and `npm run build` passed; the existing non-fatal 500 kB chunk advisory remains.

## 2026-07-20 — Remove forced finger stack and join the thumb

- Screenshot review showed that the explicit four-fingertip overlays read as detached capsules after the 1.314x Meta enlargement; the separate front thumb fill also made the grip look assembled from pieces.
- Removed both `VisibleRearFingers` layers completely. Rear fingers may now remain naturally occluded by the phone instead of being exposed to satisfy a count.
- Replaced the separate palm and thumb fills with one closed SVG silhouette spanning palm, thenar web, and thumb; lighting and crease paths remain secondary details only.
- Updated static regression coverage to reject any return of `VisibleRearFingers`, `data-visible-grip-finger`, or the old left/right visible-finger wrappers.
- Static verification before final build: `npm test` 38/38 and `npm run lint` passed. Browser validation remains intentionally omitted per project instruction.

## 2026-07-20 — Chapter 0 fullscreen and persistent Chapter 1 camera

- Chapter 0 now presents the cheap Flappy game edge to edge, without phone bezel styling, status bar, gesture bar, hands, or desk camera.
- The formal Meta reveal remains gated by at least two Gate 37 deaths followed by actually opening the leaderboard.
- Once formally unlocked, the Meta camera is controlled by its own persistent state and no longer inferred from `seenLeaderboard`, phase, or an arbitrary chapter 9 ceiling.
- Loading any developer chapter snapshot explicitly unlocks the same persistent Meta presentation; closing Developer Debug Mode hides only the tool panel.
- Verification is static and automated only; browser and screenshot validation remain intentionally omitted per project instruction.

## 2026-07-20 — Gate 40 Chapter 0 boundary revision

- Replaced the canonical Chapter 0 blocker, investigation clue, password, leaderboard cluster, and documentation references from Gate 37 to Gate 40.
- Score now increases when a pipe is actually passed, so passing Gate 39 produces score 40 and colliding with Gate 40 keeps the death result at 40.
- Death results appear immediately in the same state update instead of exposing the home screen for 800 ms.
- Gate 39 and Gate 40 retain a visible 50px horizontal gap while the configured maximum fall speed still makes the high-to-low route impossible.
- Daylight remains unchanged through 37, transitions across 38 and 39, and reaches full night at 40.
- The three upper-left fake analytics values now drift independently through deterministic decorative telemetry and never affect gameplay.
- Browser and screenshot validation remain intentionally omitted per project instruction; verification uses automated tests, TypeScript, and production build only.

## 2026-07-20 — Score acceleration to Gate 40

- Each passed pipe now awards 2 points instead of 1.
- The score-40 blocker remains the same visible impossible route, but its physical pipe index is now 20 so the player reaches it after 20 pipes.
- Formal Flappy physics and the ARC_184 replay share `SCORE_PER_PIPE = 2` and `GATE_40_INDEX = 20`; story-facing Gate 40 naming remains unchanged.
- Static verification: `npm test` 69/69, `npm run lint`, and `npm run build` passed. Browser and screenshot validation remain intentionally omitted per project instruction.

## 2026-07-20 — Core music language and generation baseline

- Added `docs/CORE_MUSIC_LANGUAGE.md` as the canonical basis for all eleven music stages.
- Preserved the user's original core-language paragraph verbatim and recorded the fixed twelve-bar structure, withheld final four bars, stage-by-stage degradation arc, reusable master prompt, negative prompt, and version metadata rules.
- The GDD now links to the music document and explicitly forbids generating eleven unrelated tracks from text; every stage must derive from one approved master melody or reference audio.
- No audio was generated or modified in this step.

## 2026-07-20 — Chapter 1 protagonist dialogue and companion prompts

- Added `docs/CHAPTER_1_PROTAGONIST_DIALOGUE.md` as the canonical Chapter 1 voice, trigger, early-input warning, and manual-testing reference.
- Replaced the fixed Chinese Meta transcript with event-driven English internal monologue while retaining `YOU · LOCAL PLAYER` as the unnamed protagonist label.
- Wired Chapter 1 guidance into returning home, opening correct and incorrect apps, clicking irrelevant ViewTube videos, focusing and submitting searches, playing the ARC_184 run, inspecting the impossible Gate 40 pass, and reading ARC_184's Lumen Arc reply.
- Future names, Lumen Arc, Silver Kite, the final password, and the altitude sequence now receive teasing non-progression responses; only normalized `ARC_184` variants reveal the target video.
- Chapter 2 progression now waits until the player has started the video and selected ARC_184's highlighted reply instead of advancing on search alone.
- Static verification passed: `npm test` 47/47, `npm run lint`, and `npm run build`. Browser and screenshot validation were intentionally omitted per project instruction.

## 2026-07-20 — ARC_184 accelerated gameplay replay

- Replaced ViewTube's `COLLISION_BYPASS_DETECTION` placeholder with an isolated `ArcRunReplay` canvas that reuses the real game's Gate geometry, score semantics, day-to-night transition, bird language, and Level 2 pipe material without mutating live game progress.
- Compressed score 0 through the Gate 40 controversy into a deterministic 14.5-second loop: the first 37 points are montage-paced, while Gate 39, the impossible dive through Gate 40, score 41, and a confirming score 42 remain individually legible.
- Rendered the archived capture at 15 FPS with restrained desaturation, sepia, scan lines, deterministic compression blocks, and a 240p player label; the treatment stays old and cheap rather than glitch-horror.
- Delayed the comment flood until Gate 40. Twenty-four comments now vary in size, speed, height, and movement; several hold in the center, all use bare text with no grey pills or masks, and together obscure the 40-to-41 crossing.
- Static verification passed: `npm test` 52/52, `npm run lint`, and `npm run build`. Browser and screenshot validation were intentionally omitted per project instruction.

## 2026-07-20 — Continuous replay pipes and protagonist auto-pause

- Replaced score-derived replay pipe reconstruction with a continuous world-coordinate stream. Two passed gates remain alive behind the bird, and every gate retains its fixed index and opening height while crossing the screen.
- Shortened the focused Gate 39–41 passage: score 40 arrives around nine seconds, the heavy barrage begins at score 41, and score 42 follows without the previous extended slow section.
- Added six sparse, bare-text ambient comments throughout scores 0–40. The existing 24-comment flood now remains exclusive to scores 41–42 and freezes with the video.
- Extended the deterministic replay to score 184 in 24 seconds. Score 42 holds long enough for the Meta right hand to tap the replay canvas and pause; clicking the paused video resumes the same timeline through 184.
- Added the protagonist pause line: `I've seen enough. He's pulling some kind of cheating trick.` followed by a request to inspect the exact 40-to-41 moment.
- Static verification passed: `npm test` 53/53 and `npm run lint`; final production build follows this documentation update. Browser and screenshot validation remain intentionally omitted per project instruction.

## 2026-07-20 — Half-speed ARC excerpt and final pause

- Reduced both the accelerated prelude scroll and the focused Gate 39–41 scroll to exactly 50 percent of their previous horizontal rates; the Gate 42 evidence beat now arrives around 20 seconds instead of 10.
- Removed the generated score 42–184 continuation that produced visually unrelated pipe states. The posted video may still claim a score of 184, but Chapter 1 deliberately examines only its Gate 40 excerpt.
- The protagonist's automatic pause at score 42 is now the terminal state of the replay. Later clicks retain the evidence monologue but cannot resume the canvas.
- Static verification passed: `npm test` 53/53, `npm run lint`, and `npm run build`. Browser validation remains intentionally omitted per project instruction.

## 2026-07-20 — Generated hand asset integration

- Located the user's root-level `hand.png` and confirmed it matches the attached image exactly. Its checkerboard was baked into a 24-bit RGB image rather than stored as transparency.
- Used the built-in image edit path only to replace the checkerboard with a flat chroma key, then used the installed imagegen removal helper to create `public/assets/meta-hand-grip.png` with real alpha. The source `hand.png` remains untouched.
- Replaced the visible idle SVG grips with two clipped halves of the new raster overlay above the phone. The left half remains fixed; the right half fades during an interaction so the existing reaching/tapping hand can continue unchanged.
- Kept the in-progress SVG anatomy and tap-hand code intact but hid the four old idle grip containers, preventing duplicate hands while preserving the user's uncommitted work.
- Added static coverage for the asset path, both left/right overlay layers, clip boundaries, and the right-side interaction fade.
- Static verification before final build: `npm test` 53/53 and `npm run lint` passed. Browser validation remains intentionally omitted per project instruction.

## 2026-07-20 — Generated tapping finger integration

- Located the user's root-level `finger.png`; its checkerboard was baked into a 24-bit RGB image rather than stored as transparency.
- Used the built-in image edit path to replace only the checkerboard with a flat chroma key, then converted it to real alpha as `public/assets/meta-tapping-finger.png`. The source `finger.png` remains untouched and untracked.
- Replaced the visible SVG tapping hand with the new raster asset while retaining the existing delayed interaction queue, target travel, press timing, activation callback, return, and regrip behavior.
- Anchored motion at the generated image's fingertip and added only a restrained five-pixel press movement; the obsolete rear SVG tapping layer remains preserved but hidden.
- Verification is static and automated only; browser and screenshot validation remain intentionally omitted per project instruction.

## 2026-07-20 — Mouse-wheel finger swipe

- Reused `public/assets/meta-tapping-finger.png`; no new image was generated or requested.
- Added a non-blocking wheel-capture gesture limited to the physical phone. Wheel-down maps to a 58-pixel upward finger swipe, while wheel-up maps to the same distance downward.
- The generated right grip fades only during the 520ms swipe, then returns. A 180ms throttle prevents trackpad or wheel bursts from continuously restarting the hand.
- The wheel event is never prevented, so the underlying ViewTube feed, leaderboard, or other scrollable phone content keeps its native movement.
- Static verification passed: `npm test` 54/54, `npm run lint`, and `npm run build`; direction mapping, scene wiring, and generated finger reuse are covered. Browser validation remains intentionally omitted per project instruction.

## 2026-07-20 — Tapping finger scale correction

- User screenshots showed the generated tapping/swipe hand was visibly undersized beside the persistent grip hands.
- Increased both generated finger render paths from `clamp(210px, 31vh, 300px)` to `clamp(294px, 43vh, 420px)`, approximately 1.4 times larger.
- Preserved the `40% / 6%` fingertip anchor, target coordinates, press motion, swipe travel, and interaction timing so only the anatomical scale changes.
- Browser validation remains intentionally omitted per project instruction; static regression coverage now locks both finger layers to the corrected size.

## 2026-07-20 — Tapping finger skin-tone and scale match

- Used the protagonist grip-hand screenshot as the color reference and changed the pointing-hand sprite from saturated orange to the same softer, muted peach-pink family.
- Preserved the pointing pose and converted the edited chroma-key result back to a validated transparent PNG at `public/assets/meta-tapping-finger.png`.
- Increased both click and wheel-swipe render paths by exactly 1.5 times, from `clamp(294px, 43vh, 420px)` to `clamp(441px, 64.5vh, 630px)`.
- Browser validation remains intentionally omitted per project instruction; verification is limited to static tests, TypeScript lint, and production build.

## 2026-07-20 — Chapter 0–10 physical desk environment foundation

- Added a pure `CHAPTER_ENVIRONMENTS` map for Chapter 0–10. It reads chapter state only and cannot mutate game progress.
- Chapter 0 explicitly has no physical desk objects; Chapter 1–10 now drive cumulative coffee, cup-ring, charging-cable, notebook, pen, sticky-note, lighting, and desk-order states.
- Added a layered `ChapterEnvironment` component beneath the phone and hands, with a brief case marker and reduced-motion fallback. All clues written on physical paper are gated to the chapter where the player has already earned them.
- Wired `progress.currentChapter` into the revealed Meta scene while the unrevealed fullscreen game passes Chapter 0.
- Added static coverage for all eleven deterministic states, spoiler timing, the clutter-to-quiet-to-organized arc, DOM integration, and the display-only boundary.
- Subagent review tightened spoiler timing, disabled layout motion under reduced-motion preferences, and made restart explicitly restore the Chapter 0 fullscreen presentation.
- Remaining physical-world work: phone-home icon reordering, chapter-specific phone/hand pose presets, final art assets, and user visual tuning. Browser validation remains intentionally omitted per project instruction.

## 2026-07-20 — Complete sound-effect design document

- Added `docs/SOUND_EFFECT_DESIGN.md` as the canonical specification for all non-music audio: flight feedback, cheap ad UI, phone navigation, keyboard input, protagonist typewriter text, Meta hand/glass Foley, app evidence actions, hidden leaderboard reveals, and endings.
- Defined five sound worlds, chapter evolution, bus and concurrency rules, asset naming/export requirements, a current `AudioManager` audit, a proposed event API, and P0/P1/P2 production priorities.
- Kept BGM authority in `docs/CORE_MUSIC_LANGUAGE.md`; the new document explicitly avoids cinematic horror cues and prevents audio from revealing evidence before the player discovers it.
- Linked the sound specification from the GDD and added its implementation tasks to the checklist. This step changes documentation only; no runtime audio implementation was added.

## 2026-07-20 — P0 sound audibility correction

- Static audit confirmed the P0 Web Audio event engine and core trigger paths existed locally but were not committed, and several late-story P0 events were still synthesis-only.
- Raised bus gains to compensate for event × bus × master multiplication: gameplay `0.50 → 0.85`, UI `0.30 → 0.60`, narrative `0.16 → 0.50`, and Meta Foley `0.38 → 0.65`.
- Reduced ambience `0.20 → 0.12` so the room/device bed does not mask flap, keyboard, monologue glyph, and fingertip details.
- This pass changes gain staging only; event timbres, trigger timing, polyphony caps, and mute behavior remain unchanged. Browser listening validation remains intentionally omitted per project instruction.

## 2026-07-20 — Eleven-phase BGM integration

- Renamed the supplied root audio files `00.mp3` through `10.mp3` to `Phase 1.mp3` through `Phase 11.mp3` under `public/assets/music/`.
- Mapped the cheap Chapter 0 intro to Phase 1, then mapped investigation Chapters 1–10 to Phases 2–11.
- Added one looping music player with a restrained 600 ms phase crossfade, shared global mute behavior, and a first-input retry for browser autoplay restrictions.
- Added static coverage for all eleven assets, the Chapter-to-Phase mapping, looping playback, phase-change wiring, and mute integration.
- Browser listening validation remains intentionally omitted per project instruction; manual listening should check relative BGM/SFX balance and loop seams.

## 2026-07-20 — P0/P1 hard audibility repair

- Replaced the ineffective sub-unity-only gain correction with explicit per-event loudness multipliers: gameplay/UI `4.5x`, narrative `7x`, and Meta Foley `5x`.
- Added a final dynamics limiter so overlapping collision, death, and UI layers can be clearly loud without uncontrolled clipping.
- Added capture-phase pointer/keyboard AudioContext unlocking and retry of the triggering event after a suspended context resumes.
- Preserved event timing, pitch, deterministic variants, P1 event identities, mute behavior, and the deliberately quiet ambience layer.
- Browser listening validation remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build are required before upload.

## 2026-07-20 — Phone-embedded virtual keyboard

- Moved the Meta virtual keyboard from the scene root into the same transformed surface as the physical phone screen.
- Anchored it inside the lower seven percent of the display, above the phone content and beneath the glass/rim layers, so it follows the phone's scale and 3D tilt.
- Set the complete keyboard overlay to sixty percent opacity while keeping its buttons interactive and slightly increasing key contrast.
- Removed the old root-level keyboard that was positioned behind the protagonist dialogue panel.
- Browser/Preview validation remains intentionally omitted per project instruction; static placement coverage, TypeScript lint, and production build are required before upload.

## 2026-07-20 — Foreground chapter objects and translucent dialogue

- Split `ChapterEnvironment` into a background lighting layer and a foreground object layer so chapter props are no longer trapped behind the animated phone stacking context during normal play.
- Positioned the object layer at z-index 25: above the phone and fixed grip hands, below the animated interaction finger and dialogue.
- Enlarged the coffee, notebook, pen, and cable from approximately 1.7x to 1.9x using object-specific bottom/side transform origins so they remain anchored on the desk instead of drifting off-screen.
- Reduced the dialogue panel background from 82% to 52% opacity and its blur to 1px so the evolving desk objects remain visible beneath the text.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build cover the change.

## 2026-07-21 — Chapter 3 desk contact pass

- Split the notebook and pen into a dedicated z-index 9 underlay beneath the z-index 10 phone and z-index 22 grip hands, so the device and hands now visibly rest over the notebook.
- Reduced and repositioned the notebook and pen to remain inside the lower-left desk area instead of crossing the scene boundary.
- Kept Chapter 2's cable loose; Chapter 3 alone now uses the connected cable and a downward plug tip aligned toward the phone's bottom-center port.
- Shifted the coffee cup left and down, enlarged it slightly for foreground perspective, and added one dark coffee drop only in Chapter 3.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build cover the change.

## 2026-07-21 — Wider text-safe grip position

- Restored the persistent hand offsets that had been overwritten in the shared working copy and increased the mirrored horizontal shift from `4.5%` to `7%`.
- Anchored the left hand at `left: -7%` and the right hand at `right: -7%`, moving both vertical palms toward the outer scene edges while keeping the thumbs near the phone rim.
- Preserved hand scale, vertical position, split-image clipping, interaction fade, tapping-finger animation, and phone geometry.
- Browser/Preview validation remains intentionally omitted per project instruction; static offset coverage, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Grip offset visual correction

- Reduced the mirrored persistent hand offset from `7%` to `5%` after the updated screenshot showed the thumbs sitting too far away from the phone rim.
- Kept the vertical palms outside the text-safe area while bringing both thumbs two percentage points closer to the device edge.
- Browser/Preview validation remains intentionally omitted per project instruction; static offset coverage, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Charging cable rear-layer continuation

- Split the connected plug across the phone depth plane: only the inserted metal tip sits in the z-index 9 underlay, while the plug housing and cable remain visible in the foreground.
- Extended both cable strokes from SVG x=510 to x=650 so the right end continues beyond the scene crop instead of exposing a rounded tail.
- The phone now occludes the metal insertion point without hiding the cable body or moving the coffee cup.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Grip offset clarification

- Corrected the persistent grip offset to an absolute `2%` per side; the prior pass incorrectly interpreted the request as subtracting two percentage points from `7%`.
- The left hand now uses `left: -2%` and the right hand uses `right: -2%`.
- Browser/Preview validation remains intentionally omitted per project instruction; static offset coverage, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Grip offset final calibration

- Set the persistent left and right grip offsets to the requested absolute `4%` per side.
- Browser/Preview validation remains intentionally omitted per project instruction; static offset coverage, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Grip offset final value

- Set the persistent left and right grip offsets to the requested absolute `3%` per side.
- Browser/Preview validation remains intentionally omitted per project instruction; static offset coverage, TypeScript lint, and production build are required before upload.

## 2026-07-21 — P2 fine-detail sound implementation

- Added the complete P2 synthesis tier: leaderboard row/percentage cues, scroll-boundary bounce, finger release, rare device creak, desk contact, evidence-paper rotation, preserve-ending download counts, and the reduced score ping after 184.
- Connected each event to its real interaction with engine-level cooldowns for row scanning, percentage changes, scroll limits, paper movement, and the 30-second device-creak floor.
- Kept the P2 layer quiet and non-instructional; it adds physical detail without revealing clues or competing with P0/P1 feedback.
- Browser listening remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Developer chapter advance guide

- Replaced the developer panel's evidence recordings and raw progress flags with a dynamic English chapter-advance guide.
- Each Chapter 1–10 snapshot now shows its next destination, objective, three required player actions, and the exact completion condition.
- Chapter 1 specifically guides ViewTube search, evidence playback, and the ARC_184 reply that advances into Chapter 2; Chapter 10 guides the altitude route into the ending.
- Added static coverage for all-English guide copy, all ten chapter mappings, and removal of the obsolete evidence/flag panels.
- Browser validation remains intentionally omitted per project instruction.

## 2026-07-21 — Desk-click phone rest posture

- Added a two-state Meta posture toggle: clicking outside `#phone-bezel` lays the device on the desk; clicking the desk again raises it.
- Phone-screen clicks remain dedicated to normal app interactions and never toggle the rest posture.
- The phone, persistent grip hands, scroll finger, and tapping finger share one camera-pitch spring; table-rest locks that pitch at 68 degrees instead of following mouse height.
- Both grip-hand halves also move down and outward while resting, so the protagonist visibly loosens their hold rather than leaving upright hands around a flat phone.
- Added a tighter table contact shadow and existing desk-contact/regrip Foley to sell the placement and pickup.
- Browser validation remains intentionally omitted per project instruction; static interaction tests, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Mandatory controversial replay fullscreen

- Opening the ARC_184 controversial run now mounts a viewport-filling player and locks page scrolling until the evidence transition is reached.
- Playback may be paused and resumed by clicking, Space, or Enter, while Escape and the disabled exit control cannot leave the replay early.
- Mouse movement reveals a shadowed ViewTube-style HUD with a red timeline; the Gate 40-to-41 evidence pause is mapped to exactly `1 / 3.2` (`31.25%`) of the displayed timeline.
- Reaching the evidence frame automatically pauses playback, records `watchedVideo`, and unlocks the fullscreen exit. The ARC_184 reply cannot advance Chapter 1 before that point.
- Browser validation remains intentionally omitted per project instruction; 88 tests, TypeScript lint, production build, and diff checks pass after integration with the latest remote main.

## 2026-07-21 — Flat resting-hand perspective swap

- Added the user-supplied split resting-hand artwork as a dedicated table-rest pose while retaining the existing grip artwork for the upright phone.
- Crossfaded both hand pairs over the phone posture transition; the resting pair uses a fixed shallow desk-plane perspective instead of inheriting the phone's 68-degree pitch.
- Split the resting artwork exactly at its center, mirrored the final tilt, and moved the abbreviated wrists below the scene edge so their cropped ends remain hidden.
- The right resting hand still yields to tapping and scrolling gestures, then settles back onto the desk.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Chapter 1 Meta-state consistency

- Reworked the desk-rest posture into explicit `rest` and `wake` actions: an upright desk click rests the phone, while the next click anywhere wakes it.
- A wake click inside the phone now raises the device immediately and continues through the normal input route, so the requested button, field, canvas, or screen action is not discarded.
- Kept the initial `intro_game` presentation bare, but made every restored-phone phase from Chapter 1 onward retain the Meta scene even if the transient reveal flag is absent.
- Made ARC_184 searching available after either the real leaderboard evidence or entry into the Chapter 1 restored-phone phase, fixing developer snapshots with stale leaderboard state without allowing intro guessing.
- Browser validation remains intentionally omitted per project instruction; 90 tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Resting composition perspective correction

- Reduced the dedicated resting-hand pair to half size and moved the left and right halves diagonally toward the upper-left and upper-right desk areas, clearing the phone screen.
- Gave each hand its own palm-side transform origin and mirrored eight-degree rotation so the two halves settle naturally instead of collapsing toward the same center point.
- Animated the existing trapezoid table artwork from the raised-front composition into a horizontally contained, vertically flattened desk plane while resting, exposing its upper edge and both corners.
- Kept the hand, table, phone, and contact-shadow transitions synchronized without replacing or redrawing the supplied PNG assets.
- Browser validation remains intentionally omitted per project instruction; static tests, TypeScript lint, and production build are required before upload.

## 2026-07-21 — Chapter wall artwork integration

- Imported the five user-supplied transparent wall states as `meta-wall-stage-1.png` through `meta-wall-stage-5.png`.
- Mapped Chapters 1–2, 3–4, 5–6, 7–8, and 9–10 to the five increasingly damaged room states; Chapter 0 remains free of the Meta environment.
- Confined the artwork to the existing wall region above the 58% wall/desk boundary. The source images are scaled from their measured transparent bounds so their generated floor strips are cropped out rather than replacing the existing desk or any future floor asset.
- Kept the wall behind the desk, hands, phone, chapter props, and existing light overlays.
- Browser validation remains intentionally omitted per project instruction; 91 tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Wall edge overscan and temporary floor removal

- Increased every chapter wall state from 108% to 120% width with symmetrical 10% horizontal overscan, removing the exposed side strips without changing the wall/desk boundary.
- Removed the separate dark-brown `meta-desk-surface` floor block and replaced the underlying room fallback with black until the supplied floor artwork is integrated; the existing wooden desk artwork remains unchanged.
- Previewed Chapter 1 in both upright and desk-rest poses at 1365×910 and 1024×768. The wall extends beyond both scene edges by about 132px and 98px respectively, with no exposed side color blocks and no failed page resources.
- 91 static tests, TypeScript lint, production build, diff checks, and the requested Preview pass after the change.

## 2026-07-21 — Resting phone/table edge alignment

- The user explicitly authorized Preview for this composition pass and supplied a 1193×621 reference screenshot.
- Preview at the matching viewport confirmed the resting phone still consumed too much of the desk and its converging side edges did not follow the table trapezoid.
- Scaled the resting phone from `0.80` to `0.60` (exactly 0.75×) and moved the smaller device toward the table front edge.
- Same-size Preview comparison measured the visible desk edge near 49 degrees and the phone edge near 54 degrees at a 64-degree pitch; the final 68-degree pitch closes that remaining visual gap while preserving the requested smaller footprint.
- Final 1193×621 Preview confirmed the 0.60-scale phone remains inside the trapezoid and sits near the desk front edge; its side edges now visually track the table edges, and the console reported zero errors.
- The bundled web-game screenshot client was also run; because it intentionally crops to the game canvas, the full-scene Browser Preview remains the authoritative composition check for this DOM-based Meta camera.

## 2026-07-21 — Exact similar-trapezoid correction

- The previous pass matched only the general slant and did not make the resting phone geometrically similar to the supplied wooden-table trapezoid.
- Measured the table PNG alpha silhouette: its surface is approximately 477 px across the top and 644 px across the bottom, giving a target top/bottom ratio near 0.74.
- Solved both visible constraints instead of adjusting pitch alone: a 55-degree resting pitch restores the table-like trapezoid height, while a 2370 px perspective distance targets the measured 0.74 top/bottom ratio at the existing 0.60 scale.
- Shifted both chapter-object layers four percent right as one group, moving coffee and every supporting desk prop consistently.

## 2026-07-21 — Complete wall lower edge

- Removed the 58%-height wall clipping boundary that cut through the supplied wall artwork above its baseboard and furniture feet.
- Converted the wall layer to a full-scene clipping surface while preserving the previous rendered scale mathematically: `-20% × 58% = -11.6%` top offset and `163% × 58% = 94.54%` image height.
- The complete source artwork now reaches about 83% of the scene behind the wooden desk; its included floor strip is marked temporary and can be covered by the upcoming dedicated floor asset.
- Browser Preview remains intentionally omitted under the repository's static-analysis-only rule; 92 static tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Raised phone far edge and parallel side correction

- Rechecked the user's annotated 1289×530 reference instead of relying on the earlier top/bottom-width comparison.
- Reduced the resting pitch from 55 to 48 degrees so the phone's far edge visibly rises instead of collapsing into a flat strip.
- Tightened the resting perspective to 1500 px so the phone's converging side edges follow the annotated desk-edge direction while preserving the 0.60 device scale.
- Moved the resting phone upward from 16% to 8%, placing its raised far edge near the wooden desk's upper surface.
- Used the explicitly requested Preview at 1289×530 to verify the table-rest silhouette and placement.

## 2026-07-21 — Exact four-corner desk projection

- Replaced the resting phone's guessed `rotateX` perspective with a four-point projective matrix derived from the desk artwork's measured surface corners: TL(115,136), TR(592,136), BR(678,229), and BL(28,229) in the 707×353 source image.
- Built the phone target as a 0.60 homothetic copy of the rendered desk quadrilateral, which guarantees every corresponding edge is parallel rather than merely visually close.
- Added a projective-matrix solver and regression test that maps all four source corners to their targets and verifies parallelism with edge-vector cross products.
- Previewed the final table-rest state at the user's 1128×549 reference size. Both phone side vectors measured exactly 0.60 of the corresponding desk vectors, with floating-point cross-product error below 1.1e-11.

## 2026-07-21 — Five-stage floor artwork integration

- Imported `floor1.png` through `floor5.png` as `meta-floor-stage-1.png` through `meta-floor-stage-5.png`, preserving the original workspace files.
- Mapped Chapters 1–2, 3–4, 5–6, 7–8, and 9–10 to the five increasingly worn floor states; Chapter 0 remains free of the Meta environment.
- Positioned the transparent floor artwork at 28% scene height with full-scene height, making its measured visible top edge meet the wall/floor boundary near 58% while its widening trapezoid overscans the lower scene edges.
- Layered the floor above the wall artwork and below the wooden desk, phone, hands, and chapter props; the floor now covers the temporary floor strip embedded in the wall source.
- Browser Preview remains intentionally omitted under the repository's static-analysis-only rule; 93 static tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Floor overscan and upper crop

- Replaced the floor's natural-width rendering with a centered 180%-wide crop so the narrow far edge of the transparent trapezoid extends beyond both scene edges instead of exposing black wedges beside the desk.
- Kept the floor at 28% scene top and 100% scene height; the viewport therefore retains approximately the upper 72% of the source artwork, closely matching the requested upper-two-thirds crop while keeping the rug visible.
- Preserved the wall/floor seam, chapter mapping, floor height, and every foreground layer; only the floor's horizontal overscan changed.
- Browser Preview remains intentionally omitted under the repository's static-analysis-only rule; 94 static tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Smaller, higher projected phone

- Reduced the homothetic resting-phone quadrilateral from 60% to 40% of the rendered desk surface while preserving exact corresponding-edge parallelism.
- Shifted all four projected phone corners upward by 10% of scene height, keeping the trapezoid unchanged while opening more foreground and right-side space for the coffee cup and chapter props.
- Kept the existing desk, coffee, hands, and object-layer transforms unchanged.

## 2026-07-21 — Preserve the complete wall edge above the floor

- Corrected the background stacking order after the widened floor artwork covered the wall baseboard and lower furniture silhouette.
- Locked the environment layers to floor `z=0`, complete wall `z=1`, and wooden desk `z=2`; the floor still fills the viewport, while the wall's original lower edge remains visible in front of it.
- Kept the 180% centered floor overscan, upper-two-thirds crop, rug placement, wall dimensions, and all foreground transforms unchanged.
- Applied the compiler-required `unknown` bridge to the concurrently added four-corner projection test without changing its geometry or runtime behavior.
- Browser Preview remains intentionally omitted under the repository's static-analysis-only rule; 94 static tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Posture-specific coffee placement

- Split coffee placement by device posture instead of applying the previous clearance adjustment globally.
- Restored the upright handheld positions exactly to their prior values: normal 62%, tipped 67%, and pushed-away 65% scene top.
- Retained the raised resting positions only for the desk-rest pose: normal 48%, tipped 53%, and pushed-away 51% scene top.
- Kept the charging cable's three-percent right shift and all coffee artwork, scale, state, steam, drip, spill, and transition behavior unchanged.
- Browser Preview remains intentionally omitted under the repository's static-analysis-only rule; 94 static tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Coffee and charging-cable clearance

- Raised every coffee-cup state by 14% of scene height: the normal cup moved from 62% to 48%, the tipped cup from 67% to 53%, and the pushed-away cup from 65% to 51%.
- Shifted both charging-cable layers three percent right by changing their shared right anchor from -2% to -5%, filling the empty right-side span without changing cable geometry or scale.
- Preserved coffee size, state artwork, steam, spills, cable insertion logic, phone projection, hands, wall, floor, and desk transforms.
- Browser Preview remains intentionally omitted under the repository's static-analysis-only rule; 94 static tests, TypeScript lint, production build, and diff checks pass.

## 2026-07-21 — Reliable replay fullscreen exit

- Removed the redundant ref guard inside the already-gated fullscreen close handler; the EXIT button remains disabled until Gate 41, but an unlocked click can no longer silently no-op because two unlock states drifted apart.
- Exit now pauses the replay, scrolls the underlying ViewTube page directly to `#vt-comments`, and closes the fullscreen portal so the evidence discussion is immediately visible.
- Added static regression coverage for the complete unlocked EXIT path while preserving the mandatory pre-Gate-41 lock.
