import { describe, it, expect } from 'vitest';
import { generateCardArtSvg, generateCardArtDataUrl } from '../src/cardArtFallback.js';

describe('AI Card Art Fallback Generator', () => {
  it('generates well-formed SVG string for default vibe emoji', () => {
    const svg = generateCardArtSvg('🔮', 'The Digital Wanderer', 'Destiny & device memory');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('🔮');
    expect(svg).toContain('url(#bgGlow)');
    expect(svg).toContain('url(#violetGlow)');
    expect(svg).toContain('url(#greenGlow)');
  });

  it('generates distinct geometric variants for different vibe emojis', () => {
    const eyeSvg = generateCardArtSvg('👁️', 'The Watcher', 'Love & algorithms');
    const matrixSvg = generateCardArtSvg('💻', 'The Sysadmin', 'Career & cookies');
    const energySvg = generateCardArtSvg('⚡', 'The Spark', 'Destiny & device memory');
    const balanceSvg = generateCardArtSvg('⚖️', 'The Arbiter', 'Career & cookies');
    const celestialSvg = generateCardArtSvg('🌙', 'The Night Owl', 'Destiny & device memory');

    expect(eyeSvg).toContain('<ellipse');
    expect(matrixSvg).toContain('<rect');
    expect(energySvg).toContain('<polygon');
    expect(balanceSvg).toContain('<polygon');
    expect(celestialSvg).toContain('M 200 82 A 68 68');
  });

  it('generates valid data URL for browser image elements', () => {
    const dataUrl = generateCardArtDataUrl('🔮', 'The Digital Wanderer', 'Destiny & device memory');
    expect(dataUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(dataUrl).toContain('%3Csvg');
  });

  it('ensures no personal visitor data is ever included in the illustration', () => {
    const svg = generateCardArtSvg('🔮', 'The Digital Wanderer', 'Destiny & device memory');
    const lower = svg.toLowerCase();
    expect(lower).not.toContain('ip address');
    expect(lower).not.toContain('browsing history');
    expect(lower).not.toContain('tabs');
    expect(lower).not.toContain('password');
  });
});
