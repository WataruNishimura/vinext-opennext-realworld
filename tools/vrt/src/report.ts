export type TargetResult = {
  id: string;
  path: string;
  viewport: string;
  width: number;
  height: number;
  diffPixels: number;
  diffRatio: number;
  sizeMismatch: boolean;
};

export function summarize(
  results: TargetResult[],
  maxDiffRatio: number,
): { passed: boolean; failures: TargetResult[] } {
  const failures = results.filter(result => result.diffRatio > maxDiffRatio);
  return { passed: failures.length === 0, failures };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(3)}%`;
}

/**
 * A self-contained HTML report. Images are referenced by file name, next to the report:
 * `<id>.<app>.png` for each app and `<id>.diff.png`.
 */
export function renderReport(
  results: TargetResult[],
  { maxDiffRatio, apps }: { maxDiffRatio: number; apps: readonly [string, string] },
): string {
  const { passed, failures } = summarize(results, maxDiffRatio);
  const rows = results
    .map(result => {
      const ok = result.diffRatio <= maxDiffRatio;
      const id = escapeHtml(result.id);
      const images = [...apps, 'diff']
        .map(
          name =>
            `<figure><figcaption>${escapeHtml(name)}</figcaption><a href="${id}.${escapeHtml(name)}.png"><img src="${id}.${escapeHtml(name)}.png" alt="${id} (${escapeHtml(name)})" loading="lazy"></a></figure>`,
        )
        .join('');
      return `<section class="${ok ? 'pass' : 'fail'}" id="${id}">
  <h2>${id} <span class="verdict">${ok ? 'PASS' : 'FAIL'}</span></h2>
  <p><code>${escapeHtml(result.path)}</code> · ${escapeHtml(result.viewport)} · ${result.width}×${result.height} · ${result.diffPixels} px · <strong>${formatRatio(result.diffRatio)}</strong>${result.sizeMismatch ? ' · size differs' : ''}</p>
  <div class="images">${images}</div>
</section>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cross-app VRT</title>
<style>
  :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; padding: 1rem; max-width: 120rem; }
  section { border-top: 1px solid #8884; padding-block: 1rem; }
  .verdict { font-size: 0.8em; padding: 0.1em 0.5em; border-radius: 0.3em; }
  .pass .verdict { background: #1a7f37; color: white; }
  .fail .verdict { background: #cf222e; color: white; }
  .images { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; align-items: start; }
  figure { margin: 0; }
  img { width: 100%; height: auto; border: 1px solid #8886; }
</style>
</head>
<body>
<h1>Cross-app VRT: ${escapeHtml(apps[0])} vs ${escapeHtml(apps[1])}</h1>
<p>${passed ? 'All targets pass.' : `${failures.length} of ${results.length} targets fail.`} Threshold: ${formatRatio(maxDiffRatio)} of pixels.</p>
${rows}
</body>
</html>
`;
}
