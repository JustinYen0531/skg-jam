import type { ActiveApp } from '../types';
import type { DialogueLines } from './chapterOneDialogue';

export type ChapterThreeStorefrontDistraction = 'product' | 'department' | 'price' | 'delivery' | 'member';

export const CHAPTER_THREE_DIALOGUE = {
  entry: ["I do not know where Mom's Lumen Arc went.", 'But recalls never collect everything.'],
  homeReturned: ['Someone kept one.', 'Collectors, resellers, people who ignore safety notices.'],
  amazeMartOpened: ['AmazeMart. Where bad decisions arrive by tomorrow.', 'I only need one discontinued device.'],
  storefrontVisible: ['Nine thousand products I do not need.', 'One name should narrow this down.'],
  searchFocused: ['Lumen Arc. Hardware, not accessories.'],
  recalledSuggestion: ['Apparently the algorithm remembers what people were told to throw away.'],
  correctSearch: ['Zero certified matches.', 'The sponsored results seem less discouraged.'],
  decoyResults: ['A projector. A smart mug. A pillow with firmware.', 'The search engine is negotiating with the word “relevant.”'],
  filteredRecords: ['Three marketplace records are being hidden.', 'Trust and Safety may have accidentally found the useful part.'],
  sellerRevealed: ['There.', 'One listing the marketplace would rather pretend is not here.'],
  sellerExpanded: ['A Lumen Arc recovery lot for $1.84.', 'That price is trying very hard to mean something.'],
  reviewsSeen: ['Nobody agrees that it works.', 'That is not the same as saying nothing survived.'],
  orderRequested: ['This is a terrible purchase.', 'It is also the only listing.'],
  riskVisible: ['Fraudulent, unsafe, imaginary.', 'At least the warning is comprehensive.'],
  riskCancelled: ['Good instinct.', 'Unfortunately, I still need another lead.'],
  riskAccepted: ['I do not need the phone to work.', 'I need whatever survived with it.'],
  sellerNotification: ['That was fast.', 'Too fast.'],
  sellerRelayOpened: ['A buyer check. Not money—a score.', 'They know why someone would want this device.'],
  correctScore: ['ARC_184.', 'The score was sitting in the name the whole time.'],
  sellerMatched: ['Match.', 'The delivery archive just updated.'],
  approvedEndingA: ['The seller sent something.', 'Whatever it is, it is waiting in Deliveries.'],
} as const satisfies Record<string, DialogueLines>;

const WRONG_APP_DIALOGUE: Partial<Record<ActiveApp, DialogueLines>> = {
  browser: ['I found the file. This browser cannot run it.'],
  viewtube: ['The recording gave me a device name and a score. I need the device now.'],
  flappy: ['The current build will still kill me at forty.'],
  social: ['I am looking for hardware, not its former owner.'],
  messages: ['Nobody I know keeps recalled phones for emergencies.'],
  screenshots: ['Nothing new yet.', 'I have to receive something before I can inspect it.'],
  about: ['Yes, software disappears.', 'I am trying to buy the evidence.'],
};

const COMPANION_DIALOGUE = [
  'Someone kept one. People keep everything.',
  'This is not shopping. It only has prices.',
  'A dead device can still carry live evidence.',
  'One bad listing is more than zero certified matches.',
] as const;

const STOREFRONT_DISTRACTIONS: Readonly<Record<ChapterThreeStorefrontDistraction, readonly string[]>> = {
  product: ['Useful object. Wrong obsolete object.', 'The discount is impressive. The relevance is not.', 'I can ruin my finances after I find the device.', 'Tomorrow delivery. Twelve years late.', 'The marketplace has confused urgency with importance.'],
  department: ['Organized nonsense is still nonsense.', 'A reasonable category. An unreasonable search.'],
  price: ['Cheaper. Better rated. Equally unrelated.', 'Filtering the storefront will not create discontinued inventory.'],
  delivery: ['Harborview delivery is not the difficult part.'],
  member: ['Pay more to save on shipping. A flawless system.', 'The advertisement found me before the hardware did.'],
};

const normalize = (value: string): string => value.trim().toLowerCase().replace(/[\s_.-]+/g, ' ');

export const getChapterThreeWrongAppDialogue = (app: ActiveApp, attempt: number): DialogueLines =>
  WRONG_APP_DIALOGUE[app] ?? [COMPANION_DIALOGUE[attempt % COMPANION_DIALOGUE.length]];

export const getChapterThreeCompanionDialogue = (attempt: number): DialogueLines => [COMPANION_DIALOGUE[attempt % COMPANION_DIALOGUE.length]];

export const getChapterThreeStorefrontDistractionDialogue = (kind: ChapterThreeStorefrontDistraction, attempt: number): DialogueLines => {
  const pool = STOREFRONT_DISTRACTIONS[kind];
  return [pool[attempt % pool.length]];
};

export const getChapterThreeSearchResponse = (value: string, attempt = 0): { kind: string; lines: DialogueLines } => {
  const query = normalize(value);
  if (!query) return { kind: 'empty', lines: ['Searching for an empty shopping cart. Efficient.'] };
  if (query.includes('lumen arc')) return { kind: 'lumen_arc', lines: CHAPTER_THREE_DIALOGUE.correctSearch };
  if (query.includes('skyline256') || query.includes('skyline 256') || query.includes('ipa')) return { kind: 'known_file', lines: ['I already have the package name.', 'I need the device that can understand it.'] };
  if (query.includes('laos 4 1')) return { kind: 'operating_system', lines: ['The operating system narrows the era, not the seller.'] };
  if (query.includes('old phone') || query.includes('recalled phone')) return { kind: 'generic_phone', lines: ['A few million bad batteries and no useful model name.'] };
  if (query === '184') return { kind: 'score', lines: ['A score is not a product listing.'] };
  if (query === 'skg' || query.includes('silver kite')) return { kind: 'unknown_company', lines: ['Three letters and no context.', 'That is not something I know yet.'] };
  if (query.includes('noah') || query.includes('mara') || query.includes('elias')) return { kind: 'unknown_person', lines: ['That name has not appeared anywhere.'] };
  return { kind: 'other', lines: attempt % 2 === 0 ? ['Wrong object.'] : ['I need the hardware named in the archive record.'] };
};

export const getChapterThreeSellerCodeResponse = (value: string): { kind: string; lines: DialogueLines } => {
  const code = value.trim().toLowerCase().replace(/\s+/g, '');
  if (!code) return { kind: 'empty', lines: ['Sending silence to a suspicious seller. Strong opening.'] };
  if (code === '184') return { kind: 'correct', lines: CHAPTER_THREE_DIALOGUE.correctScore };
  if (code === '40') return { kind: 'gate', lines: ['Forty is the wall.', "The seller asked for the runner's score."] };
  if (code === '42') return { kind: 'recording_end', lines: ['That is where the recording stopped for me.', 'It is not where ARC_184 stopped.'] };
  if (code === '1.84') return { kind: 'price', lines: ['That is the price.', 'They asked for a score.'] };
  if (code === '256') return { kind: 'filename', lines: ['That number belongs to the filename.', 'Wrong piece of evidence.'] };
  if (code.includes('alt') || code.includes('gate') || code.includes('end')) return { kind: 'future_code', lines: ['That string has not appeared anywhere.'] };
  return { kind: 'other', lines: ['A score, not a guess.'] };
};
