import fs from 'fs';
import path from 'path';

function walkFiles(dir: string, predicate: (filePath: string) => boolean): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '.next' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
        continue;
      }
      results.push(...walkFiles(fullPath, predicate));
      continue;
    }

    if (entry.isFile() && predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function isScannableFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ['.ts', '.tsx', '.js', '.jsx', '.html'].includes(ext);
}

describe('Security: no auth tokens in browser storage', () => {
  it('does not persist access/refresh tokens in localStorage/sessionStorage in frontend source', () => {
    const projectRoot = path.resolve(__dirname, '..', '..'); // selsa-frontend/

    const scanRoots = [path.join(projectRoot, 'src'), path.join(projectRoot, 'public')].filter((p) =>
      fs.existsSync(p)
    );

    const tokenStorageCall =
      /\b(localStorage|sessionStorage)\s*\.\s*(setItem|getItem|removeItem)\s*\(\s*['"](accessToken|refreshToken|access_token|refresh_token)['"]/g;

    const offenders: Array<{ file: string; match: string }> = [];

    for (const root of scanRoots) {
      const files = walkFiles(root, isScannableFile);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        tokenStorageCall.lastIndex = 0;

        let match: RegExpExecArray | null;
        while ((match = tokenStorageCall.exec(content)) !== null) {
          offenders.push({ file, match: match[0] });
        }
      }
    }

    if (offenders.length) {
      const pretty = offenders
        .map((o) => `- ${path.relative(projectRoot, o.file)} :: ${o.match}`)
        .join('\n');
      throw new Error(
        `Found forbidden token storage operations (must not persist auth tokens in browser storage):\n${pretty}`
      );
    }
  });
});
