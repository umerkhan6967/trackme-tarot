/**
 * src/fortune.js
 * Synthesizes telemetry signals into satirical, eerie cyber-tarot archetypes and fortunes.
 */

const ARCHETYPES = [
  {
    id: 'overclocked-phantom',
    numeral: 'VII',
    suit: 'SUIT OF SILICON',
    title: 'THE OVERCLOCKED PHANTOM',
    subtitle: 'High-Thread count, Zero Peace of Mind',
    avatar: '⚡',
    condition: (fp) => fp.cores >= 8 || fp.gpuRenderer.toLowerCase().includes('nvidia') || fp.gpuRenderer.toLowerCase().includes('rtx'),
    quote: 'Your machine hums with enough compute to launch a satellite, yet 92% of your cycles are consumed by 47 abandoned browser tabs and a video you paused 3 hours ago.',
    warning: 'Oracle verdict: You will purchase another peripheral you do not need before this quarter ends.'
  },
  {
    id: 'endless-scroller',
    numeral: '0',
    suit: 'SUIT OF GLASS',
    title: 'THE ENDLESS SCROLLER',
    subtitle: 'Thumb of Mercury, Spine of a Shrimp',
    avatar: '📱',
    condition: (fp) => fp.isMobile || fp.isTouchDevice,
    quote: 'Your screen detects relentless capacitive micro-swipes. You opened this page to look for answers, but your algorithm already filed you under "susceptible to 3 AM impulse buys".',
    warning: 'Oracle verdict: Drink water and uncurl your posture immediately.'
  },
  {
    id: 'dual-monitor-architect',
    numeral: 'IV',
    suit: 'SUIT OF RESOLUTION',
    title: 'THE PIXEL SOVEREIGN',
    subtitle: 'Master of Viewports, Captive to Notifications',
    avatar: '👁️',
    condition: (fp) => {
      const [w] = fp.resolution.split('x').map(Number);
      return w >= 1920 || fp.pixelRatio > 1.25;
    },
    quote: 'A canvas vast enough to simulate weather patterns, yet your gaze remains permanently locked onto a Slack channel waiting for a three-dot typing indicator.',
    warning: 'Oracle verdict: The red unread badge you are ignoring will haunt you tonight.'
  },
  {
    id: 'nocturnal-tab-hoarder',
    numeral: 'XVIII',
    suit: 'SUIT OF SHADOWS',
    title: 'THE NOCTURNAL PROWLER',
    subtitle: 'Circadian Rhythm: Error 404',
    avatar: '🦇',
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 22 || hour <= 5;
    },
    quote: 'The spectral glow of blue light bathes your face. Every tracker on the eastern seaboard knows you are awake when respectable society sleeps.',
    warning: 'Oracle verdict: Closing 10 inactive tabs will not fix your sleep schedule, but try it anyway.'
  },
  {
    id: 'paranoid-specter',
    numeral: 'IX',
    suit: 'SUIT OF CIPHERS',
    title: 'THE PARANOID SPECTER',
    subtitle: 'Do-Not-Track Flag: Proudly Ignored by All Ad Networks',
    avatar: '🥷',
    condition: (fp) => fp.doNotTrack === true,
    quote: 'You flipped the Do-Not-Track toggle hoping for invisibility. In doing so, you placed a neon beacon on your forehead that says: "This one cares enough to resist".',
    warning: 'Oracle verdict: Your ad-blocker loves you, but your canvas fingerprint knows your heart.'
  },
  {
    id: 'battery-ascetic',
    numeral: 'XVI',
    suit: 'SUIT OF VOLTS',
    title: 'THE DEPLETED ACOLYTE',
    subtitle: 'Living dangerously at low voltage',
    avatar: '🪫',
    condition: (fp) => fp.batteryStatus && fp.batteryStatus.level < 25 && !fp.batteryStatus.charging,
    quote: 'Your battery levels whisper of adrenaline and neglect. You stare into the digital abyss with 14% remaining and no cable in sight.',
    warning: 'Oracle verdict: Plug in your device before the digital realm claims your unsaved thoughts.'
  },
  {
    id: 'standard-citizen',
    numeral: 'XXI',
    suit: 'SUIT OF CLOUD',
    title: 'THE CHROME WANDERER',
    subtitle: 'Perfect Demographic Camouflage',
    avatar: '🌐',
    condition: () => true, // default fallback
    quote: 'Your browser profile is so impeccably typical that data brokers consider you the golden baseline of consumer compliance.',
    warning: 'Oracle verdict: A targeted ad for something you only thought about will manifest in 48 hours.'
  }
];

export function generateFortune(fingerprint) {
  // Find first matching archetype or fallback
  const card = ARCHETYPES.find((arc) => arc.condition(fingerprint)) || ARCHETYPES[ARCHETYPES.length - 1];

  return {
    ...card,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    locationEstimate: fingerprint.timezone.replace('_', ' ')
  };
}
