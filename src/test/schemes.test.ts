import { describe, it, expect } from 'vitest';
import { SEED_SCHEMES, matchSchemesForProfile } from '../data/seedSchemes';
import { DEMO_ENGINEERING_PROFILE } from '../services/storage';
import { StudentProfile } from '../types';

describe('Scholarship & Government Scheme Matcher', () => {
  it('identifies strong matches for engineering hosteller OBC student', () => {
    const matches = matchSchemesForProfile(SEED_SCHEMES, DEMO_ENGINEERING_PROFILE);
    expect(matches.length).toBeGreaterThan(0);

    const strongOrLikely = matches.filter(
      (m) => m.matchScore === 'Strong' || m.matchScore === 'Likely'
    );
    expect(strongOrLikely.length).toBeGreaterThanOrEqual(1);

    // Post-Matric OBC scholarship should be strong match
    const obcScheme = matches.find((m) => m.id === 'post-matric-obc-sc-st');
    expect(obcScheme?.matchScore).toBe('Strong');
  });

  it('matches AICTE Pragati for female engineering students', () => {
    const femaleEnggProfile: StudentProfile = {
      ...DEMO_ENGINEERING_PROFILE,
      name: 'Pooja Patil',
      gender: 'Female',
      course: 'B.Tech Information Technology'
    };

    const matches = matchSchemesForProfile(SEED_SCHEMES, femaleEnggProfile);
    const pragati = matches.find((m) => m.id === 'aicte-pragati');
    expect(pragati).toBeDefined();
    expect(pragati?.matchScore).toBe('Strong');
  });

  it('matches Bihar Credit Card scheme for Bihar students', () => {
    const biharProfile: StudentProfile = {
      ...DEMO_ENGINEERING_PROFILE,
      state: 'Bihar'
    };

    const matches = matchSchemesForProfile(SEED_SCHEMES, biharProfile);
    const biharScheme = matches.find((m) => m.id === 'bihar-student-credit-card');
    expect(biharScheme?.matchScore).toBe('Strong');
  });
});
