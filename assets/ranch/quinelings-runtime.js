var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ranch-crypto.js
var require_ranch_crypto = __commonJS({
  "ranch-crypto.js"(exports, module) {
    (function(root) {
      "use strict";
      const K2 = new Uint32Array([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]);
      const rotr = (x, n) => x >>> n | x << 32 - n;
      function sha256(text) {
        if (typeof text !== "string") throw new TypeError("SHA256 expects text");
        const data = new TextEncoder().encode(text);
        if (data.length > 2097152) throw new RangeError("SHA256 input exceeds 2MiB");
        const bytes = new Uint8Array(Math.ceil((data.length + 9) / 64) * 64), view = new DataView(bytes.buffer);
        bytes.set(data);
        bytes[data.length] = 128;
        view.setUint32(bytes.length - 8, 0);
        view.setUint32(bytes.length - 4, data.length * 8);
        const h = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]), w = new Uint32Array(64);
        for (let start = 0; start < bytes.length; start += 64) {
          for (let i = 0; i < 16; i++) w[i] = view.getUint32(start + 4 * i);
          for (let i = 16; i < 64; i++) {
            const a2 = w[i - 15], b2 = w[i - 2], s0 = rotr(a2, 7) ^ rotr(a2, 18) ^ a2 >>> 3, s1 = rotr(b2, 17) ^ rotr(b2, 19) ^ b2 >>> 10;
            w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
          }
          let [a, b, c, d, e, f, g, j] = h;
          for (let i = 0; i < 64; i++) {
            const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = e & f ^ ~e & g, t1 = j + s1 + ch + K2[i] + w[i] >>> 0, s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), maj = a & b ^ a & c ^ b & c, t2 = s0 + maj >>> 0;
            j = g;
            g = f;
            f = e;
            e = d + t1 >>> 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 >>> 0;
          }
          const next = [a, b, c, d, e, f, g, j];
          for (let i = 0; i < 8; i++) h[i] = h[i] + next[i] >>> 0;
        }
        return Array.from(h, (x) => x.toString(16).padStart(8, "0")).join("");
      }
      const api = Object.freeze({ sha256 });
      if (typeof module !== "undefined") module.exports = api;
      root.RanchCrypto = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// orbit.js
var require_orbit = __commonJS({
  "orbit.js"(exports, module) {
    (function(root) {
      "use strict";
      const clone = (x) => JSON.parse(JSON.stringify(x));
      function canon(x) {
        if (Array.isArray(x)) return "[" + x.map(canon).join(",") + "]";
        if (x && typeof x === "object") return "{" + Object.keys(x).sort().map((k) => JSON.stringify(k) + ":" + canon(x[k])).join(",") + "}";
        return JSON.stringify(x);
      }
      const signatures = { Observe: [[], ["Evidence"]], Box: [[], ["Box"]], Permit: [[], ["Capability"]], Apply: [["Box", "Evidence"], ["Decision"]], Score: [["Evidence"], ["Decision"]], Authorize: [["Decision", "Capability"], ["Action"]], Execute: [["Action"], ["Receipt"]], Quote: [["Box"], ["Code"]], Decode: [["Code"], ["Box"]], Report: [["Receipt", "Code"], ["Report"]] };
      function validate(g, depth = 0) {
        if (depth > 12) throw Error("Box nesting exceeds 12");
        if (!g || g.version !== 1 || !Array.isArray(g.wires) || !Array.isArray(g.edges) || !g.boundary) throw Error("Bad graph envelope");
        const wires = /* @__PURE__ */ new Map(), edgeIds = /* @__PURE__ */ new Set(), producers = /* @__PURE__ */ new Set(), consumers = /* @__PURE__ */ new Map();
        for (const w of g.wires) {
          if (typeof w.id !== "string" || wires.has(w.id) || !["Evidence", "Decision", "Box", "Capability", "Action", "Receipt", "Code", "Report"].includes(w.type)) throw Error("Bad/duplicate wire");
          wires.set(w.id, w.type);
        }
        for (const w of g.boundary.inputs) {
          if (!wires.has(w) || producers.has(w)) throw Error("Bad input boundary");
          producers.add(w);
        }
        for (const e of g.edges) {
          if (!e || typeof e.id !== "string" || edgeIds.has(e.id)) throw Error("Bad/duplicate edge");
          edgeIds.add(e.id);
          const s = signatures[e.op];
          if (!s || !Array.isArray(e.inputs) || !Array.isArray(e.outputs) || s[0].length !== e.inputs.length || s[1].length !== e.outputs.length) throw Error("Unknown operation / arity");
          e.inputs.forEach((w, i) => {
            if (wires.get(w) !== s[0][i]) throw Error("Input type mismatch " + e.id);
            consumers.set(w, (consumers.get(w) || 0) + 1);
          });
          e.outputs.forEach((w, i) => {
            if (wires.get(w) !== s[1][i] || producers.has(w)) throw Error("Output type/producer mismatch " + e.id);
            producers.add(w);
          });
          if (e.op === "Box") {
            validate(e.graph, depth + 1);
            if (e.graph.edges.some((x) => !["Score", "Box", "Apply", "Quote", "Decode"].includes(x.op))) throw Error("Effectful deliberation box");
            if (e.graph.boundary.inputs.length !== 1 || e.graph.boundary.outputs.length !== 1 || e.graph.wires.find((w) => w.id === e.graph.boundary.inputs[0]).type !== "Evidence" || e.graph.wires.find((w) => w.id === e.graph.boundary.outputs[0]).type !== "Decision") throw Error("Expected Evidence \u2192 Decision box");
          }
          if (e.op === "Observe" && (!Number.isFinite(e.confidence) || e.confidence < 0 || e.confidence > 1)) throw Error("Confidence outside [0,1]");
          if (e.op === "Score" && (!Number.isFinite(e.threshold) || e.threshold < 0 || e.threshold > 1)) throw Error("Threshold outside [0,1]");
          if (e.op === "Permit" && typeof e.allowed !== "boolean") throw Error("Capability must be boolean");
        }
        for (const w of g.wires) {
          if (!producers.has(w.id)) throw Error("Unbound wire " + w.id);
          if (["Capability", "Action"].includes(w.type) && (consumers.get(w.id) || 0) + g.boundary.outputs.filter((x) => x === w.id).length > 1) throw Error("Linear wire fanout " + w.id);
        }
        const outs = /* @__PURE__ */ new Set();
        for (const w of g.boundary.outputs) {
          if (!wires.has(w) || outs.has(w)) throw Error("Bad output boundary");
          outs.add(w);
        }
        const ready = new Set(g.boundary.inputs), pending = new Set(g.edges);
        let changed = true;
        while (changed) {
          changed = false;
          for (const e of pending) if (e.inputs.every((w) => ready.has(w))) {
            e.outputs.forEach((w) => ready.add(w));
            pending.delete(e);
            changed = true;
          }
        }
        if (pending.size) throw Error("Cycles require explicit delay; unsupported");
        return true;
      }
      function valueType(v, t) {
        switch (t) {
          case "Evidence":
            return v && Number.isFinite(v.confidence) && v.confidence >= 0 && v.confidence <= 1;
          case "Decision":
            return v && ["repair", "defer"].includes(v.choice);
          case "Capability":
            return v && typeof v.allowed === "boolean";
          case "Action":
            return v && typeof v.allowed === "boolean" && ["repair", "defer"].includes(v.choice);
          case "Receipt":
            return v && ["simulated", "skipped"].includes(v.status);
          case "Code":
            return typeof v === "string";
          case "Report":
            return v && typeof v.summary === "string";
          case "Box":
            try {
              validate(v);
              return v.edges.every((x) => ["Score", "Box", "Apply", "Quote", "Decode"].includes(x.op)) && v.boundary.inputs.length === 1 && v.boundary.outputs.length === 1 && v.wires.find((w) => w.id === v.boundary.inputs[0]).type === "Evidence" && v.wires.find((w) => w.id === v.boundary.outputs[0]).type === "Decision";
            } catch {
              return false;
            }
          default:
            return false;
        }
      }
      class Machine {
        constructor(g, args = []) {
          validate(g);
          this.graph = clone(g);
          this.values = /* @__PURE__ */ new Map();
          this.fired = /* @__PURE__ */ new Set();
          this.trace = [];
          this.effects = [];
          if (args.length !== g.boundary.inputs.length) throw Error("Boundary argument mismatch");
          g.boundary.inputs.forEach((w, i) => {
            if (!valueType(args[i], g.wires.find((x) => x.id === w).type)) throw Error("Boundary value type mismatch");
            this.values.set(w, clone(args[i]));
          });
        }
        ready() {
          return this.graph.edges.filter((e) => !this.fired.has(e.id) && e.inputs.every((w) => this.values.has(w)));
        }
        step(id) {
          const e = id ? this.ready().find((e2) => e2.id === id) : this.ready()[0];
          if (!e) return null;
          const a = e.inputs.map((w) => this.values.get(w));
          let v;
          switch (e.op) {
            case "Observe":
              v = { confidence: e.confidence, subject: "broken city lamp 07", source: "simulated sensor" };
              break;
            case "Box":
              v = clone(e.graph);
              break;
            case "Permit":
              v = { allowed: e.allowed, scope: "lamp-07", uses: 1 };
              break;
            case "Score":
              v = { choice: a[0].confidence >= e.threshold ? "repair" : "defer", confidence: a[0].confidence, threshold: e.threshold };
              break;
            case "Apply": {
              const sub = new Machine(a[0], [a[1]]);
              sub.run();
              v = sub.output()[0];
              this.trace.push({ rule: "open Box boundary", nested: sub.trace });
              break;
            }
            case "Authorize":
              v = { choice: a[0].choice, allowed: a[1].allowed && a[0].choice === "repair", scope: a[1].scope };
              break;
            case "Execute":
              v = { status: a[0].allowed ? "simulated" : "skipped", scope: a[0].scope, choice: a[0].choice };
              if (a[0].allowed) this.effects.push({ kind: "simulation-only", action: "repair lamp 07" });
              break;
            case "Quote":
              v = canon(a[0]);
              break;
            case "Decode":
              v = JSON.parse(a[0]);
              if (!valueType(v, "Box")) throw Error("Decoded code is not a valid Box");
              break;
            case "Report":
              v = { summary: a[0].status === "simulated" ? "Lamp repair simulated." : "Lamp repair deferred.", receipt: a[0], boxRoundtrip: canon(JSON.parse(a[1])) === a[1] };
              break;
            default:
              throw Error("No rewrite");
          }
          if (!valueType(v, this.graph.wires.find((w) => w.id === e.outputs[0]).type)) throw Error("Rewrite violated type");
          this.values.set(e.outputs[0], v);
          this.fired.add(e.id);
          this.trace.push({ edge: e.id, rule: e.op, input: e.inputs, output: e.outputs });
          return e;
        }
        run() {
          let fuel = 100;
          while (this.step()) if (--fuel === 0) throw Error("Fuel exceeded");
          if (this.fired.size !== this.graph.edges.length) throw Error("Stuck");
          return this.output();
        }
        output() {
          return this.graph.boundary.outputs.map((w) => this.values.get(w));
        }
      }
      function plan(confidence = 0.82, allowed = true, threshold = 0.7) {
        const graph = { version: 1, name: "deliberation", boundary: { inputs: ["seen"], outputs: ["choice"] }, wires: [{ id: "seen", type: "Evidence" }, { id: "choice", type: "Decision" }], edges: [{ id: "compare", op: "Score", inputs: ["seen"], outputs: ["choice"], threshold }] };
        return { version: 1, name: "lamp-07 repair agent", boundary: { inputs: [], outputs: ["report"] }, wires: [["evidence", "Evidence"], ["thought", "Box"], ["decision", "Decision"], ["permit", "Capability"], ["action", "Action"], ["receipt", "Receipt"], ["code", "Code"], ["restored", "Box"], ["report", "Report"]].map(([id, type]) => ({ id, type })), edges: [{ id: "sense", op: "Observe", inputs: [], outputs: ["evidence"], confidence }, { id: "think", op: "Box", inputs: [], outputs: ["thought"], graph }, { id: "permission", op: "Permit", inputs: [], outputs: ["permit"], allowed }, { id: "deliberate", op: "Apply", inputs: ["thought", "evidence"], outputs: ["decision"] }, { id: "authorize", op: "Authorize", inputs: ["decision", "permit"], outputs: ["action"] }, { id: "act", op: "Execute", inputs: ["action"], outputs: ["receipt"] }, { id: "reflect", op: "Quote", inputs: ["thought"], outputs: ["code"] }, { id: "restore", op: "Decode", inputs: ["code"], outputs: ["restored"] }, { id: "audit", op: "Report", inputs: ["receipt", "code"], outputs: ["report"] }] };
      }
      const D2 = ["lambda", "x", ["emit", ["makeApply", ["makeRun", ["makeQuote", ["var", "x"]]], ["makeQuote", ["var", "x"]]]]];
      const quine = ["apply", ["run", ["quote", D2]], ["quote", D2]];
      function agentQuine() {
        const body = ["lambda", "x", ["seq", ["plan", ["quote", plan()]], clone(D2[2])]];
        return ["apply", ["run", ["quote", body]], ["quote", body]];
      }
      function executeTerm(program) {
        let fuel = 1e3;
        const trace = [], emitted = [], plans = [];
        function ev(t, env) {
          if (--fuel < 0) throw Error("Term fuel exceeded");
          if (!Array.isArray(t)) throw Error("Not a term");
          const [op, ...a] = t;
          trace.push(op);
          const arities = { lambda: 2, var: 1, quote: 1, run: 1, apply: 2, emit: 1, makeQuote: 1, makeRun: 1, makeApply: 2, seq: 2, plan: 1 };
          if (arities[op] !== a.length) throw Error("Bad term operation / arity");
          switch (op) {
            case "seq":
              ev(a[0], env);
              return ev(a[1], env);
            case "plan": {
              const g = ev(a[0], env), m = new Machine(g);
              m.run();
              const record = { report: m.output(), effects: m.effects, trace: m.trace };
              plans.push(record);
              return record.report;
            }
            case "lambda":
              if (typeof a[0] !== "string") throw Error("Bad binder");
              return { closure: true, param: a[0], body: a[1], env };
            case "var":
              if (!Object.hasOwn(env, a[0])) throw Error("Unbound variable");
              return env[a[0]];
            case "quote":
              return clone(a[0]);
            case "run":
              return ev(ev(a[0], env), /* @__PURE__ */ Object.create(null));
            case "apply": {
              const f = ev(a[0], env), x = ev(a[1], env);
              if (!f || !f.closure) throw Error("Expected closure");
              return ev(f.body, { ...f.env, [f.param]: x });
            }
            case "emit": {
              const v = ev(a[0], env);
              if (!Array.isArray(v)) throw Error("Emit expects code");
              emitted.push(canon(v));
              return v;
            }
            case "makeQuote":
              return ["quote", clone(ev(a[0], env))];
            case "makeRun":
              return ["run", clone(ev(a[0], env))];
            case "makeApply":
              return ["apply", clone(ev(a[0], env)), clone(ev(a[1], env))];
          }
        }
        const result = ev(program, /* @__PURE__ */ Object.create(null));
        return { result, emitted, trace, plans };
      }
      function quineCheck() {
        const a = executeTerm(quine), b = executeTerm(JSON.parse(a.emitted[0]));
        return { source: canon(quine), output: a.emitted[0], same: canon(quine) === a.emitted[0], secondGeneration: b.emitted[0] === a.emitted[0], trace: a.trace };
      }
      function pairNet() {
        return { cells: [{ id: "g1", symbol: "gamma" }, { id: "g2", symbol: "gamma" }], wires: [["g1.p", "g2.p"], ["g1.0", "a"], ["g1.1", "b"], ["g2.0", "c"], ["g2.1", "d"]], boundary: ["a", "b", "c", "d"] };
      }
      function checkNet(n) {
        const ports = new Set(n.boundary);
        for (const c of n.cells) {
          if (c.symbol !== "gamma") throw Error("Only gamma supported");
          for (const p of ["p", "0", "1"]) {
            if (ports.has(c.id + "." + p)) throw Error("Duplicate port");
            ports.add(c.id + "." + p);
          }
        }
        const used = /* @__PURE__ */ new Set();
        for (const w of n.wires) {
          if (w.length !== 2) throw Error("Not a wire");
          for (const p of w) {
            if (!ports.has(p) || used.has(p)) throw Error("Invalid port incidence");
            used.add(p);
          }
        }
        if (used.size !== ports.size) throw Error("Dangling port");
        return true;
      }
      function annihilate(n) {
        checkNet(n);
        const link = n.wires.find(([a, b]) => a.endsWith(".p") && b.endsWith(".p"));
        if (!link) return null;
        const [l, r] = link.map((p) => p.slice(0, -2));
        const partner = (p) => {
          const w = n.wires.find((w2) => w2.includes(p));
          return w[0] === p ? w[1] : w[0];
        };
        const removed = new Set([l, r].flatMap((c) => ["p", "0", "1"].map((p) => c + "." + p)));
        const wires = n.wires.filter((w) => !w.some((p) => removed.has(p)));
        for (let i = 0; i < 2; i++) {
          const a = partner(l + "." + i), b = partner(r + "." + i);
          if (removed.has(a) || removed.has(b)) throw Error("This demo only handles external auxiliary partners");
          wires.push([a, b]);
        }
        const out = { cells: n.cells.filter((c) => c.id !== l && c.id !== r), wires, boundary: clone(n.boundary) };
        checkNet(out);
        return out;
      }
      const api = { canon, clone, validate, Machine, plan, executeTerm, quine, agentQuine, quineCheck, pairNet, checkNet, annihilate };
      if (typeof module !== "undefined") module.exports = api;
      root.Orbit = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// kernels.js
var require_kernels = __commonJS({
  "kernels.js"(exports, module) {
    (function(root) {
      "use strict";
      const O2 = typeof module !== "undefined" ? require_orbit() : root.Orbit, canon = O2.canon, clone = O2.clone;
      const ARITY = { literal: 0, sum: 1, mean: 1, min: 1, max: 1, weightedMean: 2, length: 1, map: 1, sort: 1, dedupe: 1, filter: 1, compare: 1, choose: 3, get: 1, clamp: 1, budget: 2, action: 2, report: -1, bfs: 2, allocate: 2, schedule: 1, consensus: 1, retry: 1, evidence: 1 };
      const badKeys = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
      function requireThat(ok, message) {
        if (!ok) throw Error(message);
      }
      function number(x) {
        requireThat(typeof x === "number" && Number.isFinite(x), "Expected finite number");
        return x;
      }
      function nonnegative(x) {
        number(x);
        requireThat(x >= 0, "Expected nonnegative number");
        return x;
      }
      function integer(x) {
        nonnegative(x);
        requireThat(Number.isSafeInteger(x), "Expected nonnegative safe integer");
        return x;
      }
      function array(x) {
        requireThat(Array.isArray(x) && x.length <= 512, "Expected array with at most 512 items");
        return x;
      }
      function numbers(x) {
        array(x).forEach(number);
        return x;
      }
      function record(x) {
        requireThat(x && typeof x === "object" && !Array.isArray(x), "Expected record");
        return x;
      }
      function key(x) {
        requireThat(typeof x === "string" && x.length > 0 && !badKeys.has(x), "Invalid property key");
        return x;
      }
      function get(x, path) {
        let v = x;
        requireThat(typeof path === "string", "Expected property path");
        for (const part of path.split(".")) {
          key(part);
          requireThat(v !== null && typeof v === "object" && Object.hasOwn(v, part), "Missing own property " + part);
          v = v[part];
        }
        return v;
      }
      function compare(a, b, op) {
        if (op === "eq") return canon(a) === canon(b);
        if (op === "ne") return canon(a) !== canon(b);
        requireThat(typeof a === "number" && typeof b === "number" || typeof a === "string" && typeof b === "string", "Ordering needs two numbers or two strings");
        switch (op) {
          case "gt":
            return a > b;
          case "gte":
            return a >= b;
          case "lt":
            return a < b;
          case "lte":
            return a <= b;
          default:
            throw Error("Unknown comparison");
        }
      }
      function boundedJSON(value, depth = 0, seen = /* @__PURE__ */ new Set()) {
        requireThat(depth <= 24, "JSON depth exceeds 24");
        if (value === null || typeof value === "boolean") return;
        if (typeof value === "string") {
          requireThat(value.length <= 16384, "String too long");
          return;
        }
        if (typeof value === "number") {
          number(value);
          return;
        }
        requireThat(value && typeof value === "object", "Expected finite JSON");
        requireThat(!seen.has(value), "Cyclic value");
        const next = new Set(seen).add(value);
        if (Array.isArray(value)) {
          array(value);
          value.forEach((v) => boundedJSON(v, depth + 1, next));
        } else {
          requireThat(Object.keys(value).length <= 512, "Record too large");
          for (const k of Object.keys(value)) {
            key(k);
            boundedJSON(value[k], depth + 1, next);
          }
        }
      }
      function validate(graph) {
        requireThat(graph && graph.version === 1 && Array.isArray(graph.nodes) && graph.nodes.length > 0 && graph.nodes.length <= 64 && Array.isArray(graph.outputs), "Invalid task graph");
        boundedJSON(graph);
        requireThat(new TextEncoder().encode(canon(graph)).length <= 65536, "Task graph exceeds 64 KiB");
        const ids = /* @__PURE__ */ new Set();
        for (const n of graph.nodes) {
          requireThat(n && typeof n.id === "string" && n.id.length > 0 && !ids.has(n.id), "Invalid or duplicate node ID");
          ids.add(n.id);
          requireThat(Object.hasOwn(ARITY, n.op), "Unknown kernel " + n.op);
          requireThat(Array.isArray(n.inputs) && n.inputs.length <= 16 && (ARITY[n.op] < 0 || n.inputs.length === ARITY[n.op]), "Invalid kernel arity");
          record(n.params);
        }
        for (const n of graph.nodes) for (const id of n.inputs) requireThat(typeof id === "string" && ids.has(id), "Unknown input node");
        for (const id of graph.outputs) requireThat(ids.has(id), "Unknown output node");
        requireThat(graph.outputs.length > 0 && graph.outputs.length <= 16, "Invalid output boundary");
        const ready = /* @__PURE__ */ new Set(), pending = new Set(graph.nodes);
        let changed = true;
        while (changed) {
          changed = false;
          for (const n of pending) if (n.inputs.every((id) => ready.has(id))) {
            ready.add(n.id);
            pending.delete(n);
            changed = true;
          }
        }
        requireThat(!pending.size, "Task graph has an unbounded cycle");
        return true;
      }
      function calculate(op, a, p) {
        switch (op) {
          case "literal":
            requireThat(Object.hasOwn(p, "value"), "Literal needs value");
            return clone(p.value);
          case "sum":
            return numbers(a[0]).reduce((s, v) => s + v, 0);
          case "mean": {
            const v = numbers(a[0]);
            requireThat(v.length > 0, "Mean requires values");
            return v.reduce((s, x) => s + x, 0) / v.length;
          }
          case "min":
          case "max": {
            const v = numbers(a[0]);
            requireThat(v.length > 0, "Extremum requires values");
            return Math[op](...v);
          }
          case "weightedMean": {
            const v = numbers(a[0]), w = numbers(a[1]);
            requireThat(v.length > 0 && v.length === w.length, "Weighted arrays must match");
            w.forEach(nonnegative);
            const total = number(w.reduce((s, x) => s + x, 0));
            requireThat(total > 0, "Weights have zero mass");
            const weighted = number(v.reduce((s, x, i) => s + x * w[i], 0));
            return number(weighted / total);
          }
          case "length":
            requireThat(typeof a[0] === "string" || Array.isArray(a[0]), "Length needs array or string");
            return a[0].length;
          case "map":
            requireThat(["square", "multiply"].includes(p.kind), "Unknown map operation");
            if (p.kind === "multiply") number(p.factor);
            return numbers(a[0]).map((x) => p.kind === "square" ? x * x : x * p.factor);
          case "sort": {
            if (Object.hasOwn(p, "descending")) requireThat(typeof p.descending === "boolean", "Descending flag must be Boolean");
            const rows = array(a[0]).map((v, i) => ({ v, i, k: p.key ? get(v, p.key) : v }));
            for (const r of rows) requireThat(typeof r.k === "number" || typeof r.k === "string", "Sort key must be number or string");
            rows.sort((a2, b) => {
              requireThat(typeof a2.k === typeof b.k, "Mixed sort key types");
              return (a2.k < b.k ? -1 : a2.k > b.k ? 1 : 0) * (p.descending ? -1 : 1) || a2.i - b.i;
            });
            return rows.map((r) => clone(r.v));
          }
          case "dedupe": {
            const seen = /* @__PURE__ */ new Set();
            return array(a[0]).filter((v) => {
              const k = canon(p.key ? get(v, p.key) : v);
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            }).map(clone);
          }
          case "filter":
            requireThat(["eq", "ne", "gt", "gte", "lt", "lte"].includes(p.operator), "Unknown comparison");
            return array(a[0]).filter((v) => compare(p.key ? get(v, p.key) : v, p.value, p.operator)).map(clone);
          case "compare":
            return compare(a[0], p.value, p.operator);
          case "choose":
            requireThat(typeof a[0] === "boolean", "Choice guard must be Boolean");
            return clone(a[a[0] ? 1 : 2]);
          case "get":
            record(a[0]);
            return clone(get(a[0], p.path));
          case "clamp":
            number(a[0]);
            number(p.min);
            number(p.max);
            requireThat(p.min <= p.max, "Invalid clamp interval");
            return Math.max(p.min, Math.min(p.max, a[0]));
          case "budget": {
            const available = nonnegative(a[0]), desired = nonnegative(a[1]), allocated = Math.min(available, desired);
            return { allocated, remaining: available - allocated };
          }
          case "action":
            requireThat(typeof a[0] === "boolean" && typeof p.allowed === "boolean" && typeof p.action === "string", "Invalid simulated action");
            return { status: a[0] && p.allowed ? "simulated" : "skipped", action: p.action, payload: clone(a[1]) };
          case "report": {
            requireThat(Array.isArray(p.labels) && p.labels.length === a.length && new Set(p.labels).size === p.labels.length, "Report labels must match inputs");
            const out = /* @__PURE__ */ Object.create(null);
            p.labels.forEach((label, i) => out[key(label)] = clone(a[i]));
            return out;
          }
          case "bfs": {
            const adj = record(a[0]), blockedValues = array(a[1]);
            requireThat(blockedValues.every((x) => typeof x === "string"), "Blocked node IDs must be strings");
            const blocked = new Set(blockedValues);
            requireThat(typeof p.start === "string" && typeof p.goal === "string", "Route endpoints must be strings");
            for (const neighbors of Object.values(adj)) requireThat(array(neighbors).every((x) => typeof x === "string"), "Route neighbor must be string");
            const miss = { found: false, path: [], distance: null };
            if (blocked.has(p.start) || blocked.has(p.goal)) return miss;
            const queue = [[p.start]], seen = /* @__PURE__ */ new Set([p.start]);
            while (queue.length) {
              const path = queue.shift(), last = path.at(-1);
              if (last === p.goal) return { found: true, path, distance: path.length - 1 };
              const neighbors = Object.hasOwn(adj, last) ? adj[last] : [];
              for (const id of neighbors) if (!seen.has(id) && !blocked.has(id)) {
                requireThat(seen.size < 512, "Route search budget exceeded");
                seen.add(id);
                queue.push([...path, id]);
              }
            }
            return miss;
          }
          case "allocate": {
            let remaining = integer(a[0]);
            const ids = /* @__PURE__ */ new Set();
            const grants = array(a[1]).map((row) => {
              record(row);
              requireThat(typeof row.id === "string" && !ids.has(row.id), "Duplicate allocation ID");
              ids.add(row.id);
              const requested = integer(row.amount), granted = Math.min(requested, remaining);
              remaining -= granted;
              return { id: row.id, requested, granted };
            });
            return { grants, remaining };
          }
          case "schedule": {
            const jobs = array(a[0]), ids = /* @__PURE__ */ new Set();
            for (const j of jobs) {
              record(j);
              requireThat(typeof j.id === "string" && !ids.has(j.id), "Duplicate job ID");
              ids.add(j.id);
              array(j.depends);
              nonnegative(j.duration);
            }
            for (const j of jobs) requireThat(j.depends.every((id) => ids.has(id)), "Missing job dependency");
            const pending = [...jobs], done = /* @__PURE__ */ new Map(), order = [], result = [];
            while (pending.length) {
              const index = pending.findIndex((j2) => j2.depends.every((id) => done.has(id)));
              requireThat(index >= 0, "Schedule has dependency cycle");
              const [j] = pending.splice(index, 1), start = Math.max(0, ...j.depends.map((id) => done.get(id))), end = start + j.duration;
              number(end);
              done.set(j.id, end);
              order.push(j.id);
              result.push({ id: j.id, start, end });
            }
            return { order, jobs: result, makespan: Math.max(0, ...done.values()) };
          }
          case "consensus": {
            integer(p.required);
            requireThat(p.required > 0, "Consensus threshold must be positive");
            const seen = /* @__PURE__ */ new Set(), counts = /* @__PURE__ */ new Map();
            for (const vote of array(a[0])) {
              record(vote);
              requireThat(typeof vote.source === "string" && typeof vote.choice === "string", "Invalid vote");
              if (seen.has(vote.source)) continue;
              seen.add(vote.source);
              counts.set(vote.choice, (counts.get(vote.choice) || 0) + 1);
            }
            let choice = null, support = 0;
            for (const [c, n] of counts) if (n > support) {
              choice = c;
              support = n;
            }
            return { choice, support, accepted: support >= p.required, uniqueSources: seen.size };
          }
          case "retry": {
            requireThat(Number.isInteger(p.maxAttempts) && p.maxAttempts >= 1 && p.maxAttempts <= 8, "Retry bound must be 1\u20138");
            const values = array(a[0]);
            requireThat(values.every((x) => ["retry", "ok", "unknown"].includes(x)), "Invalid retry outcome");
            const history = [];
            let status = "exhausted";
            for (const value of values.slice(0, p.maxAttempts)) {
              history.push(value);
              if (value === "ok") {
                status = "completed";
                break;
              }
              if (value === "unknown") {
                status = "uncertain";
                break;
              }
            }
            return { status, attempts: history.length, history };
          }
          case "evidence": {
            const seen = /* @__PURE__ */ new Set(), sources = /* @__PURE__ */ new Set();
            let support = 0, refute = 0;
            for (const row of array(a[0])) {
              record(row);
              requireThat(typeof row.source === "string" && typeof row.claim === "string" && typeof row.value === "boolean", "Invalid evidence report");
              if (Object.hasOwn(p, "claim") && row.claim !== p.claim) continue;
              const pair = canon([row.source, row.claim]);
              if (seen.has(pair)) continue;
              seen.add(pair);
              sources.add(row.source);
              if (row.value) support++;
              else refute++;
            }
            return { state: support && refute ? "conflict" : support ? "supported" : refute ? "refuted" : "unknown", support, refute, sources: sources.size };
          }
          default:
            throw Error("Unknown kernel");
        }
      }
      function run(graph, overrides = {}) {
        validate(graph);
        record(overrides);
        const g = clone(graph);
        for (const [id, value] of Object.entries(overrides)) {
          const n = g.nodes.find((n2) => n2.id === id);
          requireThat(n && n.op === "literal", "Overrides may change literals only");
          boundedJSON(value);
          n.params.value = clone(value);
        }
        validate(g);
        const values = /* @__PURE__ */ new Map(), pending = new Set(g.nodes), trace = [], effects = [];
        let steps = 0;
        while (pending.size) {
          const n = [...pending].find((n2) => n2.inputs.every((id) => values.has(id)));
          requireThat(n && ++steps <= 64, "Task stuck or out of fuel");
          const inputs = n.inputs.map((id) => values.get(id)), value = calculate(n.op, inputs, n.params);
          boundedJSON(value);
          requireThat(new TextEncoder().encode(canon(value)).length <= 65536, "Task value exceeds 64 KiB");
          values.set(n.id, value);
          pending.delete(n);
          trace.push({ edge: n.id, rule: n.op, inputs: clone(inputs), value: clone(value) });
          if (n.op === "action" && value.status === "simulated") effects.push(clone(value));
        }
        return { output: g.outputs.map((id) => clone(values.get(id))), trace, effects, graph: g };
      }
      const api = { ARITY, validate, run, calculate };
      if (typeof module !== "undefined") module.exports = api;
      root.QuinelingKernels = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// anatomy.js
var require_anatomy = __commonJS({
  "anatomy.js"(exports, module) {
    (function(root) {
      "use strict";
      const TAU = 2 * Math.PI, COMPILER = "qdl-assembly-experimental";
      const TEMPLATES = { gather: [[0, 0, 0], [-0.06, -0.03, -0.06], [0.09, 0.04, 0.08], [0, 0, 0], [0, 0, 0]], unfurl: [[0, 0, 0], [-0.03, 0.02, -0.07], [0.06, -0.02, 0.1], [0, 0, 0], [0, 0, 0]], glide: [[0, 0, 0], [-0.025, -0.06, -0.03], [0.04, 0.08, 0.05], [0, 0, 0], [0, 0, 0]], hover: [[0, 0, 0], [-0.025, 0.02, -0.02], [0.025, -0.02, 0.02], [0, 0, 0], [0, 0, 0]] };
      const fail = (m) => {
        throw Error("Anatomy: " + m);
      }, check2 = (b, m) => {
        if (!b) fail(m);
      };
      function fields2(o, keys) {
        check2(o && typeof o === "object" && !Array.isArray(o), "expected record");
        check2(Object.keys(o).length === keys.length && keys.every((k) => Object.hasOwn(o, k)), "unknown or missing fields");
      }
      function number(x, a, b) {
        check2(typeof x === "number" && Number.isFinite(x) && x >= a && x <= b, "number outside [" + a + "," + b + "]");
      }
      function id(x) {
        check2(typeof x === "string" && Array.from(x).length >= 1 && Array.from(x).length <= 64, "invalid ID");
      }
      function vector(x, n, a, b) {
        check2(Array.isArray(x) && x.length === n, "invalid vector");
        x.forEach((v) => number(v, a, b));
      }
      function freeze(x) {
        if (x && typeof x === "object") {
          Object.values(x).forEach(freeze);
          Object.freeze(x);
        }
        return x;
      }
      const copy2 = (x) => JSON.parse(JSON.stringify(x));
      function validateGesture(g) {
        fields2(g, ["kind", "strength", "ticks"]);
        check2(Object.hasOwn(TEMPLATES, g.kind), "unknown gesture");
        number(g.strength, 0, 1);
        vector(g.ticks, 4, 100, 700);
        check2(g.ticks.every(Number.isInteger) && g.ticks.reduce((a, b) => a + b, 0) === 1e3, "ticks must be integers summing to 1000");
        return true;
      }
      function validate(a) {
        fields2(a, ["model", "compiler", "seed", "components", "owners"]);
        check2(a.model === "assembly" && a.compiler === COMPILER, "unknown assembly compiler");
        number(a.seed, 0, 4294967295);
        check2(Number.isInteger(a.seed), "seed must be uint32");
        check2(Array.isArray(a.components) && a.components.length >= 1 && a.components.length <= 16, "need 1\u201316 components");
        const parts = /* @__PURE__ */ new Map();
        for (const c of a.components) {
          if (c.kind === "spine") {
            fields2(c, ["id", "kind", "length", "radii", "bend", "parent"]);
            number(c.length, 0.12, 1.2);
            vector(c.radii, 2, 0.015, 0.16);
            vector(c.bend, 2, -0.2, 0.2);
          } else if (c.kind === "chamber") {
            fields2(c, ["id", "kind", "axes", "parent"]);
            vector(c.axes, 3, 0.04, 0.35);
          } else fail("unknown component kind");
          id(c.id);
          check2(!parts.has(c.id), "duplicate component ID");
          let depth = 0, angleBudget = 0;
          if (c.parent === null) check2(parts.size === 0, "only the first component may be root");
          else {
            check2(parts.size > 0, "first component must be root");
            fields2(c.parent, ["component", "socket", "angle", "hinge"]);
            const p = parts.get(c.parent.component);
            check2(p, "parent must be an earlier component");
            fields2(c.parent.socket, ["u", "v"]);
            number(c.parent.socket.u, 0, 1);
            number(c.parent.socket.v, 0, 1);
            number(c.parent.angle, -Math.PI, Math.PI);
            number(c.parent.hinge, -0.12, 0.12);
            depth = p.depth + 1;
            angleBudget = p.angleBudget + Math.abs(c.parent.hinge);
            check2(depth <= 4, "attachment depth exceeds four");
            check2(++p.children <= 4, "component has more than four children");
            check2(angleBudget <= 0.35, "joint path exceeds .35 radians");
          }
          parts.set(c.id, { depth, angleBudget, children: 0 });
        }
        check2(Array.isArray(a.owners) && a.owners.length >= 1 && a.owners.length <= 128, "need 1\u2013128 owner territories");
        const groups = new Map(a.components.map((c) => [c.id, []]));
        for (const o of a.owners) {
          fields2(o, ["node", "component", "u"]);
          id(o.node);
          check2(groups.has(o.component), "unknown ownership component");
          vector(o.u, 2, 0, 1);
          check2(o.u[0] < o.u[1], "territory must have positive width");
          check2((o.u[0] + o.u[1]) / 2 > o.u[0] && (o.u[0] + o.u[1]) / 2 < o.u[1], "territory has no representable interior");
          groups.get(o.component).push(o);
        }
        for (const regions of groups.values()) {
          regions.sort((x, y) => x.u[0] - y.u[0]);
          check2(regions.length && regions[0].u[0] === 0 && regions.at(-1).u[1] === 1, "ownership must cover each component");
          for (let i = 1; i < regions.length; i++) check2(regions[i - 1].u[1] === regions[i].u[0], "ownership gap or overlap");
        }
        return true;
      }
      function nodeIDs(graph) {
        const ns = Array.isArray(graph) ? graph : graph?.nodes;
        check2(Array.isArray(ns) && ns.length >= 1 && ns.length <= 64, "need 1\u201364 graph nodes");
        const ids = ns.map((n) => typeof n === "string" ? n : n?.id);
        ids.forEach(id);
        check2(new Set(ids).size === ids.length, "duplicate graph node");
        return ids;
      }
      function validateOwners(a, graph) {
        validate(a);
        const ids = new Set(nodeIDs(graph)), seen = /* @__PURE__ */ new Set();
        for (const o of a.owners) {
          check2(ids.has(o.node), "unknown owner node " + o.node);
          seen.add(o.node);
        }
        check2([...ids].every((n) => seen.has(n)), "every graph node needs positive territory");
        return true;
      }
      function local(c, u, v, chart = "side") {
        const angle = TAU * (v === 1 ? 0 : v), co = Math.cos(angle), si = Math.sin(angle);
        if (c.kind === "spine") {
          const s = u === 0 || u === 1 ? 0 : Math.sin(Math.PI * u), cx = c.bend[0] * c.length * s, cz = c.bend[1] * c.length * s, r = c.radii[0] + (c.radii[1] - c.radii[0]) * u;
          if (chart === "root" || chart === "tip") {
            const end = chart === "root" ? 0 : 1, rad = c.radii[end] * u;
            return { p: [rad * co, end * c.length, rad * si], n: [0, end ? 1 : -1, 0], u: end };
          }
          const dx = c.bend[0] * c.length * Math.PI * Math.cos(Math.PI * u), dz = c.bend[1] * c.length * Math.PI * Math.cos(Math.PI * u), dr = c.radii[1] - c.radii[0];
          return { p: [cx + r * co, c.length * u, cz + r * si], n: [c.length * co, -dx * co - dz * si - dr, c.length * si], u };
        }
        const q = 2 * Math.sqrt(Math.max(0, u * (1 - u))), [ax, ay, az] = c.axes, y = 2 * u - 1;
        return { p: [ax * q * co, ay * (1 + y), az * q * si], n: [q * co / ax, y / ay, q * si / az], u };
      }
      function chartLocal(c, chart, a, b) {
        const r2 = a * a + b * b;
        check2(r2 <= 1, "chart coordinate outside unit disk");
        if (c.kind === "spine") {
          check2(chart === "root" || chart === "tip", "spine disk chart must be root or tip");
          const end = chart === "tip" ? 1 : 0;
          return { p: [c.radii[end] * a, c.length * end, c.radii[end] * b], n: [0, end ? 1 : -1, 0], u: end };
        }
        check2(chart === "north" || chart === "south", "unknown chamber chart");
        const sign = chart === "north" ? 1 : -1, d = 1 + r2, x = 2 * a / d, z = 2 * b / d, y = sign * (1 - r2) / d, [ax, ay, az] = c.axes;
        return { p: [ax * x, ay * (1 + y), az * z], n: [x / ax, y / ay, z / az], u: (1 + y) / 2 };
      }
      const matvec = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
      function matmul(a, b) {
        const r = [];
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(a[i * 3] * b[j] + a[i * 3 + 1] * b[j + 3] + a[i * 3 + 2] * b[j + 6]);
        return r;
      }
      function normalMatrix(m) {
        return [m[4] * m[8] - m[5] * m[7], m[5] * m[6] - m[3] * m[8], m[3] * m[7] - m[4] * m[6], m[2] * m[7] - m[1] * m[8], m[0] * m[8] - m[2] * m[6], m[1] * m[6] - m[0] * m[7], m[1] * m[5] - m[2] * m[4], m[2] * m[3] - m[0] * m[5], m[0] * m[4] - m[1] * m[3]];
      }
      function rotation(a) {
        const c = Math.cos(a), s = Math.sin(a);
        return [c, -s, 0, s, c, 0, 0, 0, 1];
      }
      function phaseValue(phase) {
        number(phase, -1e9, 1e9);
        return (phase / TAU % 1 + 1) % 1;
      }
      function score(g, phase) {
        validateGesture(g);
        const at = phaseValue(phase) * 1e3;
        let start = 0, i = 0;
        while (i < 3 && at >= start + g.ticks[i]) start += g.ticks[i++];
        const z = Math.max(0, Math.min(1, (at - start) / g.ticks[i])), h = z * z * z * (10 + z * (-15 + 6 * z)), a = TEMPLATES[g.kind][i], b = TEMPLATES[g.kind][i + 1];
        return a.map((x, k) => (x + (b[k] - x) * h) * g.strength);
      }
      const compiledSet = /* @__PURE__ */ new WeakSet(), poseCache = /* @__PURE__ */ new WeakMap(), planCache = /* @__PURE__ */ new WeakMap(), bufferCache = /* @__PURE__ */ new WeakMap();
      function assertCompiled(c) {
        check2(compiledSet.has(c), "expected compiled anatomy");
      }
      function compile(anatomy, nodes, gesture) {
        validateOwners(anatomy, nodes);
        validateGesture(gesture);
        const a = copy2(anatomy), g = copy2(gesture), ids = nodeIDs(nodes), indices = new Map(ids.map((id2, i) => [id2, i]));
        const parts = a.components.map((c) => ({ ...c, charts: c.kind === "spine" ? ["side", "root", "tip"] : ["north", "south"], regions: a.owners.filter((o) => o.component === c.id).sort((x, y) => x.u[0] - y.u[0]).map((o) => ({ ...o, index: indices.get(o.node) })) }));
        const out = freeze({ anatomy: a, gesture: g, nodeIds: ids, parts });
        compiledSet.add(out);
        return out;
      }
      function pose(c, phase) {
        assertCompiled(c);
        phaseValue(phase);
        const old = poseCache.get(c);
        if (old?.phase === phase) return old;
        const [sigma, lean, opening] = score(c.gesture, phase), R = rotation(lean), a = Math.exp(-sigma / 2), b = Math.exp(sigma), base = matmul(R, [a, 0, 0, 0, b, 0, 0, 0, a]), maps = [], byID = /* @__PURE__ */ new Map();
        for (const part of c.parts) {
          let m = base, t = [0, 0, 0];
          if (part.parent) {
            const p = byID.get(part.parent.component), s = local(p.part, part.parent.socket.u, part.parent.socket.v), v = matvec(p.m, s.p);
            t = v.map((x, i) => x + p.t[i]);
            m = matmul(p.m, rotation(part.parent.angle + part.parent.hinge * opening / 0.12));
          }
          const frame2 = { part, m, t, n: normalMatrix(m) };
          maps.push(frame2);
          byID.set(part.id, frame2);
        }
        const result = freeze({ phase, score: [sigma, lean, opening], maps });
        poseCache.set(c, result);
        return result;
      }
      function owner(part, u) {
        return (part.regions.find((o) => u < o.u[1]) || part.regions.at(-1)).index;
      }
      function world(f, p) {
        const v = matvec(f.m, p.p), n = matvec(f.n, p.n), len = Math.hypot(...n);
        return { x: v[0] + f.t[0], y: v[1] + f.t[1], z: v[2] + f.t[2], nx: n[0] / len, ny: n[1] / len, nz: n[2] / len, owner: owner(f.part, p.u) };
      }
      function getMap(c, component, phase) {
        const f = pose(c, phase).maps.find((f2) => f2.part.id === component);
        check2(f, "unknown component");
        return f;
      }
      function sample(c, component, u, v, phase, chart = "side") {
        number(u, 0, 1);
        number(v, 0, 1);
        const f = getMap(c, component, phase);
        check2(chart === "side" || f.part.kind === "spine" && ["root", "tip"].includes(chart), "invalid sample chart");
        return world(f, local(f.part, u, v, chart));
      }
      function sampleChart(c, component, chart, a, b, phase) {
        number(a, -1, 1);
        number(b, -1, 1);
        const f = getMap(c, component, phase);
        return world(f, chartLocal(f.part, chart, a, b));
      }
      function anchor(c, node, phase) {
        assertCompiled(c);
        const index = c.nodeIds.indexOf(typeof node === "string" ? node : node.id);
        check2(index >= 0, "unknown anchor node");
        const f = pose(c, phase).maps.find((f2) => f2.part.regions.some((r2) => r2.index === index)), r = f.part.regions.find((r2) => r2.index === index);
        return world(f, local(f.part, (r.u[0] + r.u[1]) / 2, 0.375));
      }
      function socket(c, component, phase) {
        const f = getMap(c, component, phase);
        return { x: f.t[0], y: f.t[1], z: f.t[2] };
      }
      function area(c) {
        return c.kind === "spine" ? TAU * (c.radii[0] + c.radii[1]) * 0.5 * c.length + Math.PI * (c.radii[0] ** 2 + c.radii[1] ** 2) : 4 * Math.PI * ((c.axes[0] * c.axes[1] + c.axes[1] * c.axes[2] + c.axes[0] * c.axes[2]) / 3);
      }
      function plan(c, budget) {
        let plans = planCache.get(c);
        if (!plans) {
          plans = /* @__PURE__ */ new Map();
          planCache.set(c, plans);
        }
        if (plans.has(budget)) {
          const cached = plans.get(budget);
          plans.delete(budget);
          plans.set(budget, cached);
          return cached;
        }
        const items = [];
        c.parts.forEach((p, i) => {
          for (const r of p.regions) items.push({ i, p: local(p, (r.u[0] + r.u[1]) / 2, 0.375), reserved: true });
          for (const chart of p.charts) if (chart !== "side") items.push({ i, p: chartLocal(p, chart, 0.31, 0.23), reserved: true });
        });
        const total = c.parts.reduce((s, p) => s + area(p), 0), remaining = budget - items.length;
        check2(remaining >= 0, "sample budget cannot cover owners/charts");
        let cumulative = 0, allocated = 0;
        c.parts.forEach((p, i) => {
          cumulative += area(p) / total;
          const upto = i === c.parts.length - 1 ? remaining : Math.floor(cumulative * remaining), count = upto - allocated;
          allocated = upto;
          for (let j = 0; j < count; j++) {
            const v = j * 0.6180339887498949 % 1, u = (j + 0.5) / Math.max(1, count);
            if (p.kind === "spine" && j % 12 < 2) {
              const end = j % 12 === 0 ? "root" : "tip", rho = Math.sqrt((j + 0.5) * 0.754877666 % 1);
              items.push({ i, p: chartLocal(p, end, rho * Math.cos(TAU * v), rho * Math.sin(TAU * v)) });
            } else items.push({ i, p: local(p, u, v) });
          }
        });
        for (const item of items) item.owner = owner(c.parts[item.i], item.p.u);
        const result = freeze(items);
        plans.set(budget, result);
        while (plans.size > 2) plans.delete(plans.keys().next().value);
        return result;
      }
      function restLayout(c, options2 = {}) {
        assertCompiled(c);
        const budget = options2.budget ?? 2e3;
        number(budget, 1e3, 4e3);
        check2(Number.isInteger(budget), "integer rest layout budget required");
        check2(Object.keys(options2).every((k) => k === "budget"), "unknown rest layout option");
        const items = plan(c, budget), positions = new Float32Array(budget * 3), normals = new Float32Array(budget * 3), owners = new Uint16Array(budget), components = new Uint16Array(budget), weights = new Float32Array(budget), reserved = new Uint8Array(budget), counts = c.parts.map(() => [0, 0]);
        for (const it of items) counts[it.i][it.reserved ? 0 : 1]++;
        const total = c.parts.reduce((sum, p) => sum + area(p), 0);
        for (let j = 0; j < items.length; j++) {
          const it = items[j], k = j * 3;
          positions.set(it.p.p, k);
          normals.set(it.p.n, k);
          owners[j] = it.owner;
          components[j] = it.i;
          reserved[j] = it.reserved ? 1 : 0;
          const [anchors, samples] = counts[it.i], fraction = it.reserved ? samples ? 0.05 : 1 : 0.95;
          weights[j] = area(c.parts[it.i]) / total * fraction / (it.reserved ? anchors : samples);
        }
        return { positions, normals, owners, components, weights, reserved, sampleCount: budget };
      }
      function frame(c, phase, options2 = {}) {
        assertCompiled(c);
        const budget = options2.budget ?? 12e3, crests = options2.crests ?? 3;
        number(budget, 4e3, 24e3);
        number(crests, 2, 4);
        check2(Number.isInteger(budget) && Number.isInteger(crests), "integer frame budgets required");
        const maps = pose(c, phase).maps, items = plan(c, budget);
        let buffers = options2.reuse ? bufferCache.get(c) : null;
        if (!buffers || buffers.owners.length !== items.length) {
          buffers = { points: new Float32Array(items.length * 4), normals: new Float32Array(items.length * 3), owners: new Uint16Array(items.length) };
          if (options2.reuse) bufferCache.set(c, buffers);
        }
        const { points, normals, owners } = buffers;
        for (let j = 0; j < items.length; j++) {
          const it = items[j], f = maps[it.i], m = f.m, n = f.n, p = it.p.p, v = it.p.n, k = 4 * j, q = 3 * j, nx = n[0] * v[0] + n[1] * v[1] + n[2] * v[2], ny = n[3] * v[0] + n[4] * v[1] + n[5] * v[2], nz = n[6] * v[0] + n[7] * v[1] + n[8] * v[2], length = Math.hypot(nx, ny, nz);
          points[k] = m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + f.t[0];
          points[k + 1] = m[3] * p[0] + m[4] * p[1] + m[5] * p[2] + f.t[1];
          points[k + 2] = m[6] * p[0] + m[7] * p[1] + m[8] * p[2] + f.t[2];
          points[k + 3] = 0.18;
          normals[q] = nx / length;
          normals[q + 1] = ny / length;
          normals[q + 2] = nz / length;
          owners[j] = it.owner;
        }
        const ridges = [];
        for (let j = 0; j < crests; j++) {
          const component = j < 2 || c.parts.length === 1 ? 0 : 1 + Math.floor((j - 2) * (c.parts.length - 1) / Math.max(1, crests - 2)), f = maps[component], line = [];
          for (let k = 0; k <= 300; k++) line.push(world(f, local(f.part, k / 300, (j * 0.381966 + 0.14) % 1)));
          ridges.push({ line, primary: true });
        }
        return { points, normals, owners, ridges };
      }
      function portraitFrame(c) {
        assertCompiled(c);
        const rest = pose(c, 0).maps, template = TEMPLATES[c.gesture.kind], sigmaMax = Math.max(...template.map((p) => Math.abs(p[0]))) * c.gesture.strength, leanMax = Math.max(...template.map((p) => Math.abs(p[1]))) * c.gesture.strength, openMax = Math.max(...template.map((p) => Math.abs(p[2]))) * c.gesture.strength / 0.12;
        let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < rest.length; i++) {
          const f = rest[i], p = f.part, L = p.kind === "spine" ? p.length : 2 * p.axes[1], r = p.kind === "spine" ? Math.max(...p.radii) : Math.max(p.axes[0], p.axes[2]), bow = p.kind === "spine" ? Math.max(...p.bend.map(Math.abs)) * L : 0, localBounds = [[-r - bow, 0, -r - bow], [r + bow, L, r + bow]];
          let reach = Math.hypot(L, r + bow), angle = 0, node = p;
          while (node.parent) {
            angle += Math.abs(node.parent.hinge);
            node = c.parts.find((x) => x.id === node.parent.component);
            reach += node.kind === "spine" ? Math.hypot(node.length, Math.max(...node.radii) + 0.283 * node.length) : 2 * Math.max(...node.axes);
          }
          const pad = reach * (Math.expm1(sigmaMax) + leanMax * Math.exp(sigmaMax) + angle * openMax * Math.exp(sigmaMax));
          for (let mask = 0; mask < 8; mask++) {
            const v = matvec(f.m, [localBounds[mask & 1 ? 1 : 0][0], localBounds[mask & 2 ? 1 : 0][1], localBounds[mask & 4 ? 1 : 0][2]]);
            for (let k = 0; k < 3; k++) {
              lo[k] = Math.min(lo[k], v[k] + f.t[k] - pad);
              hi[k] = Math.max(hi[k], v[k] + f.t[k] + pad);
            }
          }
        }
        return { cx: (lo[0] + hi[0]) / 2, cy: (lo[1] + hi[1]) / 2, cz: (lo[2] + hi[2]) / 2, width: hi[0] - lo[0], height: hi[1] - lo[1], depth: hi[2] - lo[2] };
      }
      function generate(graph, seed = 0) {
        const ids = nodeIDs(graph);
        number(seed, 0, 4294967295);
        check2(Number.isInteger(seed), "seed must be uint32");
        const nodes = graph.nodes;
        check2(Array.isArray(nodes) && nodes.every((n) => Array.isArray(n.inputs)), "generation needs graph input lists");
        const known = new Set(ids), depth = /* @__PURE__ */ new Map(), fanout = new Map(ids.map((x) => [x, 0]));
        for (const n of nodes) {
          check2(n.inputs.every((x) => known.has(x) && depth.has(x)), "graph must be an ordered DAG");
          depth.set(n.id, n.inputs.length ? 1 + Math.max(...n.inputs.map((x) => depth.get(x))) : 0);
          n.inputs.forEach((x) => fanout.set(x, fanout.get(x) + 1));
        }
        let state = seed >>> 0;
        const rnd = () => {
          state = Math.imul(1664525, state) + 1013904223 >>> 0;
          return state / 4294967296;
        }, clamp = (x, a, b) => Math.max(a, Math.min(b, x)), count = (ops) => nodes.filter((n) => ops.includes(n.op)).length;
        const maxDepth = Math.max(...depth.values()), forks = nodes.filter((n) => fanout.get(n.id) > 1), merges = nodes.filter((n) => n.inputs.length > 1), maxFork = Math.max(...fanout.values()), maxMerge = Math.max(...nodes.map((n) => n.inputs.length)), arithmetic = count(["map", "sum", "mean", "min", "max", "weightedMean"]), selection = count(["filter", "compare", "choose", "dedupe", "sort"]), effect = count(["action", "retry"]), sequencing = count(["schedule", "retry"]), kind = merges.length > forks.length ? "gather" : forks.length ? "unfurl" : maxDepth >= 2 ? "glide" : "hover";
        const spread = clamp(0.12 + 0.026 * maxMerge + 0.022 * selection + 0.13 * effect + 0.055 * sequencing + 0.018 * forks.length + (rnd() - 0.5) * 0.07, 0.105, 0.34), height = clamp(0.22 + 0.025 * Math.min(maxDepth, 5) + 0.021 * arithmetic - 0.026 * selection - 0.095 * effect - 0.045 * sequencing + (rnd() - 0.5) * 0.07, 0.15, 0.35), thickness = clamp(0.075 + 0.025 * rnd() + 0.012 * Math.min(maxMerge, 4), 0.075, 0.16), hand = rnd() < 0.5 ? -1 : 1;
        const parts = [{ id: "trunk", kind: "chamber", axes: [spread, height, thickness], parent: null }], buckets = [ids.slice()];
        function append(part, owners2) {
          parts.push(part);
          buckets.push(owners2);
          return part.id;
        }
        function spine(id2, owner2, parent, u, v, angle, length, width, bend, hinge = 0.04) {
          return append({ id: id2, kind: "spine", length: clamp(length, 0.12, 0.7), radii: [clamp(width, 0.022, 0.09), 0.015 + 3e-3 * rnd()], bend: [clamp(bend, -0.2, 0.2), (rnd() - 0.5) * 0.16], parent: { component: parent, socket: { u, v }, angle: clamp(angle, -Math.PI, Math.PI), hinge } }, [owner2]);
        }
        const motif = forks.length ? forks.slice().sort((a, b) => fanout.get(b.id) - fanout.get(a.id))[0] : merges.slice().sort((a, b) => b.inputs.length - a.inputs.length)[0];
        if (motif) {
          const selected = forks.length ? nodes.filter((n) => n.inputs.includes(motif.id)) : motif.inputs.map((id2) => nodes.find((n) => n.id === id2)), visible = selected.slice(0, 3);
          for (let j = 0; j < visible.length; j++) {
            const direction = (j % 2 ? 1 : -1) * hand, u = clamp(0.38 + 0.14 * j + 0.06 * rnd(), 0.3, 0.8), angle = -direction * (0.75 + 0.28 * j + 0.35 * rnd());
            spine("branch-" + j, visible[j].id, "trunk", u, direction > 0 ? 0 : 0.5, angle, 0.24 + 0.048 * Math.min(4, maxFork + maxMerge) + 0.06 * j + 0.04 * rnd(), 0.03 + 0.012 * (1 - j / 3), direction * 0.18, -direction * 0.065);
          }
        } else if (maxDepth >= 3) {
          const terminal = nodes.find((n) => depth.get(n.id) === maxDepth) || nodes.at(-1), side = hand;
          const neck = spine("neck", terminal.id, "trunk", 0.77, side > 0 ? 0 : 0.5, -side * 0.9, 0.16, 0.034, side * 0.16);
          const lobe = append({ id: "lobe", kind: "chamber", axes: [0.065 + 0.02 * rnd(), 0.1 + 0.022 * rnd(), 0.055 + 0.012 * rnd()], parent: { component: neck, socket: { u: 1, v: 0 }, angle: side * 0.2, hinge: 0.035 } }, [terminal.id]);
          spine("lobe-tip", terminal.id, lobe, 1, 0, -side * 0.3, 0.17, 0.025, -side * 0.17, 0.025);
        } else if (selection) {
          const n = nodes.find((n2) => ["filter", "compare", "choose", "dedupe", "sort"].includes(n2.op)) || nodes.at(-1);
          spine("sweep", n.id, "trunk", 0.62, hand > 0 ? 0 : 0.5, -hand * 1.75, 0.32 + 0.04 * rnd(), 0.035, hand * 0.2, hand * 0.065);
        } else {
          const n = nodes.at(-1);
          spine("continuation", n.id, "trunk", 1, 0.25, hand * (0.15 + 0.38 * rnd()), 0.18 + 0.037 * Math.min(maxDepth, 5), 0.038, -hand * 0.18);
        }
        const tailAngle = hand * (2.55 + 0.4 * rnd()), tail = spine("tail", nodes[0].id, "trunk", 0, 0.25, tailAngle, 0.19 + 0.035 * Math.min(maxDepth, 5) + 0.065 * rnd(), 0.026 + 9e-3 * rnd(), -hand * 0.19, -hand * 0.035);
        if (effect || maxFork >= 3) {
          spine("wake", nodes.at(-1).id, tail, 0.72, 0.5, -hand * 0.75, 0.19 + 0.025 * effect, 0.023, hand * 0.19, 0.035);
        }
        const owners = [];
        parts.forEach((p, i) => buckets[i].forEach((node, j) => owners.push({ node, component: p.id, u: [j / buckets[i].length, (j + 1) / buckets[i].length] })));
        const anatomy = { model: "assembly", compiler: COMPILER, seed, components: parts, owners }, gesture = { kind, strength: 0.55 + Math.round(rnd() * 15) / 100, ticks: kind === "gather" ? [180, 180, 420, 220] : kind === "unfurl" ? [220, 170, 430, 180] : [180, 170, 450, 200] };
        validateOwners(anatomy, graph);
        validateGesture(gesture);
        return { anatomy, gesture };
      }
      const api = { COMPILER, validate, validateOwners, validateGesture, generate, compile, score, pose, sample, sampleChart, anchor, socket, frame, restLayout, portraitFrame };
      if (typeof module !== "undefined") module.exports = api;
      root.Anatomy = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// qdl.js
var require_qdl = __commonJS({
  "qdl.js"(exports, module) {
    (function(root) {
      "use strict";
      const Anatomy2 = typeof module !== "undefined" ? require_anatomy() : root.Anatomy;
      const FAMILIES = ["filament", "jelly", "moth", "coral", "ribbon", "nautilus", "seed", "torus", "comet", "bloom"];
      const DEFAULT = {
        qdl: 1,
        family: "filament",
        organ: { model: "rosette", baseRadius: 0.03, degreeGain: 4e-3, literalGain: 1e-3, amplitudes: [0.2, 0.13] },
        filament: { model: "pinned-sine", bend: 0.04, frequencyGain: 0.07, ripple: 0.16 },
        motion: { clock: "separate", phaseRate: 0.038, reducedMotion: "freeze", rhythm: { model: "coupled-harmonic", mode: "periodic", rate: 1, breath: 0.06, wave: 0.055, waveNumber: 1.6, lag: 0.9, asymmetry: 0.28, overtone: 0.17 } },
        ink: { ghostAlpha: 0.09, secondaryAlpha: 0.42, ridgeAlpha: 0.88, neutral: "#f0f1eb" },
        surface: { model: "folded-ribbon", ribbons: 28, crests: 4, spread: 0.16, folds: 7, taper: 0.65, asymmetry: 0.25, depth: 0.28, twist: 1.9, phaseLag: 1.4, samples: 24e3 },
        light: { model: "density-crest", recessAlpha: 0.045, crestAlpha: 0.58, depthContrast: 0.65 },
        composition: { occupancy: 0.76, lean: -0.12, yaw: 0.3, pitch: 0.12, focus: 0.38 },
        chroma: { model: "material-territories", palette: "roles-1", strength: 0.85 }
      };
      const clone = (x) => JSON.parse(JSON.stringify(x));
      function check2(ok, message) {
        if (!ok) throw Error("QDL: " + message);
      }
      function fields2(obj, names, optional = []) {
        check2(obj && typeof obj === "object" && !Array.isArray(obj), "expected record");
        check2(Object.keys(obj).every((k) => names.includes(k) || optional.includes(k)) && names.every((k) => Object.hasOwn(obj, k)), "unknown or missing fields");
      }
      function range(v, min, max) {
        check2(typeof v === "number" && Number.isFinite(v) && v >= min && v <= max, "number outside [" + min + "," + max + "]");
      }
      function boundedString(v, min, max) {
        check2(typeof v === "string" && Array.from(v).length >= min && Array.from(v).length <= max, "string length outside [" + min + "," + max + "]");
      }
      function validateChroma(c) {
        fields2(c, ["model", "palette", "strength"], ["lens"]);
        check2(c.model === "material-territories", "unknown chroma model");
        check2(c.palette === "roles-1", "unknown chroma palette");
        range(c.strength, 0, 1);
        if (Object.hasOwn(c, "lens")) {
          const l = c.lens;
          fields2(l, ["kind", "id", "label", "unit", "domain", "bindings"], ["threshold"]);
          check2(l.kind === "scalar", "unknown chroma lens");
          boundedString(l.id, 1, 64);
          boundedString(l.label, 1, 80);
          boundedString(l.unit, 0, 24);
          check2(Array.isArray(l.domain) && l.domain.length === 2 && l.domain.every((x) => typeof x === "number" && Number.isFinite(x)), "need two finite domain endpoints");
          const [lo, hi] = l.domain;
          check2(lo < hi && Number.isFinite(hi - lo), "scalar domain must have finite positive width");
          if (Object.hasOwn(l, "threshold")) range(l.threshold, lo, hi);
          check2(Array.isArray(l.bindings) && l.bindings.length >= 1 && l.bindings.length <= 64, "need 1\u201364 scalar bindings");
          const ids = /* @__PURE__ */ new Set();
          for (const b of l.bindings) {
            fields2(b, ["node", "path"]);
            boundedString(b.node, 1, 64);
            check2(!ids.has(b.node), "duplicate scalar node binding");
            ids.add(b.node);
            check2(Array.isArray(b.path) && b.path.length <= 8, "scalar path exceeds eight segments");
            for (const part of b.path) {
              if (typeof part === "string") {
                boundedString(part, 1, 64);
                check2(!["__proto__", "constructor", "prototype"].includes(part), "unsafe scalar property key");
              } else {
                check2(Number.isInteger(part), "scalar path needs property keys or integer indices");
                range(part, 0, 511);
              }
            }
          }
        }
      }
      const HEREDITY_TRAITS = ["elongation", "spread", "curvature", "gestureGain", "tempo", "pigmentGain"];
      function validateHeredity(h) {
        fields2(h, ["model", "parents", "seedDigest", "nonce", "traits"]);
        check2(h.model === "bounded-traits-experimental", "unknown heredity model");
        const hash = (x) => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
        check2(Array.isArray(h.parents) && h.parents.length === 2 && h.parents.every(hash), "heredity needs two complete-source SHA256 assertions");
        check2(hash(h.seedDigest), "invalid heredity seed digest");
        range(h.nonce, 0, 4294967295);
        check2(Number.isInteger(h.nonce), "heredity nonce must be uint32");
        fields2(h.traits, HEREDITY_TRAITS);
        for (const k of HEREDITY_TRAITS) {
          range(h.traits[k], -1e3, 1e3);
          check2(Number.isInteger(h.traits[k]), "heredity traits must be bounded integers");
        }
        return true;
      }
      function validate(d) {
        fields2(d, ["qdl", "family", "organ", "filament", "motion", "ink", "surface", "light", "composition"], ["chroma", "anatomy", "heredity"]);
        check2(d.qdl === 1, "invalid format marker");
        check2(FAMILIES.includes(d.family), "unknown family");
        if (Object.hasOwn(d, "heredity")) validateHeredity(d.heredity);
        if (Object.hasOwn(d, "chroma")) validateChroma(d.chroma);
        if (Object.hasOwn(d, "anatomy")) {
          check2(Anatomy2, "assembly module missing");
          Anatomy2.validate(d.anatomy);
          check2(Object.hasOwn(d.motion || {}, "gesture"), "assembly requires an authored gesture");
        }
        fields2(d.organ, ["model", "baseRadius", "degreeGain", "literalGain", "amplitudes"]);
        check2(d.organ.model === "rosette", "unknown organ model");
        range(d.organ.baseRadius, 0.01, 0.08);
        range(d.organ.degreeGain, 0, 6e-3);
        range(d.organ.literalGain, 0, 3e-3);
        check2(Array.isArray(d.organ.amplitudes) && d.organ.amplitudes.length === 2, "need two radial harmonics");
        d.organ.amplitudes.forEach((a) => range(a, 0, 0.45));
        check2(d.organ.amplitudes[0] + d.organ.amplitudes[1] < 1, "radial envelope may collapse");
        fields2(d.filament, ["model", "bend", "frequencyGain", "ripple"]);
        check2(d.filament.model === "pinned-sine", "unknown filament model");
        range(d.filament.bend, 0, 0.08);
        range(d.filament.frequencyGain, 0, 0.2);
        range(d.filament.ripple, 0, 0.3);
        fields2(d.motion, ["clock", "phaseRate", "reducedMotion"], ["rhythm", "gesture"]);
        check2(d.motion.clock === "separate" && d.motion.reducedMotion === "freeze", "motion may not control execution");
        range(d.motion.phaseRate, 0, 0.05);
        if (Object.hasOwn(d.motion, "gesture")) {
          check2(Object.hasOwn(d, "anatomy"), "gesture requires assembly anatomy");
          Anatomy2.validateGesture(d.motion.gesture);
        }
        if (Object.hasOwn(d.motion, "rhythm")) {
          const r = d.motion.rhythm;
          fields2(r, ["model", "mode", "rate", "breath", "wave", "waveNumber", "lag", "asymmetry", "overtone"]);
          check2(r.model === "coupled-harmonic", "unknown rhythm model");
          check2(["periodic", "quasiperiodic"].includes(r.mode), "unknown rhythm mode");
          range(r.rate, 0.25, 2);
          range(r.breath, 0, 0.18);
          range(r.wave, 0, 0.18);
          range(r.waveNumber, 0, 4);
          range(r.lag, 0, 2);
          range(r.asymmetry, 0, 0.8);
          range(r.overtone, 0, 0.35);
        }
        fields2(d.ink, ["ghostAlpha", "secondaryAlpha", "ridgeAlpha", "neutral"]);
        for (const k of ["ghostAlpha", "secondaryAlpha", "ridgeAlpha"]) range(d.ink[k], 0, 1);
        check2(d.ink.ghostAlpha < d.ink.secondaryAlpha && d.ink.secondaryAlpha < d.ink.ridgeAlpha, "ink hierarchy must be ghost < secondary < ridge");
        check2(/^#[0-9a-f]{6}$/.test(d.ink.neutral), "invalid neutral RGB");
        {
          fields2(d.surface, ["model", "ribbons", "crests", "spread", "folds", "taper", "asymmetry", "depth", "twist", "phaseLag", "samples"]);
          check2(d.surface.model === "folded-ribbon", "unknown surface model");
          check2(Number.isInteger(d.surface.ribbons), "integer ribbons required");
          range(d.surface.ribbons, 8, 36);
          check2(Number.isInteger(d.surface.crests), "integer crest count required");
          range(d.surface.crests, 3, 6);
          check2(Number.isInteger(d.surface.folds), "integer folds required");
          range(d.surface.folds, 2, 9);
          range(d.surface.spread, 0.02, 0.24);
          range(d.surface.taper, 0.4, 2.5);
          range(d.surface.asymmetry, 0, 0.35);
          range(d.surface.depth, 0, 0.35);
          range(d.surface.twist, 0, 3);
          range(d.surface.phaseLag, 0, 2);
          check2(Number.isInteger(d.surface.samples), "integer sample budget required");
          range(d.surface.samples, 4e3, 24e3);
          fields2(d.light, ["model", "recessAlpha", "crestAlpha", "depthContrast"]);
          check2(d.light.model === "density-crest", "unknown light model");
          range(d.light.recessAlpha, 0.015, 0.12);
          range(d.light.crestAlpha, 0.16, 0.65);
          range(d.light.depthContrast, 0, 0.8);
          check2(d.light.recessAlpha < d.light.crestAlpha, "light hierarchy required");
          fields2(d.composition, ["occupancy", "lean", "yaw", "pitch", "focus"]);
          range(d.composition.occupancy, 0.6, 0.84);
          for (const k of ["lean", "yaw", "pitch"]) range(d.composition[k], -0.5, 0.5);
          range(d.composition.focus, 0.15, 0.8);
        }
        return true;
      }
      function create(family = "filament") {
        const d = clone(DEFAULT);
        d.family = family;
        {
          const presets = {
            jelly: { spread: 0.12, folds: 5, depth: 0.3, twist: 1.6, taper: 1.4, focus: 0.28, lean: 0.08, rate: 0.029 },
            moth: { spread: 0.17, folds: 5, depth: 0.25, twist: 1.8, taper: 0.8, focus: 0.45, yaw: -0.22, rate: 0.031 },
            coral: { ribbons: 20, spread: 0.12, folds: 4, depth: 0.24, twist: 1.3, taper: 0.7, focus: 0.55, lean: 0.02, rate: 0.034 },
            ribbon: { spread: 0.19, folds: 6, depth: 0.3, twist: 2.1, taper: 0.55, focus: 0.45, lean: -0.17 },
            nautilus: { spread: 0.1, folds: 6, depth: 0.24, twist: 1.5, taper: 0.85, focus: 0.45, yaw: 0.36, rate: 0.028 },
            torus: { ribbons: 24, spread: 0.12, folds: 5, depth: 0.28, twist: 1.7, taper: 0.8, focus: 0.5, lean: 0.09, rate: 0.03 },
            comet: { ribbons: 24, spread: 0.14, folds: 6, depth: 0.25, twist: 1.6, taper: 1.6, focus: 0.25, lean: -0.16 },
            bloom: { ribbons: 24, spread: 0.12, folds: 5, depth: 0.23, twist: 1.4, taper: 0.9, focus: 0.55, lean: 0.08, rate: 0.026 },
            seed: { ribbons: 24, spread: 0.13, folds: 6, depth: 0.25, twist: 1.8, taper: 0.8, focus: 0.42, rate: 0.03 }
          };
          for (const [k, v] of Object.entries(presets[family] || {})) {
            if (Object.hasOwn(d.surface, k)) d.surface[k] = v;
            else if (Object.hasOwn(d.composition, k)) d.composition[k] = v;
            else if (k === "rate") d.motion.phaseRate = v;
          }
        }
        const rhythms = {
          filament: { breath: 0.06, wave: 0.055, waveNumber: 1.6, lag: 0.9, asymmetry: 0.28, overtone: 0.17 },
          jelly: { rate: 0.8, breath: 0.14, wave: 0.075, waveNumber: 1.2, lag: 1.1, asymmetry: 0.65, overtone: 0.2 },
          moth: { rate: 1.35, breath: 0.045, wave: 0.075, waveNumber: 1, lag: 0.55, asymmetry: 0.4, overtone: 0.22 },
          coral: { mode: "quasiperiodic", rate: 0.55, breath: 0.035, wave: 0.04, waveNumber: 2.4, lag: 1.25, asymmetry: 0.18, overtone: 0.25 },
          ribbon: { rate: 0.85, breath: 0.055, wave: 0.095, waveNumber: 2.6, lag: 1.4, asymmetry: 0.32, overtone: 0.23 },
          nautilus: { rate: 0.65, breath: 0.08, wave: 0.045, waveNumber: 1.8, lag: 1.1, asymmetry: 0.45, overtone: 0.18 },
          seed: { rate: 0.6, breath: 0.075, wave: 0.035, waveNumber: 1.4, lag: 0.8, asymmetry: 0.3, overtone: 0.12 },
          torus: { rate: 0.9, breath: 0.085, wave: 0.055, waveNumber: 3, lag: 0.6, asymmetry: 0.25, overtone: 0.2 },
          comet: { rate: 1.15, breath: 0.045, wave: 0.09, waveNumber: 2.8, lag: 1.5, asymmetry: 0.48, overtone: 0.2 },
          bloom: { mode: "quasiperiodic", rate: 0.55, breath: 0.11, wave: 0.05, waveNumber: 2, lag: 0.85, asymmetry: 0.35, overtone: 0.28 }
        };
        Object.assign(d.motion.rhythm, rhythms[family] || {});
        validate(d);
        return d;
      }
      function validateBindings(d, graph) {
        validate(d);
        if (d.anatomy) Anatomy2.validateOwners(d.anatomy, graph);
        if (!d.chroma?.lens) return true;
        check2(graph && Array.isArray(graph.nodes), "scalar bindings require a task graph");
        const ids = new Set(graph.nodes.map((n) => n.id));
        for (const b of d.chroma.lens.bindings) check2(ids.has(b.node), "unknown scalar binding node " + b.node);
        return true;
      }
      function forProgram(item) {
        const d = create(item.skin.family);
        if (Object.hasOwn(item.skin, "chroma")) {
          validateChroma(item.skin.chroma);
          d.chroma = clone(item.skin.chroma);
        }
        validate(d);
        return d;
      }
      function organRadius(d, n, a, t) {
        const value = n.params?.value, magnitude = typeof value === "number" ? Math.min(6, Math.abs(value)) : Array.isArray(value) ? Math.min(6, value.length) : 1;
        const r = Math.min(0.16, d.organ.baseRadius + d.organ.degreeGain * (n.indegree + n.outdegree) + d.organ.literalGain * magnitude);
        return r * (1 + d.organ.amplitudes[0] * Math.cos(n.frequency * a) + d.organ.amplitudes[1] * Math.cos((n.outdegree + 1) * a + t));
      }
      function filamentBend(d, frequency, u, t) {
        return d.filament.bend * (1 + d.filament.frequencyGain * frequency) * Math.sin(Math.PI * u) * (1 + d.filament.ripple * Math.sin(2 * Math.PI * frequency * u + t));
      }
      const api = { FAMILIES, DEFAULT, HEREDITY_TRAITS, validateHeredity, validate, validateBindings, create, forProgram, organRadius, filamentBend };
      if (typeof module !== "undefined") module.exports = api;
      root.QDL = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// chroma.js
var require_chroma = __commonJS({
  "chroma.js"(exports, module) {
    (function(root) {
      "use strict";
      const ROLES = Object.freeze(Object.fromEntries(Object.entries({
        input: { label: "Input", color: "#35d6c3" },
        process: { label: "Process", color: "#639bfa" },
        decision: { label: "Judgment & evidence", color: "#edc653" },
        quote: { label: "Quote & reconstruction", color: "#b184ef" },
        action: { label: "Action", color: "#f2757d" },
        report: { label: "Report", color: "#8ccc76" }
      }).map(([key, value]) => [key, Object.freeze(value)])));
      const ROLE_MAP = Object.freeze({
        Observe: "input",
        Box: "quote",
        Permit: "decision",
        Apply: "process",
        Score: "process",
        Authorize: "decision",
        Execute: "action",
        Quote: "quote",
        Decode: "quote",
        Report: "report",
        literal: "input",
        sum: "process",
        mean: "process",
        min: "process",
        max: "process",
        weightedMean: "process",
        length: "process",
        map: "process",
        sort: "process",
        dedupe: "process",
        filter: "process",
        compare: "decision",
        choose: "decision",
        get: "process",
        clamp: "process",
        budget: "process",
        action: "action",
        report: "report",
        bfs: "process",
        allocate: "process",
        schedule: "process",
        consensus: "decision",
        retry: "process",
        evidence: "decision"
      });
      const SCALE_STOPS = Object.freeze([
        Object.freeze({ at: 0, color: "#593b9c" }),
        Object.freeze({ at: 0.25, color: "#765eb4" }),
        Object.freeze({ at: 0.5, color: "#a17ac0" }),
        Object.freeze({ at: 0.75, color: "#dca7b8" }),
        Object.freeze({ at: 1, color: "#f7e6ac" })
      ]);
      const STATUS_COLORS = Object.freeze({ "not-evaluated": "#839097", stale: "#839097", invalid: "#b0a7a0" });
      const STATUS_LABELS = Object.freeze({ valid: "Recorded value", underflow: "Below domain", overflow: "Above domain", "not-evaluated": "Not evaluated", stale: "Previous source", invalid: "Invalid value" });
      const cache = /* @__PURE__ */ new WeakMap(), closedFamilies = /* @__PURE__ */ new Set(["moth", "torus", "bloom"]), forbidden = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
      const clamp = (x) => Math.max(0, Math.min(1, x));
      function role(op) {
        if (!Object.hasOwn(ROLE_MAP, op)) throw Error("Unknown chroma operation " + op);
        return ROLE_MAP[op];
      }
      function channels(hex2) {
        return [1, 3, 5].map((i) => parseInt(hex2.slice(i, i + 2), 16));
      }
      function hex(rgb) {
        return "#" + rgb.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
      }
      function linear(x) {
        x /= 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      }
      function display(x) {
        return 255 * (x <= 31308e-7 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
      }
      function mix(a, b, t) {
        const x = channels(a), y = channels(b);
        return hex(x.map((v, i) => display((1 - t) * linear(v) + t * linear(y[i]))));
      }
      function desaturate(color, amount) {
        const c = channels(color).map(linear), y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        return hex(c.map((x) => display((1 - amount) * x + amount * y)));
      }
      function scalarColor(normalized) {
        if (!Number.isFinite(normalized)) throw Error("Scalar color needs a finite normalized value");
        const t = clamp(normalized), i = Math.min(SCALE_STOPS.length - 2, Math.floor(t * (SCALE_STOPS.length - 1))), a = SCALE_STOPS[i], b = SCALE_STOPS[i + 1];
        return mix(a.color, b.color, (t - a.at) / (b.at - a.at));
      }
      function compile(shape) {
        const nodes = shape.nodes;
        if (!Array.isArray(nodes) || !nodes.length) throw Error("Chroma needs operation nodes");
        const signature = JSON.stringify([shape.design?.family, shape.design?.chroma?.lens?.bindings?.map((x) => x.node) || [], nodes.map((n) => [n.id, n.op, n.level])]);
        const previous = cache.get(shape);
        if (previous?.signature === signature) return previous.field;
        const focused = new Set(shape.design?.chroma?.lens?.bindings?.map((x) => x.node) || []), groups = /* @__PURE__ */ new Map();
        nodes.forEach((n, index) => {
          const level = n.level || 0;
          if (!groups.has(level)) groups.set(level, []);
          groups.get(level).push({ index, id: n.id, weight: focused.has(n.id) ? 2 : 1 });
        });
        const ordered = [...groups].sort((a, b) => a[0] - b[0]).map(([, peers]) => peers.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        const totalWeight = ordered.flat().reduce((sum, n) => sum + n.weight, 0);
        let edge = 0;
        const bands = ordered.map((peers) => {
          const weight = peers.reduce((sum, n) => sum + n.weight, 0), start = edge;
          edge += weight / totalWeight;
          let lane = 0;
          return { start, end: edge, peers: peers.map((p) => {
            lane += p.weight / weight;
            return { ...p, end: lane };
          }) };
        });
        bands[bands.length - 1].end = 1;
        for (const b of bands) b.peers[b.peers.length - 1].end = 1;
        const closed = closedFamilies.has(shape.design?.family), offset = closed ? bands[0].end / 2 : 0;
        function owner2(u, v, k, total) {
          if (![u, v, k, total].every(Number.isFinite) || total <= 0) throw Error("Invalid material coordinate");
          const wrapped = (u % 1 + 1) % 1, x = closed ? (wrapped + offset) % 1 : clamp(u), lane = clamp((k + clamp((v + 1) / 2)) / total);
          const band = bands.find((b) => x < b.end) || bands[bands.length - 1];
          return (band.peers.find((p) => lane < p.end) || band.peers[band.peers.length - 1]).index;
        }
        const field = Object.freeze({ owner: owner2, nodeIds: Object.freeze(nodes.map((n) => n.id)), roleColors: Object.freeze(nodes.map((n) => ROLES[role(n.op)].color)), bands: Object.freeze(bands.map((b) => Object.freeze({ start: b.start, end: b.end, nodeIds: Object.freeze(b.peers.map((p) => nodes[p.index].id)) }))) });
        cache.set(shape, { signature, field });
        return field;
      }
      function owner(shape, u, v, k, total) {
        return compile(shape).owner(u, v, k, total);
      }
      function ownPath(value, path) {
        if (!Array.isArray(path)) return { ok: false };
        for (const part of path) {
          if (!(typeof part === "string" || Number.isInteger(part) && part >= 0) || forbidden.has(String(part)) || value === null || typeof value !== "object" || !Object.hasOwn(value, part)) return { ok: false };
          value = value[part];
        }
        return typeof value === "number" && Number.isFinite(value) ? { ok: true, value } : { ok: false };
      }
      function resolveLens(design, taskRecord, status = "current") {
        const lens = design?.chroma?.lens, byNode = /* @__PURE__ */ Object.create(null), entries = [];
        if (!lens) return { status: "off", lens: null, byNode, entries };
        const trace = taskRecord?.trace, rows = /* @__PURE__ */ new Map(), duplicates = /* @__PURE__ */ new Set();
        if (Array.isArray(trace)) for (const row of trace) {
          if (!row || typeof row.edge !== "string") continue;
          if (rows.has(row.edge)) duplicates.add(row.edge);
          rows.set(row.edge, row);
        }
        const domainOK = Array.isArray(lens.domain) && lens.domain.length === 2 && lens.domain.every(Number.isFinite) && lens.domain[1] > lens.domain[0] && Number.isFinite(lens.domain[1] - lens.domain[0]);
        for (const binding of lens.bindings || []) {
          const entry = { node: binding.node, path: Array.isArray(binding.path) ? binding.path.slice() : [], status: "not-evaluated", color: STATUS_COLORS["not-evaluated"] };
          if (status !== "current") {
            entry.status = status === "stale" ? "stale" : "not-evaluated";
            entry.color = STATUS_COLORS[entry.status];
          } else if (!domainOK || duplicates.has(binding.node)) {
            entry.status = "invalid";
            entry.color = STATUS_COLORS.invalid;
          } else if (rows.has(binding.node)) {
            const row = rows.get(binding.node), result = Object.hasOwn(row, "value") ? ownPath(row.value, binding.path) : { ok: false };
            if (!result.ok) {
              entry.status = "invalid";
              entry.color = STATUS_COLORS.invalid;
            } else {
              const [lo, hi] = lens.domain;
              entry.value = result.value;
              entry.normalized = clamp((result.value - lo) / (hi - lo));
              entry.status = result.value < lo ? "underflow" : result.value > hi ? "overflow" : "valid";
              entry.color = scalarColor(entry.normalized);
            }
          }
          entries.push(entry);
          byNode[binding.node] = entry;
        }
        return { status: status === "current" ? Array.isArray(trace) ? "current" : "not-evaluated" : status, lens, byNode, entries };
      }
      function colorFor(shape, nodeIndex, lensState) {
        const neutral = shape.design?.ink?.neutral || shape.design?.light?.neutral || "#d5e2e0", chroma = shape.design?.chroma;
        if (!chroma) return neutral;
        const node = shape.nodes[nodeIndex];
        if (!node) throw Error("Unknown material owner");
        const strength = Number.isFinite(chroma.strength) ? clamp(chroma.strength) : 0;
        const entry = lensState?.byNode?.[node.id];
        let color = entry?.color || ROLES[role(node.op)].color;
        if (lensState?.lens && !entry) color = desaturate(color, 0.48);
        return strength === 1 ? color : strength === 0 ? neutral : mix(neutral, color, strength);
      }
      const api = { ROLES, ROLE_MAP, SCALE_STOPS, STATUS_COLORS, STATUS_LABELS, role, compile, owner, scalarColor, resolveLens, colorFor };
      if (typeof module !== "undefined") module.exports = api;
      root.Chroma = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// morphology.js
var require_morphology = __commonJS({
  "morphology.js"(exports, module) {
    (function(root) {
      "use strict";
      const TAU = Math.PI * 2;
      const Anatomy2 = typeof module !== "undefined" ? require_anatomy() : root.Anatomy;
      const assemblyCache = /* @__PURE__ */ new WeakMap();
      function assembly(s) {
        let c = assemblyCache.get(s);
        const key = JSON.stringify([s.design.anatomy, s.design.motion.gesture, s.nodes.map((n) => n.id)]);
        if (!c || c.key !== key) {
          c = { key, body: Anatomy2.compile(s.design.anatomy, s.nodes, s.design.motion.gesture) };
          assemblyCache.set(s, c);
        }
        return c.body;
      }
      const Chroma2 = typeof module !== "undefined" ? require_chroma() : root.Chroma;
      const DEFAULT_RHYTHM = Object.freeze({ model: "coupled-harmonic", mode: "periodic", rate: 1, breath: 0.06, wave: 0.055, waveNumber: 1.6, lag: 0.9, asymmetry: 0.28, overtone: 0.17 });
      const motionCache = /* @__PURE__ */ new WeakMap();
      function bodyTransform(family, r, pulse, secondary) {
        const scale = 1 + r.breath * pulse, angle = (family === "seed" ? 0.18 : family === "bloom" ? 0.1 : family === "moth" ? 0.035 : 0.055) * r.wave / 0.18 * secondary;
        return { family, scale, stretch: 1 / Math.sqrt(scale), pivot: family === "coral" ? 0.48 : 0, c: Math.cos(angle), sn: Math.sin(angle), lift: family === "coral" ? 0 : r.wave * 0.22 * secondary };
      }
      const closedFamily = (family) => family === "moth" || family === "torus" || family === "bloom";
      function motionState(s, t) {
        const authored = s.design?.motion?.rhythm || DEFAULT_RHYTHM, cached = motionCache.get(s);
        if (cached && cached.time === t && cached.body.family === (s.design?.family || "filament") && ["yaw", "pitch", "lean"].every((key) => cached.composition?.[key] === s.design?.composition?.[key]) && Object.keys(DEFAULT_RHYTHM).every((key) => cached.rhythm[key] === authored[key])) return cached;
        const rhythm = { ...authored }, raw = rhythm.rate * t, phase = raw + rhythm.asymmetry * Math.sin(raw);
        const extra = (rhythm.mode === "quasiperiodic" ? Math.SQRT2 : 3) * raw;
        const state = { time: t, rhythm, phase, pulse: Math.sin(phase), secondary: (Math.sin(2 * phase - rhythm.lag) + rhythm.overtone * Math.sin(extra)) / (1 + rhythm.overtone) };
        state.body = bodyTransform(s.design?.family || "filament", rhythm, state.pulse, state.secondary);
        const c = s.design?.composition;
        state.composition = c ? { ...c } : null;
        state.projection = c ? { cy: Math.cos(c.yaw), sy: Math.sin(c.yaw), cp: Math.cos(c.pitch), sp: Math.sin(c.pitch), lean: c.lean } : null;
        motionCache.set(s, state);
        return state;
      }
      function traveling(m, u, a = 0, closed = false) {
        const r = m.rhythm, winding = closed ? Math.round(r.waveNumber) : r.waveNumber;
        return (Math.sin(m.phase - TAU * winding * u - r.lag * (1 - Math.cos(a))) + r.overtone * Math.sin(2 * m.phase - TAU * winding * u - r.lag - a)) / (1 + r.overtone);
      }
      function livingPose(p, family, u, t, s, state) {
        const m = state || motionState(s, t), b = m.body.family === family ? m.body : bodyTransform(family, m.rhythm, m.pulse, m.secondary);
        const x = p.x * b.scale, y = (p.y - b.pivot) * b.stretch;
        return { x: x * b.c - y * b.sn, y: b.pivot + x * b.sn + y * b.c + b.lift };
      }
      function project(p, family) {
        if (family === "moth") return { x: p.x * 0.86, y: p.y * 0.85 };
        if (family === "torus" || family === "bloom") return { x: p.x * 1.05, y: p.y * 0.63 };
        if (family === "comet") return { x: p.x * 0.7 + p.y * 0.48, y: p.y * 0.7 };
        return { x: p.x * 0.82, y: p.y * 0.83 };
      }
      function strandPoint(family, u, k, total, t, s, state) {
        const v = 2 * u - 1, a = TAU * k / total, depth = s.maxDepth || 1, branch = s.branches || 0, m = state || motionState(s, t), r = m.rhythm;
        let x, y;
        switch (family) {
          case "jelly": {
            const contraction = 2 * r.breath * m.pulse;
            if (k === 0) {
              x = 0.43 * (2 * u - 1) * (1 - contraction);
              y = -0.06;
            } else if (k < total / 2) {
              const angle = Math.PI * u, layer = k / Math.max(1, total / 2 - 1), radius = 0.43 * (0.7 + 0.3 * layer);
              x = radius * Math.cos(angle) * (1 - contraction);
              y = -0.06 - (0.43 + 0.1 * contraction) * (0.8 + 0.2 * layer) * Math.sin(angle);
            } else {
              const root2 = 0.43 * Math.cos(a), lagged = traveling(m, u, a);
              x = root2 * (1 - contraction) + r.wave * 2 * u * u * lagged;
              y = -0.06 + 0.85 * u + 0.07 * r.breath * Math.sin(m.phase - r.lag * u) * u;
            }
            break;
          }
          case "moth": {
            const side = k % 2 ? 1 : -1, f = Math.floor(k / 2) / Math.max(1, total / 2), angle = TAU * u;
            const stroke = 0.78 + 0.22 * Math.cos(2 * m.phase), edge = Math.sin(angle), lagged = Math.sin(2 * m.phase - r.lag * (1 - Math.cos(angle)));
            x = side * (0.07 + (0.26 + 0.08 * f) * (1 - Math.cos(angle)) * (1 + 0.18 * edge)) * stroke;
            y = -0.02 + 0.36 * edge * (1 - 0.2 * Math.cos(angle)) + r.wave * 0.65 * (1 - Math.cos(angle)) * lagged;
            break;
          }
          case "coral": {
            const angle = -Math.PI + 0.3 + k / Math.max(1, total - 1) * (Math.PI - 0.6), reach = 0.65 + 0.1 * Math.sin(k * 2 + branch);
            x = reach * u * Math.cos(angle) + r.wave * 1.5 * u * u * traveling(m, u, a);
            y = 0.48 + reach * u * Math.sin(angle) - 0.16 * u * u + 0.3 * r.wave * u * u * m.secondary;
            break;
          }
          case "ribbon":
            x = 0.35 * Math.sin(v * (3 + depth * 0.1) + m.phase) + 0.12 * Math.cos(a + v * 3) + r.wave * traveling(m, u, a);
            y = 0.82 * v + 0.06 * Math.sin(a + v * 5) + 0.4 * r.wave * Math.sin(Math.PI * u) * m.secondary;
            break;
          case "nautilus": {
            const angle = u * TAU * (2 + 0.12 * (s.quoteDepth || 1)) + 0.12 * m.pulse, radius = 0.055 * Math.exp(Math.log(0.57 / 0.055) * u) + 0.018 * Math.cos(a);
            x = radius * Math.cos(angle) + r.wave * 0.35 * u * u * traveling(m, u, a);
            y = radius * Math.sin(angle) + 0.018 * Math.sin(a);
            break;
          }
          case "seed": {
            const envelope = Math.sqrt(Math.max(0, 1 - v * v)), goldenAngle = Math.PI * (3 - Math.sqrt(5)), azimuth = k * goldenAngle + v * 0.7;
            const radius = 0.34 * envelope * (1 + 0.1 * v), flutter = r.wave * envelope * Math.sin(m.phase - r.lag * (u + 0.3));
            x = radius * Math.cos(azimuth) + flutter;
            y = 0.72 * v + 0.025 * envelope * Math.sin(azimuth) + 0.35 * r.wave * envelope * m.secondary;
            break;
          }
          case "torus": {
            const angle = TAU * u, poloidal = 3 * angle + a - m.phase, minor = 0.085 * (1 + 0.35 * r.breath * Math.sin(2 * m.phase)), radius = 0.43 + minor * Math.cos(poloidal);
            x = radius * Math.cos(angle);
            y = 0.68 * radius * Math.sin(angle) + minor * Math.sin(poloidal) + r.wave * 0.25 * Math.sin(2 * angle + m.phase);
            break;
          }
          case "comet": {
            const taper = (1 - u) ** 2;
            x = -0.46 + 1.08 * u + 0.1 * taper * Math.cos(a);
            y = -0.24 + 0.6 * u + 0.24 * taper * Math.sin(a) + r.wave * 1.6 * u * u * traveling(m, u, a);
            break;
          }
          case "bloom": {
            const angle = TAU * u, petals = 5 + Math.min(branch, 4), opening = 1 + r.breath * 0.7 * Math.sin(m.phase - r.lag * (k / total));
            const radius = (0.18 + 0.018 * k) * (1 + 0.38 * Math.cos(petals * angle)) * opening;
            x = radius * Math.cos(angle) + r.wave * 0.25 * Math.sin(petals * angle) * m.secondary;
            y = radius * Math.sin(angle);
            break;
          }
          default: {
            const envelope = Math.sqrt(Math.max(0, 1 - v * v));
            x = 0.13 * Math.sin(4 * v + m.phase) + (0.11 + 0.07 * Math.sin(a)) * envelope * Math.cos(a + v * (2 + depth * 0.12) + 0.22 * m.secondary) + r.wave * 0.5 * envelope * traveling(m, u, a);
            y = 0.82 * v + 0.035 * envelope * Math.sin(a + v * 4);
          }
        }
        return livingPose({ x, y }, family, u, t, s, m);
      }
      function bodyPoint(family, u, a, t, s) {
        return strandPoint(family, u, a / TAU * 24, 24, t, s);
      }
      function anchor(n, t, s) {
        if (s.design?.anatomy) {
          const p = Anatomy2.anchor(assembly(s), n.id, t);
          return pose(p, p.z, s.design);
        }
        const u = n.u, v = 2 * u - 1, family = s.design?.family || "filament", m = motionState(s, t), r = m.rhythm;
        const peers = s.nodes.filter((x2) => !x2.parent && x2.level === n.level), index = Math.max(0, peers.findIndex((x2) => x2.id === n.id));
        const lane = peers.length > 1 ? (index / (peers.length - 1) - 0.5) * 2 : 0, depth = s.maxDepth || 1;
        let x, y;
        switch (family) {
          case "comet":
            x = -0.46 + 1.08 * u;
            y = -0.24 + 0.6 * u + 0.075 * lane * (1 - u) + r.wave * 1.6 * u * u * traveling(m, u);
            break;
          case "ribbon":
            x = 0.35 * Math.sin(v * (3 + depth * 0.1) + m.phase) + 0.085 * lane;
            y = 0.82 * v + 0.4 * r.wave * Math.sin(Math.PI * u) * m.secondary;
            break;
          case "nautilus": {
            const angle = u * TAU * (2 + 0.12 * (s.quoteDepth || 1)) + 0.12 * m.pulse, radius = 0.055 * Math.exp(Math.log(0.57 / 0.055) * u) + 0.025 * lane;
            x = radius * Math.cos(angle) + r.wave * 0.35 * u * u * traveling(m, u);
            y = radius * Math.sin(angle);
            break;
          }
          case "torus": {
            const angle = TAU * u, radius = 0.43 + 0.045 * lane;
            x = radius * Math.cos(angle);
            y = 0.68 * radius * Math.sin(angle) + r.wave * 0.25 * Math.sin(2 * angle + m.phase);
            break;
          }
          case "bloom": {
            const angle = TAU * u, radius = (0.23 + 0.095 * lane + 0.025 * Math.cos((5 + Math.min(s.branches, 4)) * angle)) * (1 + r.breath * 0.7 * Math.sin(m.phase - r.lag * u));
            x = radius * Math.cos(angle);
            y = radius * Math.sin(angle);
            break;
          }
          case "coral": {
            const angle = -Math.PI + 0.3 + (lane + 1) / 2 * (Math.PI - 0.6), reach = 0.2 + 0.55 * u;
            x = reach * Math.cos(angle) + r.wave * 1.5 * u * u * traveling(m, u, angle);
            y = 0.48 + reach * Math.sin(angle) - 0.16 * u * u + 0.3 * r.wave * u * u * m.secondary;
            break;
          }
          case "moth":
            x = 0.06 * lane;
            y = -0.36 + 0.72 * u;
            break;
          case "jelly":
            x = (0.13 + 0.05 * u) * lane * (1 - r.breath * m.pulse) + r.wave * 0.6 * u * u * traveling(m, u);
            y = -0.44 + 1.15 * u;
            break;
          case "seed": {
            const envelope = Math.sqrt(Math.max(0, 1 - v * v));
            x = 0.13 * lane * envelope + r.wave * envelope * Math.sin(m.phase - r.lag * (u + 0.3));
            y = 0.72 * v + 0.35 * r.wave * envelope * m.secondary;
            break;
          }
          default:
            x = 0.13 * Math.sin(4 * v + m.phase) + 0.07 * lane;
            y = 0.82 * v;
        }
        return pose(project(livingPose({ x, y }, family, u, t, s, m), family), s.design.surface.depth * 0.45 * Math.sin(u * TAU - m.phase), s.design, m.projection);
      }
      function pose(p, z, d, projection) {
        const c = projection || { cy: Math.cos(d.composition.yaw), sy: Math.sin(d.composition.yaw), cp: Math.cos(d.composition.pitch), sp: Math.sin(d.composition.pitch), lean: d.composition.lean }, x = p.x * c.cy + z * c.sy, depth = z * c.cy - p.x * c.sy, y = p.y * c.cp - depth * c.sp;
        return { x: x + c.lean * y, y, z: depth };
      }
      function ribbonCount(s) {
        return Math.min(36, s.design.surface.ribbons + Math.min(6, s.branches));
      }
      function surfacePoint(s, u, v, k, total, t, state) {
        const d = s.design, f = d.surface, family = d.family, a = TAU * k / total, epsilon = 3e-3, m = state || motionState(s, t), closed = closedFamily(family);
        const previous = closed ? (u - epsilon + 1) % 1 : Math.max(0, u - epsilon), next = closed ? (u + epsilon) % 1 : Math.min(1, u + epsilon);
        const center = project(strandPoint(family, u, k, total, t, s, m), family), before = project(strandPoint(family, previous, k, total, t, s, m), family), after = project(strandPoint(family, next, k, total, t, s, m), family);
        const tx = after.x - before.x, ty = after.y - before.y, len = Math.hypot(tx, ty) || 1, nx = -ty / len, ny = tx / len;
        const spatial = closed ? Math.sin(TAU * u) : u, psi = m.phase - f.phaseLag * spatial - m.rhythm.lag * spatial + 0.13 * Math.sin(a), folds = Math.min(9, f.folds + Math.floor(s.maxDepth / 5));
        const distance = closed ? Math.sin(Math.PI * (u - d.composition.focus)) : (u - d.composition.focus) / 0.3;
        const focus = Math.exp(-distance * distance * (closed ? 2 : 1));
        const envelope = closed ? (0.75 + 0.25 * Math.cos(TAU * (u - d.composition.focus))) ** f.taper : Math.max(0.025, Math.sin(Math.PI * u)) ** f.taper;
        const width = f.spread * envelope * (0.55 + 0.75 * focus) * (1 + f.asymmetry * Math.sin(a + 0.6)) * (1 + 0.055 * (Math.sin(psi) + 0.35 * Math.sin(2 * psi + 0.7)));
        const theta = 0.35 * a + f.twist * (closed ? Math.sin(TAU * u) : TAU * (u - 0.5)) + 0.48 * Math.sin(psi) + 0.24 * Math.sin(2 * psi + 0.4 * a + v * Math.PI) + m.rhythm.overtone * 0.18 * m.secondary;
        const ripple = 0.1 * width * Math.sin(folds * TAU * u - psi + a) * (closed ? 1 : Math.sin(Math.PI * u));
        const ct = Math.cos(theta), st = Math.sin(theta), lateral = v * width * ct + ripple;
        const depthPhase = family === "jelly" ? 4 * center.x : u * TAU, depthEnvelope = family === "jelly" ? k === 0 ? 0 : Math.sin(Math.PI * u) : envelope;
        const z = f.depth * 0.45 * Math.sin(depthPhase - m.phase) + v * width * st + f.depth * 0.14 * Math.sin(folds * TAU * u - psi + a) * depthEnvelope;
        const raw = { x: center.x + nx * lateral + f.asymmetry * 0.07 * (closed ? 1 : Math.sin(Math.PI * u)) * focus, y: center.y + ny * lateral };
        const result = pose(raw, z, d, m.projection), angleDerivative = 0.24 * Math.PI * Math.cos(2 * psi + 0.4 * a + v * Math.PI);
        const dl = width * (ct - v * st * angleDerivative), dz = width * (st + v * ct * angleDerivative), derivative = pose({ x: nx * dl, y: ny * dl }, dz, d, m.projection);
        const compression = Math.max(0, Math.min(1, 1 - Math.hypot(derivative.x, derivative.y) / Math.max(0.01, width * 1.4)));
        const depth = Math.max(0, Math.min(1, 0.5 + result.z / (2 * (f.depth + f.spread))));
        result.alpha = d.light.recessAlpha + (d.light.crestAlpha - d.light.recessAlpha) * compression ** 0.9 * (0.28 + 0.72 * focus) * (1 - d.light.depthContrast + d.light.depthContrast * depth);
        return result;
      }
      const fitCache = /* @__PURE__ */ new WeakMap();
      function portraitFrame(s) {
        if (s.design?.anatomy) {
          const f = Anatomy2.portraitFrame(assembly(s));
          return { ...f, width: f.width * 1.5, height: f.height * 1.5 };
        }
        if (fitCache.has(s)) return fitCache.get(s);
        const total = ribbonCount(s);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const include = (p) => {
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        };
        const rhythm = s.design.motion.rhythm || DEFAULT_RHYTHM, phases = Array.from({ length: 16 }, (_, i) => TAU * i / (16 * rhythm.rate));
        for (const t of phases) {
          const m = motionState(s, t);
          for (let k = 0; k < total; k++) for (let i = 0; i <= 48; i++) for (const v of [-1, 0, 1]) include(surfacePoint(s, i / 48, v, k, total, t, m));
        }
        for (const t of phases) for (const n of s.nodes) {
          const p = anchor(n, t, s), r = Math.min(0.16, s.design.organ.baseRadius + s.design.organ.degreeGain * (n.indegree + n.outdegree) + s.design.organ.literalGain * 6) * (1 + s.design.organ.amplitudes[0] + s.design.organ.amplitudes[1]);
          include({ x: p.x - r, y: p.y - r });
          include({ x: p.x + r, y: p.y + r });
        }
        const padding = 0.035 + 0.3 * rhythm.wave + 0.1 * rhythm.breath + 0.025 * rhythm.overtone;
        const result = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, width: (maxX - minX + 2 * padding) * 1.08, height: (maxY - minY + 2 * padding) * 1.08 };
        fitCache.set(s, result);
        return result;
      }
      const ownerCache = /* @__PURE__ */ new WeakMap();
      function surfaceFrame(s, t, thumb = false) {
        if (s.design?.anatomy) {
          const f = Anatomy2.frame(assembly(s), t, { budget: thumb ? Math.min(4200, s.design.surface.samples) : s.design.surface.samples, crests: Math.min(4, s.design.surface.crests) });
          for (let i = 0; i < f.points.length; i += 4) {
            const p = pose({ x: f.points[i], y: f.points[i + 1] }, f.points[i + 2], s.design);
            f.points[i] = p.x;
            f.points[i + 1] = p.y;
            f.points[i + 2] = p.z;
          }
          for (const ridge of f.ridges) ridge.line = ridge.line.map((p) => ({ ...p, ...pose(p, p.z, s.design), alpha: 0.18 }));
          return f;
        }
        const m = motionState(s, t), total = ribbonCount(s), budget = thumb ? Math.min(4200, s.design.surface.samples) : s.design.surface.samples, columns = 4, rows = Math.max(12, Math.floor(budget / (total * columns))), points = new Float32Array(total * rows * columns * 4);
        let cursor = 0;
        const compiled = Chroma2.compile(s);
        let cached = ownerCache.get(s);
        if (!cached || cached.field !== compiled) {
          cached = { field: compiled };
          ownerCache.set(s, cached);
        }
        const key = String(thumb), count = points.length / 4, rebuild = !cached[key] || cached[key].total !== total || cached[key].rows !== rows;
        const owners = rebuild ? new Uint16Array(count) : cached[key].owners;
        for (let k = 0; k < total; k++) for (let j = 0; j < columns; j++) for (let i = 0; i < rows; i++) {
          const u = (i + 0.5 + ((k * 0.618 + j * 0.381) % 1 - 0.5) * 0.75) / rows, v = Math.cos(Math.PI * (j + 0.5) / columns), p = surfacePoint(s, u, v, k, total, t, m);
          if (rebuild) owners[cursor / 4] = compiled.owner(u, v, k, total);
          points[cursor++] = p.x;
          points[cursor++] = p.y;
          points[cursor++] = p.z;
          points[cursor++] = p.alpha;
        }
        const ridges = [];
        for (let j = 0; j < s.design.surface.crests; j++) {
          const k = Math.floor(j * total / s.design.surface.crests), a = TAU * k / total, line = [];
          for (let i = 0; i <= 300; i++) {
            const u = i / 300, spatial = closedFamily(s.design.family) ? Math.sin(TAU * u) : u, v = 0.92 * Math.cos(m.phase - s.design.surface.phaseLag * spatial + a * 0.5);
            const p = surfacePoint(s, u, v, k, total, t, m);
            p.owner = compiled.owner(u, v, k, total);
            line.push(p);
          }
          ridges.push({ line, primary: true });
        }
        if (rebuild) cached[key] = { owners, total, rows };
        return { points, ridges, owners };
      }
      function advancePhase(phase, rate, seconds, moving = true) {
        return moving ? phase + rate * 24 * Math.max(0, Math.min(0.1, seconds)) : phase;
      }
      function framingExtent(s) {
        const d = s.design, nodeMap = new Map(s.nodes.map((n) => [n.id, n]));
        let extent = 1;
        for (const e of s.links) {
          const f = 1 + e.port + nodeMap.get(e.from).frequency;
          extent = Math.max(extent, 0.75 + d.filament.bend * (1 + d.filament.frequencyGain * f) * (1 + d.filament.ripple));
        }
        for (const n of s.nodes) {
          const value = n.params?.value, magnitude = typeof value === "number" ? Math.min(6, Math.abs(value)) : Array.isArray(value) ? Math.min(6, value.length) : 1, r = Math.min(0.16, d.organ.baseRadius + d.organ.degreeGain * (n.indegree + n.outdegree) + d.organ.literalGain * magnitude);
          extent = Math.max(extent, 0.75 + r * (1 + d.organ.amplitudes[0] + d.organ.amplitudes[1]));
        }
        return extent;
      }
      const api = { motionState, bodyPoint, strandPoint, project, anchor, advancePhase, framingExtent, pose, surfacePoint, surfaceFrame, portraitFrame, ribbonCount };
      if (typeof module !== "undefined") module.exports = api;
      root.Morphology = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// core.js
var require_core = __commonJS({
  "core.js"(exports, module) {
    (function(root) {
      "use strict";
      const O2 = typeof module !== "undefined" ? require_orbit() : root.Orbit;
      const K2 = typeof module !== "undefined" ? require_kernels() : root.QuinelingKernels;
      const Design = typeof module !== "undefined" ? require_qdl() : root.QDL;
      const Morph = typeof module !== "undefined" ? require_morphology() : root.Morphology;
      const clone = O2.clone, canon = O2.canon, TAU = 2 * Math.PI;
      const OPS = ["Observe", "Box", "Permit", "Apply", "Score", "Authorize", "Execute", "Quote", "Decode", "Report", ...Object.keys(K2.ARITY)];
      function hslHex(h, s, l) {
        const a = s * Math.min(l, 1 - l);
        const f = (n) => {
          const k = (n + h / 30) % 12;
          return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0");
        };
        return "#" + f(0) + f(8) + f(4);
      }
      const ROLE_HUE = { literal: 190, compare: 43, choose: 46, consensus: 39, evidence: 51, action: 16, retry: 220, report: 133 };
      const COLORS = ["#72d9e2", "#bb91ed", "#e6c66a", "#6ad4a0", "#eb90ba", "#efaa73", "#b5e681", "#899be8", "#77bce9", "#d6e6be", ...Object.keys(K2.ARITY).map((op, i) => hslHex((ROLE_HUE[op] ?? 158) + i % 5 * 2, 0.37 + 8e-3 * i, 0.64 + 3e-3 * i))];
      function instructionColor(op) {
        const i = OPS.indexOf(op);
        if (i < 0) throw Error("Unknown instruction");
        return COLORS[i];
      }
      function instructionFromColor(hex) {
        const i = COLORS.indexOf(String(hex).toLowerCase());
        if (i < 0) throw Error("Unknown instruction color");
        return OPS[i];
      }
      function makeProgram(confidence = 0.82, allowed = true, threshold = 0.7, repeats = 1, reflection = true) {
        if (!Number.isInteger(repeats) || repeats < 1 || repeats > 8) throw Error("Repeat count must be 1\u20138");
        const graph = O2.plan(confidence, allowed, threshold);
        if (!reflection) {
          graph.edges = graph.edges.filter((e) => e.id !== "restore");
          graph.wires = graph.wires.filter((w) => w.id !== "restored");
        }
        O2.validate(graph);
        const constructor = ["emit", ["makeApply", ["makeRun", ["makeQuote", ["var", "x"]]], ["makeQuote", ["var", "x"]]]];
        const body = ["lambda", "x", ["seq", ["repeat", repeats, ["plan", ["quote", graph]]], constructor]];
        return ["apply", ["run", ["quote", body]], ["quote", clone(body)]];
      }
      function makeTaskProgram(graph, repeats = 1, design = Design.create()) {
        K2.validate(graph);
        if (!Number.isInteger(repeats) || repeats < 1 || repeats > 8) throw Error("Repeat count must be 1\u20138");
        Design.validateBindings(design, graph);
        graph = clone(graph);
        graph.design = clone(design);
        const constructor = ["emit", ["makeApply", ["makeRun", ["makeQuote", ["var", "x"]]], ["makeQuote", ["var", "x"]]]];
        const body = ["lambda", "x", ["seq", ["repeat", repeats, ["task", ["quote", clone(graph)]]], constructor]];
        const program = ["apply", ["run", ["quote", body]], ["quote", clone(body)]];
        if (new TextEncoder().encode(canon(program)).length > 65536) throw Error("Complete quine source exceeds 64 KiB");
        return program;
      }
      function execute(program) {
        let fuel = 2e4;
        const emitted = [], plans = [], tasks = [], trace = [];
        function ev(t, env) {
          if (--fuel < 0) throw Error("Execution fuel exhausted");
          if (!Array.isArray(t)) throw Error("Expected expression");
          const [op, ...a] = t;
          const arity = { lambda: 2, var: 1, quote: 1, run: 1, apply: 2, emit: 1, makeQuote: 1, makeRun: 1, makeApply: 2, seq: 2, plan: 1, task: 1, repeat: 2 };
          if (!Object.hasOwn(arity, op) || a.length !== arity[op]) throw Error("Invalid expression operation or arity");
          trace.push({ kind: "term", op });
          switch (op) {
            case "lambda":
              if (typeof a[0] !== "string") throw Error("Invalid binder");
              return { closure: true, param: a[0], body: a[1], env };
            case "var":
              if (!Object.hasOwn(env, a[0])) throw Error("Unbound variable");
              return env[a[0]];
            case "quote":
              return clone(a[0]);
            case "run":
              return ev(ev(a[0], env), /* @__PURE__ */ Object.create(null));
            case "apply": {
              const f = ev(a[0], env), x = ev(a[1], env);
              if (!f?.closure) throw Error("Expected closure");
              return ev(f.body, { ...f.env, [f.param]: x });
            }
            case "seq":
              ev(a[0], env);
              return ev(a[1], env);
            case "repeat": {
              if (!Number.isInteger(a[0]) || a[0] < 1 || a[0] > 8) throw Error("Repeat budget exceeded");
              let v;
              for (let i = 0; i < a[0]; i++) {
                trace.push({ kind: "loop", op: "repeat", iteration: i + 1, total: a[0] });
                v = ev(a[1], env);
              }
              return v;
            }
            case "plan": {
              const graph = ev(a[0], env), m = new O2.Machine(graph);
              m.run();
              plans.push({ graph: clone(graph), report: m.output(), effects: m.effects, trace: m.trace });
              trace.push(...m.trace.map((e) => ({ kind: "graph", ...e })));
              return m.output();
            }
            case "task": {
              const graph = ev(a[0], env);
              if (graph?.design) Design.validateBindings(graph.design, graph);
              const record = K2.run(graph);
              tasks.push(record);
              trace.push(...record.trace.map((e) => ({ kind: "graph", ...e })));
              return record.output;
            }
            case "emit": {
              const v = ev(a[0], env);
              if (!Array.isArray(v)) throw Error("Emit expects a program");
              emitted.push(canon(v));
              return v;
            }
            case "makeQuote":
              return ["quote", clone(ev(a[0], env))];
            case "makeRun":
              return ["run", clone(ev(a[0], env))];
            case "makeApply":
              return ["apply", clone(ev(a[0], env)), clone(ev(a[1], env))];
          }
        }
        const result = ev(program, /* @__PURE__ */ Object.create(null));
        return { result, emitted, plans, tasks, trace, steps: 2e4 - fuel + tasks.reduce((s, t) => s + t.trace.length, 0) };
      }
      function checksum(bytes) {
        let h = 2166136261;
        for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
        return h;
      }
      function encode(program) {
        const data = new TextEncoder().encode(canon(program));
        if (data.length > 65536) throw Error("Genome exceeds 64 KiB");
        const bytes = new Uint8Array(12 + data.length);
        bytes.set([81, 76, 78, 71]);
        const view = new DataView(bytes.buffer);
        view.setUint32(4, data.length);
        bytes.set(data, 8);
        view.setUint32(8 + data.length, checksum(data));
        const bands = [];
        for (let i = 0; i < bytes.length; i += 32) {
          const a = Array(32).fill(0);
          bytes.slice(i, i + 32).forEach((b, j) => a[j] = b + 1);
          bands.push(a);
        }
        return { format: "quineling-harmonics-1", bands };
      }
      function validateGenome(g) {
        if (!g || g.format !== "quineling-harmonics-1" || !Array.isArray(g.bands) || g.bands.length < 1 || g.bands.length > 2049) throw Error("Invalid harmonic genome");
        for (const a of g.bands) if (!Array.isArray(a) || a.length !== 32 || a.some((x) => !Number.isInteger(x) || x < 0 || x > 256)) throw Error("Invalid harmonic coefficient");
      }
      function decode(g) {
        validateGenome(g);
        const values = g.bands.flat();
        if (values.slice(0, 8).some((x) => x === 0)) throw Error("Missing header");
        const bytes = Uint8Array.from(values, (x) => Math.max(0, x - 1));
        if (bytes.slice(0, 4).join(",") !== "81,76,78,71") throw Error("Invalid genome magic");
        const v = new DataView(bytes.buffer), n = v.getUint32(4);
        if (n > 65536 || n + 12 > bytes.length || g.bands.length !== Math.ceil((n + 12) / 32)) throw Error("Invalid genome length");
        if (values.slice(0, n + 12).some((x) => x === 0) || values.slice(n + 12).some((x) => x !== 0)) throw Error("Invalid padding");
        const data = bytes.slice(8, 8 + n);
        if (checksum(data) !== v.getUint32(8 + n)) throw Error("Genome checksum mismatch");
        const text = new TextDecoder("utf-8", { fatal: true }).decode(data), program = JSON.parse(text);
        if (canon(program) !== text) throw Error("Noncanonical source");
        return program;
      }
      function encodeColors(program) {
        const g = encode(program);
        return { format: "quineling-chroma-1", pixels: g.bands.map((a) => a.map((c) => {
          if (c === 0) return null;
          const b = c - 1;
          return [b, 255 - b, (73 * b + 19) % 256];
        })) };
      }
      function decodeColors(g) {
        if (!g || g.format !== "quineling-chroma-1" || !Array.isArray(g.pixels) || g.pixels.length < 1 || g.pixels.length > 2049) throw Error("Invalid color genome");
        const bands = g.pixels.map((row) => {
          if (!Array.isArray(row) || row.length !== 32) throw Error("Need 32 colors per band");
          return row.map((rgb) => {
            if (rgb === null) return 0;
            if (!Array.isArray(rgb) || rgb.length !== 3 || rgb.some((x) => !Number.isInteger(x) || x < 0 || x > 255) || rgb[1] !== 255 - rgb[0] || rgb[2] !== (73 * rgb[0] + 19) % 256) throw Error("Color is outside the exact byte palette");
            return rgb[0] + 1;
          });
        });
        return decode({ format: "quineling-harmonics-1", bands });
      }
      function wave(coefficients, theta) {
        return coefficients.reduce((sum, a, k) => sum + a * Math.cos((k + 1) * theta), 0);
      }
      function samples(g) {
        validateGenome(g);
        return g.bands.map((a) => Array.from({ length: 65 }, (_, j) => wave(a, TAU * j / 65)));
      }
      function fromSamples(records) {
        if (!Array.isArray(records) || records.length < 1 || records.length > 2049) throw Error("Invalid sampled genome");
        const bands = records.map((row) => {
          if (!Array.isArray(row) || row.length !== 65 || row.some((x) => !Number.isFinite(x))) throw Error("Need 65 finite equally spaced samples per band");
          const a = Array.from({ length: 32 }, (_, k) => 2 / 65 * row.reduce((s, v, j) => s + v * Math.cos((k + 1) * TAU * j / 65), 0));
          if (a.some((x) => Math.abs(x - Math.round(x)) > 1e-6 || x < -1e-6 || x > 256.000001)) throw Error("Samples do not encode integer coefficients");
          const ints = a.map((x) => Math.round(x) || 0);
          if (row.some((v, j) => Math.abs(v - wave(ints, TAU * j / 65)) > 1e-5)) throw Error("Samples contain an unsupported harmonic");
          return ints;
        });
        const g = { format: "quineling-harmonics-1", bands };
        decode(g);
        return g;
      }
      function describe(program) {
        let graph = null, repeats = 1, quoteDepth = 0;
        function visit(t, depth2 = 0) {
          if (!Array.isArray(t)) return;
          if (t[0] === "quote") quoteDepth = Math.max(quoteDepth, depth2 + 1);
          if (t[0] === "repeat" && Number.isInteger(t[1])) repeats = t[1];
          if (t[0] === "plan" && t[1]?.[0] === "quote" && !graph) graph = clone(t[1][1]);
          for (const x of t.slice(1)) visit(x, depth2 + (t[0] === "quote" ? 1 : 0));
        }
        function visitTask(t, depth2 = 0) {
          if (!Array.isArray(t)) return;
          if (t[0] === "quote") quoteDepth = Math.max(quoteDepth, depth2 + 1);
          if (t[0] === "repeat" && Number.isInteger(t[1])) repeats = t[1];
          if (t[0] === "task" && t[1]?.[0] === "quote" && !graph) graph = clone(t[1][1]);
          for (const x of t.slice(1)) visitTask(x, depth2 + (t[0] === "quote" ? 1 : 0));
        }
        visit(program);
        if (!graph) visitTask(program);
        if (!graph) throw Error("No quoted thought graph");
        const isTask = Array.isArray(graph.nodes);
        if (isTask) K2.validate(graph);
        else O2.validate(graph);
        const nodes = [], links = [];
        function project(g, scope, parent) {
          const producers = /* @__PURE__ */ new Map();
          g.edges.forEach((e) => e.outputs.forEach((w) => producers.set(w, scope + e.id)));
          for (const e of g.edges) {
            const id = scope + e.id;
            nodes.push({ id, op: e.op, parent, inputs: e.inputs.length, outputs: e.outputs.length, params: e });
            for (let port = 0; port < e.inputs.length; port++) {
              const from = producers.get(e.inputs[port]);
              if (from) links.push({ from, to: id, port, type: g.wires.find((w) => w.id === e.inputs[port]).type });
            }
            if (e.op === "Box") project(e.graph, id + "/", id);
          }
        }
        if (isTask) {
          for (const n of graph.nodes) {
            nodes.push({ id: n.id, op: n.op, parent: null, inputs: n.inputs.length, outputs: 1, params: n.params });
            n.inputs.forEach((id, port) => links.push({ from: id, to: n.id, port, type: "Data" }));
          }
        } else project(graph, "", null);
        const top = nodes.filter((n) => !n.parent), depths = /* @__PURE__ */ new Map();
        function depth(id, path = /* @__PURE__ */ new Set()) {
          if (depths.has(id)) return depths.get(id);
          if (path.has(id)) throw Error("Unbounded cycle");
          const next = new Set(path).add(id), inputs = links.filter((e) => e.to === id);
          const d = inputs.length ? 1 + Math.max(...inputs.map((e) => depth(e.from, next))) : 0;
          depths.set(id, d);
          return d;
        }
        top.forEach((n) => depth(n.id));
        const max = Math.max(...depths.values(), 1);
        nodes.forEach((n, i) => {
          n.outdegree = links.filter((e) => e.from === n.id).length;
          n.indegree = links.filter((e) => e.to === n.id).length;
          n.frequency = OPS.indexOf(n.op) + 1;
          n.level = n.parent ? depths.get(n.parent) || 0 : depths.get(n.id);
          n.u = (n.level + 0.5) / (max + 1);
          n.side = (i % 2 * 2 - 1) * (n.op === "Permit" ? 0.62 : n.op === "Box" ? 0.42 : 0.24);
        });
        const design = isTask ? graph.design || Design.create() : Design.create();
        Design.validateBindings(design, graph);
        const branches = top.reduce((s, n) => s + Math.max(0, n.outdegree - 1), 0);
        return { graph, nodes, links, repeats, quoteDepth, branches, strandCount: Math.min(22, 12 + Math.floor(branches / 2)), maxDepth: max, design };
      }
      function nodePosition(n, t, shape) {
        if (n.parent) {
          const p = nodePosition(shape.nodes.find((x) => x.id === n.parent), t, shape);
          const phase = Morph.motionState(shape, t).phase;
          return { x: p.x + 0.015 * Math.sin(phase + n.frequency), y: p.y + 0.016 * Math.cos(phase + n.frequency) };
        }
        return Morph.anchor(n, t, shape);
      }
      function edgePoint(link, s, t, shape) {
        const a = nodePosition(shape.nodes.find((n) => n.id === link.from), t, shape), b = nodePosition(shape.nodes.find((n) => n.id === link.to), t, shape);
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        const f = 1 + link.port + shape.nodes.find((n) => n.id === link.from).frequency;
        const bend = Design.filamentBend(shape.design || Design.DEFAULT, f, s, Morph.motionState(shape, t).phase);
        return { x: a.x + dx * s - dy / len * bend, y: a.y + dy * s + dx / len * bend };
      }
      const api = { canon, makeProgram, makeTaskProgram, runTask: K2.run, validateTask: K2.validate, execute, encode, decode, encodeColors, decodeColors, instructionColor, instructionFromColor, wave, samples, fromSamples, describe, nodePosition, edgePoint, OPS, COLORS, TAU };
      if (typeof module !== "undefined") module.exports = api;
      root.Quinelings = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// thought.js
var require_thought = __commonJS({
  "thought.js"(exports, module) {
    (function(root) {
      "use strict";
      const K2 = typeof module !== "undefined" ? require_kernels() : root.QuinelingKernels;
      const Q2 = typeof module !== "undefined" ? require_core() : root.Quinelings;
      const canon = Q2.canon, clone = (x) => JSON.parse(JSON.stringify(x));
      const UNKNOWN = Symbol("unevaluated simulation"), badKeys = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
      const capabilities2 = Object.freeze(Object.keys(K2.ARITY).filter((x) => x !== "literal"));
      const schema = "design/intent.schema.json", B = { kind: "boolean" }, S = { kind: "string" }, Z = { kind: "null" };
      const num = (unit2 = "one") => ({ kind: "number", unit: unit2 }), arr = (element) => ({ kind: "array", element }), rec = (fields2) => ({ kind: "record", fields: fields2 }), opt = (element) => ({ kind: "optional", element });
      function fail(code, path, message) {
        const e = new Error(message);
        e.code = code;
        e.path = path;
        throw e;
      }
      function check2(ok, code, path, message) {
        if (!ok) fail(code, path, message);
      }
      function own(x, k) {
        return Object.hasOwn(x, k);
      }
      function object(x) {
        return x !== null && typeof x === "object" && !Array.isArray(x);
      }
      function closed(x, required, optional, path) {
        check2(object(x), "schema", path, "Expected an object");
        for (const k of required) check2(own(x, k), "missing", path + "." + k, "Missing " + k);
        for (const k of Object.keys(x)) check2(required.includes(k) || optional.includes(k), "unknown-field", path + "." + k, "Unknown field " + k);
      }
      function finiteJSON(x, path = "$", depth = 0, seen = /* @__PURE__ */ new Set()) {
        check2(depth <= 24, "budget", path, "JSON nesting exceeds 24");
        if (x === null || typeof x === "boolean") return;
        if (typeof x === "number") {
          check2(Number.isFinite(x), "finite", path, "Expected a finite number");
          return;
        }
        if (typeof x === "string") {
          check2(x.length <= 16384, "budget", path, "String exceeds 16384 characters");
          return;
        }
        check2(x && typeof x === "object", "json", path, "Expected finite JSON, without undefined/functions");
        check2(!seen.has(x), "json", path, "Cyclic input");
        check2(Array.isArray(x) || Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null, "json", path, "Expected a plain JSON object");
        const next = new Set(seen).add(x), keys = Object.keys(x);
        check2(keys.length <= 512, "budget", path, "Collection exceeds 512 entries");
        if (Array.isArray(x)) {
          check2(x.length <= 512 && keys.length === x.length && keys.every((k, i) => k === String(i)), "json", path, "Expected a dense bounded JSON array");
        }
        check2(Reflect.ownKeys(x).length === keys.length + (Array.isArray(x) ? 1 : 0), "json", path, "Hidden or symbol properties are not JSON");
        check2(keys.every((k) => own(Object.getOwnPropertyDescriptor(x, k), "value")), "json", path, "Accessor properties are not JSON");
        for (const k of keys) {
          check2(!badKeys.has(k), "unsafe-key", path + "." + k, "Unsafe property name");
          finiteJSON(x[k], path + "." + k, depth + 1, next);
        }
      }
      function unit(u, path) {
        check2(typeof u === "string" && u.length <= 64 && /^(one|[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)(\*[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)*$/.test(u), "unit", path, "Expected a symbolic unit such as one, L or L^2");
        const powers = {};
        for (const term of u.split("*")) {
          const [base, e] = term.split("^");
          if (base !== "one") powers[base] = (powers[base] || 0) + (e === void 0 ? 1 : Number(e));
        }
        check2(Object.values(powers).every((e) => Math.abs(e) <= 99), "unit", path, "Unit exponent exceeds 99");
        const result = Object.keys(powers).sort().filter((k) => powers[k]).map((k) => k + (powers[k] === 1 ? "" : "^" + powers[k])).join("*") || "one";
        check2(result.length <= 64, "unit", path, "Unit expression too large");
        return result;
      }
      function type(t, path) {
        check2(object(t) && typeof t.kind === "string", "type", path, "Expected a type");
        switch (t.kind) {
          case "number":
            closed(t, ["kind", "unit"], [], path);
            return num(unit(t.unit, path + ".unit"));
          case "boolean":
          case "string":
          case "null":
            closed(t, ["kind"], [], path);
            return { kind: t.kind };
          case "array":
          case "optional":
            closed(t, ["kind", "element"], [], path);
            return { kind: t.kind, element: type(t.element, path + ".element") };
          case "record": {
            closed(t, ["kind", "fields"], [], path);
            check2(object(t.fields), "type", path, "Expected record fields");
            const fields2 = {};
            for (const [k, v] of Object.entries(t.fields)) {
              check2(k.length > 0 && !k.includes(".") && !badKeys.has(k), "type", path, "Invalid record field " + k);
              fields2[k] = type(v, path + ".fields." + k);
            }
            return rec(fields2);
          }
          default:
            fail("type", path, "Unknown type " + t.kind);
        }
      }
      function equal(a, b) {
        return canon(a) === canon(b);
      }
      function merge(a, b, path) {
        if (equal(a, b)) return a;
        if (a.kind === "null") return b.kind === "optional" ? b : opt(b);
        if (b.kind === "null") return a.kind === "optional" ? a : opt(a);
        if (a.kind === "optional" && equal(a.element, b)) return a;
        if (b.kind === "optional" && equal(b.element, a)) return b;
        fail("type", path, "Incompatible value types or units");
      }
      function matches(v, t, path) {
        if (t.kind === "optional") {
          if (v !== null) matches(v, t.element, path);
          return;
        }
        if (t.kind === "number") {
          check2(typeof v === "number" && Number.isFinite(v), "type", path, "Expected a finite number");
          return;
        }
        if (t.kind === "null") {
          check2(v === null, "type", path, "Expected null");
          return;
        }
        if (t.kind === "boolean" || t.kind === "string") {
          check2(typeof v === t.kind, "type", path, "Expected " + t.kind);
          return;
        }
        if (t.kind === "array") {
          check2(Array.isArray(v), "type", path, "Expected an array");
          v.forEach((x, i) => matches(x, t.element, path + "." + i));
          return;
        }
        check2(object(v), "type", path, "Expected a record");
        check2(equal(Object.keys(v).sort(), Object.keys(t.fields).sort()), "type", path, "Record fields must exactly match the declared type");
        for (const [k, ft] of Object.entries(t.fields)) matches(v[k], ft, path + "." + k);
      }
      function inferType(value, quantityUnit = "one") {
        finiteJSON(value);
        const u = unit(quantityUnit, "unit");
        function infer(v) {
          if (v === null) return Z;
          if (typeof v === "number") return num(u);
          if (typeof v === "boolean") return B;
          if (typeof v === "string") return S;
          if (Array.isArray(v)) {
            return arr(v.length ? v.map(infer).reduce((a, b) => merge(a, b, "value")) : num(u));
          }
          const fields2 = {};
          for (const [k, x] of Object.entries(v)) {
            check2(!k.includes(".") && k.length > 0, "type", "value", "Record field names cannot contain dots");
            fields2[k] = infer(x);
          }
          return rec(fields2);
        }
        return clone(infer(value));
      }
      function at(t, path, where) {
        check2(typeof path === "string" && path.length > 0, "path", where, "Expected a nonempty field path");
        for (const k of path.split(".")) {
          check2(k && !badKeys.has(k) && t.kind === "record" && own(t.fields, k), "path", where, "Unknown or optional record path " + path);
          t = t.fields[k];
        }
        return t;
      }
      function kind(t, k, path) {
        check2(t && t.kind === k, "type", path, "Expected " + k + " input");
        return t;
      }
      function numeric(t, path) {
        return kind(t, "number", path);
      }
      function same(a, b, path) {
        check2(equal(a, b), "unit-type", path, "Input types and units must agree");
      }
      const comparison = ["eq", "ne", "gt", "gte", "lt", "lte"];
      function parameters(n, ts, path) {
        const p = n.params, required = { map: ["kind"], filter: ["operator", "value"], compare: ["operator", "value"], get: ["path"], clamp: ["min", "max"], action: ["allowed", "action"], report: ["labels"], bfs: ["start", "goal"], consensus: ["required"], retry: ["maxAttempts"] }[n.op] || [];
        const optional = { map: ["factor"], sort: ["key", "descending"], dedupe: ["key"], filter: ["key"], evidence: ["claim"] }[n.op] || [];
        closed(p, required, optional, path + ".params");
        if (["sort", "dedupe", "filter"].includes(n.op) && own(p, "key")) check2(typeof p.key === "string" && p.key.length > 0, "parameter", path, "Field key must be nonempty");
        if (n.op === "sort" && own(p, "descending")) check2(typeof p.descending === "boolean", "parameter", path, "descending must be Boolean");
        if (["compare", "filter"].includes(n.op)) check2(comparison.includes(p.operator), "parameter", path, "Unknown comparison");
        if (n.op === "map") {
          check2(["square", "multiply"].includes(p.kind), "parameter", path, "Unknown map kind");
          check2(p.kind === "multiply" ? typeof p.factor === "number" && Number.isFinite(p.factor) : !own(p, "factor"), "parameter", path, "multiply requires a finite factor; square has no factor");
        }
        if (n.op === "clamp") check2(typeof p.min === "number" && typeof p.max === "number" && p.min <= p.max, "parameter", path, "Expected ordered numeric clamp bounds");
        if (n.op === "action") check2(typeof p.allowed === "boolean" && typeof p.action === "string" && p.action.length > 0 && p.action.length <= 120, "parameter", path, "Simulation action needs an explicit allowed Boolean and action name");
        if (n.op === "report") check2(Array.isArray(p.labels) && p.labels.length === ts.length && new Set(p.labels).size === p.labels.length && p.labels.every((x) => typeof x === "string" && x.length > 0 && !x.includes(".") && !badKeys.has(x)), "parameter", path, "Report labels must be unique safe names matching ports");
        if (n.op === "bfs") check2(typeof p.start === "string" && typeof p.goal === "string", "parameter", path, "Route endpoints must be strings");
        if (n.op === "consensus") check2(Number.isSafeInteger(p.required) && p.required > 0, "parameter", path, "Consensus threshold must be a positive safe integer");
        if (n.op === "retry") check2(Number.isInteger(p.maxAttempts) && p.maxAttempts >= 1 && p.maxAttempts <= 8, "parameter", path, "Retry bound must be 1\u20138");
        if (n.op === "evidence" && own(p, "claim")) check2(typeof p.claim === "string", "parameter", path, "Evidence claim must be a string");
      }
      function inferStep(n, ts, path) {
        parameters(n, ts, path);
        const p = n.params, a = ts[0], b = ts[1];
        function element() {
          return kind(a, "array", path).element;
        }
        function field(t, k) {
          check2(t.kind === "record" && own(t.fields, k), "type", path, "Missing record field " + k);
          return t.fields[k];
        }
        function compareType(t) {
          matches(p.value, t, path + ".params.value");
          if (!["eq", "ne"].includes(p.operator)) check2(["number", "string"].includes(t.kind), "type", path, "Ordered comparison requires numbers or strings");
        }
        switch (n.op) {
          case "sum":
          case "mean":
          case "min":
          case "max":
            return numeric(element(), path);
          case "weightedMean": {
            const e = numeric(element(), path), w = numeric(kind(b, "array", path).element, path);
            same(w, num(), path);
            return e;
          }
          case "length":
            check2(a.kind === "array" || a.kind === "string", "type", path, "length needs an array or string");
            return num("count");
          case "map": {
            const e = numeric(element(), path);
            return arr(num(p.kind === "square" ? unit(e.unit + "*" + e.unit, path) : e.unit));
          }
          case "sort": {
            const e = element(), t = p.key ? at(e, p.key, path) : e;
            check2(["number", "string"].includes(t.kind), "type", path, "Sort requires scalar comparable keys");
            return a;
          }
          case "dedupe": {
            const e = element();
            if (p.key) at(e, p.key, path);
            return a;
          }
          case "filter": {
            const e = element();
            compareType(p.key ? at(e, p.key, path) : e);
            return a;
          }
          case "compare":
            compareType(a);
            return B;
          case "choose":
            kind(a, "boolean", path);
            return merge(b, ts[2], path);
          case "get":
            return at(a, p.path, path);
          case "clamp":
            return numeric(a, path);
          case "budget":
            numeric(a, path);
            same(a, b, path);
            return rec({ allocated: a, remaining: a });
          case "action":
            kind(a, "boolean", path);
            return rec({ status: S, action: S, payload: b });
          case "report":
            return rec(Object.fromEntries(p.labels.map((label, i) => [label, ts[i]])));
          case "bfs":
            kind(a, "record", path);
            for (const t of Object.values(a.fields)) same(t, arr(S), path);
            same(b, arr(S), path);
            return rec({ found: B, path: arr(S), distance: opt(num("edge")) });
          case "allocate": {
            numeric(a, path);
            const e = kind(b, "array", path).element;
            same(field(e, "id"), S, path);
            same(field(e, "amount"), a, path);
            return rec({ grants: arr(rec({ id: S, requested: a, granted: a })), remaining: a });
          }
          case "schedule": {
            const e = element();
            same(field(e, "id"), S, path);
            same(field(e, "depends"), arr(S), path);
            const duration = numeric(field(e, "duration"), path);
            return rec({ order: arr(S), jobs: arr(rec({ id: S, start: duration, end: duration })), makespan: duration });
          }
          case "consensus": {
            const e = element();
            same(field(e, "source"), S, path);
            same(field(e, "choice"), S, path);
            return rec({ choice: opt(S), support: num("count"), accepted: B, uniqueSources: num("count") });
          }
          case "retry":
            same(element(), S, path);
            return rec({ status: S, attempts: num("count"), history: arr(S) });
          case "evidence": {
            const e = element();
            same(field(e, "source"), S, path);
            same(field(e, "claim"), S, path);
            same(field(e, "value"), B, path);
            return rec({ state: S, support: num("count"), refute: num("count"), sources: num("count") });
          }
          default:
            fail("unsupported", path, "Unsupported capability " + n.op);
        }
      }
      function compile(intent) {
        finiteJSON(intent);
        check2(new TextEncoder().encode(canon(intent)).length <= 131072, "budget", "$", "Intent exceeds 128 KiB");
        closed(intent, ["format", "name", "thought", "inputs", "steps", "outputs"], ["assumptions"], "$");
        check2(intent.format === "quineling-intent", "format", "$.format", "Unknown intent format");
        check2(typeof intent.name === "string" && intent.name.length > 0 && intent.name.length <= 120, "schema", "$.name", "Name must be 1\u2013120 characters");
        check2(typeof intent.thought === "string", "schema", "$.thought", "Thought must be a string");
        const assumptions = intent.assumptions || [];
        check2(Array.isArray(assumptions) && assumptions.length <= 32 && assumptions.every((x) => typeof x === "string" && x.length <= 512), "schema", "$.assumptions", "Invalid assumptions");
        check2(Array.isArray(intent.inputs) && Array.isArray(intent.steps) && intent.inputs.length + intent.steps.length >= 1 && intent.inputs.length + intent.steps.length <= 64, "budget", "$", "Task must contain 1\u201364 inputs and steps");
        check2(Array.isArray(intent.outputs) && intent.outputs.length > 0 && intent.outputs.length <= 16 && new Set(intent.outputs).size === intent.outputs.length, "schema", "$.outputs", "Expected 1\u201316 unique output IDs");
        const ids = /* @__PURE__ */ new Set(), types = /* @__PURE__ */ new Map(), values = /* @__PURE__ */ new Map(), nodes = [], sourceMap = [], steps = /* @__PURE__ */ new Map();
        function id(s, path) {
          check2(typeof s === "string" && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(s) && !badKeys.has(s) && !ids.has(s), "id", path, "Invalid or duplicate node ID");
          ids.add(s);
        }
        intent.inputs.forEach((x, i) => {
          const path = "$.inputs." + i;
          closed(x, ["id", "value", "type"], [], path);
          id(x.id, path);
          const t = type(x.type, path + ".type");
          matches(x.value, t, path + ".value");
          types.set(x.id, t);
          values.set(x.id, clone(x.value));
          nodes.push({ id: x.id, op: "literal", inputs: [], params: { value: clone(x.value) } });
          sourceMap.push({ nodeId: x.id, clause: "Supplied input " + x.id });
        });
        intent.steps.forEach((n, i) => {
          const path = "$.steps." + i;
          closed(n, ["id", "op", "inputs", "params"], [], path);
          id(n.id, path);
          check2(capabilities2.includes(n.op), "unsupported", path, "Unsupported capability " + n.op);
          check2(Array.isArray(n.inputs) && n.inputs.length <= 16 && (K2.ARITY[n.op] === -1 || n.inputs.length === K2.ARITY[n.op]), "ports", path, "Wrong ordered input count for " + n.op);
          steps.set(n.id, { n, path });
        });
        for (const { n, path } of steps.values()) for (const from of n.inputs) check2(typeof from === "string" && ids.has(from), "reference", path, "Unknown input " + from);
        for (const output of intent.outputs) check2(typeof output === "string" && ids.has(output), "reference", "$.outputs", "Unknown output " + output);
        const reachable = /* @__PURE__ */ new Set();
        function visit(id2) {
          if (reachable.has(id2)) return;
          reachable.add(id2);
          const entry = steps.get(id2);
          if (entry) entry.n.inputs.forEach(visit);
        }
        intent.outputs.forEach(visit);
        check2(reachable.size === ids.size, "disconnected", "$", "Every supplied input and step must contribute to a declared output");
        function upstreamAction(id2, seen = /* @__PURE__ */ new Set()) {
          if (seen.has(id2)) return false;
          seen.add(id2);
          const entry = steps.get(id2);
          return !!entry && (entry.n.op === "action" || entry.n.inputs.some((x) => upstreamAction(x, seen)));
        }
        for (const { n, path } of steps.values()) if (n.op === "choose") check2(!upstreamAction(n.inputs[1]) && !upstreamAction(n.inputs[2]), "eager-effect", path, "choose is eager: use an explicit action guard, never an action inside a branch");
        const pending = new Map(steps);
        while (pending.size) {
          const entry = [...pending.values()].find(({ n: n2 }) => n2.inputs.every((x) => types.has(x)));
          check2(entry, "cycle", "$.steps", "Task graph contains a cycle");
          const { n, path } = entry, ts = n.inputs.map((x) => types.get(x)), args = n.inputs.map((x) => values.get(x)), t = inferStep(n, ts, path);
          let value = UNKNOWN;
          if (n.op !== "action") {
            if (args.includes(UNKNOWN)) {
              check2(["report", "get", "compare", "length"].includes(n.op), "unproven-refinement", path, "Cannot prove numerical refinements from an unevaluated action receipt");
            } else {
              if (n.op === "weightedMean") {
                const vs = args[0], ws = args[1];
                const mass = ws.reduce((s, v) => s + v, 0), products = vs.map((v, i) => v * ws[i]), total = products.reduce((s, v) => s + v, 0);
                check2(Number.isFinite(mass) && Number.isFinite(total) && products.every(Number.isFinite), "refinement", path, "Weighted arithmetic overflow");
              }
              try {
                value = K2.calculate(n.op, args, n.params);
                finiteJSON(value, path + ".result");
                check2(new TextEncoder().encode(canon(value)).length <= 65536, "budget", path, "Intermediate value exceeds 64 KiB");
                matches(value, t, path + ".result");
              } catch (e) {
                if (e.code) throw e;
                fail("refinement", path, e.message);
              }
            }
          }
          types.set(n.id, t);
          values.set(n.id, value);
          nodes.push(clone(n));
          sourceMap.push({ nodeId: n.id, clause: n.op + "(" + n.inputs.join(", ") + ")" });
          pending.delete(n.id);
        }
        const graph = { version: 1, name: intent.name, nodes, outputs: [...intent.outputs] };
        check2(new TextEncoder().encode(canon(graph)).length <= 65536, "source-budget", "$", "Task graph exceeds 64 KiB");
        K2.validate(graph);
        let sourceBytes;
        try {
          const program = Q2.makeTaskProgram(graph);
          sourceBytes = new TextEncoder().encode(canon(program)).length;
          Q2.encode(program);
        } catch (e) {
          fail("source-budget", "$", e.message);
        }
        return { graph, contract: { format: "quineling-contract", registry: "quineling-kernels-experimental", types: clone(Object.fromEntries(types)), assumptions: clone(assumptions), effectMode: intent.steps.some((n) => n.op === "action") ? "simulation" : "pure", sourceBytes, provenance: "companion document; types and thought are not embedded in the quine" }, sourceMap, diagnostics: [] };
      }
      function splitPipeline(text) {
        const chunks = [];
        let depth = 0, quoted = false, escape = false, start = 0;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (quoted) {
            if (escape) escape = false;
            else if (c === "\\") escape = true;
            else if (c === '"') quoted = false;
          } else if (c === '"') quoted = true;
          else if (c === "[" || c === "{") depth++;
          else if (c === "]" || c === "}") depth--;
          else if (c === "|" && depth === 0) {
            chunks.push(text.slice(start, i).trim());
            start = i + 1;
          }
          check2(depth >= 0, "syntax", "$", "Unbalanced JSON");
        }
        check2(!quoted && depth === 0, "syntax", "$", "Incomplete JSON");
        chunks.push(text.slice(start).trim());
        check2(chunks.every(Boolean), "syntax", "$", "Empty pipeline stage");
        return chunks;
      }
      function takeValue(text) {
        text = text.trim();
        let end = 0;
        if (text[0] === "[" || text[0] === "{") {
          let depth = 0, q = false, esc = false;
          for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (q) {
              if (esc) esc = false;
              else if (c === "\\") esc = true;
              else if (c === '"') q = false;
            } else if (c === '"') q = true;
            else if (c === "[" || c === "{") depth++;
            else if (c === "]" || c === "}") {
              if (--depth === 0) {
                end = i + 1;
                break;
              }
            }
          }
        } else if (text[0] === '"') {
          let esc = false;
          for (let i = 1; i < text.length; i++) {
            if (esc) esc = false;
            else if (text[i] === "\\") esc = true;
            else if (text[i] === '"') {
              end = i + 1;
              break;
            }
          }
        } else {
          const m = text.match(/^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)(?=\s|$)/);
          if (m) end = m[0].length;
        }
        check2(end > 0, "syntax", "$", "Expected explicit JSON data");
        let value;
        try {
          value = JSON.parse(text.slice(0, end));
        } catch {
          fail("syntax", "$", "Invalid JSON data");
        }
        finiteJSON(value);
        return { value, rest: text.slice(end).trim() };
      }
      const numericPattern = "-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?";
      function parse(text) {
        const base = { diagnostics: [], assumptions: [], sourceMap: [] };
        try {
          let input = function(id, value, t) {
            intent.inputs.push({ id, value, type: t || inferType(value) });
            sourceClauses[id] = activeClause;
            return id;
          }, step = function(op, inputs, params = {}) {
            const id = "step" + ++counter;
            intent.steps.push({ id, op, inputs, params });
            sourceClauses[id] = activeClause;
            current = id;
            return id;
          }, finishUnit = function(rest) {
            if (!rest) {
              intent.assumptions.push("Unspecified numeric units are dimensionless (one).");
              return "one";
            }
            return unit(rest, "$.input.unit");
          };
          check2(typeof text === "string" && text.length <= 16384, "budget", "$", "Thought must be at most 16384 characters");
          text = text.trim();
          if (!text) return { ...base, status: "clarify", diagnostics: [{ code: "missing", path: "$", message: "Supply explicit data and operations, or import a typed plan." }] };
          let imported = text.startsWith("plan ") ? text.slice(5).trim() : text;
          if (imported.startsWith("{")) {
            let candidate;
            try {
              candidate = JSON.parse(imported);
            } catch {
            }
            if (candidate && candidate.format) {
              const result2 = compile(candidate);
              return { ...base, status: "supported", intent: clone(candidate), assumptions: result2.contract.assumptions, sourceMap: result2.sourceMap };
            }
            if (text.startsWith("plan ")) fail("syntax", "$", "plan requires a complete typed IntentIR JSON object");
          }
          if (/\b(?:forever|continuously|live data|send email|delete files|internet|persistent|real-world)\b/i.test(text)) return { ...base, status: "unsupported", diagnostics: [{ code: "unavailable-capability", path: "$", message: "This goal needs an external, persistent, or unbounded capability. The local compiler supports bounded supplied data and simulated actions." }] };
          const chunks = splitPipeline(text), first = chunks.shift(), intent = { format: "quineling-intent", name: "Generated thought", thought: text, inputs: [], steps: [], outputs: [], assumptions: [] };
          let current, seedKind = "", counter = 0, activeClause = first;
          const sourceClauses = {};
          let m;
          if (m = first.match(/^weighted mean\s+(.+)$/i)) {
            const v = takeValue(m[1]);
            check2(v.rest.startsWith("weights "), "syntax", "$", "Use weighted mean VALUES weights WEIGHTS [UNIT]");
            const w = takeValue(v.rest.slice(8)), u = finishUnit(w.rest);
            const vi = input("values", v.value, arr(num(u))), wi = input("weights", w.value, arr(num()));
            step("weightedMean", [vi, wi]);
          } else if (m = first.match(new RegExp("^allocate (" + numericPattern + ")(?: ([A-Za-z][A-Za-z0-9_^*\\-]*))? to (.+)$", "i"))) {
            const req = takeValue(m[3]);
            check2(!req.rest, "syntax", "$", "Unexpected text after allocation requests");
            const u = finishUnit(m[2] || "");
            const requestsType = inferType(req.value, u);
            if (Array.isArray(req.value) && req.value.length === 0) requestsType.element = rec({ id: S, amount: num(u) });
            step("allocate", [input("available", Number(m[1]), num(u)), input("requests", req.value, requestsType)]);
          } else if (m = first.match(/^route ([A-Za-z0-9_-]+) to ([A-Za-z0-9_-]+) in (.+)$/i)) {
            const roads = takeValue(m[3]);
            check2(roads.rest.startsWith("blocked "), "syntax", "$", "Route requires an explicit blocked JSON array (use [] for none)");
            const blocked = takeValue(roads.rest.slice(8));
            check2(!blocked.rest, "syntax", "$", "Unexpected text after blocked nodes");
            check2(object(roads.value), "type", "$", "Route graph must be an adjacency record");
            const fields2 = Object.fromEntries(Object.keys(roads.value).map((k) => [k, arr(S)]));
            step("bfs", [input("streets", roads.value, rec(fields2)), input("blocked", blocked.value, arr(S))], { start: m[1], goal: m[2] });
            seedKind = "route";
          } else if (m = first.match(/^schedule (.+)$/i)) {
            const jobs = takeValue(m[1]), u = finishUnit(jobs.rest);
            step("schedule", [input("jobs", jobs.value, arr(rec({ id: S, depends: arr(S), duration: num(u) })))]);
          } else if (m = first.match(/^consensus (.+)$/i)) {
            const votes = takeValue(m[1]), r = votes.rest.match(/^required ([1-9]\d*)$/);
            check2(r, "syntax", "$", "Consensus requires an explicit positive threshold: required N");
            step("consensus", [input("votes", votes.value, arr(rec({ source: S, choice: S })))], { required: Number(r[1]) });
          } else if (m = first.match(/^evidence (.+)$/i)) {
            const reports = takeValue(m[1]);
            let params = {};
            if (reports.rest) {
              check2(reports.rest.startsWith("claim "), "syntax", "$", "Expected claim JSON_STRING");
              const claim = takeValue(reports.rest.slice(6));
              check2(typeof claim.value === "string" && !claim.rest, "syntax", "$", "Claim must be a JSON string");
              params.claim = claim.value;
            }
            step("evidence", [input("evidence", reports.value, arr(rec({ source: S, claim: S, value: B })))], params);
          } else if (m = first.match(/^retry (.+)$/i)) {
            const outcomes = takeValue(m[1]), r = outcomes.rest.match(/^max ([1-8])$/);
            check2(r, "syntax", "$", "Retry needs an explicit bound: max 1\u20138");
            step("retry", [input("outcomes", outcomes.value, arr(S))], { maxAttempts: Number(r[1]) });
          } else if (m = first.match(/^budget (.+)$/i)) {
            const available = takeValue(m[1]);
            check2(available.rest.startsWith("for "), "syntax", "$", "Use budget AVAILABLE for DESIRED [UNIT]");
            const desired = takeValue(available.rest.slice(4)), u = finishUnit(desired.rest);
            step("budget", [input("available", available.value, num(u)), input("desired", desired.value, num(u))]);
          } else {
            let seed = first.replace(/^numbers\s+/i, ""), prefixed = null;
            if (m = seed.match(/^(sum|mean|min|max)\s+(.+)$/i)) {
              prefixed = m[1].toLowerCase();
              seed = m[2];
            }
            const parsed = takeValue(seed), u = finishUnit(parsed.rest);
            current = input("input", parsed.value, inferType(parsed.value, u));
            if (prefixed) step(prefixed, [current]);
          }
          for (const clause of chunks) {
            activeClause = clause;
            if (/^(sum|mean|min|max|length)$/i.test(clause)) step(clause.toLowerCase(), [current]);
            else if (/^square$/i.test(clause)) step("map", [current], { kind: "square" });
            else if (m = clause.match(new RegExp("^multiply (" + numericPattern + ")$", "i"))) step("map", [current], { kind: "multiply", factor: Number(m[1]) });
            else if (m = clause.match(new RegExp("^clamp (" + numericPattern + ") (" + numericPattern + ")$", "i"))) step("clamp", [current], { min: Number(m[1]), max: Number(m[2]) });
            else if (m = clause.match(/^filter (?:(\w+(?:\.\w+)*) )?(eq|ne|gt|gte|lt|lte) (.+)$/i)) {
              const v = takeValue(m[3]);
              check2(!v.rest, "syntax", "$", "Unexpected text after filter value");
              const p = { operator: m[2].toLowerCase(), value: v.value };
              if (m[1]) p.key = m[1];
              step("filter", [current], p);
            } else if (m = clause.match(/^compare (eq|ne|gt|gte|lt|lte) (.+)$/i)) {
              const v = takeValue(m[2]);
              check2(!v.rest, "syntax", "$", "Unexpected text after comparison value");
              step("compare", [current], { operator: m[1].toLowerCase(), value: v.value });
            } else if (m = clause.match(/^sort(?: ([A-Za-z][A-Za-z0-9_.-]*))?(?: (asc|desc))?$/i)) {
              let key = m[1], direction = m[2];
              if (!direction && ["asc", "desc"].includes((key || "").toLowerCase())) {
                direction = key;
                key = void 0;
              }
              const p = { descending: (direction || "asc").toLowerCase() === "desc" };
              if (key) p.key = key;
              step("sort", [current], p);
            } else if (m = clause.match(/^dedupe(?: ([A-Za-z][A-Za-z0-9_.-]*))?$/i)) step("dedupe", [current], m[1] ? { key: m[1] } : {});
            else if (m = clause.match(/^get ([A-Za-z][A-Za-z0-9_.-]*)$/i)) step("get", [current], { path: m[1] });
            else if (m = clause.match(/^report ([A-Za-z][A-Za-z0-9_-]*)$/i)) step("report", [current], { labels: [m[1]] });
            else if (m = clause.match(/^simulate (.+)$/i)) {
              check2(seedKind === "route" && intent.steps.find((n) => n.id === current)?.op === "bfs", "syntax", "$", "simulate is supported directly after a route, guarded by found");
              const action = takeValue(m[1]);
              check2(typeof action.value === "string" && !action.rest, "syntax", "$", "Simulation action must be a JSON string");
              const route = current, guard = step("get", [route], { path: "found" }), payload = step("get", [route], { path: "path" });
              step("action", [guard, payload], { allowed: true, action: action.value });
              intent.assumptions.push("The action is a local simulation, guarded by route.found; it grants no external authority.");
            } else fail("syntax", "$", "Unrecognized complete pipeline stage: " + clause);
          }
          intent.outputs = [current];
          const result = compile(intent);
          return { ...base, status: "supported", intent, assumptions: clone(intent.assumptions), sourceMap: result.sourceMap.map((entry) => ({ ...entry, clause: sourceClauses[entry.nodeId] })) };
        } catch (e) {
          return { ...base, status: e.code === "unsupported" ? "unsupported" : ["syntax", "missing", "unit"].includes(e.code) ? "clarify" : "inconsistent", diagnostics: [{ code: e.code || "invalid", path: e.path || "$", message: e.message }] };
        }
      }
      const examples2 = Object.freeze([
        "[2,3,4] | square | sum | report total",
        "[8,2,8,4] | dedupe | sort desc | mean",
        "[1,5,9] L | filter gt 3 | sum",
        "weighted mean [24,36,60] weights [2,1,1] L",
        'allocate 9 L to [{"id":"fern","amount":4},{"id":"sage","amount":7}]',
        'route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ["B"] | simulate "walk-route"',
        'schedule [{"id":"a","depends":[],"duration":2},{"id":"b","depends":["a"],"duration":3}] s',
        'consensus [{"source":"a","choice":"yes"},{"source":"b","choice":"yes"}] required 2',
        'evidence [{"source":"a","claim":"safe","value":true}] claim "safe"',
        'retry ["retry","ok"] max 3'
      ]);
      const api = { parse, compile, inferType, capabilities: capabilities2, schema, examples: examples2 };
      if (typeof module !== "undefined") module.exports = api;
      root.ThoughtCompiler = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// offspring.js
var require_offspring = __commonJS({
  "offspring.js"(exports, module) {
    (function(root) {
      "use strict";
      const node = typeof module !== "undefined" && module.exports;
      const Q2 = node ? require_core() : root.Quinelings, T2 = node ? require_thought() : root.ThoughtCompiler;
      const A2 = node ? require_anatomy() : root.Anatomy, D2 = node ? require_qdl() : root.QDL;
      const C2 = node ? require_ranch_crypto() : root.RanchCrypto;
      const TRAITS = Object.freeze(["elongation", "spread", "curvature", "gestureGain", "tempo", "pigmentGain"]);
      const POLICIES = Object.freeze({ compiler: "quineling-kernels-experimental", assembly: A2.COMPILER, heredity: "bounded-traits-experimental", offspring: "closed-four-recipes-experimental", quantization: "ecmascript-round-1e-6-experimental" });
      const clone = (x) => JSON.parse(JSON.stringify(x)), canon = Q2.canon, hash = (x) => C2.sha256(x), bytes = (x) => new TextEncoder().encode(x).length;
      function fail(code, path, message) {
        const e = new Error(message);
        e.code = code;
        e.path = path;
        throw e;
      }
      function check2(ok, code, path, message) {
        if (!ok) fail(code, path, message);
      }
      function safe(x, path = "$", seen = /* @__PURE__ */ new Set(), depth = 0) {
        check2(depth <= 32, "budget", path, "JSON nesting exceeds 32");
        if (x === null || typeof x === "boolean") return;
        if (typeof x === "string") {
          check2(bytes(x) <= 2097152, "budget", path, "String exceeds byte budget");
          return;
        }
        if (typeof x === "number") {
          check2(Number.isFinite(x), "invalid-input", path, "Expected finite JSON");
          return;
        }
        check2(x && typeof x === "object", "invalid-input", path, "Expected JSON data");
        check2(!seen.has(x), "invalid-input", path, "Cyclic JSON");
        check2(Array.isArray(x) ? Object.getPrototypeOf(x) === Array.prototype : [Object.prototype, null].includes(Object.getPrototypeOf(x)), "invalid-input", path, "Expected native JSON arrays or plain records");
        const ds = Object.getOwnPropertyDescriptors(x), ks = Reflect.ownKeys(ds);
        check2(ks.every((k) => typeof k === "string"), "invalid-input", path, "Symbol properties are not JSON");
        for (const k of ks) {
          const d = ds[k];
          check2(Object.hasOwn(d, "value"), "invalid-input", path + "." + k, "Accessor properties are not JSON");
          check2(d.enumerable || Array.isArray(x) && k === "length", "invalid-input", path + "." + k, "Hidden properties are not JSON");
        }
        if (Array.isArray(x)) check2(Object.keys(x).length === x.length && Object.keys(x).every((k, i) => k === String(i)), "invalid-input", path, "Expected dense JSON array");
        const next = new Set(seen).add(x);
        for (const k of Object.keys(x)) {
          check2(!["__proto__", "prototype", "constructor"].includes(k), "invalid-input", path + "." + k, "Unsafe JSON key");
          safe(ds[k].value, path + "." + k, next, depth + 1);
        }
      }
      function closed(x, required, optional = [], path = "$") {
        check2(x && typeof x === "object" && !Array.isArray(x), "invalid-input", path, "Expected record");
        for (const k of required) check2(Object.hasOwn(x, k), "invalid-input", path + "." + k, "Missing field");
        for (const k of Object.keys(x)) check2(required.includes(k) || optional.includes(k), "invalid-input", path + "." + k, "Unknown field");
      }
      function str(x, path, max = 128) {
        check2(typeof x === "string" && x.length >= 1 && x.length <= max, "invalid-input", path, "Expected bounded nonempty string");
      }
      function uint(x, path, max = 4294967295) {
        check2(Number.isInteger(x) && x >= 0 && x <= max, "invalid-input", path, "Expected bounded unsigned integer");
      }
      function digest(x, path) {
        check2(typeof x === "string" && /^[a-f0-9]{64}$/.test(x), "invalid-input", path, "Expected lowercase SHA256 digest");
      }
      function traits(x, path) {
        closed(x, TRAITS, [], path);
        for (const k of TRAITS) check2(Number.isInteger(x[k]) && Math.abs(x[k]) <= 1e3, "invalid-input", path + "." + k, "Trait must be an integer in [-1000,1000]");
      }
      function validateInput(input) {
        safe(input);
        closed(input, ["parents", "recipe", "nonce", "style", "origin"]);
        check2(Array.isArray(input.parents) && input.parents.length === 2, "invalid-input", "$.parents", "Expected two ordered parents");
        input.parents.forEach((p, i) => {
          closed(p, ["artifactId", "intentHash"], [], "$.parents." + i);
          str(p.artifactId, "$.parents." + i + ".artifactId");
          if (p.intentHash !== null) digest(p.intentHash, "$.parents." + i + ".intentHash");
        });
        uint(input.nonce, "$.nonce");
        const r = input.recipe;
        check2(r && typeof r === "object", "invalid-input", "$.recipe", "Expected recipe");
        const fields2 = { compose: ["donorOutput", "recipientInput"], mate: ["donorNode", "replaceNode"], merge: [], body: ["base"] };
        check2(Object.hasOwn(fields2, r.kind), "invalid-input", "$.recipe.kind", "Unknown offspring recipe");
        closed(r, ["kind", ...fields2[r.kind]], [], "$.recipe");
        for (const k of fields2[r.kind]) if (k === "base") check2(r.base === 0 || r.base === 1, "invalid-input", "$.recipe.base", "Expected ordered base role");
        else str(r[k], "$.recipe." + k, 64);
        closed(input.style, ["mutation"], ["traits"], "$.style");
        check2(["none", "gentle"].includes(input.style.mutation), "invalid-input", "$.style.mutation", "Unknown mutation policy");
        if (Object.hasOwn(input.style, "traits")) {
          traits(input.style.traits, "$.style.traits");
          check2(input.style.mutation === "none", "invalid-input", "$.style.mutation", "Trait overrides require mutation:none");
        }
        const o = input.origin;
        check2(o && typeof o === "object", "invalid-input", "$.origin", "Expected origin");
        check2(["manual", "pairing"].includes(o.kind), "invalid-input", "$.origin.kind", "Unknown origin");
        closed(o, o.kind === "manual" ? ["kind"] : ["kind", "worldId", "proposalId", "parentResidents", "epochs"], [], "$.origin");
        if (o.kind === "pairing") {
          str(o.worldId, "$.origin.worldId");
          str(o.proposalId, "$.origin.proposalId");
          check2(Array.isArray(o.parentResidents) && o.parentResidents.length === 2, "invalid-input", "$.origin.parentResidents", "Expected two residents");
          o.parentResidents.forEach((s, i) => str(s, "$.origin.parentResidents." + i));
          check2(o.parentResidents[0] !== o.parentResidents[1], "self-pairing", "$.origin.parentResidents", "A resident cannot pair with itself");
          check2(Array.isArray(o.epochs) && o.epochs.length === 2, "invalid-input", "$.origin.epochs", "Expected two epochs");
          o.epochs.forEach((n, i) => uint(n, "$.origin.epochs." + i, 1e6));
        }
        return clone(input);
      }
      function intentHash(intent) {
        if (intent === null || intent === void 0) return null;
        safe(intent, "$.intent");
        T2.compile(intent);
        return hash(canon(intent));
      }
      function taskProjection(g) {
        const result = clone(g);
        delete result.design;
        return result;
      }
      function parent(p, pin, index) {
        safe(p, "$.parentArtifacts." + index);
        check2(p && p.id === pin.artifactId, "parent-pin", "$.parents." + index + ".artifactId", "Parent artifact ID mismatch");
        check2(typeof p.source === "string" && bytes(p.source) <= 65536, "source-budget", "$.parents." + index, "Expected source within 64 KiB");
        let program, shape;
        try {
          program = JSON.parse(p.source);
          shape = Q2.describe(program);
        } catch (e) {
          fail("parent-source", "$.parents." + index, e.message);
        }
        check2(canon(program) === p.source, "parent-source", "$.parents." + index, "Parent source is not canonical");
        check2(Array.isArray(shape.graph.nodes), "parent-source", "$.parents." + index, "Offspring requires a task constructor");
        const graph = taskProjection(shape.graph);
        let rebuilt;
        try {
          rebuilt = Q2.makeTaskProgram(graph, shape.repeats, shape.design);
        } catch (e) {
          fail("parent-source", "$.parents." + index, e.message);
        }
        check2(canon(rebuilt) === p.source, "parent-source", "$.parents." + index, "Parent is not a complete canonical constructor");
        check2(p.id === "ql_" + hash(p.source), "parent-pin", "$.parents." + index + ".artifactId", "Artifact ID does not identify the exact source");
        const ih = intentHash(p.intent || null);
        check2(ih === pin.intentHash, "parent-pin", "$.parents." + index + ".intentHash", "Parent intent pin mismatch");
        let compiled;
        if (p.intent) {
          compiled = T2.compile(p.intent);
          check2(canon(compiled.graph) === canon(graph), "companion-mismatch", "$.parents." + index, "Companion does not reproduce source task graph");
        }
        return { id: p.id, source: p.source, sourceHash: hash(p.source), intentHash: ih, graph, design: clone(shape.design), repeats: shape.repeats, compiled, intent: p.intent ? clone(p.intent) : null, sourceMap: clone(p.sourceMap || compiled?.sourceMap || []) };
      }
      function topo(g) {
        const done = /* @__PURE__ */ new Set(), pending = g.nodes.slice(), out = [];
        while (pending.length) {
          const i = pending.findIndex((n2) => n2.inputs.every((id) => done.has(id)));
          check2(i >= 0, "cycle", "$.graph", "Graph is not acyclic");
          const n = pending.splice(i, 1)[0];
          done.add(n.id);
          out.push(n);
        }
        return out;
      }
      function closure(g, ids) {
        const map = new Map(g.nodes.map((n) => [n.id, n])), out = /* @__PURE__ */ new Set();
        function visit(id) {
          check2(map.has(id), "selector", "$.recipe", "Unknown selected node " + id);
          if (out.has(id)) return;
          out.add(id);
          map.get(id).inputs.forEach(visit);
        }
        ids.forEach(visit);
        return out;
      }
      function protectedNodes(g) {
        const out = /* @__PURE__ */ new Set();
        for (const n of g.nodes) if (n.op === "action") {
          out.add(n.id);
          for (const id of closure(g, [n.inputs[0]])) out.add(id);
        }
        return out;
      }
      function normalizedTask(g, repeats) {
        const ns = topo(g), ids = new Map(ns.map((n, i) => [n.id, i]));
        return { repeats, nodes: ns.map((n) => ({ op: n.op, inputs: n.inputs.map((id) => ids.get(id)), params: n.params })), outputs: g.outputs.map((id) => ids.get(id)) };
      }
      function resolvedBody(design, graph) {
        const d = clone(design);
        delete d.heredity;
        if (d.anatomy) {
          delete d.anatomy.seed;
          delete d.anatomy.compiler;
          const ids = new Map(topo(graph).map((n, i) => [n.id, i]));
          for (const o of d.anatomy.owners) o.node = ids.get(o.node);
        }
        return d;
      }
      function assembleTask(ps, r, diagnostics) {
        if (r.kind === "body") {
          const b = ps[r.base];
          return { graph: clone(b.graph), intent: b.intent ? clone(b.intent) : null, compiled: b.compiled ? clone(b.compiled) : null, sourceMap: clone(b.sourceMap), repeats: b.repeats, origins: b.graph.nodes.map((n) => ({ nodeId: n.id, parent: r.base, parentNodeId: n.id })) };
        }
        check2(ps.every((p) => p.compiled), "missing-companion", "$.parents", "Task recipes require both typed companions");
        check2(ps[0].sourceHash !== ps[1].sourceHash, "same-source", "$.parents", "Task recipes require distinct source parents");
        const maps = ps.map((p, role) => new Map(topo(p.graph).map((n, i) => [n.id, "p" + role + "n" + i]))), origins = [], types = {};
        let nodes = [], outputs, seam;
        function imported(role, keep) {
          return topo(ps[role].graph).filter((n) => !keep || keep.has(n.id)).map((n) => {
            const id = maps[role].get(n.id);
            origins.push({ nodeId: id, parent: role, parentNodeId: n.id });
            types[id] = ps[role].compiled.contract.types[n.id];
            return { ...clone(n), id, inputs: n.inputs.map((x) => maps[role].get(x)) };
          });
        }
        if (r.kind === "merge") {
          const ports = ps.flatMap((p) => p.graph.outputs);
          check2(ports.length <= 16, "ports", "$.recipe", "Merge report exceeds 16 input ports");
          nodes = [...imported(0), ...imported(1)];
          nodes.push({ id: "report", op: "report", inputs: ps.flatMap((p, i) => p.graph.outputs.map((x) => maps[i].get(x))), params: { labels: ps.flatMap((p, i) => p.graph.outputs.map((_, j) => (i ? "b" : "a") + j)) } });
          origins.push({ nodeId: "report", parent: "generated" });
          outputs = ["report"];
        } else {
          const donor = r.kind === "compose" ? r.donorOutput : r.donorNode, recipient = r.kind === "compose" ? r.recipientInput : r.replaceNode, donorNode = ps[0].graph.nodes.find((n) => n.id === donor), recipientNode = ps[1].graph.nodes.find((n) => n.id === recipient);
          check2(donorNode && recipientNode, "selector", "$.recipe", "Unknown selected donor or recipient node");
          if (r.kind === "compose") {
            check2(ps[0].graph.outputs.includes(donor), "selector", "$.recipe.donorOutput", "Compose donor must be a declared output");
            check2(recipientNode.op === "literal", "selector", "$.recipe.recipientInput", "Compose recipient must be a literal");
          }
          check2(!protectedNodes(ps[1].graph).has(recipient), "protected-guard", "$.recipe", "Action nodes and guard ancestors are protected");
          const keep = closure(ps[0].graph, [donor]);
          check2(ps[0].graph.nodes.filter((n) => keep.has(n.id)).every((n) => n.op !== "action"), "impure-donor", "$.recipe", "Donor predecessor closure must be pure");
          const dt = ps[0].compiled.contract.types[donor], rt = ps[1].compiled.contract.types[recipient];
          check2(canon(dt) === canon(rt), "unit-type", "$.recipe", "Connection requires equal complete normalized types");
          const donorId = maps[0].get(donor), replaceId = maps[1].get(recipient);
          nodes = [...imported(0, keep), ...imported(1)];
          nodes = nodes.filter((n) => n.id !== replaceId).map((n) => ({ ...n, inputs: n.inputs.map((x) => x === replaceId ? donorId : x) }));
          outputs = ps[1].graph.outputs.map((x) => x === recipient ? donorId : maps[1].get(x));
          const live = closure({ nodes }, outputs);
          nodes = nodes.filter((n) => live.has(n.id));
          for (const old of ps[1].graph.nodes.filter((n) => n.op === "action")) {
            const now = nodes.find((n) => n.id === maps[1].get(old.id));
            check2(now && canon(now.params) === canon(old.params) && now.inputs[0] === maps[1].get(old.inputs[0]), "protected-guard", "$.recipe", "All recipient actions and guards must survive");
            for (const guardId of closure(ps[1].graph, [old.inputs[0]])) {
              const before = ps[1].graph.nodes.find((n) => n.id === guardId), after = nodes.find((n) => n.id === maps[1].get(guardId));
              check2(after && canon(after) === canon({ ...before, id: maps[1].get(guardId), inputs: before.inputs.map((x) => maps[1].get(x)) }), "protected-guard", "$.recipe", "Recipient guard cone changed");
            }
          }
          const downstream = /* @__PURE__ */ new Set([donorId]);
          for (const n of topo({ nodes })) if (n.inputs.some((x) => downstream.has(x))) downstream.add(n.id);
          const integration = nodes.find((n) => n.id.startsWith("p1n") && n.op !== "literal" && downstream.has(n.id) && closure({ nodes }, outputs).has(n.id));
          check2(integration, "disconnected-integration", "$.recipe", "Donation must feed surviving original recipient computation and output");
          seam = { donorNode: donorId, recipientNode: replaceId, type: clone(dt), integrationNode: integration.id };
        }
        check2(nodes.length <= 64, "node-budget", "$.recipe", "Child exceeds 64 nodes");
        nodes = topo({ nodes });
        const liveIds = new Set(nodes.map((n) => n.id));
        const liveOrigins = origins.filter((o) => liveIds.has(o.nodeId));
        const name = "Ranch " + r.kind + " offspring", intent = { format: "quineling-intent", name, thought: "Generated " + r.kind + " recipe over ordered source parents.", inputs: nodes.filter((n) => n.op === "literal").map((n) => ({ id: n.id, value: clone(n.params.value), type: clone(types[n.id]) })), steps: nodes.filter((n) => n.op !== "literal"), outputs, assumptions: [] };
        const compiled = T2.compile(intent);
        diagnostics.push({ code: "repeats-reset", path: "$.recipe", message: "Task-changing recipes use one task repeat." });
        return { graph: compiled.graph, intent, compiled, sourceMap: compiled.sourceMap, repeats: 1, origins: compiled.graph.nodes.map((n) => liveOrigins.find((o) => o.nodeId === n.id)), seam };
      }
      const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), quant = (x) => Math.round(x * 1e6) / 1e6 || 0;
      function parentTraits(p) {
        if (p.design.heredity) return { label: "authored-heredity", traits: clone(p.design.heredity.traits) };
        const cs = p.design.anatomy?.components || [], rootPart = cs.find((c) => c.parent === null);
        check2(rootPart, "missing-anatomy", "$.parents", "Legacy phenotype requires authored assembly anatomy");
        const e = rootPart.kind === "chamber" ? 2 * rootPart.axes[1] : rootPart.length, r = rootPart.kind === "chamber" ? 2 * Math.sqrt(rootPart.axes[0] * rootPart.axes[2]) : rootPart.radii[0] + rootPart.radii[1], spines = cs.filter((c) => c.kind === "spine"), b = spines.length ? spines.reduce((s, c) => s + c.bend[0], 0) / spines.length : 0;
        const values = [1e3 * (e / r - 1.5) / 1.5, 1e3 * (r / e - 0.6) / 0.6, 5e3 * b, 1e3 * ((p.design.motion.gesture?.strength ?? 0.65) - 0.65) / 0.35, 1e3 * (p.design.motion.phaseRate - 0.038) / 7e-3, 1e3 * ((p.design.chroma?.strength ?? 0) - 0.85) / 0.1];
        return { label: "legacy-phenotype", traits: Object.fromEntries(TRAITS.map((k, i) => [k, clamp(Math.round(values[i]), -1e3, 1e3)])) };
      }
      function inherit(ps, style, seed) {
        const parents = ps.map(parentTraits), draw = (label) => parseInt(hash(seed + "\n" + label).slice(0, 8), 16), draws = [], changes = [];
        let ts;
        if (style.traits) ts = clone(style.traits);
        else {
          ts = {};
          for (const k of TRAITS) {
            const n = draw("trait:" + k) % 3, a = parents[0].traits[k], b = parents[1].traits[k];
            ts[k] = n === 0 ? a : n === 1 ? b : Math.floor((a + b) / 2);
            draws.push({ trait: k, selection: ["A", "B", "floor-midpoint"][n], value: ts[k] });
          }
          if (style.mutation === "gentle") {
            const first = draw("mutation:locus:0") % 6, remaining = TRAITS.filter((_, i) => i !== first), chosen = [TRAITS[first], remaining[draw("mutation:locus:1") % 5]];
            chosen.forEach((k, i) => {
              const n = draw("mutation:delta:" + i), delta = (n % 2 === 0 ? 1 : -1) * (1 + n % 80), before = ts[k];
              ts[k] = clamp(before + delta, -1e3, 1e3);
              changes.push({ trait: k, requestedDelta: delta, actualDelta: ts[k] - before, saturated: before + delta !== ts[k] });
            });
          }
        }
        return { traits: ts, parents, draws, changes, override: !!style.traits };
      }
      function authoredDesign(ps, task, r, seedDigest, genetics, nonce, diagnostics) {
        const base = r.kind === "body" ? r.base : 1, d = clone(ps[base].design);
        delete d.heredity;
        const fresh = A2.generate(task.graph, parseInt(seedDigest.slice(0, 8), 16));
        d.anatomy = fresh.anatomy;
        d.motion.gesture = fresh.gesture;
        const g = (k) => genetics.traits[k] / 1e3;
        for (const c of d.anatomy.components) if (c.kind === "spine") {
          c.length = quant(clamp(c.length * (1 + 0.12 * g("elongation")), 0.12, 1.2));
          c.radii = c.radii.map((x) => quant(clamp(x * (1 + 0.1 * g("spread")), 0.015, 0.16)));
          c.bend[0] = quant(clamp(c.bend[0] + 0.025 * g("curvature"), -0.2, 0.2));
        } else {
          c.axes[1] = quant(clamp(c.axes[1] * (1 + 0.12 * g("elongation")), 0.04, 0.35));
          for (const i of [0, 2]) c.axes[i] = quant(clamp(c.axes[i] * (1 + 0.1 * g("spread")), 0.04, 0.35));
        }
        d.motion.gesture.strength = quant(clamp(0.65 + 0.1 * g("gestureGain"), 0, 1));
        d.motion.phaseRate = quant(clamp(0.038 + 7e-3 * g("tempo"), 0, 0.05));
        d.chroma.strength = quant(clamp(0.85 + 0.1 * g("pigmentGain"), 0, 1));
        if (d.chroma.lens) {
          try {
            D2.validateBindings(d, task.graph);
          } catch {
            delete d.chroma.lens;
            diagnostics.push({ code: "dropped-lens", path: "$.child.design.chroma.lens", message: "Inherited scalar lens is incompatible with child task references." });
          }
        }
        d.heredity = { model: POLICIES.heredity, parents: ps.map((p) => p.sourceHash), seedDigest, nonce, traits: clone(genetics.traits) };
        D2.validateBindings(d, task.graph);
        A2.validateOwners(d.anatomy, task.graph);
        A2.validateGesture(d.motion.gesture);
        return d;
      }
      function constructor(graph, repeats, design) {
        try {
          return Q2.makeTaskProgram(graph, repeats, design);
        } catch (e) {
          fail(/source.*(?:exceeds|budget)/i.test(e.message) ? "source-budget" : "offspring-refused", "$.child.source", e.message);
        }
      }
      function build(parents, input) {
        try {
          input = validateInput(input);
          safe(parents, "$.parentArtifacts");
          check2(Array.isArray(parents) && parents.length === 2, "invalid-input", "$.parentArtifacts", "Expected two detached artifacts");
          const ps = parents.map((p, i) => parent(p, input.parents[i], i)), diagnostics = [], task = assembleTask(ps, input.recipe, diagnostics), key = { domain: "quineling-ranch-construction-experimental", parents: ps.map((p) => ({ sourceHash: p.sourceHash, intentHash: p.intentHash })), recipe: clone(input.recipe), style: clone(input.style), nonce: input.nonce, policies: clone(POLICIES) }, candidateId = "qc_" + hash(canon(key)), seedDigest = hash("quineling-ranch-seed-experimental\n" + canon(key)), genetics = inherit(ps, input.style, seedDigest), design = authoredDesign(ps, task, input.recipe, seedDigest, genetics, input.nonce, diagnostics), program = constructor(task.graph, task.repeats, design), source = canon(program);
          check2(bytes(source) <= 65536, "source-budget", "$.child.source", "Complete source exceeds 64 KiB");
          const childSourceHash = hash(source), id = "ql_" + childSourceHash, derivationId = "qd_" + hash(canon({ candidateId, childSourceHash, origin: input.origin })), base = ps[input.recipe.kind === "body" ? input.recipe.base : 1];
          const changes = { sourceChanged: source !== base.source, taskSyntaxChanged: canon(normalizedTask(task.graph, task.repeats)) !== canon(normalizedTask(base.graph, base.repeats)), bodyChanged: canon(resolvedBody(design, task.graph)) !== canon(resolvedBody(base.design, base.graph)) };
          check2(changes.taskSyntaxChanged || changes.bodyChanged, "no-novelty", "$.recipe", "Candidate changes neither executable task nor resolved body");
          const classification = input.recipe.kind === "body" ? ps[0].sourceHash === ps[1].sourceHash ? "same-source body variation" : "body-only inheritance" : changes.taskSyntaxChanged ? "task-and-body offspring" : "body variation";
          const child = { id, source, program, graph: clone(task.graph), design, sourceMap: clone(task.sourceMap), harmonics: Q2.encode(program), colors: Q2.encodeColors(program) };
          if (task.intent) {
            child.intent = clone(task.intent);
            child.contract = clone(task.compiled.contract);
          }
          const lineage = { id: derivationId, candidateId, childArtifactId: id, childSourceHash, parents: key.parents, construction: clone(input), policies: clone(POLICIES), classification, changes: clone(changes), origins: clone(task.origins), heredity: genetics };
          if (task.seam) lineage.seam = task.seam;
          check2(bytes(canon(lineage)) <= 32768, "lineage-budget", "$.lineage", "Derivation exceeds 32 KiB");
          const candidate = { candidateId, derivationId, childSourceHash, child, changes, classification, diagnostics, lineage };
          check2(bytes(canon(candidate)) <= 2097152, "candidate-budget", "$", "Candidate exceeds 2 MiB");
          return candidate;
        } catch (e) {
          if (!e.code) e.code = "offspring-refused";
          if (!e.path) e.path = "$";
          throw e;
        }
      }
      const api = { POLICIES, TRAITS, validateInput, intentHash, build };
      if (node) module.exports = api;
      root.QuinelingOffspring = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// ranch-world.js
var require_ranch_world = __commonJS({
  "ranch-world.js"(exports, module) {
    (function(root) {
      "use strict";
      const Q2 = typeof module !== "undefined" ? require_core() : root.Quinelings;
      const C2 = typeof module !== "undefined" ? require_ranch_crypto() : root.RanchCrypto;
      const LIMITS = Object.freeze({ residents: 32, nursery: 8, pairs: 16, proposals: 16, events: 256, receipts: 256, ceiling: 1e6, bytes: 1048576, width: 512, height: 320, guard: 24, invitation: 120, approach: 160, attempt: 240, court: 80, proposal: 600, cooldown: 200 });
      const FOUNDERS = [{ x: 120, y: 24 }, { x: 168, y: 24 }, { x: 344, y: 24 }, { x: 392, y: 24 }, { x: 24, y: 144 }, { x: 72, y: 144 }, { x: 440, y: 144 }, { x: 488, y: 144 }, { x: 168, y: 296 }, { x: 344, y: 296 }];
      const SPAWNS = Object.freeze([...FOUNDERS, ...Array.from({ length: 60 }, (_, i) => ({ x: 24 + i % 10 * 48, y: 24 + Math.floor(i / 10) * 48 })).filter((p) => !FOUNDERS.some((s) => s.x === p.x && s.y === p.y))].map(Object.freeze));
      const CLEARINGS = Object.freeze([[{ x: 120, y: 96 }, { x: 168, y: 96 }], [{ x: 344, y: 96 }, { x: 392, y: 96 }], [{ x: 120, y: 224 }, { x: 168, y: 224 }], [{ x: 344, y: 224 }, { x: 392, y: 224 }]].map((a) => Object.freeze(a.map(Object.freeze))));
      function fail(code, message, path = "") {
        const e = new Error(message);
        e.code = code;
        e.path = path;
        throw e;
      }
      function plain(v, seen = /* @__PURE__ */ new Set(), path = "", depth = 0) {
        if (depth > 32) fail("invalid-input", "Data too deep", path);
        if (v === null || typeof v === "string" || typeof v === "boolean" || typeof v === "number" && Number.isFinite(v)) return;
        if (typeof v !== "object" || seen.has(v)) fail("invalid-input", "Only detached acyclic data accepted", path);
        const p = Object.getPrototypeOf(v);
        if (Array.isArray(v) ? p !== Array.prototype : p !== Object.prototype && p !== null) fail("invalid-input", "Plain records required", path);
        if (Array.isArray(v)) {
          const ks = Reflect.ownKeys(v).filter((k) => k !== "length");
          if (ks.length !== v.length || ks.some((k, i) => k !== String(i))) fail("invalid-input", "Dense closed arrays required", path);
        }
        seen.add(v);
        for (const k of Reflect.ownKeys(v)) {
          if (typeof k !== "string") fail("invalid-input", "Symbol field", path);
          if (Array.isArray(v) && k === "length") continue;
          const d = Object.getOwnPropertyDescriptor(v, k);
          if (!d || !("value" in d) || !d.enumerable) fail("invalid-input", "Accessor or hidden field", path + "." + k);
          plain(d.value, seen, path + "." + k, depth + 1);
        }
        seen.delete(v);
      }
      function closed(v, keys) {
        if (!v || Array.isArray(v) || typeof v !== "object" || Object.keys(v).length !== keys.length || keys.some((k) => !Object.hasOwn(v, k))) fail("invalid-input", "Closed fields required: " + keys.join(","));
      }
      function str(v, max = 128) {
        if (typeof v !== "string" || v.length < 1 || v.length > max) fail("invalid-input", "Invalid string");
      }
      function num(v, min = 0, max = LIMITS.ceiling) {
        if (!Number.isInteger(v) || v < min || v > max) fail("invalid-input", "Integer outside bounds");
      }
      function hash(v) {
        if (typeof v !== "string" || !/^[a-f0-9]{64}$/.test(v)) fail("invalid-input", "Invalid source/intent hash");
      }
      const clone = (v) => JSON.parse(JSON.stringify(v));
      function bytes(v) {
        const s = JSON.stringify(v);
        return typeof TextEncoder !== "undefined" ? new TextEncoder().encode(s).length : Buffer.byteLength(s);
      }
      function inc(n) {
        if (n >= LIMITS.ceiling) fail("capacity", "Counter ceiling");
        return n + 1;
      }
      function deadline(w, n) {
        if (w.tick + n > LIMITS.ceiling) fail("capacity", "Deadline ceiling");
        return w.tick + n;
      }
      function overlap(a, b) {
        return Math.abs(a.x - b.x) < 48 && Math.abs(a.y - b.y) < 48;
      }
      function inside(p) {
        return Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 24 && p.x <= 488 && p.y >= 24 && p.y <= 296;
      }
      function liveSlots(w) {
        return w.pairs.flatMap((p) => p.slots.map((s, i) => ({ ...s, owner: p.parentResidents[i] })));
      }
      function free(w, p, owners = []) {
        return inside(p) && w.residents.every((r) => owners.includes(r.id) || !overlap(p, r)) && liveSlots(w).every((s) => owners.includes(s.owner) || !overlap(p, s));
      }
      function spawn(w) {
        const p = SPAWNS.find((s) => free(w, s));
        if (!p) fail("capacity", "No guard-safe spawn");
        return p;
      }
      function event(w, kind, ids = []) {
        w.events.push({ tick: w.tick, kind, residentIds: ids.slice() });
        if (w.events.length > 256) {
          w.events.shift();
          w.droppedEvents = inc(w.droppedEvents);
        }
      }
      function resident(w, id) {
        str(id);
        const r = w.residents.find((r2) => r2.id === id);
        if (!r) fail("not-found", "Resident missing");
        return r;
      }
      function cooldown(w, r, n) {
        r.readyAfterTick = Math.max(r.readyAfterTick, Math.min(LIMITS.ceiling, w.tick + n));
      }
      function removeProposal(w, p, kind) {
        w.proposals = w.proposals.filter((x) => x.id !== p.id);
        for (const id of p.parentResidents) {
          const r = w.residents.find((r2) => r2.id === id);
          if (r && r.pendingProposal === p.id) r.pendingProposal = null;
        }
        event(w, kind, p.parentResidents);
      }
      function removePair(w, p, kind) {
        w.pairs = w.pairs.filter((x) => x.id !== p.id);
        for (const id of p.parentResidents) {
          const r = resident(w, id);
          r.partner = null;
          r.invitation = null;
          cooldown(w, r, 40);
        }
        event(w, kind, p.parentResidents);
      }
      function cleanup(w, r) {
        for (const p of w.pairs.slice()) if (p.parentResidents.includes(r.id)) removePair(w, p, "pair-aborted");
        for (const p of w.proposals.slice()) if (p.parentResidents.includes(r.id)) removeProposal(w, p, "proposal-cancelled");
        r.invitation = null;
        for (const a of w.residents) if (a.invitation && a.invitation.partnerId === r.id) a.invitation = null;
      }
      function artifact(c) {
        closed(c, ["artifact"]);
        const a = c.artifact;
        closed(a, ["id", "sourceHash", "intentHash", "roles", "gestureKind"]);
        str(a.id);
        hash(a.sourceHash);
        if (a.intentHash !== null) hash(a.intentHash);
        if (!Array.isArray(a.roles) || a.roles.length > 64) fail("invalid-input", "Bounded roles required");
        a.roles.forEach((x) => str(x, 64));
        str(a.gestureKind, 64);
        return a;
      }
      function insert(w, a, child) {
        if (w.residents.length >= 32 || child && w.residents.filter((r) => r.nurseryUntil > 0).length >= 8) fail("capacity", "Resident/nursery cap");
        const p = spawn(w), n = child ? deadline(w, 200) : 0;
        const id = "wr_" + w.nextResident;
        w.nextResident = inc(w.nextResident);
        w.residents.push({ id, artifactId: a.id, sourceHash: a.sourceHash, intentHash: a.intentHash, epoch: 0, enabled: false, energy: child ? 40 : 60, rest: false, nurseryUntil: n, readyAfterTick: 0, x: p.x, y: p.y, heading: 0, invitation: null, partner: null, pendingProposal: null, roles: a.roles.slice(), gestureKind: a.gestureKind });
        event(w, child ? "birth" : "import", [id]);
        return id;
      }
      function eligible(w, r) {
        return r.enabled && !r.nurseryUntil && !r.rest && r.energy >= 60 && w.tick >= r.readyAfterTick && !r.partner && !r.pendingProposal;
      }
      function affinity(a, b, neutral = false) {
        if (neutral) return -Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        const ar = new Set(a.roles), br = new Set(b.roles);
        let common = 0;
        for (const r of ar) if (br.has(r)) common++;
        return 8 * common + 4 * (a.gestureKind === b.gestureKind) + 2 * (a.sourceHash !== b.sourceHash) - Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
      }
      function pairings(w) {
        const adults = w.residents.filter((r) => eligible(w, r));
        for (const r of adults) if (!r.invitation) {
          const b = adults.filter((a) => a.id !== r.id).sort((a, b2) => affinity(r, b2, w.affinity === "neutral") - affinity(r, a, w.affinity === "neutral") || Number(a.id.slice(3)) - Number(b2.id.slice(3)))[0];
          if (b) r.invitation = { partnerId: b.id, expiry: deadline(w, 120) };
        }
        const mutual = adults.filter((a) => a.invitation).map((a) => [a, adults.find((b) => b.id === a.invitation.partnerId)]).filter(([a, b]) => b && b.invitation && b.invitation.partnerId === a.id && Number(a.id.slice(3)) < Number(b.id.slice(3)));
        for (const [a, b] of mutual) {
          if (a.partner || b.partner || w.pairs.length >= 16) continue;
          const slots = CLEARINGS.find((s) => s.every((p2, i) => free(w, p2, [a.id, b.id]) && Math.max(Math.abs(p2.x - [a, b][i].x), Math.abs(p2.y - [a, b][i].y)) <= 160));
          if (!slots) continue;
          const start = w.tick, p = { id: "pair_" + a.id + "_" + b.id + "_" + start, parentResidents: [a.id, b.id], slots: clone(slots), startTick: start, approachDeadline: deadline(w, 160), attemptDeadline: deadline(w, 240), dwell: 0, arrived: false };
          w.pairs.push(p);
          a.partner = b.id;
          b.partner = a.id;
          a.invitation = b.invitation = null;
          event(w, "pair-created", p.parentResidents);
        }
      }
      const MOVES = [[0, 0], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
      function box(a, b) {
        return { l: Math.min(a.x, b.x) - 24, r: Math.max(a.x, b.x) + 24, t: Math.min(a.y, b.y) - 24, b: Math.max(a.y, b.y) + 24 };
      }
      function boxes(a, b) {
        return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      }
      function move(w) {
        const old = w.residents.map((r) => ({ id: r.id, x: r.x, y: r.y })), accepted = [];
        const order = w.residents.slice().sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));
        if (order.length) {
          const rotation = w.tick % order.length;
          order.push(...order.splice(0, rotation));
        }
        for (const r of order) {
          const p = w.pairs.find((p2) => p2.parentResidents.includes(r.id));
          const goal = p ? p.slots[p.parentResidents.indexOf(r.id)] : r.enabled && !r.rest && !r.nurseryUntil ? SPAWNS[(w.seed % SPAWNS.length + Number(r.id.slice(3)) * 7 + Math.floor(w.tick / 80) * 11) % SPAWNS.length] : r;
          const moves = MOVES.map(([dx, dy], i) => {
            const q = { x: r.x + dx, y: r.y + dy };
            const crowd = old.filter((o) => o.id !== r.id && Math.max(Math.abs(o.x - q.x), Math.abs(o.y - q.y)) < 96).length;
            return { q, i, rank: [Math.max(Math.abs(q.x - goal.x), Math.abs(q.y - goal.y)), Math.abs(q.x - goal.x) + Math.abs(q.y - goal.y), crowd, i === 0 ? 0 : Math.min(Math.abs(i - r.heading), 8 - Math.abs(i - r.heading)), i] };
          }).sort((a, b) => {
            for (let k = 0; k < 5; k++) if (a.rank[k] !== b.rank[k]) return a.rank[k] - b.rank[k];
            return 0;
          });
          for (const m of moves) {
            const sweep = box(r, m.q);
            if (!inside(m.q) || old.some((o) => o.id !== r.id && boxes(sweep, box(o, o))) || accepted.some((s) => boxes(sweep, s)) || liveSlots(w).some((s) => !(p ? p.parentResidents.includes(s.owner) : s.owner === r.id) && overlap(m.q, s))) continue;
            r.x = m.q.x;
            r.y = m.q.y;
            if (m.i) r.heading = m.i;
            accepted.push(sweep);
            break;
          }
        }
      }
      function step(w) {
        w.tick = inc(w.tick);
        for (const r of w.residents) if (r.nurseryUntil && w.tick >= r.nurseryUntil) {
          r.nurseryUntil = 0;
          event(w, "mature", [r.id]);
        }
        if (w.tick % 20 === 0) {
          for (const r of w.residents) {
            const delta = r.nurseryUntil || r.rest ? 4 : r.partner ? -2 : w.tick < r.readyAfterTick ? 2 : -1;
            r.energy = Math.max(0, Math.min(100, r.energy + delta));
            if (r.energy < 20) r.rest = true;
            else if (r.energy >= 60) r.rest = false;
          }
          for (const r of w.residents) if (r.energy < 20) cleanup(w, r);
        }
        for (const p of w.pairs.slice()) if (w.tick >= p.attemptDeadline || !p.arrived && w.tick >= p.approachDeadline) removePair(w, p, "pair-expired");
        for (const p of w.proposals.slice()) if (w.tick >= p.expiry) removeProposal(w, p, "proposal-expired");
        for (const r of w.residents) if (r.invitation && w.tick >= r.invitation.expiry) {
          r.invitation = null;
          cooldown(w, r, 20);
        }
        pairings(w);
        move(w);
        for (const p of w.pairs.slice()) {
          const rs = p.parentResidents.map((id) => resident(w, id));
          const at = rs.every((r, i) => r.x === p.slots[i].x && r.y === p.slots[i].y);
          if (at) p.arrived = true;
          p.dwell = at ? p.dwell + 1 : 0;
          if (p.dwell === 80) {
            if (w.proposals.length >= 16) fail("capacity", "Proposal cap");
            const expiry = deadline(w, 600), proposal = { id: "wp_" + p.id, parentResidents: p.parentResidents.slice(), artifactIds: rs.map((r) => r.artifactId), sourceHashes: rs.map((r) => r.sourceHash), intentHashes: rs.map((r) => r.intentHash), epochs: rs.map((r) => r.epoch), createdTick: w.tick, expiry };
            w.pairs = w.pairs.filter((x) => x.id !== p.id);
            w.proposals.push(proposal);
            for (const r of rs) {
              r.partner = null;
              r.invitation = null;
              r.pendingProposal = proposal.id;
              cooldown(w, r, 200);
            }
            event(w, "proposal-created", proposal.parentResidents);
          }
        }
      }
      function create(config) {
        plain(config);
        closed(config, Object.hasOwn(config, "affinity") ? ["worldKey", "seed", "affinity"] : ["worldKey", "seed"]);
        str(config.worldKey, 64);
        num(config.seed, 0, 4294967295);
        const affinity2 = config.affinity === void 0 ? "structural" : config.affinity;
        if (!["structural", "neutral"].includes(affinity2)) fail("invalid-input", "Unknown affinity mode");
        const normalized = { worldKey: config.worldKey, seed: config.seed, affinity: affinity2 };
        return { id: "qw_" + C2.sha256(Q2.canon(normalized)), worldKey: config.worldKey, seed: config.seed, affinity: affinity2, tick: 0, revision: 0, nextResident: 1, nextSequence: 1, residents: [], pairs: [], proposals: [], events: [], droppedEvents: 0, receipts: [] };
      }
      function validate(w) {
        plain(w);
        closed(w, ["id", "worldKey", "seed", "affinity", "tick", "revision", "nextResident", "nextSequence", "residents", "pairs", "proposals", "events", "droppedEvents", "receipts"]);
        str(w.id);
        str(w.worldKey, 64);
        if (!["structural", "neutral"].includes(w.affinity)) fail("invalid-world", "Affinity mode");
        num(w.seed, 0, 4294967295);
        for (const k of ["tick", "revision", "nextResident", "nextSequence", "droppedEvents"]) num(w[k]);
        for (const [k, cap] of [["residents", 32], ["pairs", 16], ["proposals", 16], ["events", 256], ["receipts", 256]]) if (!Array.isArray(w[k]) || w[k].length > cap) fail("invalid-world", "Collection bound");
        if (w.id !== "qw_" + C2.sha256(Q2.canon({ worldKey: w.worldKey, seed: w.seed, affinity: w.affinity }))) fail("invalid-world", "World config identity");
        if (w.residents.filter((r) => r.nurseryUntil > 0).length > 8) fail("invalid-world", "Nursery cap");
        const ids = /* @__PURE__ */ new Set();
        for (const r of w.residents) {
          closed(r, ["id", "artifactId", "sourceHash", "intentHash", "epoch", "enabled", "energy", "rest", "nurseryUntil", "readyAfterTick", "x", "y", "heading", "invitation", "partner", "pendingProposal", "roles", "gestureKind"]);
          str(r.id);
          if (!/^wr_[1-9][0-9]*$/.test(r.id) || Number(r.id.slice(3)) >= w.nextResident) fail("invalid-world", "Resident counter identity");
          if (ids.has(r.id) || !inside(r)) fail("invalid-world", "Resident identity/geometry");
          ids.add(r.id);
          artifact({ artifact: { id: r.artifactId, sourceHash: r.sourceHash, intentHash: r.intentHash, roles: r.roles, gestureKind: r.gestureKind } });
          for (const k of ["epoch", "nurseryUntil", "readyAfterTick"]) num(r[k]);
          num(r.energy, 0, 100);
          num(r.heading, 0, 8);
          if (typeof r.enabled !== "boolean" || typeof r.rest !== "boolean") fail("invalid-world", "Boolean resident state");
          if (r.invitation) {
            closed(r.invitation, ["partnerId", "expiry"]);
            if (!w.residents.some((a) => a.id === r.invitation.partnerId) || r.invitation.partnerId === r.id) fail("invalid-world", "Invitation owner");
            num(r.invitation.expiry);
          }
          if (r.partner !== null && !w.pairs.some((p) => p.parentResidents.includes(r.id) && p.parentResidents.includes(r.partner))) fail("invalid-world", "Pair backlink");
          if (r.pendingProposal !== null && !w.proposals.some((p) => p.id === r.pendingProposal && p.parentResidents.includes(r.id))) fail("invalid-world", "Proposal backlink");
        }
        for (let i = 0; i < w.residents.length; i++) for (let j = 0; j < i; j++) if (overlap(w.residents[i], w.residents[j])) fail("invalid-world", "Overlapping guards");
        const paired = /* @__PURE__ */ new Set(), pending = /* @__PURE__ */ new Set();
        for (const p of w.pairs) {
          closed(p, ["id", "parentResidents", "slots", "startTick", "approachDeadline", "attemptDeadline", "dwell", "arrived"]);
          str(p.id);
          if (!Array.isArray(p.parentResidents) || !Array.isArray(p.slots) || p.parentResidents.length !== 2 || p.slots.length !== 2 || p.parentResidents[0] === p.parentResidents[1] || overlap(...p.slots)) fail("invalid-world", "Pair shape");
          for (const slot of p.slots) closed(slot, ["x", "y"]);
          if (!CLEARINGS.some((c) => Q2.canon(c) === Q2.canon(p.slots))) fail("invalid-world", "Unknown clearing");
          num(p.startTick);
          num(p.approachDeadline);
          num(p.attemptDeadline);
          num(p.dwell, 0, 79);
          if (p.approachDeadline !== p.startTick + 160 || p.attemptDeadline !== p.startTick + 240 || typeof p.arrived !== "boolean") fail("invalid-world", "Immutable deadline");
          for (let i = 0; i < 2; i++) {
            const r = resident(w, p.parentResidents[i]);
            if (paired.has(r.id) || r.partner !== p.parentResidents[1 - i] || r.pendingProposal || r.invitation || !inside(p.slots[i])) fail("invalid-world", "Pair ownership");
            paired.add(r.id);
            if (!free(w, p.slots[i], p.parentResidents)) fail("invalid-world", "Invalid reservation");
          }
        }
        for (const p of w.proposals) {
          closed(p, ["id", "parentResidents", "artifactIds", "sourceHashes", "intentHashes", "epochs", "createdTick", "expiry"]);
          str(p.id);
          if (["parentResidents", "artifactIds", "sourceHashes", "intentHashes", "epochs"].some((k) => !Array.isArray(p[k]) || p[k].length !== 2) || p.parentResidents[0] === p.parentResidents[1] || p.expiry !== p.createdTick + 600) fail("invalid-world", "Proposal shape");
          num(p.createdTick);
          num(p.expiry);
          if (p.expiry <= w.tick) fail("invalid-world", "Expired retained proposal");
          for (let i = 0; i < 2; i++) {
            const r = resident(w, p.parentResidents[i]);
            if (pending.has(r.id) || r.pendingProposal !== p.id || r.partner || r.invitation || r.artifactId !== p.artifactIds[i] || r.sourceHash !== p.sourceHashes[i] || r.intentHash !== p.intentHashes[i] || r.epoch !== p.epochs[i]) fail("invalid-world", "Stale proposal");
            pending.add(r.id);
          }
        }
        for (const k of ["pairs", "proposals"]) if (new Set(w[k].map((p) => p.id)).size !== w[k].length) fail("invalid-world", "Duplicate lifecycle id");
        for (const e of w.events) {
          closed(e, ["tick", "kind", "residentIds"]);
          num(e.tick, 0, w.tick);
          str(e.kind, 64);
          if (!Array.isArray(e.residentIds) || e.residentIds.length > 32) fail("invalid-world", "Event residents");
          e.residentIds.forEach((id) => str(id));
        }
        let seq = 0;
        for (const receipt of w.receipts) {
          closed(receipt, ["sequence", "payloadHash", "result"]);
          num(receipt.sequence, 1, w.nextSequence - 1);
          hash(receipt.payloadHash);
          if (receipt.sequence <= seq) fail("invalid-world", "Receipt ordering");
          seq = receipt.sequence;
          const r = receipt.result, allowed = ["worldId", "revision", "sequence", "tick", "residentId", "proposalId", "appliedTicks"];
          if (!r || typeof r !== "object" || Array.isArray(r) || Object.keys(r).some((k) => !allowed.includes(k)) || ["worldId", "revision", "sequence", "tick"].some((k) => !Object.hasOwn(r, k))) fail("invalid-world", "Receipt acknowledgement");
          if (r.worldId !== w.id || r.sequence !== receipt.sequence) fail("invalid-world", "Receipt identity");
          num(r.revision, 1, w.revision);
          num(r.tick, 0, w.tick);
          if (Object.hasOwn(r, "residentId")) str(r.residentId);
          if (Object.hasOwn(r, "proposalId")) str(r.proposalId);
          if (Object.hasOwn(r, "appliedTicks")) num(r.appliedTicks, 1, 4);
        }
        if (bytes(w) > LIMITS.bytes) fail("capacity", "World byte cap");
        return true;
      }
      function finish(w, result) {
        validate(w);
        if (bytes(result) > 4096) fail("capacity", "Acknowledgement cap");
        return { world: w, result };
      }
      function command(world, input, context = {}) {
        plain(input);
        plain(context);
        closed(input, ["worldId", "expectedRevision", "sequence", "command"]);
        str(input.worldId);
        num(input.expectedRevision);
        num(input.sequence, 1);
        const c = input.command;
        if (!c || typeof c.kind !== "string") fail("invalid-input", "Command required");
        const schemas = { import: ["kind", "artifactId"], retire: ["kind", "residentId"], participate: ["kind", "residentId", "enabled"], invite: ["kind", "residentId", "partnerId"], cancelProposal: ["kind", "proposalId"], advance: ["kind", "ticks"] };
        if (!Object.hasOwn(schemas, c.kind)) fail("invalid-input", "Unknown command");
        closed(c, schemas[c.kind]);
        const payloadHash = C2.sha256(Q2.canon(input));
        validate(world);
        if (input.worldId !== world.id) fail("not-found", "Wrong world");
        const saved = world.receipts.find((r) => r.sequence === input.sequence);
        if (saved) {
          if (saved.payloadHash !== payloadHash) fail("conflict", "Sequence payload conflict");
          return { world: clone(world), result: clone(saved.result) };
        }
        if (input.sequence !== world.nextSequence) fail("sequence", input.sequence < world.nextSequence ? "Stale sequence" : "Sequence gap");
        if (input.expectedRevision !== world.revision) fail("stale", "Revision mismatch");
        const w = clone(world), result = { worldId: w.id, revision: inc(w.revision), sequence: input.sequence, tick: w.tick };
        w.nextSequence = inc(w.nextSequence);
        w.revision = result.revision;
        if (c.kind === "import") {
          str(c.artifactId);
          const a = artifact(context);
          if (a.id !== c.artifactId) fail("invalid-input", "Artifact identity mismatch");
          result.residentId = insert(w, a, false);
        } else {
          closed(context, []);
          if (c.kind === "advance") {
            num(c.ticks, 1, 4);
            for (let i = 0; i < c.ticks; i++) step(w);
            result.appliedTicks = c.ticks;
          } else if (c.kind === "cancelProposal") {
            str(c.proposalId);
            const p = w.proposals.find((p2) => p2.id === c.proposalId);
            if (!p) fail("not-found", "Proposal missing");
            removeProposal(w, p, "proposal-cancelled");
            result.proposalId = p.id;
          } else {
            const r = resident(w, c.residentId);
            result.residentId = r.id;
            if (c.kind === "retire") {
              r.epoch = inc(r.epoch);
              cleanup(w, r);
              w.residents = w.residents.filter((a) => a.id !== r.id);
              event(w, "retired", [r.id]);
            } else if (c.kind === "participate") {
              if (typeof c.enabled !== "boolean") fail("invalid-input", "enabled must be Boolean");
              if (r.enabled !== c.enabled) {
                r.epoch = inc(r.epoch);
                if (!c.enabled) cleanup(w, r);
                r.enabled = c.enabled;
              }
            } else {
              const b = resident(w, c.partnerId);
              if (r.id === b.id || !eligible(w, r) || !eligible(w, b)) fail("ineligible", "Invitation requires eligible distinct adults");
              r.invitation = { partnerId: b.id, expiry: deadline(w, 120) };
            }
          }
        }
        result.tick = w.tick;
        w.receipts.push({ sequence: input.sequence, payloadHash, result: clone(result) });
        if (w.receipts.length > 256) w.receipts.shift();
        return finish(w, result);
      }
      function admit(world, input, context) {
        plain(input);
        plain(context);
        closed(input, ["origin", "target", "childArtifactId"]);
        closed(input.target, ["kind", "worldId", "expectedRevision"]);
        closed(input.origin, ["kind", "worldId", "proposalId", "parentResidents", "epochs"]);
        validate(world);
        const o = input.origin, t = input.target;
        str(o.worldId);
        str(o.proposalId);
        str(t.worldId);
        if (!Array.isArray(o.parentResidents) || o.parentResidents.length !== 2 || !Array.isArray(o.epochs) || o.epochs.length !== 2) fail("invalid-input", "Two ordered origin parents required");
        o.parentResidents.forEach((id2) => str(id2));
        o.epochs.forEach((n) => num(n));
        if (o.kind !== "pairing" || t.kind !== "world" || o.worldId !== world.id || t.worldId !== world.id) fail("invalid-input", "World pairing origin required");
        num(t.expectedRevision);
        if (t.expectedRevision !== world.revision) fail("stale", "Revision mismatch");
        const a = artifact(context);
        str(input.childArtifactId);
        if (a.id !== input.childArtifactId) fail("invalid-input", "Child identity mismatch");
        const w = clone(world), p = w.proposals.find((p2) => p2.id === o.proposalId);
        if (!p || w.tick >= p.expiry) fail("stale", "Proposal missing/expired");
        if (Q2.canon(o.parentResidents) !== Q2.canon(p.parentResidents) || Q2.canon(o.epochs) !== Q2.canon(p.epochs)) fail("stale", "Ordered origin pins mismatch");
        const rs = p.parentResidents.map((id2) => resident(w, id2));
        if (rs.some((r, i) => !r.enabled || r.nurseryUntil || r.rest || r.energy < 50 || r.pendingProposal !== p.id || r.epoch !== p.epochs[i] || r.artifactId !== p.artifactIds[i] || r.sourceHash !== p.sourceHashes[i] || r.intentHash !== p.intentHashes[i])) fail("ineligible", "Birth parent pins/energy/participation");
        deadline(w, 200);
        w.revision = inc(w.revision);
        const id = insert(w, a, true);
        removeProposal(w, p, "proposal-consumed");
        for (const r of rs) {
          r.energy -= 30;
          cooldown(w, r, 200);
        }
        return finish(w, { worldId: w.id, revision: w.revision, tick: w.tick, residentId: id, parentResidents: p.parentResidents.slice() });
      }
      function annotate(world, artifactId, newIntentHash) {
        plain(world);
        str(artifactId);
        if (newIntentHash !== null) hash(newIntentHash);
        validate(world);
        const w = clone(world), rs = w.residents.filter((r) => r.artifactId === artifactId && r.intentHash !== newIntentHash);
        if (rs.length) {
          w.revision = inc(w.revision);
          for (const r of rs) {
            r.epoch = inc(r.epoch);
            cleanup(w, r);
            r.intentHash = newIntentHash;
          }
          event(w, "annotated", rs.map((r) => r.id));
        }
        return finish(w, { worldId: w.id, revision: w.revision, tick: w.tick });
      }
      const api = { LIMITS, SPAWNS, CLEARINGS, create, command, admit, annotate, validate };
      if (typeof module !== "undefined") module.exports = api;
      root.QuinelingWorld = api;
    })(typeof globalThis !== "undefined" ? globalThis : exports);
  }
});

// packages/agent-sdk/src/browser-crypto.ts
var import_ranch_crypto = __toESM(require_ranch_crypto());
function createHash(algorithm) {
  if (algorithm !== "sha256") throw new TypeError("Browser runtime supports SHA256 only");
  let text = "";
  return { update(value) {
    if (typeof value !== "string") throw new TypeError("Hash input must be text");
    text += value;
    return this;
  }, digest(encoding) {
    const hex = import_ranch_crypto.default.sha256(text);
    if (encoding === "hex") return hex;
    if (encoding !== void 0) throw new TypeError("Unsupported digest encoding");
    return { readUInt32BE(offset) {
      if (!Number.isInteger(offset) || offset < 0 || offset > 28) throw new RangeError("Digest offset");
      return parseInt(hex.slice(offset * 2, offset * 2 + 8), 16);
    } };
  } };
}
function randomUUID() {
  return globalThis.crypto.randomUUID();
}

// packages/agent-sdk/src/index.ts
var import_core = __toESM(require_core(), 1);
var import_thought = __toESM(require_thought(), 1);
var import_anatomy = __toESM(require_anatomy(), 1);
var import_qdl = __toESM(require_qdl(), 1);
var import_kernels = __toESM(require_kernels(), 1);
var import_chroma = __toESM(require_chroma(), 1);
var import_offspring = __toESM(require_offspring(), 1);
var import_ranch_world = __toESM(require_ranch_world(), 1);
var QuinelingError = class extends Error {
  constructor(code, message, path = "$") {
    super(message);
    this.code = code;
    this.path = path;
    this.name = "QuinelingError";
  }
  toJSON() {
    return { code: this.code, message: this.message, path: this.path };
  }
};
var copy = (value) => structuredClone(value);
function check(ok, code, message, path = "$") {
  if (!ok) throw new QuinelingError(code, message, path);
}
function inert(value, limit = 2 * 1024 * 1024) {
  let visits = 0;
  function visit(x, depth, seen, path) {
    check(++visits <= 4e5 && depth <= 64, "invalid-input", "JSON resource limit exceeded", path);
    if (x === null || typeof x === "boolean" || typeof x === "string") return;
    if (typeof x === "number") {
      check(Number.isFinite(x), "invalid-input", "Expected finite JSON numbers", path);
      return;
    }
    check(x && typeof x === "object", "invalid-input", "Expected JSON data", path);
    check(!seen.has(x), "invalid-input", "Cyclic JSON data", path);
    check(Array.isArray(x) ? Object.getPrototypeOf(x) === Array.prototype : Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null, "invalid-input", "Expected native JSON arrays or plain records", path);
    const keys = Object.keys(x), descriptors = Object.getOwnPropertyDescriptors(x);
    check(Reflect.ownKeys(x).length === keys.length + (Array.isArray(x) ? 1 : 0), "invalid-input", "Hidden or symbol properties are not JSON", path);
    if (Array.isArray(x)) check(keys.length === x.length && keys.every((k, i) => k === String(i)), "invalid-input", "Expected dense JSON arrays", path);
    const next = new Set(seen).add(x);
    for (const key of keys) {
      const childPath = Array.isArray(x) ? `${path}[${key}]` : /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
      check(!["__proto__", "constructor", "prototype"].includes(key), "invalid-input", "Unsafe property name", childPath);
      const d = descriptors[key];
      check(d && "value" in d, "invalid-input", "Accessors are not JSON", childPath);
      visit(d.value, depth + 1, next, childPath);
    }
  }
  visit(value, 0, /* @__PURE__ */ new Set(), "$");
  check(Buffer.byteLength(JSON.stringify(value)) <= limit, "invalid-input", "JSON byte budget exceeded");
}
function fields(value, required, optional = []) {
  check(value !== null && typeof value === "object" && !Array.isArray(value), "invalid-input", "Expected record");
  check(required.every((k) => Object.hasOwn(value, k)) && Object.keys(value).every((k) => required.includes(k) || optional.includes(k)), "invalid-input", "Unknown or missing fields");
}
function stripOptional(value, names) {
  check(value !== null && typeof value === "object" && !Array.isArray(value), "invalid-input", "Expected options record");
  check(Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, "invalid-input", "Expected plain options");
  const keys = Object.keys(value);
  check(Reflect.ownKeys(value).length === keys.length, "invalid-input", "Hidden or symbol options are not JSON");
  const entries = keys.map((key) => {
    const d = Object.getOwnPropertyDescriptor(value, key);
    check(d && "value" in d, "invalid-input", "Accessors are not JSON");
    return [key, d.value];
  });
  return Object.fromEntries(entries.filter(([key, v]) => !(v === void 0 && names.includes(key))));
}
function options(value = {}) {
  value = stripOptional(value, ["seed", "repeats"]);
  inert(value);
  fields(value, [], ["seed", "repeats"]);
  if (value.seed !== void 0) check(typeof value.seed === "number" && Number.isInteger(value.seed) && value.seed >= 0 && value.seed <= 4294967295, "invalid-input", "Seed must be uint32");
  if (value.repeats !== void 0) check(typeof value.repeats === "number" && Number.isInteger(value.repeats) && value.repeats >= 1 && value.repeats <= 8, "invalid-input", "Repeats must be 1\u20138");
  return value;
}
function wrap(code, fn) {
  try {
    return fn();
  } catch (e) {
    if (e instanceof QuinelingError) throw e;
    const err = e;
    const preserved = err?.code === "source-budget" ? "source-budget" : code;
    throw new QuinelingError(preserved, err?.message || String(e), err?.path || "$");
  }
}
function sourceId(source) {
  return "ql_" + createHash("sha256").update(source).digest("hex");
}
function ranchWrap(fn) {
  try {
    return fn();
  } catch (e) {
    if (e instanceof QuinelingError) throw e;
    const err = e;
    const code = err.code === "capacity" || err.code === "candidate-budget" || err.code === "lineage-budget" ? "resource-limit" : err.code === "source-budget" ? "source-budget" : err.code === "stale" || err.code === "parent-pin" ? "stale-state" : err.code === "invalid-input" ? "invalid-input" : "invalid-offspring";
    throw new QuinelingError(code, err.message || String(e), err.path || "$");
  }
}
var Runtime = class {
  #artifacts = /* @__PURE__ */ new Map();
  #records = /* @__PURE__ */ new Map();
  #artifactBytes = 0;
  #world = null;
  #derivations = /* @__PURE__ */ new Map();
  #admissions = /* @__PURE__ */ new Map();
  #derivationBytes = 0;
  #bodies = /* @__PURE__ */ new Map();
  #maxArtifacts;
  #maxRecords;
  constructor(config = {}) {
    config = stripOptional(config, ["maxArtifacts", "maxRecords"]);
    inert(config);
    fields(config, [], ["maxArtifacts", "maxRecords"]);
    this.#maxArtifacts = config.maxArtifacts ?? 128;
    this.#maxRecords = config.maxRecords ?? 256;
    check(Number.isInteger(this.#maxArtifacts) && this.#maxArtifacts >= 1 && this.#maxArtifacts <= 1024, "invalid-input", "maxArtifacts must be 1\u20131024");
    check(Number.isInteger(this.#maxRecords) && this.#maxRecords >= 1 && this.#maxRecords <= 4096, "invalid-input", "maxRecords must be 1\u20134096");
  }
  parse(thought) {
    check(typeof thought === "string" && thought.length <= 16384, "invalid-input", "Thought must be a string of at most 16384 characters");
    return copy(import_thought.default.parse(thought));
  }
  compile(intent, config = {}) {
    return this.#build(intent, config);
  }
  #build(intent, config = {}, sourceMap) {
    intent = stripOptional(intent, ["assumptions"]);
    inert(intent);
    check(Buffer.byteLength(import_core.default.canon(intent)) <= 131072, "resource-limit", "Intent exceeds 128 KiB", "$.intent");
    const opts = options(config);
    return wrap("invalid-intent", () => {
      const compiled = import_thought.default.compile(intent), seed = opts.seed ?? createHash("sha256").update(import_core.default.canon(compiled.graph)).digest().readUInt32BE(0);
      if (sourceMap) {
        check(sourceMap.length <= 128, "invalid-input", "Source map exceeds 128 clauses");
        const ids = new Set(compiled.graph.nodes.map((n) => n.id));
        for (const m of sourceMap) {
          fields(m, ["nodeId", "clause"], ["start", "end"]);
          check(typeof m.nodeId === "string" && ids.has(m.nodeId) && typeof m.clause === "string" && m.clause.length <= 16384, "invalid-input", "Source map must name actual operations");
          if (m.start !== void 0 || m.end !== void 0) check(typeof m.start === "number" && typeof m.end === "number" && Number.isInteger(m.start) && Number.isInteger(m.end) && m.start >= 0 && m.end >= m.start && m.end <= intent.thought.length, "invalid-input", "Source map span is outside thought");
        }
      }
      const generated = import_anatomy.default.generate(compiled.graph, seed), design = import_qdl.default.create();
      design.anatomy = generated.anatomy;
      design.motion.gesture = generated.gesture;
      const program = import_core.default.makeTaskProgram(compiled.graph, opts.repeats ?? 1, design);
      return this.#admit(program, { intent: copy(intent), contract: compiled.contract, sourceMap: sourceMap ?? compiled.sourceMap });
    });
  }
  create(thought, config = {}) {
    options(config);
    const parsed = this.parse(thought);
    if (parsed.status !== "supported") return { status: parsed.status, diagnostics: parsed.diagnostics, assumptions: parsed.assumptions };
    check(parsed.intent, "invalid-intent", "Supported proposal has no intent");
    const artifact = this.#build(parsed.intent, config, parsed.sourceMap);
    return { status: "supported", artifact, diagnostics: parsed.diagnostics, assumptions: parsed.assumptions };
  }
  /** Provider proposes data only; acceptance always rechecks the typed compiler. */
  async propose(thought, provider, config = {}, signal) {
    this.parse(thought);
    options(config);
    check(!signal?.aborted, "cancelled", "Proposal cancelled");
    const pending = provider.propose(thought, { signal });
    const proposal = signal ? await new Promise((resolve, reject) => {
      const abort = () => {
        signal.removeEventListener("abort", abort);
        reject(new QuinelingError("cancelled", "Proposal cancelled"));
      };
      signal.addEventListener("abort", abort, { once: true });
      pending.then((value) => {
        signal.removeEventListener("abort", abort);
        resolve(value);
      }, (error) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      });
      if (signal.aborted) abort();
    }) : await pending;
    check(!signal?.aborted, "cancelled", "Proposal cancelled");
    inert(proposal, 262144);
    fields(proposal, ["status", "diagnostics", "assumptions", "sourceMap"], ["intent"]);
    check(["supported", "clarify", "unsupported", "inconsistent"].includes(proposal.status), "invalid-input", "Unknown proposal status");
    check(Array.isArray(proposal.diagnostics) && Array.isArray(proposal.assumptions) && Array.isArray(proposal.sourceMap), "invalid-input", "Malformed proposal metadata");
    check(proposal.diagnostics.length <= 64 && proposal.assumptions.length <= 32 && proposal.assumptions.every((x) => typeof x === "string" && x.length <= 512), "invalid-input", "Malformed proposal assumptions");
    for (const d of proposal.diagnostics) {
      fields(d, ["code", "path", "message"]);
      check(["code", "path", "message"].every((k) => typeof d[k] === "string" && d[k].length <= 2048), "invalid-input", "Malformed proposal diagnostic");
    }
    if (proposal.status !== "supported") return { status: proposal.status, diagnostics: copy(proposal.diagnostics), assumptions: copy(proposal.assumptions) };
    check(proposal.intent, "invalid-intent", "Supported proposal has no intent");
    return { status: "supported", artifact: this.#build(proposal.intent, config, proposal.sourceMap.length ? proposal.sourceMap : void 0), diagnostics: copy(proposal.diagnostics), assumptions: copy(proposal.assumptions) };
  }
  inspect(artifactId) {
    return copy(this.#lookup(artifactId));
  }
  #lookup(id) {
    check(typeof id === "string", "invalid-input", "Expected artifact ID");
    const artifact = this.#artifacts.get(id);
    check(artifact, "unknown-artifact", "Artifact is not in this runtime");
    return artifact;
  }
  #prepareArtifact(program, metadata = {}) {
    inert(program, 65536);
    check(Array.isArray(program), "invalid-source", "Expected source AST");
    const source = import_core.default.canon(program);
    check(Buffer.byteLength(source) <= 65536, "source-budget", "Complete source exceeds 65536 bytes");
    const shape = wrap("invalid-source", () => import_core.default.describe(program)), graph = shape.graph;
    check(Array.isArray(graph.nodes), "invalid-source", "Agent SDK accepts task constructor programs");
    const reconstructed = wrap("invalid-source", () => import_core.default.makeTaskProgram(graph, shape.repeats, shape.design));
    check(import_core.default.canon(reconstructed) === source, "invalid-source", "Source must be a complete task constructor quine");
    import_kernels.default.validate(graph);
    import_qdl.default.validateBindings(shape.design, graph);
    check(shape.design.anatomy && shape.design.motion.gesture, "invalid-source", "Source needs assembly anatomy and gesture");
    const id = sourceId(source), existing = this.#artifacts.get(id);
    if (existing) {
      if (metadata.intent && existing.intent) check(import_core.default.canon(metadata.intent) === import_core.default.canon(existing.intent), "metadata-conflict", "Same source has different companion intent; use a separate Runtime to preserve both interpretations");
      if (metadata.intent && !existing.intent) {
        const enriched = { ...existing, intent: copy(metadata.intent), sourceMap: copy(metadata.sourceMap ?? []), ...metadata.contract ? { contract: { ...copy(metadata.contract), sourceBytes: Buffer.byteLength(source) } } : {} };
        const totalBytes2 = this.#artifactBytes - Buffer.byteLength(JSON.stringify(existing)) + Buffer.byteLength(JSON.stringify(enriched));
        check(totalBytes2 <= 33554432, "resource-limit", "Artifact store exceeds32MiB");
        return { artifact: enriched, write: true, totalBytes: totalBytes2 };
      }
      return { artifact: existing, write: false, totalBytes: this.#artifactBytes };
    }
    check(this.#artifacts.size < this.#maxArtifacts, "resource-limit", "Artifact store is full; use a new Runtime");
    const artifact = { id, source, program: JSON.parse(source), graph: copy(graph), design: copy(shape.design), sourceMap: copy(metadata.sourceMap ?? []), harmonics: import_core.default.encode(program), colors: import_core.default.encodeColors(program) };
    if (metadata.intent) artifact.intent = copy(metadata.intent);
    if (metadata.contract) artifact.contract = { ...copy(metadata.contract), sourceBytes: Buffer.byteLength(source) };
    const totalBytes = this.#artifactBytes + Buffer.byteLength(JSON.stringify(artifact));
    check(totalBytes <= 33554432, "resource-limit", "Artifact store exceeds32MiB");
    return { artifact, write: true, totalBytes };
  }
  #admit(program, metadata = {}) {
    const prepared = this.#prepareArtifact(program, metadata), result = copy(prepared.artifact), nextWorld = this.#annotationWorld(prepared.artifact, this.#world);
    if (prepared.write) {
      const next = new Map(this.#artifacts);
      next.set(prepared.artifact.id, prepared.artifact);
      this.#artifacts = next;
      this.#artifactBytes = prepared.totalBytes;
    }
    if (nextWorld) this.#world = nextWorld;
    return result;
  }
  run(artifactId) {
    return this.#execute(this.#lookup(artifactId));
  }
  #execute(artifact, parent) {
    check(this.#records.size < this.#maxRecords, "resource-limit", "Execution record store is full; use a new Runtime");
    const result = wrap("execution-failed", () => import_core.default.execute(copy(artifact.program)));
    check(result.emitted.length === 1 && result.emitted[0] === artifact.source, "execution-failed", "Constructor did not reproduce exact source");
    if (parent) check(import_core.default.canon(result.tasks.map((t) => t.output)) === import_core.default.canon(parent.result.tasks.map((t) => t.output)), "execution-failed", "Fresh child result differs from parent");
    const record = { id: "run_" + randomUUID(), artifactId: artifact.id, source: artifact.source, result: copy(result) };
    if (parent) record.parentRecordId = parent.id;
    this.#records.set(record.id, record);
    return copy(record);
  }
  reproduce(artifactId, recordId) {
    const parent = this.#lookup(artifactId);
    check(typeof recordId === "string", "invalid-input", "Expected record ID");
    const record = this.#records.get(recordId);
    check(record, "unknown-record", "Record is not in this runtime");
    check(record.artifactId === parent.id && record.source === parent.source, "stale-record", "Record belongs to a different source");
    check(record.result.emitted[0] === parent.source, "stale-record", "Record does not emit this source");
    const program = JSON.parse(record.result.emitted[0]);
    const artifact = this.#admit(program, parent);
    return { artifact, record: this.#execute({ ...artifact, program: JSON.parse(artifact.source) }, record) };
  }
  recover(input) {
    inert(input);
    fields(input, [], ["source", "harmonics", "colors"]);
    check(Object.keys(input).length === 1, "invalid-input", "Supply exactly one source or genome");
    return wrap("invalid-source", () => {
      const program = input.source !== void 0 ? (check(typeof input.source === "string" && Buffer.byteLength(input.source) <= 65536, "source-budget", "Source text exceeds byte budget"), JSON.parse(input.source)) : input.harmonics !== void 0 ? import_core.default.decode(input.harmonics) : import_core.default.decodeColors(input.colors);
      return this.#admit(program);
    });
  }
  #annotationWorld(artifact, world) {
    const previous = this.#artifacts.get(artifact.id);
    if (!world || !previous || previous.intent || !artifact.intent) return world;
    return ranchWrap(() => import_ranch_world.default.annotate(world, artifact.id, import_offspring.default.intentHash(artifact.intent))).world;
  }
  #requireWorld(id) {
    check(typeof id === "string", "invalid-input", "Expected world ID");
    check(this.#world && this.#world.id === id, "unknown-world", "World is not in this Runtime");
    return this.#world;
  }
  #socialArtifact(a) {
    return { id: a.id, sourceHash: a.id.slice(3), intentHash: import_offspring.default.intentHash(a.intent ?? null), roles: a.graph.nodes.map((n) => import_chroma.default.role(n.op)), gestureKind: a.design.motion.gesture.kind };
  }
  #candidate(input) {
    return ranchWrap(() => import_offspring.default.build(input.parents.map((p) => copy(this.#lookup(p.artifactId))), input));
  }
  offspringPreview(input) {
    inert(input);
    ranchWrap(() => import_offspring.default.validateInput(input));
    try {
      return { status: "ready", candidate: this.#candidate(input) };
    } catch (e) {
      if (!(e instanceof QuinelingError)) throw e;
      if (e.code === "unknown-artifact") throw e;
      return { status: "rejected", diagnostics: [{ code: e.code, path: e.path, message: e.message }] };
    }
  }
  offspringFrame(request) {
    request = stripOptional(request, ["options"]);
    inert(request);
    fields(request, ["input", "candidateId", "childSourceHash", "phase"], ["options"]);
    ranchWrap(() => import_offspring.default.validateInput(request.input));
    const c = this.#candidate(request.input);
    check(c.candidateId === request.candidateId && c.childSourceHash === request.childSourceHash, "stale-state", "Preview identity does not match rebuilt source");
    return { candidateId: c.candidateId, childSourceHash: c.childSourceHash, frame: this.#sampleFrame(c.child, request.phase, request.options ?? {}, false) };
  }
  offspringAdmit(request) {
    inert(request);
    fields(request, ["input", "candidateId", "childSourceHash", "target", "requestId"]);
    ranchWrap(() => import_offspring.default.validateInput(request.input));
    check(typeof request.requestId === "string" && request.requestId.length >= 1 && request.requestId.length <= 128, "invalid-input", "requestId must be1..128 characters", "$.requestId");
    check(typeof request.candidateId === "string" && /^qc_[0-9a-f]{64}$/.test(request.candidateId), "invalid-input", "Invalid candidate ID", "$.candidateId");
    check(typeof request.childSourceHash === "string" && /^[0-9a-f]{64}$/.test(request.childSourceHash), "invalid-input", "Invalid child source hash", "$.childSourceHash");
    fields(request.target, ["kind"], ["worldId", "expectedRevision"]);
    if (request.target.kind === "library") fields(request.target, ["kind"]);
    else {
      fields(request.target, ["kind", "worldId", "expectedRevision"]);
      check(request.target.kind === "world", "invalid-input", "Unknown admission target");
    }
    check(request.target.kind === "library" && request.input.origin.kind === "manual" || request.target.kind === "world" && request.input.origin.kind === "pairing", "invalid-input", "Admission origin and target must agree");
    const payload = import_core.default.canon(request), saved = this.#admissions.get(request.requestId);
    if (saved) {
      check(saved.payload === payload, "metadata-conflict", "Admission request key already binds a different payload");
      return copy(saved.result);
    }
    check(this.#admissions.size < 128, "resource-limit", "Admission receipt ledger is full; use a new Runtime");
    let priorWorld;
    if (request.target.kind === "world") {
      priorWorld = this.#requireWorld(request.target.worldId);
      const origin = request.input.origin;
      check(origin.kind === "pairing", "invalid-input", "World requires pairing origin");
      check(origin.worldId === priorWorld.id, "stale-state", "Origin world mismatch");
      const proposal = priorWorld.proposals.find((p) => p.id === origin.proposalId);
      check(proposal, "stale-state", "Proposal is missing or consumed");
      check(request.input.parents.every((p, i) => p.artifactId === proposal.artifactIds[i] && p.intentHash === proposal.intentHashes[i]), "stale-state", "Construction parents do not match the social proposal");
    }
    const c = this.#candidate(request.input);
    check(c.candidateId === request.candidateId && c.childSourceHash === request.childSourceHash, "stale-state", "Admission identity does not match rebuilt source");
    const prepared = this.#prepareArtifact(c.child.program, c.child), existing = this.#derivations.get(c.derivationId);
    if (existing) check(import_core.default.canon(existing) === import_core.default.canon(c.lineage), "metadata-conflict", "Derivation identity conflicts with stored evidence");
    check(existing || this.#derivations.size < 128, "resource-limit", "Derivation ledger is full; use a new Runtime");
    const derivationBytes = this.#derivationBytes + (existing ? 0 : Buffer.byteLength(JSON.stringify(c.lineage)));
    check(derivationBytes <= 4194304, "resource-limit", "Derivation ledger exceeds4MiB");
    let nextWorld = this.#annotationWorld(prepared.artifact, this.#world) ?? void 0, placement = {};
    if (priorWorld) {
      if (nextWorld !== priorWorld) nextWorld = { ...nextWorld, revision: priorWorld.revision };
      const staged = ranchWrap(() => import_ranch_world.default.admit(nextWorld, { origin: request.input.origin, target: request.target, childArtifactId: prepared.artifact.id }, { artifact: this.#socialArtifact(prepared.artifact) }));
      nextWorld = staged.world;
      placement = { worldId: staged.result.worldId, residentId: staged.result.residentId, revision: staged.result.revision, tick: staged.result.tick };
    }
    const ack = { requestId: request.requestId, candidateId: c.candidateId, derivationId: c.derivationId, artifactId: prepared.artifact.id, childSourceHash: c.childSourceHash, ...placement };
    check(Buffer.byteLength(JSON.stringify(ack)) <= 4096, "resource-limit", "Admission acknowledgement exceeds4KiB");
    const returned = copy(ack), nextArtifacts = new Map(this.#artifacts), nextDerivations = new Map(this.#derivations), nextAdmissions = new Map(this.#admissions);
    if (prepared.write) nextArtifacts.set(prepared.artifact.id, prepared.artifact);
    if (!existing) nextDerivations.set(c.derivationId, copy(c.lineage));
    nextAdmissions.set(request.requestId, { payload, result: copy(ack) });
    this.#artifacts = nextArtifacts;
    this.#artifactBytes = prepared.totalBytes;
    this.#derivations = nextDerivations;
    this.#derivationBytes = derivationBytes;
    this.#admissions = nextAdmissions;
    if (nextWorld) this.#world = nextWorld;
    return returned;
  }
  lineage(request = {}) {
    request = stripOptional(request, ["artifactId", "cursor", "limit"]);
    inert(request);
    fields(request, [], ["artifactId", "cursor", "limit"]);
    if (request.artifactId !== void 0) {
      check(typeof request.artifactId === "string", "invalid-input", "Expected artifact ID");
      this.#lookup(request.artifactId);
    }
    if (request.cursor !== void 0) check(typeof request.cursor === "number", "invalid-input", "Cursor must be a number");
    if (request.limit !== void 0) check(typeof request.limit === "number", "invalid-input", "Limit must be a number");
    const cursor = request.cursor ?? 0, limit = request.limit ?? 16;
    check(typeof cursor === "number" && typeof limit === "number", "invalid-input", "Lineage cursor and limit must be integers");
    check(Number.isInteger(cursor) && cursor >= 0 && cursor <= this.#derivations.size, "invalid-input", "Lineage cursor is outside this session");
    check(Number.isInteger(limit) && limit >= 1 && limit <= 32, "invalid-input", "Lineage page limit must be1..32");
    const rows = [...this.#derivations.values()], page = [];
    let index = cursor;
    while (index < rows.length && page.length < limit) {
      const d = rows[index++];
      if (!request.artifactId || d.childArtifactId === request.artifactId) page.push(copy(d));
    }
    return { derivations: page, ...index < rows.length ? { nextCursor: index } : {} };
  }
  annotate(request) {
    inert(request);
    fields(request, ["artifactId", "intent"]);
    const prior = this.#lookup(request.artifactId), compiled = wrap("invalid-intent", () => import_thought.default.compile(request.intent)), graph = copy(prior.graph);
    delete graph.design;
    check(import_core.default.canon(compiled.graph) === import_core.default.canon(graph), "metadata-conflict", "Companion does not match exact source task graph");
    const prepared = this.#prepareArtifact(prior.program, { intent: copy(request.intent), contract: compiled.contract, sourceMap: compiled.sourceMap });
    const nextWorld = this.#world ? ranchWrap(() => import_ranch_world.default.annotate(this.#world, prior.id, import_offspring.default.intentHash(request.intent))).world : null, returned = copy(prepared.artifact), next = new Map(this.#artifacts);
    if (prepared.write) next.set(prior.id, prepared.artifact);
    this.#artifacts = next;
    this.#artifactBytes = prepared.totalBytes;
    if (nextWorld) this.#world = nextWorld;
    return returned;
  }
  worldCreate(request) {
    request = stripOptional(request, ["affinity"]);
    inert(request);
    fields(request, ["worldKey", "seed"], ["affinity"]);
    if (request.affinity !== void 0) check(request.affinity === "structural" || request.affinity === "neutral", "invalid-input", "Unknown affinity mode");
    const next = ranchWrap(() => import_ranch_world.default.create(request));
    if (this.#world) {
      check(this.#world.id === next.id, "metadata-conflict", "Runtime already contains a different world");
      return copy(this.#world);
    }
    const returned = copy(next);
    this.#world = next;
    return returned;
  }
  worldInspect(worldId) {
    return copy(this.#requireWorld(worldId));
  }
  worldCommand(request) {
    inert(request);
    fields(request, ["worldId", "expectedRevision", "sequence", "command"]);
    fields(request.command, ["kind"], ["artifactId", "residentId", "enabled", "partnerId", "proposalId", "ticks"]);
    const prior = this.#requireWorld(request.worldId);
    let context = {};
    if (request.command.kind === "import") context = { artifact: this.#socialArtifact(this.#lookup(request.command.artifactId)) };
    const staged = ranchWrap(() => import_ranch_world.default.command(prior, request, context)), returned = copy(staged.result);
    this.#world = staged.world;
    return returned;
  }
  frame(artifactId, phase, config = {}) {
    return this.#sampleFrame(this.#lookup(artifactId), phase, config, true);
  }
  #sampleFrame(artifact, phase, config = {}, cache = false) {
    config = stripOptional(config, ["budget", "crests"]);
    inert(config);
    fields(config, [], ["budget", "crests"]);
    check(typeof phase === "number" && Number.isFinite(phase) && Math.abs(phase) <= 1e9, "invalid-input", "Phase must be finite with magnitude \u22641e9", "$.phase");
    if (config.budget !== void 0) check(typeof config.budget === "number" && Number.isInteger(config.budget) && config.budget >= 4e3 && config.budget <= 24e3, "invalid-input", "Frame budget must be an integer in [4000,24000]", "$.options.budget");
    if (config.crests !== void 0) check(typeof config.crests === "number" && Number.isInteger(config.crests) && config.crests >= 2 && config.crests <= 4, "invalid-input", "Frame crests must be an integer in [2,4]", "$.options.crests");
    let body = cache ? this.#bodies.get(artifact.id) : void 0;
    if (!body) {
      body = import_anatomy.default.compile(artifact.design.anatomy, artifact.graph.nodes, artifact.design.motion.gesture);
      if (cache) this.#bodies.set(artifact.id, body);
    }
    const f = wrap("invalid-input", () => import_anatomy.default.frame(body, phase, config));
    return { points: Array.from(f.points), normals: Array.from(f.normals), owners: Array.from(f.owners), ridges: copy(f.ridges), nodeIds: artifact.graph.nodes.map((n) => n.id), nodeColors: artifact.graph.nodes.map((_, i) => import_chroma.default.colorFor({ design: artifact.design, nodes: artifact.graph.nodes }, i)), nodeRoles: artifact.graph.nodes.map((n) => import_chroma.default.role(n.op)) };
  }
  dispatch(request) {
    inert(request);
    check(request && typeof request === "object", "invalid-input", "Expected request");
    switch (request.operation) {
      case "parse":
        fields(request, ["operation", "thought"]);
        return this.parse(request.thought);
      case "create":
        fields(request, ["operation", "thought"], ["options"]);
        return this.create(request.thought, request.options);
      case "compile":
        fields(request, ["operation", "intent"], ["options"]);
        return this.compile(request.intent, request.options);
      case "inspect":
        fields(request, ["operation", "artifactId"]);
        return this.inspect(request.artifactId);
      case "run":
        fields(request, ["operation", "artifactId"]);
        return this.run(request.artifactId);
      case "reproduce":
        fields(request, ["operation", "artifactId", "recordId"]);
        return this.reproduce(request.artifactId, request.recordId);
      case "recover":
        fields(request, ["operation", "recovery"]);
        return this.recover(request.recovery);
      case "frame":
        fields(request, ["operation", "artifactId", "phase"], ["options"]);
        return this.frame(request.artifactId, request.phase, request.options);
      case "offspringPreview":
        fields(request, ["operation", "input"]);
        return this.offspringPreview(request.input);
      case "offspringFrame":
        fields(request, ["operation", "input", "candidateId", "childSourceHash", "phase"], ["options"]);
        return this.offspringFrame({ input: request.input, candidateId: request.candidateId, childSourceHash: request.childSourceHash, phase: request.phase, options: request.options });
      case "offspringAdmit":
        fields(request, ["operation", "input", "candidateId", "childSourceHash", "target", "requestId"]);
        return this.offspringAdmit({ input: request.input, candidateId: request.candidateId, childSourceHash: request.childSourceHash, target: request.target, requestId: request.requestId });
      case "lineage":
        fields(request, ["operation"], ["artifactId", "cursor", "limit"]);
        return this.lineage({ artifactId: request.artifactId, cursor: request.cursor, limit: request.limit });
      case "annotate":
        fields(request, ["operation", "artifactId", "intent"]);
        return this.annotate({ artifactId: request.artifactId, intent: request.intent });
      case "worldCreate":
        fields(request, ["operation", "worldKey", "seed"], ["affinity"]);
        return this.worldCreate({ worldKey: request.worldKey, seed: request.seed, affinity: request.affinity });
      case "worldInspect":
        fields(request, ["operation", "worldId"]);
        return this.worldInspect(request.worldId);
      case "worldCommand":
        fields(request, ["operation", "worldId", "expectedRevision", "sequence", "command"]);
        return this.worldCommand({ worldId: request.worldId, expectedRevision: request.expectedRevision, sequence: request.sequence, command: request.command });
      default:
        throw new QuinelingError("invalid-input", "Unknown operation");
    }
  }
  exchange(request) {
    return { operation: request.operation, result: this.dispatch(request) };
  }
};
var capabilities = Object.freeze([...import_thought.default.capabilities]);
var examples = Object.freeze(copy(import_thought.default.examples));

// packages/agent-sdk/src/browser-entry.ts
var import_anatomy2 = __toESM(require_anatomy(), 1);
var import_qdl2 = __toESM(require_qdl(), 1);
var import_core2 = __toESM(require_core(), 1);
var import_kernels2 = __toESM(require_kernels(), 1);
var import_offspring2 = __toESM(require_offspring(), 1);
var import_ranch_world2 = __toESM(require_ranch_world(), 1);
if (!globalThis.Buffer) globalThis.Buffer = { byteLength(text) {
  return new TextEncoder().encode(text).length;
} };
var export_Anatomy = import_anatomy2.default;
var export_QDL = import_qdl2.default;
var export_QuinelingKernels = import_kernels2.default;
var export_QuinelingOffspring = import_offspring2.default;
var export_QuinelingWorld = import_ranch_world2.default;
var export_Quinelings = import_core2.default;
export {
  export_Anatomy as Anatomy,
  export_QDL as QDL,
  QuinelingError,
  export_QuinelingKernels as QuinelingKernels,
  export_QuinelingOffspring as QuinelingOffspring,
  export_QuinelingWorld as QuinelingWorld,
  export_Quinelings as Quinelings,
  Runtime
};
//# sourceMappingURL=quinelings-runtime.js.map
