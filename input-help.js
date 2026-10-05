/** Field explanations for the frozen QDL 1 examples. Values remain user supplied. */
const current = 'Enter true if you consider these supplied facts current, or false if they are out of date. The program trusts this flag; it does not check the outside world. A false flag prevents the simulated action proposal.';
const records = 'A list of reports. Each report has id (report label), source (reporter label), claim (what is being checked), value (true for yes, false for no, or null for unknown), kind ("observation", "testimony", or "inference"), observedAt (time in ticks), and revision (update number). Times and revisions are whole numbers at least zero. Source labels do not authenticate reporters. Example: [{"id":"a","source":"sensor","claim":"ready","value":true,"kind":"observation","observedAt":0,"revision":2}].';
const clock = 'Time and update limits: now is the supplied current time, maxAge is the oldest acceptable report age in ticks, and minRevision is the lowest acceptable update number. All three are whole numbers at least zero. A tick is one time step in this example. Reports exactly at the age or revision limit qualify; future reports do not.';
const help = {
  'water-total': {
    readings: 'Water measurements in liters. Enter a list of numbers at least zero, such as [1.5, 2, 0.5], which totals 4 liters. Decimals are allowed. [] means no readings and gives a total and count of zero. Each run uses this list only; it does not read a sensor or accumulate earlier totals.'
  },
  'route-preview': {
    streets: 'A map with four named junctions: A, B, C, and D. Each list names the junctions reachable directly from that junction. Connections are directional: listing B under A does not create a return connection. Example: {"A":["C","B"],"B":["D"],"C":["D"],"D":[]}. The program finds a route from A to D with the fewest connections; list order breaks ties.',
    blocked: 'Junction labels the route must avoid. Enter [] for no closures, ["C"] to close C, or ["D"] to block the destination. Labels are quoted text. Blocking A or D prevents a route.',
    current
  },
  'craft-quote': {
    inventory: 'Available materials, as a list with a unique id and an amount for each entry. Amounts are whole item counts at least zero. Example: [{"id":"ore","amount":7},{"id":"wood","amount":8}]. The recipe looks for exactly "ore" and "wood"; a missing material counts as zero. One batch needs two ore and one wood.',
    requested: 'How many batches you want. Enter a whole number at least zero; the starting example requests 4. The quote may offer fewer when materials or space run out. Zero requests no work.',
    freeCapacity: 'Available storage spaces, as a whole number at least zero. Each batch requires two spaces. The starting value 5 fits two batches; changing it to 8 allows up to four by space alone. Material limits still apply.'
  },
  'confirmed-checkpoints': {
    records: records + ' This example checks the claims "haul" and "arrival". Only reports whose kind is "observation" qualify. Both claims need support without a qualifying denial before completion is true.',
    clock: clock + ' The starting limits are {"now":12,"maxAge":2,"minRevision":1}.'
  },
  'evidence-ledger': {
    records: records + ' This example accepts all three report kinds and preserves conflicting yes/no reports, including contradictions from one source.',
    claim: 'The exact claim label to assess, as quoted text. The starting value is "ready". Reports with other claim labels are excluded from this assessment.',
    clock: clock + ' The starting limits are {"now":10,"maxAge":10,"minRevision":2}.'
  },
  'trade-preview': {
    offers: 'A list of offers with unique id labels. Each has price (crystals per item, a number at least zero), expiry (last valid tick), and available (item count). Expiry and available are whole numbers at least zero. Example: [{"id":"offer","price":3,"expiry":10,"available":5}]. The program selects exactly "offer". Crystals are symbolic units in this example; no payment occurs.',
    now: 'The supplied current time in ticks, as a whole number at least zero. A tick is one example time step. Starting value: 10. An offer remains valid at its expiry tick; advancing to 11 expires the starting offer.',
    quantity: 'Requested sale quantity, as a whole item count at least zero. Starting value: 2. It must be positive and fit the inventory, offer availability, and allowance. If any check fails, the quote returns zero rather than a partial sale.',
    inventory: 'Items available in your supplied inventory, as a whole number at least zero. Starting value: 5. The requested quantity must not exceed this count.',
    allowance: 'The largest item quantity this quote is allowed to use, as a whole number at least zero. Starting value: 2. A quantity above this allowance fails the quote; this number grants no outside-world authority.'
  },
  'needs-triage': {
    foods: 'A list of foods with unique id labels. Each entry has edible and fresh (true or false), and restoration (a whole score at least zero). Example: [{"id":"b","edible":true,"fresh":true,"restoration":8},{"id":"a","edible":true,"fresh":true,"restoration":8}]. The highest restoration score among fresh edible foods wins; ascending id order breaks ties. A score of zero remains eligible under this program.',
    hunger: 'A supplied hunger score, as a whole number at least zero. Starting value: 4. Any positive score allows the hunger check to pass; zero prevents the eating proposal. Larger scores do not change the food ranking.',
    current
  },
  'receipt-reconciliation': {
    receipts: 'A list of supplied attempt reports. Each has id (report label), operation (work label, such as "craft"), attempt (which try), sequence (update number), status ("confirmed", "failed", "pending", or "unknown"), and units (confirmed item count). Sequence and units are whole numbers at least zero. Example: [{"id":"a","operation":"craft","attempt":"attempt1","sequence":1,"status":"confirmed","units":1}]. The program reviews this history without submitting work. Pending or unknown attempts withhold retry advice; repeated acknowledgements do not add confirmed units again.',
    policy: 'Rules for reviewing the supplied history. operation selects the matching work label; requested is the target item count, a whole number at least zero; maxAttempts is a whole attempt limit from 1 to 8. Example: {"operation":"craft","requested":3,"maxAttempts":4}. This returns advice about retrying; it does not retry anything.'
  },
  'gather-readiness': {
    checks: 'Exactly six true/false values, in this order: sufficient skill, usable route, reservation, capacity, owner permission, and remaining uses. Example: [true,true,true,true,true,true]. Every check must be true, and the observation must be recent enough, for the local collection proposal.',
    observedAt: 'When the supplied checks were observed, in whole ticks at least zero. A tick is one example time step. Starting value: 10. An observation after now is rejected by the readiness check.',
    now: 'The supplied current time, in whole ticks at least zero. Starting value: 12. With observedAt 10 and maxAge 2, advancing now to 13 makes the observation too old.',
    maxAge: 'The greatest acceptable observation age, in whole ticks at least zero. Starting value: 2. An age exactly equal to this limit still passes; a larger age fails.'
  },
  'work-schedule': {
    jobs: 'A list of jobs. Each has id (a unique job label), depends (labels of jobs that must finish first), and duration (whole ticks at least zero). Example: [{"id":"a","depends":[],"duration":3},{"id":"b","depends":["a"],"duration":2}]. A tick is one example time step. Dependencies must name supplied jobs and cannot form a loop. Independent jobs can overlap; the estimate assumes enough capacity to run them together.',
    deadline: 'The latest acceptable finishing time, in whole ticks at least zero, measured from start time zero. Starting value: 5. Finishing exactly at the deadline passes. This is a calculation, not a reservation of workers or equipment.'
  }
};

function describeType(type = {}) {
  switch (type.kind) {
    case 'number': {
      let text = type.integer ? 'a whole number' : 'a number (decimals allowed)';
      if (type.min !== undefined) text += ` at least ${type.min}`;
      if (type.max !== undefined) text += ` no greater than ${type.max}`;
      if (type.unit && type.unit !== 'one') text += ` in ${type.unit}`;
      return text;
    }
    case 'boolean': return 'true for yes or false for no, without quotation marks';
    case 'string': return type.enum ? `one of ${type.enum.map(x => JSON.stringify(x)).join(', ')}` : 'text enclosed in double quotation marks';
    case 'optional': return `${describeType(type.element)}, or null for an unavailable value`;
    case 'array': {
      let text = `a list enclosed in square brackets, with commas between entries; each entry is ${describeType(type.element)}`;
      if (type.minLength !== undefined) text += `; at least ${type.minLength} entries`;
      if (type.maxLength !== undefined) text += `; at most ${type.maxLength} entries`;
      if (type.uniqueBy) text += `; each entry must have a different ${type.uniqueBy}`;
      return text;
    }
    case 'record': return `named fields enclosed in braces: ${Object.entries(type.fields || {}).map(([name, value]) => `${name} is ${describeType(value)}`).join('; ')}. Put double quotation marks around field names and separate fields with commas`;
    default: return 'a JSON value: quoted text, a number, true or false, null, a list in square brackets, or named fields in braces';
  }
}

export function inputHelp(recipeId, port) {
  const name = typeof port === 'string' ? port : port?.name ?? port?.id;
  return help[recipeId]?.[name] ?? `Supply ${describeType(typeof port === 'object' ? port?.type : undefined)}. Editing this value prepares new input; run the example to calculate its result.`;
}
