import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheetPath = path.resolve(__dirname, '../../styles/globals.css');

describe('shared global styles', () => {
  it('keeps body defaults in the base layer so dark utilities can override them', () => {
    const stylesheet = fs.readFileSync(stylesheetPath, 'utf8');

    expect(stylesheet).toMatch(
      /@layer base\s*{[\s\S]*body\s*{[\s\S]*background-color:\s*#FBFBFB;[\s\S]*color:\s*#0D0D0D;[\s\S]*}\s*}/,
    );
  });
});
