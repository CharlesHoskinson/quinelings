// Draws one stable QDL 1 frame. Frame does not evaluate. run evaluates.
(function (root) {
  const intent = {
    format: 'qdl-intent', version: 1, name: 'Measured total',
    thought: 'Sum the supplied measurements.',
    inputs: [{id: 'samples', name: 'samples', type: {kind: 'array', element: {kind: 'number', unit: 'item', min: 0, integer: true}, maxLength: 512}}],
    steps: [{id: 'total', op: 'sum', inputs: ['samples'], params: {}}],
    outputs: ['total']
  };

  function draw(frame, canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#141816';
    ctx.fillRect(0, 0, width, height);
    const points = frame.points;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < points.length; i += 4) {
      const x = points[i], y = points[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const scale = Math.min((width - 48) / spanX, (height - 48) / spanY);
    const originX = width / 2 - ((minX + maxX) / 2) * scale;
    const originY = height / 2 + ((minY + maxY) / 2) * scale;
    for (let i = 0, sample = 0; i < points.length; i += 4, sample += 1) {
      const owner = frame.owners[sample];
      ctx.fillStyle = frame.nodeColors[owner] || '#d7e6c8';
      const alpha = points[i + 3];
      ctx.globalAlpha = alpha > 0 && alpha < 1 ? Math.max(alpha, 0.45) : 0.9;
      ctx.fillRect(originX + points[i] * scale, originY - points[i + 1] * scale, 2, 2);
    }
    ctx.globalAlpha = 1;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let ink = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 40 || pixels[i + 1] > 40 || pixels[i + 2] > 40) ink += 1;
    }
    return {ink, spanX, spanY};
  }

  function glRenderer() {
    try {
      const canvas = root.document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) return null;
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    } catch (error) {
      return String(error.message || error);
    }
  }

  function names(value) {
    if (value === undefined || value === null) return [];
    return Object.getOwnPropertyNames(value);
  }

  root.QuinelingBrowserDraw = function (api) {
    const report = {ok: false};
    try {
      report.runtime = {
        process: typeof process,
        require: typeof require,
        module: typeof module,
        Buffer: typeof Buffer,
        bufferKeys: names(typeof Buffer === 'undefined' ? undefined : Buffer),
        dirname: typeof __dirname
      };
      report.gl = glRenderer();
      report.lifeforms = typeof api.MathematicalLifeforms?.frame;
      const session = new api.Session();
      const compileStart = performance.now();
      const artifact = session.compile(intent);
      report.compileMs = performance.now() - compileStart;
      const before = JSON.stringify(session.exportSnapshot());
      const frameStart = performance.now();
      const frame = session.frame(artifact.id, 0.4, {budget: 4000, crests: 2});
      report.frameMs = performance.now() - frameStart;
      const afterFrame = session.exportSnapshot();
      report.passiveFrame = before === JSON.stringify(afterFrame);
      report.recordsAfterFrame = afterFrame.records.length;
      report.points = frame.points.length;
      report.owners = frame.owners.length;
      report.finite = frame.points.every(Number.isFinite) && frame.normals.every(Number.isFinite);
      const canvas = root.document.getElementById('creature');
      const drawn = draw(frame, canvas);
      report.ink = drawn.ink;
      report.spanX = drawn.spanX;
      report.spanY = drawn.spanY;
      const run = session.run({artifactId: artifact.id, requestId: 'browser-total', inputs: {samples: [3, 5, 7]}});
      report.output = run.result.occurrences[0].outputs;
      report.recordsAfterRun = session.exportSnapshot().records.length;
      const replayRecords = report.recordsAfterRun;
      session.frame(artifact.id, 1.1, {budget: 4000, crests: 2});
      report.recordsAfterSecondFrame = session.exportSnapshot().records.length;
      report.frameDoesNotAddRecords = report.recordsAfterSecondFrame === replayRecords;
      report.ok = report.passiveFrame && report.recordsAfterFrame === 0 && report.points === 16000 &&
        report.owners === 4000 && report.finite && report.ink > 100 && report.output[0] === 15 &&
        report.recordsAfterRun === 1 && report.frameDoesNotAddRecords && report.lifeforms === 'function';
    } catch (error) {
      report.ok = false;
      report.error = error && error.message ? error.message : String(error);
    }
    root.document.getElementById('report').textContent = JSON.stringify(report);
  };
})(globalThis);
