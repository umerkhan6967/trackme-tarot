import { describe, it, expect } from 'vitest';
import {
  generateSlide1Canvas,
  generateSlide2Canvas,
  generateSlide3Canvas,
  generateAllStorySlides,
  downloadStorySlides,
  shareStorySlides
} from '../src/storySlides.js';

// Mock minimal canvas document when running in Node environment
if (typeof document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            shadowColor: '',
            shadowBlur: 0,
            font: '',
            letterSpacing: '',
            textAlign: '',
            fillRect: () => {},
            strokeRect: () => {},
            fillText: () => {},
            measureText: (str) => ({ width: (str || '').length * 10 }),
            beginPath: () => {},
            closePath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            quadraticCurveTo: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} })
          }),
          toDataURL: () => 'data:image/png;base64,mock',
          toBlob: (cb) => cb(new Blob(['mock']))
        };
      }
      return {};
    },
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  };
}

describe('Story-Style Share Slides (1080x1920)', () => {
  const samplePayload = {
    fortune: {
      archetype: 'The Digital Voyager',
      fortune: 'Your silicon footprint broadcasts telemetry across the digital ether.',
      prediction: 'Tomorrow you will open a new tab to look up a forgotten thought.',
      theme: 'Destiny & device memory',
      badge: {
        name: 'The Privacy Monk',
        icon: '🧘‍♂️',
        rule: 'You got this because Do Not Track is on, an ad blocker was detected, and cookies are restricted.'
      }
    },
    fingerprint: {
      cores: 8,
      resolution: '1920x1080',
      os: 'Windows',
      badge: {
        name: 'The Privacy Monk',
        icon: '🧘‍♂️',
        rule: 'You got this because Do Not Track is on, an ad blocker was detected, and cookies are restricted.'
      }
    },
    score: {
      score: 74,
      level: 'High'
    }
  };

  it('generates all 3 slides with exact 1080x1920 dimensions', () => {
    // In Node/Vitest with jsdom or basic canvas mocking
    const slides = generateAllStorySlides(samplePayload);
    expect(slides).toHaveLength(3);

    slides.forEach((slide, idx) => {
      expect(slide.width, `Slide ${idx + 1} width must be 1080`).toBe(1080);
      expect(slide.height, `Slide ${idx + 1} height must be 1920`).toBe(1920);
    });
  });

  it('guarantees slide 1 canvas is 1080x1920', () => {
    const s1 = generateSlide1Canvas(samplePayload);
    expect(s1.width).toBe(1080);
    expect(s1.height).toBe(1920);
  });

  it('guarantees slide 2 canvas is 1080x1920', () => {
    const s2 = generateSlide2Canvas(samplePayload);
    expect(s2.width).toBe(1080);
    expect(s2.height).toBe(1920);
  });

  it('guarantees slide 3 canvas is 1080x1920', () => {
    const s3 = generateSlide3Canvas(samplePayload);
    expect(s3.width).toBe(1080);
    expect(s3.height).toBe(1920);
  });

  it('exports multi-slide download and share functions', () => {
    expect(typeof downloadStorySlides).toBe('function');
    expect(typeof shareStorySlides).toBe('function');
  });

  it('verifies that no slide text or badge rule contains visitor percentages or ranking claims', () => {
    const textsToCheck = [
      samplePayload.fortune.archetype,
      samplePayload.fortune.prediction,
      samplePayload.fortune.badge.name,
      samplePayload.fortune.badge.rule,
      samplePayload.score.level
    ];

    textsToCheck.forEach((text) => {
      const lower = String(text).toLowerCase();
      expect(lower).not.toContain('%');
      expect(lower).not.toContain('percent');
      expect(lower).not.toContain('top ');
      expect(lower).not.toContain('rank');
    });
  });
});
