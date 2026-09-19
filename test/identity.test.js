import { describe, it, expect } from 'vitest';
import { determineIdentityBadge, detectRareCards } from '../src/identity.js';

describe('Identity Badges Evaluation', () => {
  it('assigns "The Privacy Monk" when DNT or GPC is on, ad blocker is detected, and cookies are restricted', () => {
    const signalsDnt = {
      privacy: {
        dnt: 'on',
        adBlockerDetected: true,
        cookiesRestricted: true
      },
      hardware: { cores: 8, deviceMemory: '4GB' },
      temporal: { localHour: 14 },
      preferences: { touchSupport: false }
    };
    const badgeDnt = determineIdentityBadge(signalsDnt);
    expect(badgeDnt.name).toBe('The Privacy Monk');
    expect(badgeDnt.rule).toContain('Do Not Track');
    expect(badgeDnt.rule).toContain('ad blocker was detected');
    expect(badgeDnt.rule).toContain('cookies are restricted');

    const signalsGpc = {
      privacy: {
        gpc: 'on',
        adBlockerDetected: true,
        cookiesEnabled: false
      },
      temporal: { localHour: 15 }
    };
    const badgeGpc = determineIdentityBadge(signalsGpc);
    expect(badgeGpc.name).toBe('The Privacy Monk');
  });

  it('assigns "The Data Royal" when 12+ CPU cores AND 20+ tested fonts installed (memory dropped)', () => {
    const signalsMatching = {
      privacy: { dnt: 'off', adBlockerDetected: false, cookiesEnabled: true },
      hardware: { cores: 12, deviceMemory: '4GB' },
      fonts: { installedCount: 20 },
      temporal: { localHour: 12 },
      preferences: { touchSupport: false }
    };
    const badge = determineIdentityBadge(signalsMatching);
    expect(badge.name).toBe('The Data Royal');
    expect(badge.rule).toContain('12 or more CPU cores');
    expect(badge.rule).toContain('20 or more tested fonts installed');
    expect(badge.rule).not.toContain('memory');

    // Not enough fonts (< 20)
    const signalsNotEnoughFonts = {
      privacy: { dnt: 'off', adBlockerDetected: false, cookiesEnabled: true },
      hardware: { cores: 16, deviceMemory: '32GB' },
      fonts: { installedCount: 19 },
      temporal: { localHour: 12 },
      preferences: { touchSupport: false }
    };
    expect(determineIdentityBadge(signalsNotEnoughFonts).name).not.toBe('The Data Royal');

    // Not enough cores (< 12)
    const signalsNotEnoughCores = {
      privacy: { dnt: 'off', adBlockerDetected: false, cookiesEnabled: true },
      hardware: { cores: 8, deviceMemory: '32GB' },
      fonts: { installedCount: 25 },
      temporal: { localHour: 12 },
      preferences: { touchSupport: false }
    };
    expect(determineIdentityBadge(signalsNotEnoughCores).name).not.toBe('The Data Royal');
  });

  it('assigns "The Night Owl" when local hour is between 0 and 4', () => {
    [0, 1, 2, 3, 4].forEach((hour) => {
      const signals = {
        privacy: { dnt: 'off', adBlockerDetected: false, cookiesEnabled: true },
        hardware: { cores: 4, deviceMemory: '4GB' },
        fonts: { installedCount: 2 },
        temporal: { localHour: hour },
        preferences: { touchSupport: false }
      };
      const badge = determineIdentityBadge(signals);
      expect(badge.name).toBe('The Night Owl');
      expect(badge.rule).toContain(`local hour is ${hour}`);
      expect(badge.rule).toContain('between 0 and 4');
    });
  });

  it('assigns "The Pocket Wanderer" when touch device with a small screen', () => {
    const signals = {
      privacy: { dnt: 'off', adBlockerDetected: false, cookiesEnabled: true },
      hardware: { cores: 4, deviceMemory: '4GB' },
      fonts: { installedCount: 2 },
      temporal: { localHour: 14 },
      preferences: { touchSupport: true },
      screen: { resolution: '390x844' }
    };
    const badge = determineIdentityBadge(signals);
    expect(badge.name).toBe('The Pocket Wanderer');
    expect(badge.rule).toContain('touch device with a small screen');
  });

  it('assigns fallback "The Everyday Browser" when no specific rules match', () => {
    const signals = {
      privacy: { dnt: 'off', adBlockerDetected: false, cookiesEnabled: true },
      hardware: { cores: 8, deviceMemory: '4GB' },
      fonts: { installedCount: 4 },
      temporal: { localHour: 16 },
      preferences: { touchSupport: false },
      screen: { resolution: '1920x1080' }
    };
    const badge = determineIdentityBadge(signals);
    expect(badge.name).toBe('The Everyday Browser');
    expect(badge.rule).toContain('everyday browsing defaults');
  });
});

describe('Rare Archetypes Evaluation', () => {
  it('detects "The Ghost" when DNT or GPC on, ad blocker detected, and canvas output blocked or randomised', () => {
    const signals = {
      privacy: {
        dnt: 'on',
        adBlockerDetected: true,
        canvasProtected: true
      }
    };
    const rare = detectRareCards(signals);
    expect(rare.some(c => c.title === 'The Ghost')).toBe(true);
    const ghost = rare.find(c => c.title === 'The Ghost');
    expect(ghost.label).toBe('rare card');
    expect(ghost.callout).toBe('You found a rare card!');
  });

  it('detects "The Lab Rat" when webdriver is true or user agent is headless', () => {
    const signalsWebdriver = {
      automation: { webdriver: true }
    };
    const rare1 = detectRareCards(signalsWebdriver);
    expect(rare1.some(c => c.title === 'The Lab Rat')).toBe(true);
    expect(rare1[0].label).toBe('rare card');

    const signalsHeadless = {
      automation: { isHeadless: true }
    };
    const rare2 = detectRareCards(signalsHeadless);
    expect(rare2.some(c => c.title === 'The Lab Rat')).toBe(true);
  });

  it('detects "The Time Traveler" when local hour in reported timezone is 3:00 to 3:59', () => {
    const signals = {
      temporal: { localHour: 3, timezone: 'America/New_York' }
    };
    const rare = detectRareCards(signals);
    expect(rare.some(c => c.title === 'The Time Traveler')).toBe(true);
    const card = rare.find(c => c.title === 'The Time Traveler');
    expect(card.label).toBe('rare card');
    expect(card.callout).toBe('You found a rare card!');
  });
});

describe('Zero Percentage Constraint', () => {
  it('guarantees that no badge text, name, or rule contains a percentage or rank claim', () => {
    const sampleSignalVariations = [
      { privacy: { dnt: 'on', adBlockerDetected: true, cookiesRestricted: true } },
      { hardware: { cores: 16 }, fonts: { installedCount: 15 } },
      { temporal: { localHour: 2 } },
      { preferences: { touchSupport: true }, screen: { resolution: '412x915' } },
      { temporal: { localHour: 14 } }
    ];

    sampleSignalVariations.forEach((sig) => {
      const badge = determineIdentityBadge(sig);
      const combined = `${badge.name} ${badge.rule}`.toLowerCase();
      expect(combined).not.toContain('%');
      expect(combined).not.toContain('percent');
      expect(combined).not.toContain('top ');
      expect(combined).not.toContain('rank');
    });

    const rareVariations = [
      { privacy: { dnt: 'on', adBlockerDetected: true, canvasProtected: true } },
      { automation: { webdriver: true } },
      { temporal: { localHour: 3, timezone: 'UTC' } }
    ];

    rareVariations.forEach((sig) => {
      const cards = detectRareCards(sig);
      cards.forEach((card) => {
        const combined = `${card.title} ${card.rule} ${card.label} ${card.callout}`.toLowerCase();
        expect(combined).not.toContain('%');
        expect(combined).not.toContain('percent');
        expect(combined).not.toContain('top ');
        expect(combined).not.toContain('rank');
      });
    });
  });
});
