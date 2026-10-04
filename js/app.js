(function () {
  "use strict";
  /* ================= helpers ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const ftin = (f) => {
    const t = Math.round(f * 12),
      a = Math.floor(t / 12),
      b = t % 12;
    return b ? `${a}′ ${b}″` : `${a}′`;
  };
  const fdate = (t) =>
    new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const ago = (t) => {
    const m = Math.round((Date.now() - t) / 6e4);
    if (m < 1) return "just now";
    if (m < 60) return m + " min ago";
    const h = Math.round(m / 60);
    if (h < 24) return h + " h ago";
    const d = Math.round(h / 24);
    return d < 30 ? d + " d ago" : fdate(t);
  };
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#d9d9d1";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear();

  /* ================= catalog & materials ================= */
  const CATALOG = {
    base_cab: {
      name: "Base cabinet",
      cat: "Kitchen",
      w: 3,
      d: 2,
      h: 2.9,
      price: 1450,
      slots: ["body", "hardware", "top"],
      wall: true,
    },
    wall_cab: {
      name: "Wall cabinet",
      cat: "Kitchen",
      w: 3,
      d: 1.1,
      h: 2.5,
      price: 980,
      slots: ["body", "hardware"],
      wall: true,
      upper: true,
    },
    tall_cab: {
      name: "Tall pantry",
      cat: "Kitchen",
      w: 2,
      d: 2,
      h: 7.5,
      price: 2600,
      slots: ["body", "hardware"],
      wall: true,
    },
    island: {
      name: "Kitchen island",
      cat: "Kitchen",
      w: 8,
      d: 3.5,
      h: 3,
      price: 6800,
      slots: ["body", "top", "hardware"],
    },
    stool: {
      name: "Counter stool",
      cat: "Kitchen",
      w: 1.4,
      d: 1.4,
      h: 2.6,
      price: 380,
      slots: ["body", "hardware"],
      loose: true,
    },
    shelving: {
      name: "Library wall",
      cat: "Living",
      w: 8,
      d: 1.25,
      h: 8,
      price: 7200,
      slots: ["body", "hardware"],
      wall: true,
    },
    fluted: {
      name: "Fluted wall panel",
      cat: "Living",
      w: 6,
      d: 0.35,
      h: 8,
      price: 3100,
      slots: ["body"],
      wall: true,
    },
    console: {
      name: "Media console",
      cat: "Living",
      w: 6,
      d: 1.5,
      h: 1.8,
      price: 2300,
      slots: ["body", "hardware"],
      wall: true,
    },
    sofa: {
      name: "Three-seat sofa",
      cat: "Living",
      w: 7.5,
      d: 3.2,
      h: 2.8,
      price: 3900,
      slots: ["fabric", "body"],
      loose: true,
    },
    dining: {
      name: "Dining table",
      cat: "Dining",
      w: 7,
      d: 3.3,
      h: 2.5,
      price: 4200,
      slots: ["body"],
      loose: true,
    },
    chair: {
      name: "Dining chair",
      cat: "Dining",
      w: 1.6,
      d: 1.7,
      h: 2.8,
      price: 650,
      slots: ["body", "fabric"],
      loose: true,
    },
    bed: {
      name: "Queen platform bed",
      cat: "Bedroom",
      w: 5.6,
      d: 7.2,
      h: 4.2,
      price: 3600,
      slots: ["body", "fabric"],
      wall: true,
    },
    wardrobe: {
      name: "Wardrobe",
      cat: "Bedroom",
      w: 6,
      d: 2,
      h: 8,
      price: 5400,
      slots: ["body", "hardware"],
      wall: true,
    },
    pendant: {
      name: "Pendant light",
      cat: "Lighting",
      w: 1.2,
      d: 1.2,
      h: 3,
      price: 420,
      slots: ["hardware"],
      loose: true,
      hang: true,
    },
  };
  const FINISHES = {
    oak: { name: "White oak", hex: "#C39C6E", wood: true, mult: 1, rough: 0.72 },
    walnut: { name: "American walnut", hex: "#5C3E2A", wood: true, mult: 1.25, rough: 0.6 },
    ebony: { name: "Ebonized oak", hex: "#2C2723", wood: true, mult: 1.15, rough: 0.55 },
    chalk: { name: "Chalk lacquer", hex: "#E4E1D8", mult: 1.1, rough: 0.38 },
    sage: { name: "Sage lacquer", hex: "#89977F", mult: 1.1, rough: 0.38 },
    ink: { name: "Ink blue lacquer", hex: "#2B3747", mult: 1.1, rough: 0.38 },
  };
  const HARDWARE = {
    brass: { name: "Brushed brass", hex: "#B8914C", metal: 0.75, rough: 0.32, add: 0 },
    black: { name: "Matte black", hex: "#1F1F1E", metal: 0.4, rough: 0.65, add: 0 },
    nickel: { name: "Polished nickel", hex: "#C8CBCC", metal: 0.85, rough: 0.18, add: 45 },
  };
  const TOPS = {
    calacatta: { name: "Calacatta marble", hex: "#EFEDE8", marble: true, rough: 0.22, add: 0.2 },
    granite: { name: "Honed black granite", hex: "#242423", rough: 0.5, add: 0.1 },
    quartz: { name: "White quartz", hex: "#E9E8E3", rough: 0.3, add: 0.06 },
  };
  const FABRICS = {
    boucle: { name: "Ivory bouclé", hex: "#E2DCCF", rough: 1, add: 0 },
    leather: { name: "Cognac leather", hex: "#8A4E28", rough: 0.5, add: 0.22 },
    velvet: { name: "Olive velvet", hex: "#5C623F", rough: 0.88, add: 0.12 },
  };
  const SLOT_SETS = { body: FINISHES, hardware: HARDWARE, top: TOPS, fabric: FABRICS };
  const SLOT_LABEL = {
    body: "Wood or lacquer",
    hardware: "Hardware",
    top: "Countertop",
    fabric: "Upholstery",
  };
  const DEF = { body: "oak", hardware: "brass", top: "calacatta", fabric: "boucle" };
  const WALLS = {
    white: { name: "Gallery white", hex: "#ECEAE4" },
    greige: { name: "Greige", hex: "#CBC4B7" },
    forest: { name: "Forest", hex: "#3F4A40" },
    clay: { name: "Clay", hex: "#B58C70" },
    charcoal: { name: "Charcoal", hex: "#48494A" },
  };
  const FLOORS = {
    oak: { name: "White oak plank", hex: "#C3A077" },
    walnut: { name: "Walnut plank", hex: "#5A3D2A" },
    concrete: { name: "Polished concrete", hex: "#A2A09A" },
    marble: { name: "Honed marble", hex: "#EEEBE5" },
  };
  const STATUS = {
    draft: "Draft",
    submitted: "Submitted",
    in_review: "In review",
    quoted: "Quote sent",
    approved: "Approved",
  };
  const STAGES = ["Started", "Work in progress", "Milestones", "Completed"];
  const ROOMTYPE = { kitchen: "Kitchen", living: "Living room", bedroom: "Bedroom", empty: "Custom room" };

  /* ================= state ================= */
  const KEY = "fatalier-haastrup-v1";
  let S;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  }
  function load() {
    try {
      const r = localStorage.getItem(KEY);
      if (r) {
        const o = JSON.parse(r);
        if (o && o.v === 1) return o;
      }
    } catch (e) {}
    return seed();
  }
  function priceOf(type) {
    const o = S.catalog[type];
    return o && o.price != null ? o.price : CATALOG[type].price;
  }
  function typeActive(type) {
    const o = S.catalog[type];
    return !(o && o.active === false);
  }
  function optActive(slot, key) {
    return !S.inactive.includes(slot + ":" + key);
  }

  function newItem(type, x, z, q, finish) {
    const f = {};
    CATALOG[type].slots.forEach((s) => (f[s] = (finish && finish[s]) || DEF[s]));
    return { id: uid("i"), type, x, z, q: q || 0, finish: f };
  }
  function makeTemplate(t) {
    const I = newItem;
    if (t === "kitchen") {
      const W = 18,
        D = 14,
        bz = -D / 2 + 1,
        wz = -D / 2 + 0.55;
      return {
        room: { template: t, w: W, d: D, wall: "white", floor: "oak" },
        items: [
          I("tall_cab", -8, bz),
          I("base_cab", -5.5, bz),
          I("base_cab", -2.5, bz),
          I("base_cab", 0.5, bz),
          I("base_cab", 3.5, bz),
          I("tall_cab", 6, bz),
          I("wall_cab", -5.5, wz),
          I("wall_cab", -2.5, wz),
          I("wall_cab", 0.5, wz),
          I("wall_cab", 3.5, wz),
          I("island", -1, 0.5),
          I("stool", -3.5, 3),
          I("stool", -1, 3),
          I("stool", 1.5, 3),
          I("pendant", -3.5, 0.5),
          I("pendant", -1, 0.5),
          I("pendant", 1.5, 0.5),
        ],
      };
    }
    if (t === "living") {
      const W = 20,
        D = 16;
      return {
        room: { template: t, w: W, d: D, wall: "greige", floor: "oak" },
        items: [
          I("shelving", 0, -D / 2 + 0.625),
          I("sofa", 2, 0, 2),
          I("console", -W / 2 + 0.75, -3, 1),
          I("dining", -6.3, 4.6),
          I("chair", -8.2, 2.3),
          I("chair", -4.4, 2.3),
          I("chair", -8.2, 6.9, 2),
          I("chair", -4.4, 6.9, 2),
          I("pendant", -6.3, 4.6),
        ],
      };
    }
    if (t === "bedroom") {
      const W = 16,
        D = 14;
      return {
        room: { template: t, w: W, d: D, wall: "greige", floor: "walnut" },
        items: [
          I("bed", 0, -D / 2 + 3.6),
          I("wardrobe", -W / 2 + 1, 1, 1),
          I("console", 0, D / 2 - 0.75, 2),
          I("pendant", -3.7, -5.6),
          I("pendant", 3.7, -5.6),
        ],
      };
    }
    return { room: { template: "empty", w: 16, d: 14, wall: "white", floor: "oak" }, items: [] };
  }
  function newDesign(t, owner) {
    const tp = makeTemplate(t);
    return {
      id: uid("d"),
      owner: owner || null,
      name: (ROOMTYPE[t] || "New") + " design",
      room: tp.room,
      items: tp.items,
      status: "draft",
      created: Date.now(),
      updated: Date.now(),
      thumb: null,
    };
  }
  function seedDesign(id, owner, name, t, fin, status, extra, daysAgo) {
    const d = newDesign(t, owner);
    d.id = id;
    d.name = name;
    d.status = status;
    d.items.forEach((i) => {
      Object.keys(i.finish).forEach((s) => {
        if (fin[s]) i.finish[s] = fin[s];
      });
      if (fin[i.type]) Object.assign(i.finish, fin[i.type]);
    });
    d.updated = d.created = Date.now() - daysAgo * 864e5;
    return Object.assign(d, extra || {});
  }
  function seed() {
    const now = Date.now(),
      day = 864e5;
    const prefs = { email: true, inapp: true, sms: false, whatsapp: false };
    const s = {
      v: 1,
      session: null,
      role: "customer",
      catalog: {},
      inactive: [],
      working: null,
      customers: [
        {
          id: "c1",
          name: "Daniel Reyes",
          email: "daniel.reyes@example.com",
          password: "demo1234",
          city: "Montclair, NJ",
          phone: "(973) 555-0142",
          joined: now - 64 * day,
          prefs: { ...prefs, whatsapp: true },
        },
        {
          id: "c2",
          name: "Priya Natarajan",
          email: "priya.n@example.com",
          password: "demo1234",
          city: "Hoboken, NJ",
          phone: "(201) 555-0118",
          joined: now - 90 * day,
          prefs: { ...prefs },
        },
        {
          id: "c3",
          name: "Marcus Bell",
          email: "marcus.bell@example.com",
          password: "demo1234",
          city: "Short Hills, NJ",
          phone: "(973) 555-0190",
          joined: now - 21 * day,
          prefs: { ...prefs },
        },
      ],
      designs: [],
      projects: [],
      notifications: [],
    };
    s.designs = [
      seedDesign(
        "d1",
        "c1",
        "Montclair kitchen, option C",
        "kitchen",
        { body: "walnut", top: "calacatta", island: { body: "ebony" }, stool: { body: "ebony" } },
        "approved",
        {
          submittedAt: now - 40 * day,
          quote: 46800,
          brief: {
            timeline: "3–6 months",
            budget: "$40k–$60k",
            contact: "WhatsApp",
            notes: "Keep the window over the sink. Want the island to seat three.",
          },
        },
        44,
      ),
      seedDesign(
        "d2",
        "c1",
        "Primary bedroom wardrobe",
        "bedroom",
        { body: "chalk", hardware: "nickel", fabric: "boucle" },
        "draft",
        null,
        3,
      ),
      seedDesign(
        "d3",
        "c2",
        "Hoboken loft living room",
        "living",
        { body: "oak", fabric: "velvet", hardware: "black" },
        "submitted",
        {
          submittedAt: now - 1 * day,
          brief: {
            timeline: "Within 3 months",
            budget: "$25k–$40k",
            contact: "Email",
            notes: "Loft has 11 ft ceilings. Library wall should hold about 400 books and a record player.",
          },
        },
        2,
      ),
      seedDesign(
        "d4",
        "c3",
        "Short Hills library",
        "living",
        { body: "walnut", fabric: "leather", hardware: "brass" },
        "quoted",
        {
          submittedAt: now - 9 * day,
          quote: 38500,
          brief: {
            timeline: "3–6 months",
            budget: "$30k–$45k",
            contact: "Phone",
            notes: "Ladder rail on the library wall if possible.",
          },
        },
        10,
      ),
    ];
    s.projects = [
      {
        id: "p1",
        designId: "d1",
        customer: "c1",
        title: "Montclair kitchen",
        address: "Montclair, NJ",
        stage: 1,
        started: now - 30 * day,
        milestones: [
          { label: "Design sign-off", done: true },
          { label: "Shop drawings approved", done: true },
          { label: "Cabinet fabrication", done: false },
          { label: "Finishing and lacquer", done: false },
          { label: "Delivery and installation", done: false },
          { label: "Final walkthrough", done: false },
        ],
        updates: [
          {
            id: "u3",
            t: now - 2 * day,
            stage: 1,
            text: "Walnut carcasses are glued up and drying in the Newark shop. Door fronts go on the CNC Monday.",
            img: "stage:process",
          },
          {
            id: "u2",
            t: now - 12 * day,
            stage: 0,
            text: "Shop drawings approved. Thanks for signing off on the 3″ reveal above the pantries.",
            img: null,
          },
          {
            id: "u1",
            t: now - 28 * day,
            stage: 0,
            text: "Site measured and the old kitchen is out. Plumbing rough-in stays where it is.",
            img: "stage:before",
          },
        ],
      },
      {
        id: "p2",
        designId: null,
        customer: "c2",
        title: "Hoboken bar and pantry",
        address: "Hoboken, NJ",
        stage: 3,
        started: now - 120 * day,
        milestones: [
          { label: "Design sign-off", done: true },
          { label: "Shop drawings approved", done: true },
          { label: "Fabrication", done: true },
          { label: "Installation", done: true },
          { label: "Final walkthrough", done: true },
        ],
        updates: [
          {
            id: "u6",
            t: now - 35 * day,
            stage: 3,
            text: "Installed and signed off. Enjoy the new bar, Priya.",
            img: "stage:final",
          },
          {
            id: "u5",
            t: now - 60 * day,
            stage: 1,
            text: "Fluted walnut fronts finished with a hand-rubbed oil.",
            img: "stage:process",
          },
          {
            id: "u4",
            t: now - 110 * day,
            stage: 0,
            text: "Kickoff. Existing pantry removed.",
            img: "stage:before",
          },
        ],
      },
    ];
    s.notifications = [
      {
        id: "n1",
        role: "customer",
        user: "c1",
        t: now - 2 * day,
        read: false,
        text: "New progress update on Montclair kitchen",
        ch: ["Email", "In-app", "WhatsApp"],
      },
      {
        id: "n2",
        role: "customer",
        user: "c1",
        t: now - 12 * day,
        read: true,
        text: "Montclair kitchen moved to Work in progress",
        ch: ["Email", "In-app", "WhatsApp"],
      },
      {
        id: "n3",
        role: "admin",
        user: null,
        t: now - 1 * day,
        read: false,
        text: "New design submitted: Hoboken loft living room by Priya Natarajan",
        ch: ["Email", "In-app"],
      },
      {
        id: "n4",
        role: "admin",
        user: null,
        t: now - 9 * day,
        read: true,
        text: "New design submitted: Short Hills library by Marcus Bell",
        ch: ["Email", "In-app"],
      },
    ];
    return s;
  }
  S = load();

  /* ================= textures ================= */
  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }
  function hash(str) {
    let h = 7;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 100000;
    return h + 1;
  }
  function canvasTex(draw, size) {
    size = size || 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d"), size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }
  function woodTex(hex, seed) {
    return canvasTex((g, s) => {
      g.fillStyle = hex;
      g.fillRect(0, 0, s, s);
      const r = rng(seed);
      for (let i = 0; i < 160; i++) {
        const x = r() * s,
          a = 0.02 + r() * 0.09;
        g.strokeStyle = r() > 0.45 ? `rgba(0,0,0,${a})` : `rgba(255,238,215,${a * 0.8})`;
        g.lineWidth = 0.5 + r() * 2.4;
        g.beginPath();
        g.moveTo(x, 0);
        const am = 3 + r() * 12;
        g.bezierCurveTo(x + am, s * 0.33, x - am, s * 0.66, x + (r() - 0.5) * 8, s);
        g.stroke();
      }
    });
  }
  function plankTex(hex, seed) {
    return canvasTex((g, s) => {
      const r = rng(seed),
        rows = 8,
        rh = s / rows;
      for (let i = 0; i < rows; i++) {
        const y = i * rh;
        const base = new THREE.Color(hex);
        const k = 0.9 + r() * 0.18;
        g.fillStyle = `rgb(${Math.min(255, base.r * 255 * k) | 0},${Math.min(255, base.g * 255 * k) | 0},${Math.min(255, base.b * 255 * k) | 0})`;
        g.fillRect(0, y, s, rh);
        for (let j = 0; j < 18; j++) {
          const yy = y + r() * rh;
          g.strokeStyle = `rgba(0,0,0,${0.03 + r() * 0.07})`;
          g.lineWidth = 0.6 + r() * 1.6;
          g.beginPath();
          g.moveTo(0, yy);
          g.bezierCurveTo(
            s * 0.33,
            yy + (r() - 0.5) * 6,
            s * 0.66,
            yy + (r() - 0.5) * 6,
            s,
            yy + (r() - 0.5) * 4,
          );
          g.stroke();
        }
        g.fillStyle = "rgba(0,0,0,.28)";
        g.fillRect(0, y, s, 1.5);
        const jx = r() * s;
        g.fillRect(jx, y, 1.5, rh);
        g.fillRect((jx + s / 2) % s, y, 1.5, rh);
      }
    }, 512);
  }
  function concreteTex(hex, seed) {
    return canvasTex((g, s) => {
      const r = rng(seed);
      g.fillStyle = hex;
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 26; i++) {
        const x = r() * s,
          y = r() * s,
          rad = 30 + r() * 120;
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        const a = r() * 0.08;
        gr.addColorStop(0, r() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, s, s);
      }
      for (let i = 0; i < 5000; i++) {
        g.fillStyle = `rgba(0,0,0,${r() * 0.12})`;
        g.fillRect(r() * s, r() * s, 1, 1);
      }
    });
  }
  function marbleTex(seed) {
    return canvasTex((g, s) => {
      const r = rng(seed);
      g.fillStyle = "#EFEDE8";
      g.fillRect(0, 0, s, s);
      for (let i = 0; i < 16; i++) {
        let x = r() * s,
          y = r() * s;
        g.strokeStyle = `rgba(90,88,84,${0.12 + r() * 0.28})`;
        g.lineWidth = 0.6 + r() * 2.2;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 40; k++) {
          x += (r() - 0.3) * 22;
          y += (r() - 0.5) * 22;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    });
  }

  const matCache = {};
  function M(id, make) {
    return matCache[id] || (matCache[id] = make());
  }
  function std(o) {
    return new THREE.MeshStandardMaterial(o);
  }
  const FIXED = {
    kick: () => std({ color: lin("#1B1A18"), roughness: 0.8 }),
    gap: () => std({ color: lin("#141312"), roughness: 1 }),
    linen: () => std({ color: lin("#F1EFEA"), roughness: 1 }),
    duvet: () => std({ color: lin("#D9D3C6"), roughness: 1 }),
    cord: () => std({ color: lin("#151515"), roughness: 0.6 }),
    glow: () => std({ color: lin("#FFF3D9"), emissive: lin("#FFCC88"), emissiveIntensity: 1.7 }),
    ply: () => std({ map: woodTex("#D9BC8F", 3), roughness: 0.85 }),
    stud: () => std({ map: woodTex("#C9A06B", 9), roughness: 0.85 }),
    book0: () => std({ color: lin("#7A2E25"), roughness: 0.8 }),
    book1: () => std({ color: lin("#2E4057"), roughness: 0.8 }),
    book2: () => std({ color: lin("#D8CBB0"), roughness: 0.8 }),
    book3: () => std({ color: lin("#3B4A36"), roughness: 0.8 }),
    book4: () => std({ color: lin("#B98B3E"), roughness: 0.8 }),
    book5: () => std({ color: lin("#1E1E1E"), roughness: 0.8 }),
  };
  function slotMat(slot, key) {
    if (slot === "fixed") return M("fx:" + key, FIXED[key]);
    if (slot === "body") {
      const f = FINISHES[key] || FINISHES.oak;
      return M("b:" + key, () =>
        f.wood
          ? std({ map: woodTex(f.hex, hash(key)), roughness: f.rough })
          : std({ color: lin(f.hex), roughness: f.rough }),
      );
    }
    if (slot === "hardware") {
      const h = HARDWARE[key] || HARDWARE.brass;
      return M("h:" + key, () =>
        std({ color: lin(h.hex), metalness: h.metal, roughness: h.rough, side: THREE.DoubleSide }),
      );
    }
    if (slot === "top") {
      const t = TOPS[key] || TOPS.calacatta;
      return M("t:" + key, () =>
        t.marble
          ? std({ map: marbleTex(11), roughness: t.rough })
          : std({ color: lin(t.hex), roughness: t.rough }),
      );
    }
    if (slot === "fabric") {
      const f = FABRICS[key] || FABRICS.boucle;
      return M("f:" + key, () => std({ color: lin(f.hex), roughness: f.rough }));
    }
    return M("fx:gap", FIXED.gap);
  }
  function floorMat(key, W, D) {
    const base = M("floortex:" + key, () =>
      key === "concrete"
        ? concreteTex("#A2A09A", 5)
        : key === "marble"
          ? marbleTex(21)
          : plankTex(FLOORS[key] ? FLOORS[key].hex : "#C3A077", hash(key)),
    );
    const t = base.clone();
    t.needsUpdate = true;
    t.repeat.set(W / 6, D / 6);
    return std({ map: t, roughness: key === "marble" ? 0.3 : key === "concrete" ? 0.6 : 0.7 });
  }

  /* ================= furniture builders (1 unit = 1 ft, front faces +z) ================= */
  const geoCache = {};
  function boxGeo(w, h, d) {
    const k = w.toFixed(3) + "|" + h.toFixed(3) + "|" + d.toFixed(3);
    return geoCache[k] || (geoCache[k] = new THREE.BoxGeometry(w, h, d));
  }
  function Bb(g, w, h, d, x, y0, z, slot, fx, decor) {
    const m = new THREE.Mesh(boxGeo(w, h, d));
    m.position.set(x, y0 + h / 2, z);
    m.userData.slot = slot;
    if (fx) m.userData.fx = fx;
    if (decor) m.userData.decor = true;
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  }
  function Cy(g, rt, rb, h, x, y0, z, slot, fx, seg, open) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20, 1, !!open));
    m.position.set(x, y0 + h / 2, z);
    m.userData.slot = slot;
    if (fx) m.userData.fx = fx;
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  }
  const BUILD = {
    base_cab(g, c) {
      const { w, d } = c;
      Bb(g, w - 0.15, 0.33, d - 0.25, 0, 0, -0.1, "fixed", "kick");
      Bb(g, w, 2.47, d, 0, 0.33, 0, "body");
      Bb(g, w + 0.04, 0.1, d + 0.08, 0, 2.8, 0.03, "top");
      Bb(g, 0.025, 1.9, 0.01, 0, 0.38, d / 2 + 0.005, "fixed", "gap");
      Bb(g, w - 0.04, 0.025, 0.01, 0, 2.3, d / 2 + 0.005, "fixed", "gap");
      Bb(g, 0.7, 0.05, 0.06, 0, 2.5, d / 2 + 0.04, "hardware");
      Bb(g, 0.05, 0.5, 0.06, -0.18, 1.6, d / 2 + 0.04, "hardware");
      Bb(g, 0.05, 0.5, 0.06, 0.18, 1.6, d / 2 + 0.04, "hardware");
    },
    wall_cab(g, c) {
      const { w, h, d } = c,
        y = 4.7;
      Bb(g, w, h, d, 0, y, 0, "body");
      Bb(g, 0.025, h - 0.04, 0.01, 0, y + 0.02, d / 2 + 0.005, "fixed", "gap");
      Bb(g, 0.05, 0.55, 0.06, -0.18, y + 0.12, d / 2 + 0.04, "hardware");
      Bb(g, 0.05, 0.55, 0.06, 0.18, y + 0.12, d / 2 + 0.04, "hardware");
    },
    tall_cab(g, c) {
      const { w, h, d } = c;
      Bb(g, w - 0.15, 0.33, d - 0.25, 0, 0, -0.1, "fixed", "kick");
      Bb(g, w, h - 0.33, d, 0, 0.33, 0, "body");
      Bb(g, w - 0.04, 0.025, 0.01, 0, 3, d / 2 + 0.005, "fixed", "gap");
      Bb(g, 0.05, 1.8, 0.06, w / 2 - 0.22, 1, d / 2 + 0.04, "hardware");
      Bb(g, 0.05, 2.4, 0.06, w / 2 - 0.22, 3.4, d / 2 + 0.04, "hardware");
    },
    island(g, c) {
      const { w, d } = c,
        bd = d - 0.3;
      Bb(g, w - 0.7, 0.33, bd - 0.5, 0, 0, 0, "fixed", "kick");
      Bb(g, w - 0.3, 2.52, bd, 0, 0.33, 0, "body");
      Bb(g, w, 0.15, d, 0, 2.85, 0, "top");
      Bb(g, 0.15, 2.85, d, -(w / 2 - 0.075), 0, 0, "top");
      Bb(g, 0.15, 2.85, d, w / 2 - 0.075, 0, 0, "top");
      const n = Math.floor((w - 0.6) / 0.19);
      for (let i = 0; i < n; i++) {
        const x = (-(n - 1) * 0.19) / 2 + i * 0.19;
        Cy(g, 0.07, 0.07, 2.4, x, 0.4, bd / 2 + 0.02, "body", null, 10);
      }
      [-1, 0, 1].forEach((k) => {
        const x = (k * w) / 3.2;
        Bb(g, 0.9, 0.05, 0.06, x, 2.45, -bd / 2 - 0.04, "hardware");
        Bb(g, 0.9, 0.05, 0.06, x, 1.5, -bd / 2 - 0.04, "hardware");
        Bb(g, w / 3.2 - 0.05, 0.02, 0.01, x, 1.95, -bd / 2 - 0.005, "fixed", "gap");
      });
    },
    stool(g) {
      Cy(g, 0.62, 0.6, 0.14, 0, 2.42, 0, "body", null, 28);
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([a, b]) => Cy(g, 0.035, 0.04, 2.42, a * 0.42, 0, b * 0.42, "hardware", null, 8));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 32));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.85;
      ring.userData.slot = "hardware";
      ring.castShadow = true;
      g.add(ring);
    },
    shelving(g, c) {
      const { w, h, d } = c,
        lo = 2.6,
        sd = d - 0.25,
        sz = -0.125;
      Bb(g, w, lo, d, 0, 0, 0, "body");
      [-1, 0, 1].forEach((k) => {
        const x = (k * w) / 3;
        Bb(g, 0.025, lo - 0.1, 0.01, x + w / 6 - 0.01, 0.05, d / 2 + 0.005, "fixed", "gap");
        Bb(g, 0.6, 0.05, 0.06, x, lo - 0.35, d / 2 + 0.04, "hardware");
      });
      Bb(g, 0.025, lo - 0.1, 0.01, -w / 2 + 0.01, 0.05, d / 2 + 0.005, "fixed", "gap");
      [-w / 2 + 0.06, -w / 6, w / 6, w / 2 - 0.06].forEach((x) => Bb(g, 0.12, h - lo, sd, x, lo, sz, "body"));
      Bb(g, w, h - lo, 0.08, 0, lo, -d / 2 + 0.04, "body");
      const shelves = [lo + 1.35, lo + 2.7, lo + 4.05];
      shelves.forEach((y) => Bb(g, w, 0.1, sd, 0, y, sz, "body"));
      Bb(g, w, 0.14, sd, 0, h - 0.14, sz, "body");
      const r = rng(42);
      [lo + 0.0, ...shelves].forEach((y, si) => {
        if (si === 3) return;
        [-w / 3, 0, w / 3].forEach((bx) => {
          let x = bx - w / 6 + 0.2;
          const end = bx + w / 6 - 0.2 - (r() > 0.5 ? 0.8 : 0);
          while (x < end) {
            const bw = 0.08 + r() * 0.1,
              bh = 0.7 + r() * 0.35;
            Bb(g, bw, bh, 0.75, x + bw / 2, y + 0.1, sz - 0.05, "fixed", "book" + Math.floor(r() * 6), true);
            x += bw + 0.01;
          }
        });
      });
    },
    fluted(g, c) {
      const { w, h, d } = c;
      Bb(g, w, h, 0.12, 0, 0, -d / 2 + 0.06, "body");
      const n = Math.floor((w - 0.1) / 0.17);
      for (let i = 0; i < n; i++) {
        const x = (-(n - 1) * 0.17) / 2 + i * 0.17;
        Cy(g, 0.075, 0.075, h - 0.3, x, 0.15, -d / 2 + 0.12 + 0.07, "body", null, 10);
      }
      Bb(g, w, 0.15, d, 0, 0, 0, "body");
      Bb(g, w, 0.15, d, 0, h - 0.15, 0, "body");
    },
    console(g, c) {
      const { w, h, d } = c;
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([a, b]) => Bb(g, 0.08, 0.4, 0.08, a * (w / 2 - 0.2), 0, b * (d / 2 - 0.2), "hardware"));
      Bb(g, w, h - 0.4, d, 0, 0.4, 0, "body");
      [-w / 6, w / 6].forEach((x) => Bb(g, 0.025, h - 0.5, 0.01, x, 0.45, d / 2 + 0.005, "fixed", "gap"));
      [-w / 6, w / 6, w / 2].forEach((x) =>
        Bb(g, 0.04, 0.35, 0.05, x - 0.18, 0.9, d / 2 + 0.035, "hardware"),
      );
    },
    sofa(g, c) {
      const { w, d } = c;
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([a, b]) => Bb(g, 0.16, 0.35, 0.16, a * (w / 2 - 0.3), 0, b * (d / 2 - 0.3), "body"));
      Bb(g, w, 0.9, d, 0, 0.35, 0, "fabric");
      Bb(g, w, 1.55, 0.7, 0, 1.25, -d / 2 + 0.35, "fabric");
      Bb(g, 0.6, 1, d, -(w / 2 - 0.3), 1.25, 0, "fabric");
      Bb(g, 0.6, 1, d, w / 2 - 0.3, 1.25, 0, "fabric");
      const cw = (w - 1.2) / 3,
        sz = (-d / 2 + 0.7 + d / 2) / 2,
        sd = d - 0.75;
      [-1, 0, 1].forEach((k) => {
        Bb(g, cw - 0.05, 0.45, sd, k * cw, 1.25, sz + 0.02, "fabric");
        Bb(g, cw - 0.05, 1.1, 0.45, k * cw, 1.7, -d / 2 + 0.7 + 0.22, "fabric");
      });
    },
    dining(g, c) {
      const { w, h, d } = c;
      Bb(g, w, 0.15, d, 0, h - 0.15, 0, "body");
      [-1, 1].forEach((k) => {
        Bb(g, 0.35, h - 0.5, d * 0.5, k * w * 0.32, 0.35, 0, "body");
        Bb(g, 0.55, 0.35, d * 0.8, k * w * 0.32, 0, 0, "body");
      });
      Bb(g, w * 0.64, 0.22, 0.22, 0, 1, 0, "body");
    },
    chair(g) {
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ].forEach(([a, b]) => Bb(g, 0.1, 1.5, 0.1, a * 0.65, 0, b * 0.68, "body"));
      Bb(g, 1.5, 0.2, 1.5, 0, 1.5, 0.05, "fabric");
      Bb(g, 1.5, 1.15, 0.12, 0, 1.65, -0.72, "body");
    },
    bed(g, c) {
      const { w, d } = c;
      Bb(g, w, 1, d - 0.4, 0, 0, 0.2, "body");
      Bb(g, w - 0.3, 0.75, d - 0.8, 0, 1, 0.3, "fixed", "linen", true);
      Bb(g, w - 0.2, 0.18, d * 0.55, 0, 1.7, d * 0.18, "fixed", "duvet", true);
      [-1.25, 1.25].forEach((x) => Bb(g, 2, 0.45, 1, x, 1.75, -d / 2 + 1.2, "fixed", "linen", true));
      Bb(g, w + 0.6, 4.2, 0.4, 0, 0, -d / 2 + 0.2, "fabric");
    },
    wardrobe(g, c) {
      const { w, h, d } = c;
      Bb(g, w - 0.15, 0.33, d - 0.25, 0, 0, -0.1, "fixed", "kick");
      Bb(g, w, h - 0.33, d, 0, 0.33, 0, "body");
      [-w / 6, w / 6].forEach((x) => Bb(g, 0.025, h - 0.45, 0.01, x, 0.38, d / 2 + 0.005, "fixed", "gap"));
      [-w / 6 - 0.18, -w / 6 + 0.18, w / 6 + 0.18].forEach((x) =>
        Bb(g, 0.05, 1.8, 0.07, x, 3.2, d / 2 + 0.04, "hardware"),
      );
    },
    pendant(g) {
      Cy(g, 0.012, 0.012, 2.4, 0, 6.6, 0, "fixed", "cord", 6);
      const sh = Cy(g, 0.14, 0.5, 0.55, 0, 6.05, 0, "hardware", null, 32, true);
      sh.castShadow = false;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12));
      b.position.y = 6.1;
      b.userData.slot = "fixed";
      b.userData.fx = "glow";
      b.userData.glow = true;
      g.add(b);
    },
  };
  function buildItem(it) {
    const g = new THREE.Group();
    BUILD[it.type](g, CATALOG[it.type]);
    g.userData.itemId = it.id;
    placeItem(g, it);
    applyFinish(g, it, "final");
    return g;
  }
  function placeItem(g, it) {
    g.position.set(it.x, 0, it.z);
    g.rotation.y = (it.q * Math.PI) / 2;
  }
  function applyFinish(g, it, mode) {
    g.traverse((o) => {
      if (!o.isMesh) return;
      const s = o.userData.slot;
      if (mode === "process") {
        if (s === "hardware" || s === "top" || s === "fabric" || o.userData.decor || o.userData.glow) {
          o.visible = false;
          return;
        }
        o.visible = true;
        o.material = s === "fixed" ? slotMat("fixed", o.userData.fx) : slotMat("fixed", "ply");
        return;
      }
      o.visible = true;
      o.material = s === "fixed" ? slotMat("fixed", o.userData.fx) : slotMat(s, it.finish[s] || DEF[s]);
    });
  }
  function footprint(it) {
    const c = CATALOG[it.type];
    return it.q % 2 ? { w: c.d, d: c.w } : { w: c.w, d: c.d };
  }

  /* ================= room ================= */
  function buildRoom(room, opts) {
    opts = opts || {};
    const g = new THREE.Group(),
      W = room.w,
      D = room.d,
      H = 9;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat(room.floor, W, D));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    const wm = std({ color: lin(opts.wallHex || (WALLS[room.wall] || WALLS.white).hex), roughness: 0.95 });
    const walls = [];
    [
      [0, -D / 2, 0, W],
      [0, D / 2, Math.PI, W],
      [-W / 2, 0, Math.PI / 2, D],
      [W / 2, 0, -Math.PI / 2, D],
    ].forEach(([x, z, ry, len]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(len, H), wm);
      m.position.set(x, H / 2, z);
      m.rotation.y = ry;
      m.receiveShadow = true;
      g.add(m);
      walls.push(m);
    });
    if (opts.ceiling) {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: lin("#F3F2EE"), roughness: 1 }));
      c.rotation.x = Math.PI / 2;
      c.position.y = H;
      g.add(c);
    }
    g.userData = { floor, walls, wallMat: wm };
    return g;
  }

  /* ================= 3D stage ================= */
  class Stage {
    constructor(host) {
      this.host = host;
      const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }));
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputEncoding = THREE.sRGBEncoding;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.0;
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      host.prepend(r.domElement);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, 1.6, 0.1, 500);
      this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0x7d7466, 0.62));
      const sun = (this.sun = new THREE.DirectionalLight(0xfff1de, 0.95));
      sun.position.set(14, 26, 18);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      const sc = sun.shadow.camera;
      sc.left = -22;
      sc.right = 22;
      sc.top = 22;
      sc.bottom = -22;
      sc.near = 1;
      sc.far = 80;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.02;
      this.scene.add(sun);
      this.tickers = [];
      this.running = false;
      this.setBg();
      this.resize();
      if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(host);
      else window.addEventListener("resize", () => this.resize());
    }
    resize() {
      const w = this.host.clientWidth || 900,
        h = this.host.clientHeight || 560;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderOnce();
    }
    setBg() {
      this.scene.background = lin(cssVar("--stage"));
      this.renderOnce();
    }
    start() {
      if (this.running) return;
      this.running = true;
      let last = performance.now();
      const loop = (t) => {
        if (!this.running) return;
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        this.tickers.forEach((f) => f(dt));
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
    stop() {
      this.running = false;
    }
    renderOnce() {
      this.renderer.render(this.scene, this.camera);
    }
    snapshot(w) {
      w = w || 360;
      this.renderOnce();
      const src = this.renderer.domElement;
      const h = Math.round((w * src.height) / src.width);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(src, 0, 0, w, h);
      try {
        return c.toDataURL("image/jpeg", 0.8);
      } catch (e) {
        return null;
      }
    }
  }

  /* ================= EXPLORE ================= */
  const Explore = {
    W: 28,
    D: 20,
    stageName: "final",
    walk: false,
    yaw: 0,
    pitch: 0,
    keys: {},
    fly: null,
    thumbs: {},
    init() {
      const host = $("#explore-stage");
      const st = (this.st = new Stage(host));
      const sc = st.scene;
      this.room = buildRoom(
        { w: this.W, d: this.D, wall: "white", floor: "oak" },
        { ceiling: true, wallHex: "#E9E5DD" },
      );
      sc.add(this.room);
      const W = this.W,
        D = this.D,
        bz = -D / 2 + 1,
        wz = -D / 2 + 0.55,
        I = newItem;
      const wal = { body: "walnut", hardware: "brass", top: "calacatta", fabric: "leather" };
      this.items = [
        I("tall_cab", -12, bz, 0, wal),
        I("tall_cab", -10, bz, 0, wal),
        I("base_cab", -7.5, bz, 0, wal),
        I("base_cab", -4.5, bz, 0, wal),
        I("base_cab", -1.5, bz, 0, wal),
        I("base_cab", 1.5, bz, 0, wal),
        I("tall_cab", 4, bz, 0, wal),
        I("tall_cab", 6, bz, 0, wal),
        I("wall_cab", -7.5, wz, 0, wal),
        I("wall_cab", -4.5, wz, 0, wal),
        I("wall_cab", -1.5, wz, 0, wal),
        I("wall_cab", 1.5, wz, 0, wal),
        I("island", -3, -2.5, 0, { body: "ebony", top: "calacatta", hardware: "brass" }),
        I("stool", -5.6, 0.3, 0, { body: "ebony" }),
        I("stool", -3, 0.3, 0, { body: "ebony" }),
        I("stool", -0.4, 0.3, 0, { body: "ebony" }),
        I("pendant", -5.6, -2.5),
        I("pendant", -3, -2.5),
        I("pendant", -0.4, -2.5),
        I("shelving", -W / 2 + 0.625, 3, 1, wal),
        I("fluted", W / 2 - 0.175, 3, 3, wal),
        I("console", W / 2 - 0.35 - 0.75, 3, 3, wal),
        I("sofa", 6.5, 3, 1, { fabric: "leather", body: "walnut" }),
        I("dining", -6, 6, 0, { body: "oak" }),
        I("chair", -8, 3.7, 0, { body: "oak", fabric: "boucle" }),
        I("chair", -4, 3.7, 0, { body: "oak", fabric: "boucle" }),
        I("chair", -8, 8.3, 2, { body: "oak", fabric: "boucle" }),
        I("chair", -4, 8.3, 2, { body: "oak", fabric: "boucle" }),
        I("pendant", -6, 6),
      ];
      this.groups = this.items.map((it) => {
        const g = buildItem(it);
        sc.add(g);
        return g;
      });
      this.lights = [];
      this.items.forEach((it) => {
        if (it.type === "pendant") {
          const l = new THREE.PointLight(0xffd6a0, 0.55, 16, 2);
          l.position.set(it.x, 5.9, it.z);
          sc.add(l);
          this.lights.push(l);
        }
      });
      this.work = new THREE.PointLight(0xfff3e0, 0.7, 30, 2);
      this.work.position.set(0, 7, 0);
      sc.add(this.work);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), slotMat("fixed", "glow"));
      bulb.position.set(0, 7.2, 0);
      this.bulb = bulb;
      sc.add(bulb);
      const cord = new THREE.Mesh(boxGeo(0.03, 1.8, 0.03), slotMat("fixed", "cord"));
      cord.position.set(0, 8.1, 0);
      bulb.add(cord);
      cord.position.set(0, 0.9, 0);
      this.studs = new THREE.Group();
      for (let x = -W / 2 + 0.5; x < W / 2; x += 1.33)
        Bb(this.studs, 0.15, 9, 0.3, x, 0, -D / 2 + 0.15, "fixed", "stud");
      for (let z = -D / 2 + 0.5; z < D / 2; z += 1.33)
        Bb(this.studs, 0.3, 9, 0.15, -W / 2 + 0.15, 0, z, "fixed", "stud");
      this.studs.traverse((o) => {
        if (o.isMesh) o.material = slotMat("fixed", "stud");
      });
      sc.add(this.studs);
      this.mats = {
        finalWall: this.room.userData.wallMat,
        primer: std({ color: lin("#F2F1ED"), roughness: 1 }),
        concreteW: std({ map: concreteTex("#B3B0A8", 8), roughness: 0.95 }),
        finalFloor: this.room.userData.floor.material,
        kraft: std({ color: lin("#B89B74"), roughness: 1 }),
        concreteF: floorMat("concrete", W, D),
      };
      const cam = st.camera,
        canvas = st.renderer.domElement;
      canvas.addEventListener("pointerdown", (e) => {
        if (!this.walk) return;
        this.look = { x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!this.walk || !this.look) return;
        this.yaw -= (e.clientX - this.look.x) * 0.005;
        this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch - (e.clientY - this.look.y) * 0.004));
        this.look = { x: e.clientX, y: e.clientY };
      });
      canvas.addEventListener("pointerup", () => {
        this.look = null;
      });
      canvas.addEventListener("pointercancel", () => {
        this.look = null;
      });
      const c = (this.controls = new THREE.OrbitControls(cam, canvas));
      c.enableDamping = true;
      c.dampingFactor = 0.08;
      c.maxPolarAngle = Math.PI / 2.05;
      c.minDistance = 5;
      c.maxDistance = 60;
      this.home();
      st.tickers.push((dt) => this.tick(dt));
      const keymap = {
        KeyW: "f",
        ArrowUp: "f",
        KeyS: "b",
        ArrowDown: "b",
        KeyA: "l",
        ArrowLeft: "l",
        KeyD: "r",
        ArrowRight: "r",
      };
      window.addEventListener("keydown", (e) => {
        if (!this.walk || !keymap[e.code] || current !== "explore") return;
        if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        this.keys[keymap[e.code]] = true;
        e.preventDefault();
      });
      window.addEventListener("keyup", (e) => {
        if (keymap[e.code]) this.keys[keymap[e.code]] = false;
      });
      $$("#dpad button").forEach((b) => {
        const k = b.dataset.k;
        const on = (e) => {
            e.preventDefault();
            this.keys[k] = true;
          },
          off = () => {
            this.keys[k] = false;
          };
        b.addEventListener("pointerdown", on);
        b.addEventListener("pointerup", off);
        b.addEventListener("pointerleave", off);
        b.addEventListener("pointercancel", off);
      });
      this.setStage("final");
    },
    home() {
      const cam = this.st.camera;
      cam.position.set(19, 17, 23);
      this.controls.target.set(0, 2.5, 0);
      this.controls.update();
    },
    setStage(s) {
      this.stageName = s;
      const fin = s === "final",
        proc = s === "process";
      this.room.userData.walls.forEach(
        (w) => (w.material = fin ? this.mats.finalWall : proc ? this.mats.primer : this.mats.concreteW),
      );
      this.room.userData.floor.material = fin
        ? this.mats.finalFloor
        : proc
          ? this.mats.kraft
          : this.mats.concreteF;
      this.studs.visible = s === "before";
      this.lights.forEach((l) => (l.visible = fin));
      this.work.visible = !fin;
      this.bulb.visible = !fin;
      this.items.forEach((it, i) => {
        const g = this.groups[i],
          loose = CATALOG[it.type].loose;
        g.visible = fin || (proc && !loose);
        if (g.visible) applyFinish(g, it, proc ? "process" : "final");
      });
      $$("#exp-stages button").forEach((b) => b.classList.toggle("on", b.dataset.stage === s));
      this.st.renderOnce();
    },
    thumb(s) {
      if (this.thumbs[s]) return this.thumbs[s];
      const prev = this.stageName,
        cam = this.st.camera,
        p = cam.position.clone(),
        t = this.controls.target.clone(),
        wasWalk = this.walk;
      if (wasWalk) this.setWalk(false);
      this.home();
      this.setStage(s);
      const url = this.st.snapshot(640);
      this.thumbs[s] = url;
      this.setStage(prev);
      cam.position.copy(p);
      this.controls.target.copy(t);
      this.controls.update();
      if (wasWalk) this.setWalk(true);
      this.st.renderOnce();
      return url;
    },
    setWalk(on) {
      this.walk = on;
      const cam = this.st.camera;
      $("#explore-stage").classList.toggle("walk", on);
      $("#walk-btn").textContent = on ? "Exit walk mode" : "Walk mode";
      $("#exp-hint").textContent = on
        ? "Drag to look · W A S D or arrow keys to move"
        : "Drag to look around · scroll or pinch to zoom · right-drag to pan";
      if (on) {
        this.controls.enabled = false;
        cam.position.set(9, 5.3, 8);
        this.yaw = Math.atan2(9, 8);
        this.pitch = -0.08;
        cam.rotation.order = "YXZ";
      } else {
        this.controls.enabled = true;
        cam.rotation.order = "XYZ";
        this.home();
      }
    },
    flyTo(p, t) {
      if (this.walk) this.setWalk(false);
      this.fly = {
        p0: this.st.camera.position.clone(),
        t0: this.controls.target.clone(),
        p1: new THREE.Vector3(...p),
        t1: new THREE.Vector3(...t),
        k: 0,
      };
    },
    tick(dt) {
      const cam = this.st.camera;
      if (this.fly) {
        const f = this.fly;
        f.k = Math.min(1, f.k + dt / 1.1);
        const e = f.k < 0.5 ? 2 * f.k * f.k : 1 - Math.pow(-2 * f.k + 2, 2) / 2;
        cam.position.lerpVectors(f.p0, f.p1, e);
        this.controls.target.lerpVectors(f.t0, f.t1, e);
        if (f.k >= 1) this.fly = null;
      }
      if (this.walk) {
        const sp = 9 * dt,
          k = this.keys,
          fx = -Math.sin(this.yaw),
          fz = -Math.cos(this.yaw),
          rx = Math.cos(this.yaw),
          rz = -Math.sin(this.yaw);
        let mx = 0,
          mz = 0;
        if (k.f) {
          mx += fx;
          mz += fz;
        }
        if (k.b) {
          mx -= fx;
          mz -= fz;
        }
        if (k.r) {
          mx += rx;
          mz += rz;
        }
        if (k.l) {
          mx -= rx;
          mz -= rz;
        }
        cam.position.x = Math.max(-this.W / 2 + 1, Math.min(this.W / 2 - 1, cam.position.x + mx * sp));
        cam.position.z = Math.max(-this.D / 2 + 1, Math.min(this.D / 2 - 1, cam.position.z + mz * sp));
        cam.position.y = 5.3;
        cam.rotation.set(this.pitch, this.yaw, 0);
      } else this.controls.update();
    },
  };
  const HOTSPOTS = [
    {
      label: "Kitchen island",
      note: "8′ ebonized oak island with Calacatta waterfall ends and a fluted seating face.",
      p: [6, 7.5, 7],
      t: [-3, 2, -2.5],
    },
    {
      label: "Pantry and cabinet run",
      note: "Full-height walnut pantries framing 12′ of base and wall cabinets.",
      p: [-1, 6.5, 3],
      t: [-3, 4, -9.5],
    },
    {
      label: "Library wall",
      note: "8′ walnut library with closed storage below and brass pulls.",
      p: [-3, 6, 6],
      t: [-13, 4.5, 3],
    },
    {
      label: "Fluted lounge wall",
      note: "Fluted walnut paneling behind a low media console and cognac leather sofa.",
      p: [2, 6.5, -3],
      t: [13, 3.5, 3],
    },
    {
      label: "Dining",
      note: "White oak trestle table with bouclé chairs under a single brass pendant.",
      p: [2, 7, 13],
      t: [-6, 2, 6],
    },
  ];
  const PORTFOLIO = [
    ["Livingston Residence", "Interior spaces · Millwork", "Livingston, NJ · 2024", true],
    ["Sushi By Bou", "Interior spaces · Millwork", "Hoboken, NJ · 2023"],
    ["Anja Dispensary", "Interior spaces · Millwork", "Woodbridge, NJ · 2023"],
    ["D'OBA", "Interior spaces · Millwork", "New Jersey"],
    ["Lloyd Harbor Residence", "Interior spaces · Millwork", "Long Island, NY · 2024"],
    ["The Blend", "Buildings · Millwork", "Newark, NJ"],
  ];

  /* ================= STUDIO ================= */
  const Studio = {
    sel: null,
    drag: null,
    dirty: false,
    init() {
      const host = $("#studio-stage");
      const st = (this.st = new Stage(host));
      const canvas = st.renderer.domElement;
      this.itemsG = new THREE.Group();
      st.scene.add(this.itemsG);
      this.map = new Map();
      this.helper = new THREE.BoxHelper(new THREE.Object3D(), 0xc9a25e);
      this.helper.visible = false;
      this.helper.material.depthTest = false;
      this.helper.renderOrder = 10;
      st.scene.add(this.helper);
      this.ray = new THREE.Raycaster();
      this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      // our listeners are registered before OrbitControls so they run first and can disable it for a piece drag
      canvas.addEventListener("pointerdown", (e) => this.down(e));
      canvas.addEventListener("pointermove", (e) => this.move(e));
      canvas.addEventListener("pointerup", (e) => this.up(e));
      canvas.addEventListener("pointercancel", (e) => this.up(e));
      const c = (this.controls = new THREE.OrbitControls(st.camera, canvas));
      c.enableDamping = true;
      c.dampingFactor = 0.08;
      c.maxPolarAngle = Math.PI / 2.05;
      c.minDistance = 4;
      c.maxDistance = 80;
      st.tickers.push(() => c.update());
      window.addEventListener("keydown", (e) => {
        if (current !== "studio" || !this.sel || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (e.key === "r" || e.key === "R") {
          this.rotate();
          e.preventDefault();
        }
        if (e.key === "Delete" || e.key === "Backspace") {
          this.remove();
          e.preventDefault();
        }
        if (e.key === "Escape") this.select(null);
      });
    },
    load(d, opts) {
      this.design = clone(d);
      opts = opts || {};
      this.sel = null;
      this.helper.visible = false;
      this.buildRoomGeo();
      this.itemsG.clear();
      this.map.clear();
      this.design.items.forEach((it) => {
        const g = buildItem(it);
        this.itemsG.add(g);
        this.map.set(it.id, g);
      });
      this.frame();
      this.dirty = !!opts.dirty;
      if (!opts.silent) {
        this.renderAll();
      }
      this.st.renderOnce();
    },
    buildRoomGeo() {
      if (this.roomG) this.st.scene.remove(this.roomG);
      this.roomG = buildRoom(this.design.room);
      this.st.scene.add(this.roomG);
      if (this.grid) this.st.scene.remove(this.grid);
      const r = this.design.room,
        n = Math.max(r.w, r.d);
      this.grid = new THREE.GridHelper(n, n, 0x000000, 0x000000);
      this.grid.material.transparent = true;
      this.grid.material.opacity = 0.09;
      this.grid.position.y = 0.01;
      this.grid.scale.set(r.w / n, 1, r.d / n);
      this.grid.visible = $("#st-grid").getAttribute("aria-pressed") === "true";
      this.st.scene.add(this.grid);
    },
    frame(top) {
      const r = this.design.room,
        dist = Math.max(r.w, r.d) * 1.15,
        cam = this.st.camera;
      if (top) cam.position.set(0, dist * 1.55, 0.01);
      else cam.position.set(dist * 0.62, dist * 0.72, dist * 0.95);
      this.controls.target.set(0, top ? 0 : 2.5, 0);
      this.controls.update();
    },
    ndc(e) {
      const r = this.st.renderer.domElement.getBoundingClientRect();
      return new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
    },
    pick(e) {
      this.ray.setFromCamera(this.ndc(e), this.st.camera);
      const hits = this.ray.intersectObjects(this.itemsG.children, true);
      for (const h of hits) {
        let o = h.object;
        if (!o.visible) continue;
        while (o && !o.userData.itemId) o = o.parent;
        if (o) return o.userData.itemId;
      }
      return null;
    },
    floorPt(e) {
      this.ray.setFromCamera(this.ndc(e), this.st.camera);
      const p = new THREE.Vector3();
      return this.ray.ray.intersectPlane(this.plane, p) ? p : null;
    },
    down(e) {
      this.downAt = { x: e.clientX, y: e.clientY };
      if (e.button && e.button !== 0) return;
      const id = this.pick(e);
      if (!id) return;
      this.select(id);
      const it = this.item(id),
        p = this.floorPt(e);
      if (!p) return;
      this.drag = { id, ox: p.x - it.x, oz: p.z - it.z, moved: false };
      this.controls.enabled = false;
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_) {}
    },
    move(e) {
      if (!this.drag) {
        const c = this.st.renderer.domElement;
        if (e.pointerType === "mouse" && !e.buttons) c.style.cursor = this.pick(e) ? "grab" : "";
        return;
      }
      const p = this.floorPt(e);
      if (!p) return;
      const it = this.item(this.drag.id);
      const fp = footprint(it),
        r = this.design.room,
        sn = (v) => Math.round(v * 4) / 4;
      it.x = Math.max(-r.w / 2 + fp.w / 2, Math.min(r.w / 2 - fp.w / 2, sn(p.x - this.drag.ox)));
      it.z = Math.max(-r.d / 2 + fp.d / 2, Math.min(r.d / 2 - fp.d / 2, sn(p.z - this.drag.oz)));
      placeItem(this.map.get(it.id), it);
      this.helper.update();
      this.drag.moved = true;
      this.st.renderer.domElement.style.cursor = "grabbing";
    },
    up(e) {
      if (this.drag) {
        if (this.drag.moved) {
          this.touch();
          this.renderInspector();
        }
        this.drag = null;
        this.controls.enabled = true;
        this.st.renderer.domElement.style.cursor = "";
        return;
      }
      if (
        this.downAt &&
        Math.hypot(e.clientX - this.downAt.x, e.clientY - this.downAt.y) < 5 &&
        !this.pick(e)
      )
        this.select(null);
      this.downAt = null;
    },
    item(id) {
      return this.design.items.find((i) => i.id === id);
    },
    select(id) {
      this.sel = id;
      if (id) {
        this.helper.setFromObject(this.map.get(id));
        this.helper.visible = true;
      } else this.helper.visible = false;
      this.renderInspector();
      if (id && matchMedia("(max-width:960px)").matches) setStudioTab("design");
    },
    touch() {
      this.dirty = true;
      this.design.updated = Date.now();
      S.working = this.design;
      save();
      this.renderBar();
      this.renderEstimate();
    },
    add(type) {
      const c = CATALOG[type],
        r = this.design.room;
      let x = 0,
        z = 0,
        q = 0;
      if (c.wall) {
        z = -r.d / 2 + c.d / 2;
        let found = false;
        for (let tx = -r.w / 2 + c.w / 2; tx <= r.w / 2 - c.w / 2 + 0.001; tx += 0.5) {
          const probe = { type, x: tx, z, q: 0 };
          if (!this.design.items.some((o) => this.clash(probe, o))) {
            x = tx;
            found = true;
            break;
          }
        }
        if (!found) {
          x = 0;
          z = 0;
        }
      } else {
        let best = null;
        const others = this.design.items.filter(
          (o) => !CATALOG[o.type].hang && !(CATALOG[o.type].upper && c.h < 4.6),
        );
        [0, 1].forEach((tq) => {
          const fp = footprint({ type, q: tq }),
            hw = fp.w / 2,
            hd = fp.d / 2;
          if (hw * 2 > r.w || hd * 2 > r.d) return;
          const xs = [],
            zs = [];
          for (let v = -r.w / 2 + hw; v < r.w / 2 - hw; v += 0.25) xs.push(v);
          xs.push(r.w / 2 - hw);
          for (let v = -r.d / 2 + hd; v < r.d / 2 - hd; v += 0.25) zs.push(v);
          zs.push(r.d / 2 - hd);
          xs.forEach((tx) =>
            zs.forEach((tz) => {
              let ov = 0;
              others.forEach((o) => {
                const fo = footprint(o);
                const ox = Math.min(tx + hw, o.x + fo.w / 2) - Math.max(tx - hw, o.x - fo.w / 2),
                  oz = Math.min(tz + hd, o.z + fo.d / 2) - Math.max(tz - hd, o.z - fo.d / 2);
                if (ox > 0.01 && oz > 0.01) ov += ox * oz;
              });
              const score = ov * 1000 + Math.hypot(tx, tz - r.d / 6) + tq * 0.5;
              if (!best || score < best.s) best = { s: score, x: tx, z: tz, q: tq, ov };
            }),
          );
        });
        if (best) {
          x = Math.round(best.x * 4) / 4;
          z = Math.round(best.z * 4) / 4;
          q = best.q;
          if (best.ov > 0)
            setTimeout(
              () =>
                toast(
                  "The floor is tight",
                  "This piece overlaps another. Drag things apart or make the room bigger in Room settings.",
                ),
              50,
            );
        }
      }
      const it = newItem(type, x, z, q);
      this.clampItem(it);
      this.design.items.push(it);
      const g = buildItem(it);
      this.itemsG.add(g);
      this.map.set(it.id, g);
      this.touch();
      this.select(it.id);
      toast(c.name + " added", "Drag it into place, then pick finishes");
    },
    clash(a, b) {
      const ca = CATALOG[a.type],
        cb = CATALOG[b.type];
      if (ca.hang || cb.hang) return false;
      if ((ca.upper && cb.h < 4.6) || (cb.upper && ca.h < 4.6)) return false;
      const fa = footprint(a),
        fb = footprint(b);
      return Math.abs(a.x - b.x) < (fa.w + fb.w) / 2 - 0.01 && Math.abs(a.z - b.z) < (fa.d + fb.d) / 2 - 0.01;
    },
    rotate() {
      const it = this.item(this.sel);
      if (!it) return;
      it.q = (it.q + 1) % 4;
      this.clampItem(it);
      placeItem(this.map.get(it.id), it);
      this.helper.update();
      this.touch();
      this.renderInspector();
    },
    clampItem(it) {
      const fp = footprint(it),
        r = this.design.room;
      it.x = Math.max(-r.w / 2 + fp.w / 2, Math.min(r.w / 2 - fp.w / 2, it.x));
      it.z = Math.max(-r.d / 2 + fp.d / 2, Math.min(r.d / 2 - fp.d / 2, it.z));
    },
    toWall() {
      const it = this.item(this.sel);
      if (!it) return;
      const r = this.design.room,
        c = CATALOG[it.type];
      const dist = {
        back: it.z + r.d / 2,
        front: r.d / 2 - it.z,
        left: it.x + r.w / 2,
        right: r.w / 2 - it.x,
      };
      const k = Object.keys(dist).sort((a, b) => dist[a] - dist[b])[0];
      if (k === "back") {
        it.q = 0;
        it.z = -r.d / 2 + c.d / 2;
      }
      if (k === "front") {
        it.q = 2;
        it.z = r.d / 2 - c.d / 2;
      }
      if (k === "left") {
        it.q = 1;
        it.x = -r.w / 2 + c.d / 2;
      }
      if (k === "right") {
        it.q = 3;
        it.x = r.w / 2 - c.d / 2;
      }
      this.clampItem(it);
      placeItem(this.map.get(it.id), it);
      this.helper.update();
      this.touch();
      this.renderInspector();
    },
    duplicate() {
      const it = this.item(this.sel);
      if (!it) return;
      const n = clone(it);
      n.id = uid("i");
      const fp = footprint(it);
      if (it.q % 2) n.z += fp.d + 0.05;
      else n.x += fp.w + 0.05;
      this.clampItem(n);
      this.design.items.push(n);
      const g = buildItem(n);
      this.itemsG.add(g);
      this.map.set(n.id, g);
      this.touch();
      this.select(n.id);
    },
    remove() {
      const it = this.item(this.sel);
      if (!it) return;
      this.itemsG.remove(this.map.get(it.id));
      this.map.delete(it.id);
      this.design.items = this.design.items.filter((i) => i.id !== it.id);
      this.select(null);
      this.touch();
    },
    setFinish(slot, key) {
      const it = this.item(this.sel);
      if (!it) return;
      it.finish[slot] = key;
      applyFinish(this.map.get(it.id), it, "final");
      this.touch();
      this.renderInspector();
    },
    setAll(slot, key) {
      this.design.items.forEach((it) => {
        if (it.finish[slot] !== undefined) {
          it.finish[slot] = key;
          applyFinish(this.map.get(it.id), it, "final");
        }
      });
      this.touch();
      this.renderInspector();
    },
    setRoom(k, v) {
      this.design.room[k] = v;
      if (k === "w" || k === "d") {
        this.design.items.forEach((it) => {
          this.clampItem(it);
          placeItem(this.map.get(it.id), it);
        });
      }
      this.buildRoomGeo();
      if (k === "w" || k === "d") this.frame();
      this.touch();
      this.st.renderOnce();
    },
    estimate() {
      let sub = 0;
      const lines = [];
      const counts = {};
      this.design.items.forEach((it) => {
        const base = priceOf(it.type);
        let p = base;
        const f = it.finish;
        if (f.body) p *= (FINISHES[f.body] || FINISHES.oak).mult;
        if (f.top) p += base * (TOPS[f.top] || TOPS.calacatta).add;
        if (f.fabric) p += base * (FABRICS[f.fabric] || FABRICS.boucle).add;
        if (f.hardware) p += (HARDWARE[f.hardware] || HARDWARE.brass).add;
        sub += p;
        counts[it.type] = counts[it.type] || { n: 0, p: 0 };
        counts[it.type].n++;
        counts[it.type].p += p;
      });
      Object.keys(counts).forEach((t) =>
        lines.push({ label: CATALOG[t].name + (counts[t].n > 1 ? " × " + counts[t].n : ""), p: counts[t].p }),
      );
      const design = sub * 0.06,
        install = sub * 0.12,
        total = sub + design + install;
      return { lines, sub, design, install, total, low: total * 0.9, high: total * 1.1 };
    },
    /* ---- panels ---- */
    renderAll() {
      this.renderCatalog();
      this.renderBar();
      this.renderInspector();
      this.renderEstimate();
    },
    renderBar() {
      const d = this.design;
      const n = $("#design-name");
      if (document.activeElement !== n) n.value = d.name;
      const p = $("#design-status");
      p.className = "pill " + d.status;
      p.textContent = STATUS[d.status];
      $("#save-state").textContent = this.dirty
        ? "Unsaved changes"
        : S.designs.some((x) => x.id === d.id)
          ? "Saved " + ago(d.updated)
          : "Not saved yet";
      const locked = d.status !== "draft";
      $("#btn-submit").disabled = locked;
      $("#btn-submit").title = locked ? "Already submitted. Save a copy to make changes and resubmit." : "";
    },
    renderCatalog() {
      const groups = {};
      Object.keys(CATALOG).forEach((t) => {
        if (!typeActive(t)) return;
        (groups[CATALOG[t].cat] = groups[CATALOG[t].cat] || []).push(t);
      });
      $("#catalog").innerHTML =
        `<div class="p-sec"><p class="eyebrow">Catalog</p><h3>Add pieces</h3><p class="muted" style="font-size:13px">Every piece is made in the Newark shop. Prices are the starting figure in white oak.</p></div>` +
        Object.keys(groups)
          .map(
            (g) =>
              `<div class="p-sec"><p class="eyebrow">${esc(g)}</p><div class="cat-group">${groups[g]
                .map((t) => {
                  const c = CATALOG[t];
                  return `<button type="button" class="cat-item" data-add="${t}"><b>${esc(c.name)}</b><span class="price mono">${usd(priceOf(t))}</span><span class="mono">${ftin(c.w)} W × ${ftin(c.d)} D${c.hang ? "" : " × " + ftin(c.h) + " H"}</span></button>`;
                })
                .join("")}</div></div>`,
          )
          .join("");
      $$("[data-add]", $("#catalog")).forEach(
        (b) =>
          (b.onclick = () => {
            this.add(b.dataset.add);
          }),
      );
    },
    swatchRow(slot, cur, attr) {
      const set = SLOT_SETS[slot];
      return `<div class="swatches">${Object.keys(set)
        .filter((k) => optActive(slot, k) || k === cur)
        .map((k) => {
          const o = set[k];
          const bg = o.marble ? "linear-gradient(135deg,#efede8 40%,#9a968e 50%,#efede8 60%)" : o.hex;
          return `<button type="button" class="sw${k === cur ? " on" : ""}" style="background:${bg}" title="${esc(o.name)}" aria-label="${esc(o.name)}" aria-pressed="${k === cur}" ${attr}="${slot}:${k}"></button>`;
        })
        .join("")}</div><div class="sw-label">${esc(set[cur] ? set[cur].name : "")}</div>`;
    },
    renderInspector() {
      const box = $("#inspector");
      const it = this.sel && this.item(this.sel);
      if (it) {
        const c = CATALOG[it.type],
          fp = footprint(it),
          r = this.design.room;
        box.innerHTML =
          `<div class="p-sec"><p class="eyebrow">Selected piece</p><h3>${esc(c.name)}</h3>
        <dl class="kv"><dt>Size</dt><dd class="mono">${ftin(c.w)} × ${ftin(c.d)}${c.hang ? "" : " × " + ftin(c.h)}</dd><dt>From back wall</dt><dd class="mono">${ftin(it.z + r.d / 2 - fp.d / 2)}</dd><dt>From left wall</dt><dd class="mono">${ftin(it.x + r.w / 2 - fp.w / 2)}</dd></dl>
        <div class="tools"><button type="button" class="btn sm" data-act="rotate">Rotate 90°</button><button type="button" class="btn sm" data-act="wall">Push to wall</button><button type="button" class="btn sm" data-act="dup">Duplicate</button><button type="button" class="btn sm danger" data-act="del">Remove</button></div></div>` +
          c.slots
            .map(
              (s) =>
                `<div class="p-sec"><p class="eyebrow">${SLOT_LABEL[s]}</p>${this.swatchRow(s, it.finish[s], "data-fin")}<button type="button" class="linkbtn muted" style="font-size:12px;justify-self:start" data-all="${s}:${it.finish[s]}">Apply to every piece</button></div>`,
            )
            .join("") +
          `<div class="p-sec"><button type="button" class="btn sm ghost" data-act="room">Room settings</button></div>`;
      } else {
        const r = this.design.room;
        box.innerHTML = `<div class="p-sec"><p class="eyebrow">Room</p><h3>${esc(ROOMTYPE[r.template] || "Room")}</h3><p class="empty-sel">Select a piece in the 3D view to change its finish, hardware or fabric.</p></div>
        <div class="p-sec"><div class="range-row"><label for="rw" class="sw-label">Width</label><span class="mono">${ftin(r.w)}</span><input type="range" id="rw" min="10" max="32" step="1" value="${r.w}"></div>
        <div class="range-row"><label for="rd" class="sw-label">Depth</label><span class="mono">${ftin(r.d)}</span><input type="range" id="rd" min="10" max="26" step="1" value="${r.d}"></div></div>
        <div class="p-sec"><p class="eyebrow">Walls</p><div class="swatches">${Object.keys(WALLS)
          .map(
            (k) =>
              `<button type="button" class="sw${k === r.wall ? " on" : ""}" style="background:${WALLS[k].hex}" title="${WALLS[k].name}" aria-label="${WALLS[k].name}" data-wall="${k}"></button>`,
          )
          .join("")}</div><div class="sw-label">${WALLS[r.wall].name}</div></div>
        <div class="p-sec"><p class="eyebrow">Floor</p><div class="swatches">${Object.keys(FLOORS)
          .map(
            (k) =>
              `<button type="button" class="sw${k === r.floor ? " on" : ""}" style="background:${FLOORS[k].hex}" title="${FLOORS[k].name}" aria-label="${FLOORS[k].name}" data-floor="${k}"></button>`,
          )
          .join("")}</div><div class="sw-label">${FLOORS[r.floor].name}</div></div>`;
        const rw = $("#rw"),
          rd = $("#rd");
        rw.oninput = () => {
          rw.previousElementSibling.textContent = ftin(+rw.value);
        };
        rd.oninput = () => {
          rd.previousElementSibling.textContent = ftin(+rd.value);
        };
        rw.onchange = () => {
          this.setRoom("w", +rw.value);
          this.renderInspector();
        };
        rd.onchange = () => {
          this.setRoom("d", +rd.value);
          this.renderInspector();
        };
      }
      $$("[data-act]", box).forEach(
        (b) =>
          (b.onclick = () =>
            ({
              rotate: () => this.rotate(),
              wall: () => this.toWall(),
              dup: () => this.duplicate(),
              del: () => this.remove(),
              room: () => this.select(null),
            })[b.dataset.act]()),
      );
      $$("[data-fin]", box).forEach(
        (b) =>
          (b.onclick = () => {
            const [s, k] = b.dataset.fin.split(":");
            this.setFinish(s, k);
          }),
      );
      $$("[data-all]", box).forEach(
        (b) =>
          (b.onclick = () => {
            const [s, k] = b.dataset.all.split(":");
            this.setAll(s, k);
            toast(SLOT_SETS[s][k].name + " applied to every piece");
          }),
      );
      $$("[data-wall]", box).forEach(
        (b) =>
          (b.onclick = () => {
            this.setRoom("wall", b.dataset.wall);
            this.renderInspector();
          }),
      );
      $$("[data-floor]", box).forEach(
        (b) =>
          (b.onclick = () => {
            this.setRoom("floor", b.dataset.floor);
            this.renderInspector();
          }),
      );
    },
    renderEstimate() {
      const e = this.estimate();
      $("#estimate").innerHTML =
        `<div class="p-sec" style="border-top:1px solid var(--line)"><p class="eyebrow">Indicative estimate</p><div class="est-total mono" style="font-family:var(--f-display)">${usd(e.low)} – ${usd(e.high)}</div>
      <p class="muted" style="font-size:12px">${this.design.items.length} pieces. Final price comes with the quote after a consultation and site measure.</p>
      <div class="lines">${e.lines.map((l) => `<div><span>${esc(l.label)}</span><span class="mono">${usd(l.p)}</span></div>`).join("") || '<div class="muted">No pieces yet. Add some from the catalog.</div>'}
      <div style="border-top:1px solid var(--line);padding-top:6px"><span>Design and shop drawings</span><span class="mono">${usd(e.design)}</span></div><div><span>Delivery and installation</span><span class="mono">${usd(e.install)}</span></div></div></div>`;
    },
  };

  /* ================= notifications & toast ================= */
  function toast(msg, sub) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = esc(msg) + (sub ? `<small>${esc(sub)}</small>` : "");
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), 4200);
  }
  function customer(id) {
    return S.customers.find((c) => c.id === id);
  }
  function me() {
    return S.session ? customer(S.session) : null;
  }
  function notify(role, user, text) {
    let ch = ["Email", "In-app"];
    if (role === "customer") {
      const c = customer(user);
      if (c) {
        ch = [];
        if (c.prefs.email) ch.push("Email");
        if (c.prefs.inapp) ch.push("In-app");
        if (c.prefs.sms) ch.push("SMS");
        if (c.prefs.whatsapp) ch.push("WhatsApp");
      }
    }
    S.notifications.unshift({ id: uid("n"), role, user, t: Date.now(), read: false, text, ch });
    save();
    renderBell();
    const who = role === "admin" ? "Fatatelier team" : (customer(user) || {}).name || "customer";
    toast(text, "Sent to " + who + (ch.length ? " via " + ch.join(", ") : ""));
  }
  function myNotes() {
    return S.notifications.filter((n) =>
      S.role === "admin" ? n.role === "admin" : n.role === "customer" && n.user === S.session,
    );
  }
  function renderBell() {
    const list = myNotes(),
      un = list.filter((n) => !n.read).length;
    $("#bell-count").textContent = un ? String(un) : "";
    const pop = $("#bell-pop");
    pop.innerHTML =
      `<div class="bell-head"><b>Notifications</b>${un ? '<button type="button" class="linkbtn" id="mark-read" style="font-size:12px">Mark all read</button>' : ""}</div>` +
      (list.length
        ? list
            .slice(0, 30)
            .map(
              (n) =>
                `<div class="note${n.read ? "" : " unread"}"><div>${esc(n.text)}</div><div class="meta"><span>${ago(n.t)}</span>${n.ch.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div></div>`,
            )
            .join("")
        : `<div class="note muted">${S.role === "customer" && !S.session ? "Sign in to see updates about your designs and projects." : "Nothing yet. Updates show up here and go out by email."}</div>`);
    const mr = $("#mark-read");
    if (mr)
      mr.onclick = () => {
        list.forEach((n) => (n.read = true));
        save();
        renderBell();
      };
  }

  /* ================= modal ================= */
  function openModal(html, mount) {
    const m = $("#modal"),
      c = $("#modal-card");
    c.innerHTML = html;
    m.hidden = false;
    $$("[data-close]", c).forEach((b) => (b.onclick = closeModal));
    if (mount) mount(c);
    const f = c.querySelector("input,select,textarea,button");
    if (f) f.focus();
  }
  function closeModal() {
    $("#modal").hidden = true;
    $("#modal-card").innerHTML = "";
  }
  $("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
  });

  /* ================= studio actions ================= */
  function requireLogin(next) {
    if (me()) return true;
    openModal(
      `<p class="eyebrow">Customer account</p><h2>Sign in to keep this design</h2><p class="muted">Your design stays open while you sign in. Saved designs show up in My account, ready to pick up later.</p>
  <div class="actions"><button type="button" class="btn primary" id="m-demo">Continue as Daniel (demo customer)</button><button type="button" class="btn" id="m-acc">Sign in or register</button><button type="button" class="btn ghost" data-close>Cancel</button></div>`,
      (c) => {
        $("#m-demo", c).onclick = () => {
          login("c1");
          closeModal();
          if (next) next();
        };
        $("#m-acc", c).onclick = () => {
          closeModal();
          S.after = next ? "studio" : null;
          location.hash = "account";
        };
      },
    );
    return false;
  }
  function saveDesign(quiet, keepStatus) {
    const d = Studio.design;
    if (!requireLogin(() => saveDesign(quiet, keepStatus))) return false;
    if (!d.owner) d.owner = S.session;
    const fork = d.owner !== S.session || (!keepStatus && d.status !== "draft" && Studio.dirty);
    if (fork) {
      const wasMine = d.owner === S.session;
      d.id = uid("d");
      d.owner = S.session;
      d.status = "draft";
      delete d.submittedAt;
      delete d.quote;
      delete d.brief;
      if (wasMine) d.name = d.name.replace(/ \(revised\)$/, "") + " (revised)";
    }
    Studio.helper.visible = false;
    d.thumb = Studio.st.snapshot(420);
    if (Studio.sel) Studio.helper.visible = true;
    d.updated = Date.now();
    const i = S.designs.findIndex((x) => x.id === d.id);
    const copy = clone(d);
    if (i >= 0) S.designs[i] = copy;
    else S.designs.unshift(copy);
    Studio.dirty = false;
    S.working = d;
    save();
    Studio.renderBar();
    if (!quiet)
      toast(
        fork ? "Saved as a new draft" : "Design saved",
        fork ? "The submitted version stays with the studio" : "Find it any time under My account",
      );
    return true;
  }
  function submitFlow() {
    const d = Studio.design;
    if (!requireLogin(() => submitFlow())) return;
    if (!d.items.length) {
      toast("Add at least one piece before submitting");
      return;
    }
    const e = Studio.estimate();
    openModal(
      `<p class="eyebrow">Submit to Fatatelier</p><h2>${esc(d.name)}</h2><p class="muted">${d.items.length} pieces · indicative ${usd(e.low)} – ${usd(e.high)}. The studio reviews it, books a consultation and sends a quote.</p>
    <form id="sub-form" class="grid2" style="gap:14px">
      <div class="field"><label for="f-tl">When would you like it installed?</label><select class="input" id="f-tl"><option>Within 3 months</option><option selected>3–6 months</option><option>6–12 months</option><option>Just exploring</option></select></div>
      <div class="field"><label for="f-bd">Budget range</label><select class="input" id="f-bd"><option>Under $25k</option><option selected>$25k–$50k</option><option>$50k–$100k</option><option>$100k+</option></select></div>
      <div class="field"><label for="f-ct">Best way to reach you</label><select class="input" id="f-ct"><option>Email</option><option>Phone</option><option>WhatsApp</option></select></div>
      <div class="field"><label for="f-ad">Project location</label><input class="input" id="f-ad" value="${esc((me() || {}).city || "")}"></div>
      <div class="field" style="grid-column:1/-1"><label for="f-nt">Anything the designers should know?</label><textarea class="input" id="f-nt" placeholder="Ceiling height, windows to keep, appliances, how you use the room"></textarea></div>
      <div class="actions" style="grid-column:1/-1"><button class="btn primary" type="submit">Submit design</button><button class="btn ghost" type="button" data-close>Cancel</button></div>
    </form>`,
      (c) => {
        $("#sub-form", c).onsubmit = (ev) => {
          ev.preventDefault();
          d.brief = {
            timeline: $("#f-tl").value,
            budget: $("#f-bd").value,
            contact: $("#f-ct").value,
            location: $("#f-ad").value,
            notes: $("#f-nt").value.trim(),
          };
          d.status = "submitted";
          d.submittedAt = Date.now();
          saveDesign(true, true);
          closeModal();
          notify("admin", null, `New design submitted: ${d.name} by ${me().name}`);
          setTimeout(
            () =>
              notify(
                "customer",
                S.session,
                `We received “${d.name}”. A designer will be in touch within 2 business days.`,
              ),
            700,
          );
          location.hash = "account";
        };
      },
    );
  }
  function newFlow() {
    openModal(
      `<p class="eyebrow">New design</p><h2>Pick a starting room</h2><p class="muted">Each one is a real layout you can rearrange. ${Studio.dirty ? "Unsaved changes to the current design will be lost." : ""}</p>
  <div class="tpl-grid">${["kitchen", "living", "bedroom", "empty"].map((t) => `<button type="button" class="tpl" data-tpl="${t}"><b>${ROOMTYPE[t]}</b><span class="muted" style="font-size:13px">${{ kitchen: "Cabinet run, island, stools, pendants", living: "Library wall, sofa, dining for four", bedroom: "Platform bed, wardrobe, console", empty: "Bare 16′ × 14′ room" }[t]}</span></button>`).join("")}</div>
  <div class="actions"><button type="button" class="btn ghost" data-close>Cancel</button></div>`,
      (c) => {
        $$("[data-tpl]", c).forEach(
          (b) =>
            (b.onclick = () => {
              const d = newDesign(b.dataset.tpl, S.session);
              Studio.load(d, { dirty: true });
              S.working = Studio.design;
              save();
              closeModal();
            }),
        );
      },
    );
  }
  function openInStudio(id) {
    const d = S.designs.find((x) => x.id === id);
    if (!d) return;
    Studio.load(d);
    S.working = Studio.design;
    save();
    location.hash = "studio";
  }
  function setStudioTab(t) {
    $("#studio").dataset.tab = t;
    $$(".mobile-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
  }

  /* ================= auth ================= */
  function login(id) {
    S.session = id;
    save();
    renderBell();
    toast("Signed in as " + customer(id).name);
  }

  /* ================= ACCOUNT VIEW ================= */
  let accFilter = "all";
  function stageImg(src) {
    if (!src) return null;
    if (src.startsWith("stage:")) return Explore.thumb(src.slice(6));
    return src;
  }
  function renderAccount() {
    const el = $("#account");
    const u = me();
    if (!u) {
      el.innerHTML = `<div class="page-head"><div><p class="eyebrow">Customer account</p><h1 style="margin-top:8px">Your designs and projects, in one place</h1></div></div>
    <div class="auth">
      <form class="card" id="login-form"><h2>Sign in</h2><div class="field"><label for="l-em">Email</label><input class="input" id="l-em" type="email" autocomplete="email" value="daniel.reyes@example.com"></div>
        <div class="field"><label for="l-pw">Password</label><input class="input" id="l-pw" type="password" autocomplete="current-password" value="demo1234"></div><p class="muted" id="l-err" style="font-size:13px;color:var(--danger)" hidden></p>
        <button class="btn primary" type="submit">Sign in</button><p class="muted" style="font-size:12px">Demo login is filled in. Any seeded customer works with password demo1234.</p></form>
      <form class="card" id="reg-form"><h2>Create an account</h2><div class="field"><label for="r-nm">Full name</label><input class="input" id="r-nm" required autocomplete="name"></div>
        <div class="field"><label for="r-em">Email</label><input class="input" id="r-em" type="email" required autocomplete="email"></div>
        <div class="field"><label for="r-ct">City</label><input class="input" id="r-ct" placeholder="e.g. Jersey City, NJ"></div>
        <div class="field"><label for="r-pw">Password</label><input class="input" id="r-pw" type="password" minlength="6" required autocomplete="new-password"></div>
        <button class="btn" type="submit">Create account</button></form>
    </div>`;
      $("#login-form").onsubmit = (e) => {
        e.preventDefault();
        const em = $("#l-em").value.trim().toLowerCase(),
          pw = $("#l-pw").value;
        const c = S.customers.find((x) => x.email.toLowerCase() === em && x.password === pw);
        if (!c) {
          const er = $("#l-err");
          er.textContent = "That email and password don’t match an account. Try the demo login.";
          er.hidden = false;
          return;
        }
        login(c.id);
        afterLogin();
      };
      $("#reg-form").onsubmit = (e) => {
        e.preventDefault();
        const em = $("#r-em").value.trim();
        if (S.customers.some((x) => x.email.toLowerCase() === em.toLowerCase())) {
          toast("That email already has an account", "Sign in instead");
          return;
        }
        const c = {
          id: uid("c"),
          name: $("#r-nm").value.trim(),
          email: em,
          password: $("#r-pw").value,
          city: $("#r-ct").value.trim(),
          phone: "",
          joined: Date.now(),
          prefs: { email: true, inapp: true, sms: false, whatsapp: false },
        };
        S.customers.push(c);
        login(c.id);
        notify("admin", null, `New customer registered: ${c.name}`);
        afterLogin();
      };
      return;
    }
    const designs = S.designs.filter((d) => d.owner === u.id);
    const projects = S.projects.filter((p) => p.customer === u.id);
    const shown = designs.filter(
      (d) =>
        accFilter === "all" ||
        (accFilter === "draft"
          ? d.status === "draft"
          : accFilter === "open"
            ? ["submitted", "in_review", "quoted"].includes(d.status)
            : d.status === "approved"),
    );
    el.innerHTML = `<div class="page-head"><div><p class="eyebrow">My account</p><h1 style="margin-top:8px">Welcome back, ${esc(u.name.split(" ")[0])}</h1></div>
    <div class="actions"><a class="btn primary" href="#studio">Open design studio</a><button type="button" class="btn ghost" id="logout">Sign out</button></div></div>
    <section><div class="sec-head"><h2>Projects</h2><span class="muted" style="font-size:13px">${projects.filter((p) => p.stage < 3).length} active · ${projects.filter((p) => p.stage === 3).length} completed</span></div>
      <div style="display:grid;gap:16px">${projects.length ? projects.map(trackCard).join("") : `<div class="card" style="padding:22px"><p class="muted">No projects yet. Once Fatatelier approves a design and the build starts, you can follow every stage here.</p></div>`}</div></section>
    <section><div class="sec-head"><h2>Designs</h2><div class="filters" id="acc-filters">${[
      ["all", "All"],
      ["draft", "Drafts"],
      ["open", "Submitted"],
      ["approved", "Approved"],
    ]
      .map(
        ([k, l]) =>
          `<button type="button" data-f="${k}" class="${k === accFilter ? "on" : ""}">${l}</button>`,
      )
      .join("")}</div></div>
      <div class="dgrid">${shown.map(designCard).join("") || `<p class="muted">Nothing here yet.</p>`}</div></section>
    <section><div class="sec-head"><h2>How we reach you</h2><span class="muted" style="font-size:13px">For submissions, quotes, stage changes and new progress posts</span></div>
      <div class="prefs">${[
        ["email", "Email", "Every update"],
        ["inapp", "In-app", "Bell icon on this site"],
        ["sms", "SMS", "Optional add-on"],
        ["whatsapp", "WhatsApp", "Optional add-on"],
      ]
        .map(
          ([k, l, s]) =>
            `<label class="tog" for="pf-${k}"><span>${l}<small>${s}</small></span><input class="switch" type="checkbox" id="pf-${k}" data-pref="${k}" ${u.prefs[k] ? "checked" : ""}></label>`,
        )
        .join("")}</div></section>`;
    $("#logout").onclick = () => {
      S.session = null;
      save();
      renderBell();
      renderAccount();
    };
    $$("#acc-filters button").forEach(
      (b) =>
        (b.onclick = () => {
          accFilter = b.dataset.f;
          renderAccount();
        }),
    );
    $$("[data-pref]").forEach(
      (i) =>
        (i.onchange = () => {
          u.prefs[i.dataset.pref] = i.checked;
          save();
          toast("Notification settings updated");
        }),
    );
    $$("[data-open]", el).forEach((b) => (b.onclick = () => openInStudio(b.dataset.open)));
    $$("[data-accept]", el).forEach(
      (b) =>
        (b.onclick = () => {
          const d = S.designs.find((x) => x.id === b.dataset.accept);
          d.status = "approved";
          d.acceptedAt = Date.now();
          save();
          notify("admin", null, `${u.name} accepted the ${usd(d.quote)} quote for ${d.name}`);
          renderAccount();
        }),
    );
    $$("[data-del]", el).forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.del;
          openModal(
            `<h2>Delete this draft?</h2><p class="muted">It will be removed from your account.</p><div class="actions"><button type="button" class="btn danger" id="m-yes">Delete draft</button><button type="button" class="btn ghost" data-close>Keep it</button></div>`,
            (c) => {
              $("#m-yes", c).onclick = () => {
                S.designs = S.designs.filter((x) => x.id !== id);
                save();
                closeModal();
                renderAccount();
              };
            },
          );
        }),
    );
  }
  function afterLogin() {
    if (S.after === "studio") {
      S.after = null;
      location.hash = "studio";
    } else renderAccount();
  }
  function designCard(d) {
    const e = estimateFor(d);
    return `<article class="card dcard"><div class="thumb">${d.thumb ? `<img src="${d.thumb}" alt="3D preview of ${esc(d.name)}">` : esc(ROOMTYPE[d.room.template])}</div>
    <div class="body"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><b>${esc(d.name)}</b><span class="pill ${d.status}">${STATUS[d.status]}</span></div>
    <div class="meta"><span>${esc(ROOMTYPE[d.room.template])} · ${d.items.length} pieces</span><span class="mono">${usd(e.total)}</span></div>
    <div class="meta"><span>${d.submittedAt ? "Submitted " + fdate(d.submittedAt) : "Edited " + ago(d.updated)}</span></div>
    ${d.status === "quoted" ? `<div class="quote"><span>Quote from Fatatelier</span><b>${usd(d.quote)}</b></div>` : ""}</div>
    <div class="acts"><button type="button" class="btn sm" data-open="${d.id}">${d.status === "draft" ? "Continue designing" : "View in 3D"}</button>
    ${d.status === "quoted" ? `<button type="button" class="btn sm primary" data-accept="${d.id}">Accept quote</button>` : ""}${d.status === "draft" ? `<button type="button" class="btn sm ghost" data-del="${d.id}">Delete</button>` : ""}</div></article>`;
  }
  function estimateFor(d) {
    const keep = Studio.design;
    Studio.design = d;
    const e = Studio.estimate();
    Studio.design = keep;
    return e;
  }
  function trackCard(p) {
    const cur = p.stage;
    const doneMs = p.milestones.filter((m) => m.done).length;
    return `<article class="card track"><div class="track-head"><div><p class="eyebrow">${esc(p.address)} · started ${fdate(p.started)}</p><h3 style="margin-top:6px">${esc(p.title)}</h3></div><span class="pill ${cur === 3 ? "ok" : "warn"}">${STAGES[cur]}</span></div>
    <div class="stepper">${STAGES.map((s, i) => `<div class="st ${i < cur || cur === 3 ? "done" : ""} ${i === cur && cur < 3 ? "cur" : ""}">${s}</div>`).join("")}</div>
    <div class="track-body"><div><p class="eyebrow" style="margin-bottom:8px">Milestones · ${doneMs} of ${p.milestones.length}</p><ul class="ms">${p.milestones.map((m) => `<li class="${m.done ? "done" : ""}"><span class="box">${m.done ? "✓" : ""}</span><span>${esc(m.label)}</span></li>`).join("")}</ul></div>
    <div><p class="eyebrow" style="margin-bottom:12px">Updates from the shop</p><div class="feed">${
      p.updates
        .map((u) => {
          const img = stageImg(u.img);
          return `<div class="upd"><div class="ph">${img ? `<img src="${img}" alt="Progress photo">` : "No photo"}</div><div><div class="meta"><span>${fdate(u.t)}</span><span class="chip">${STAGES[u.stage]}</span></div><p>${esc(u.text)}</p></div></div>`;
        })
        .join("") || '<p class="muted">No updates yet.</p>'
    }</div></div></div></article>`;
  }

  /* ================= ADMIN VIEW ================= */
  let admTab = "subs",
    admSel = null,
    admProj = "p1";
  function renderAdmin() {
    const el = $("#admin");
    const subs = S.designs
      .filter((d) => d.status !== "draft")
      .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    const awaiting = subs.filter((d) => d.status === "submitted").length,
      quotes = subs.filter((d) => d.status === "quoted").length,
      active = S.projects.filter((p) => p.stage < 3).length;
    const pipe = subs
      .filter((d) => d.status !== "approved")
      .reduce((a, d) => a + (d.quote || estimateFor(d).total), 0);
    el.innerHTML = `<div class="page-head"><div><p class="eyebrow">Fatatelier team</p><h1 style="margin-top:8px">Studio dashboard</h1></div><span class="muted" style="font-size:13px">Signed in as Damilola Afolabi, Operations</span></div>
    <div class="kpis"><div class="kpi"><b class="mono">${awaiting}</b><span>New submissions to review</span></div><div class="kpi"><b class="mono">${quotes}</b><span>Quotes waiting on customers</span></div><div class="kpi"><b class="mono">${active}</b><span>Projects in production</span></div><div class="kpi"><b class="mono">${usd(pipe / 1000)}k</b><span>Open pipeline value</span></div></div>
    <div><div class="tabs" id="adm-tabs">${[
      ["subs", "Submissions"],
      ["proj", "Projects"],
      ["cust", "Customers"],
      ["cat", "Catalog and finishes"],
    ]
      .map(
        ([k, l]) => `<button type="button" data-t="${k}" class="${k === admTab ? "on" : ""}">${l}</button>`,
      )
      .join("")}</div><div id="adm-body" style="padding-top:20px"></div></div>`;
    $$("#adm-tabs button").forEach(
      (b) =>
        (b.onclick = () => {
          admTab = b.dataset.t;
          renderAdmin();
        }),
    );
    const body = $("#adm-body");
    if (admTab === "subs") {
      body.innerHTML = `<div class="tbl-wrap"><table><thead><tr><th>Design</th><th>Customer</th><th>Submitted</th><th class="num">Estimate</th><th>Status</th><th></th></tr></thead><tbody>
      ${subs
        .map((d) => {
          const c = customer(d.owner) || {};
          return `<tr class="${d.id === admSel ? "sel" : ""}"><td><b>${esc(d.name)}</b><div class="muted" style="font-size:12px">${esc(ROOMTYPE[d.room.template])} · ${d.items.length} pieces</div></td><td>${esc(c.name)}</td><td>${d.submittedAt ? fdate(d.submittedAt) : ""}</td><td class="num">${usd(d.quote || estimateFor(d).total)}</td><td><span class="pill ${d.status}">${STATUS[d.status]}</span></td><td><button type="button" class="btn sm" data-rev="${d.id}">${d.id === admSel ? "Close" : "Review"}</button></td></tr>`;
        })
        .join("")}</tbody></table></div><div id="review"></div>`;
      $$("[data-rev]", body).forEach(
        (b) =>
          (b.onclick = () => {
            admSel = admSel === b.dataset.rev ? null : b.dataset.rev;
            renderAdmin();
          }),
      );
      if (admSel)
        renderReview(
          $("#review"),
          S.designs.find((d) => d.id === admSel),
        );
    }
    if (admTab === "proj") renderAdminProjects(body);
    if (admTab === "cust") {
      body.innerHTML = `<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Location</th><th class="num">Designs</th><th class="num">Projects</th><th>Joined</th></tr></thead><tbody>
    ${S.customers.map((c) => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.email)}</td><td>${esc(c.city)}</td><td class="num">${S.designs.filter((d) => d.owner === c.id).length}</td><td class="num">${S.projects.filter((p) => p.customer === c.id).length}</td><td>${fdate(c.joined)}</td></tr>`).join("")}</tbody></table></div>`;
    }
    if (admTab === "cat") {
      body.innerHTML = `<div class="sec-head"><h2 style="font-size:24px">Products</h2><span class="muted" style="font-size:13px">Price changes show up in the studio straight away</span></div>
    <div class="tbl-wrap"><table><thead><tr><th>Piece</th><th>Category</th><th>Size</th><th class="num">Base price (USD)</th><th>In studio</th></tr></thead><tbody>
    ${Object.keys(CATALOG)
      .map((t) => {
        const c = CATALOG[t];
        return `<tr><td><b>${esc(c.name)}</b></td><td>${c.cat}</td><td class="mono">${ftin(c.w)} × ${ftin(c.d)}</td><td class="num"><input class="input mono" style="width:110px;text-align:right;min-height:34px" type="number" min="0" step="10" value="${priceOf(t)}" data-price="${t}" aria-label="Price for ${esc(c.name)}"></td><td><input class="switch" type="checkbox" ${typeActive(t) ? "checked" : ""} data-active="${t}" aria-label="Show ${esc(c.name)} in studio"></td></tr>`;
      })
      .join("")}</tbody></table></div>
    <div class="sec-head" style="margin-top:28px"><h2 style="font-size:24px">Finishes and materials</h2><span class="muted" style="font-size:13px">Switch off anything the shop can't source right now</span></div>
    ${Object.keys(SLOT_SETS)
      .map(
        (s) =>
          `<p class="eyebrow" style="margin:14px 0 8px">${SLOT_LABEL[s]}</p><div class="fin-grid">${Object.keys(
            SLOT_SETS[s],
          )
            .map((k) => {
              const o = SLOT_SETS[s][k];
              return `<label class="tog" for="op-${s}-${k}"><span style="display:flex;gap:10px;align-items:center"><span class="sw" style="width:22px;height:22px;background:${o.marble ? "linear-gradient(135deg,#efede8 40%,#9a968e 50%,#efede8 60%)" : o.hex}"></span>${esc(o.name)}</span><input class="switch" type="checkbox" id="op-${s}-${k}" data-opt="${s}:${k}" ${optActive(s, k) ? "checked" : ""}></label>`;
            })
            .join("")}</div>`,
      )
      .join("")}`;
      $$("[data-price]", body).forEach(
        (i) =>
          (i.onchange = () => {
            const t = i.dataset.price;
            S.catalog[t] = Object.assign({}, S.catalog[t], { price: Math.max(0, +i.value || 0) });
            save();
            Studio.renderCatalog();
            Studio.renderEstimate();
            toast(CATALOG[t].name + " now " + usd(priceOf(t)));
          }),
      );
      $$("[data-active]", body).forEach(
        (i) =>
          (i.onchange = () => {
            const t = i.dataset.active;
            S.catalog[t] = Object.assign({}, S.catalog[t], { active: i.checked });
            save();
            Studio.renderCatalog();
            toast(CATALOG[t].name + (i.checked ? " is back in the studio" : " hidden from the studio"));
          }),
      );
      $$("[data-opt]", body).forEach(
        (i) =>
          (i.onchange = () => {
            const k = i.dataset.opt;
            S.inactive = S.inactive.filter((x) => x !== k);
            if (!i.checked) S.inactive.push(k);
            save();
            Studio.renderInspector();
          }),
      );
    }
  }
  function renderReview(box, d) {
    const c = customer(d.owner) || {};
    const e = estimateFor(d);
    const b = d.brief || {};
    const proj = S.projects.find((p) => p.designId === d.id);
    box.innerHTML = `<div class="card review" style="margin-top:16px"><div style="display:grid;gap:14px;align-content:start"><div class="thumb">${d.thumb ? `<img src="${d.thumb}" alt="3D preview">` : esc(ROOMTYPE[d.room.template])}</div>
    <div class="itemlist">${e.lines.map((l) => `<div><span>${esc(l.label)}</span><span class="mono">${usd(l.p)}</span></div>`).join("")}<div><b>Indicative total</b><b class="mono">${usd(e.total)}</b></div></div>
    <button type="button" class="btn sm" data-open3d="${d.id}" style="justify-self:start">Open in 3D studio</button></div>
    <div style="display:grid;gap:16px;align-content:start"><div><p class="eyebrow">${esc(c.name)} · ${esc(c.email)}</p><h3 style="font-size:28px;margin-top:6px">${esc(d.name)}</h3></div>
    <dl class="facts"><dt>Room</dt><dd class="mono">${esc(ROOMTYPE[d.room.template])} · ${ftin(d.room.w)} × ${ftin(d.room.d)}</dd><dt>Timeline</dt><dd>${esc(b.timeline || "Not given")}</dd><dt>Budget</dt><dd>${esc(b.budget || "Not given")}</dd><dt>Contact by</dt><dd>${esc(b.contact || "Email")}</dd><dt>Location</dt><dd>${esc(b.location || c.city || "")}</dd><dt>Notes</dt><dd>${esc(b.notes || "None")}</dd></dl>
    <div class="actions" id="rev-actions"></div></div></div>`;
    const a = $("#rev-actions", box);
    if (d.status === "submitted") {
      a.innerHTML = `<button type="button" class="btn primary" id="ra">Start review</button>`;
      $("#ra").onclick = () => {
        d.status = "in_review";
        save();
        notify("customer", d.owner, `A designer is reviewing “${d.name}”`);
        renderAdmin();
      };
    }
    if (d.status === "in_review") {
      a.innerHTML = `<div class="field"><label for="q-amt">Quote amount (USD)</label><input class="input mono" id="q-amt" type="number" step="100" value="${Math.round(e.total / 100) * 100}" style="width:160px"></div><button type="button" class="btn primary" id="ra">Send quote</button>`;
      $("#ra").onclick = () => {
        d.quote = Math.max(0, +$("#q-amt").value || 0);
        d.status = "quoted";
        save();
        notify("customer", d.owner, `Your quote for “${d.name}” is ready: ${usd(d.quote)}`);
        renderAdmin();
      };
    }
    if (d.status === "quoted") {
      a.innerHTML = `<p class="muted" style="font-size:13px">Quote of <b class="mono">${usd(d.quote)}</b> sent. Waiting for the customer to accept in their account.</p><button type="button" class="btn" id="ra">Mark accepted</button>`;
      $("#ra").onclick = () => {
        d.status = "approved";
        save();
        renderAdmin();
      };
    }
    if (d.status === "approved" && !proj) {
      a.innerHTML = `<button type="button" class="btn primary" id="ra">Start project</button>`;
      $("#ra").onclick = () => {
        const p = {
          id: uid("p"),
          designId: d.id,
          customer: d.owner,
          title: d.name,
          address: (d.brief && d.brief.location) || c.city || "",
          stage: 0,
          started: Date.now(),
          milestones: [
            "Design sign-off",
            "Shop drawings approved",
            "Fabrication",
            "Finishing",
            "Delivery and installation",
            "Final walkthrough",
          ].map((l) => ({ label: l, done: false })),
          updates: [],
        };
        S.projects.unshift(p);
        save();
        notify("customer", d.owner, `Your project “${d.name}” has started`);
        admTab = "proj";
        admProj = p.id;
        renderAdmin();
      };
    }
    if (d.status === "approved" && proj) {
      a.innerHTML = `<button type="button" class="btn" id="ra">Go to project</button>`;
      $("#ra").onclick = () => {
        admTab = "proj";
        admProj = proj.id;
        renderAdmin();
      };
    }
    const o = $("[data-open3d]", box);
    o.onclick = () => openInStudio(d.id);
  }
  let pendingPhoto = null;
  function renderAdminProjects(body) {
    if (!S.projects.length) {
      body.innerHTML =
        '<p class="muted">No projects yet. Approve a submission and start a project from the Submissions tab.</p>';
      return;
    }
    if (!S.projects.find((p) => p.id === admProj)) admProj = S.projects[0].id;
    const p = S.projects.find((x) => x.id === admProj);
    const c = customer(p.customer) || {};
    body.innerHTML = `<div class="proj-admin"><div class="plist">${S.projects.map((x) => `<button type="button" data-p="${x.id}" class="${x.id === admProj ? "on" : ""}"><b>${esc(x.title)}</b><span class="muted" style="font-size:12px">${esc((customer(x.customer) || {}).name)} · ${STAGES[x.stage]}</span></button>`).join("")}</div>
    <div class="card"><div class="track" style="padding-bottom:10px"><div class="track-head"><div><p class="eyebrow">${esc(c.name)} · ${esc(p.address)}</p><h3 style="margin-top:6px">${esc(p.title)}</h3></div>
      <div class="actions"><div class="field"><label for="pj-stage">Stage</label><select class="input" id="pj-stage">${STAGES.map((s, i) => `<option value="${i}" ${i === p.stage ? "selected" : ""}>${s}</option>`).join("")}</select></div><button type="button" class="btn" id="pj-stage-btn">Update stage</button></div></div>
      <div class="stepper">${STAGES.map((s, i) => `<div class="st ${i < p.stage || p.stage === 3 ? "done" : ""} ${i === p.stage && p.stage < 3 ? "cur" : ""}">${s}</div>`).join("")}</div>
      <div><p class="eyebrow" style="margin-bottom:8px">Milestones</p><ul class="ms">${p.milestones.map((m, i) => `<li class="${m.done ? "done" : ""}"><input type="checkbox" id="ms-${i}" data-ms="${i}" ${m.done ? "checked" : ""} style="accent-color:var(--brass)"><label for="ms-${i}"><span>${esc(m.label)}</span></label></li>`).join("")}</ul></div></div>
      <form class="post" id="post-form"><p class="eyebrow">Post a progress update</p>
        <div class="field"><label for="pu-text">What happened?</label><textarea class="input" id="pu-text" required placeholder="e.g. Door fronts are sprayed and curing. Install crew booked for the 14th."></textarea></div>
        <div class="post-row"><div class="field"><label for="pu-file">Photo (video uploads come with the production build)</label><input class="input" id="pu-file" type="file" accept="image/*"></div>
        <div class="field"><label for="pu-stage">Tag stage</label><select class="input" id="pu-stage">${STAGES.map((s, i) => `<option value="${i}" ${i === p.stage ? "selected" : ""}>${s}</option>`).join("")}</select></div></div>
        <div class="actions"><button class="btn primary" type="submit">Post update and notify ${esc(c.name.split(" ")[0])}</button><span class="muted" id="pu-prev" style="font-size:12px"></span></div></form>
      <div class="track" style="padding-top:8px"><p class="eyebrow">Posted updates</p><div class="feed">${
        p.updates
          .map((u) => {
            const img = stageImg(u.img);
            return `<div class="upd"><div class="ph">${img ? `<img src="${img}" alt="Progress photo">` : "No photo"}</div><div><div class="meta"><span>${fdate(u.t)}</span><span class="chip">${STAGES[u.stage]}</span></div><p>${esc(u.text)}</p></div></div>`;
          })
          .join("") || '<p class="muted">Nothing posted yet.</p>'
      }</div></div></div></div>`;
    $$("[data-p]", body).forEach(
      (b) =>
        (b.onclick = () => {
          admProj = b.dataset.p;
          pendingPhoto = null;
          renderAdmin();
        }),
    );
    $("#pj-stage-btn").onclick = () => {
      const v = +$("#pj-stage").value;
      if (v === p.stage) {
        toast("Already at " + STAGES[v]);
        return;
      }
      p.stage = v;
      save();
      notify("customer", p.customer, `${p.title} moved to ${STAGES[v]}`);
      renderAdmin();
    };
    $$("[data-ms]", body).forEach(
      (i) =>
        (i.onchange = () => {
          const m = p.milestones[+i.dataset.ms];
          m.done = i.checked;
          save();
          if (m.done) notify("customer", p.customer, `Milestone reached on ${p.title}: ${m.label}`);
          renderAdmin();
        }),
    );
    $("#pu-file").onchange = (e) => {
      const f = e.target.files[0];
      pendingPhoto = null;
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        const im = new Image();
        im.onload = () => {
          const w = Math.min(800, im.width),
            h = Math.round((w * im.height) / im.width);
          const cv = document.createElement("canvas");
          cv.width = w;
          cv.height = h;
          cv.getContext("2d").drawImage(im, 0, 0, w, h);
          pendingPhoto = cv.toDataURL("image/jpeg", 0.8);
          $("#pu-prev").textContent = "Photo ready: " + f.name;
        };
        im.onerror = () => {
          $("#pu-prev").textContent = "That file couldn’t be read as an image. Try a JPG or PNG.";
        };
        im.src = r.result;
      };
      r.readAsDataURL(f);
    };
    $("#post-form").onsubmit = (e) => {
      e.preventDefault();
      const t = $("#pu-text").value.trim();
      if (!t) return;
      p.updates.unshift({
        id: uid("u"),
        t: Date.now(),
        stage: +$("#pu-stage").value,
        text: t,
        img: pendingPhoto,
      });
      pendingPhoto = null;
      save();
      notify("customer", p.customer, `New progress update on ${p.title}`);
      renderAdmin();
    };
  }

  /* ================= routing ================= */
  let current = null;
  const VIEWS = ["home", "explore", "studio", "account", "admin"];
  function route() {
    let v = (location.hash || "#home").slice(1);
    if (!VIEWS.includes(v)) v = "home";
    if (v === "admin" && S.role !== "admin") setRole("admin", true);
    if (v === "account" && S.role === "admin") setRole("customer", true);
    current = v;
    $$(".view").forEach((s) => s.classList.toggle("on", s.id === "view-" + v));
    $$("#nav a").forEach((a) => a.classList.toggle("on", a.dataset.view === v));
    if (v === "explore") {
      Explore.st.resize();
      Explore.st.start();
      renderBA();
    } else Explore.st.stop();
    if (v === "studio") {
      Studio.st.resize();
      Studio.st.start();
      Studio.renderAll();
    } else Studio.st.stop();
    if (v === "account") renderAccount();
    if (v === "admin") renderAdmin();
    window.scrollTo(0, 0);
  }
  function setRole(r, silent) {
    S.role = r;
    save();
    document.body.classList.toggle("role-admin", r === "admin");
    $$("#role-seg button").forEach((b) => b.classList.toggle("on", b.dataset.role === r));
    renderBell();
    if (!silent) {
      if (r === "admin" && current !== "admin") location.hash = "admin";
      else if (r === "customer" && current === "admin") location.hash = "account";
    }
  }
  function renderBA() {
    const a = $("#ba-after"),
      b = $("#ba-before");
    if (!a.src) a.src = Explore.thumb("final");
    if (!b.src) b.src = Explore.thumb("before");
  }

  /* ================= boot ================= */
  function boot() {
    Explore.init();
    Studio.init();
    // design thumbnails for seeded designs
    S.designs.forEach((d) => {
      if (!d.thumb) {
        Studio.load(d, { silent: true });
        d.thumb = Studio.st.snapshot(420);
      }
    });
    Studio.load(S.working && S.working.items ? S.working : newDesign("kitchen", S.session), {
      silent: true,
      dirty: !!S.working,
    });
    save();
    $("#hotspots").innerHTML = HOTSPOTS.map(
      (h, i) =>
        `<button type="button" class="hs" data-hs="${i}"><span class="n">${String(i + 1).padStart(2, "0")}</span><b>${esc(h.label)}</b><span>${esc(h.note)}</span></button>`,
    ).join("");
    $$("[data-hs]").forEach(
      (b) =>
        (b.onclick = () => {
          const h = HOTSPOTS[+b.dataset.hs];
          Explore.setStage("final");
          Explore.flyTo(h.p, h.t);
          if (matchMedia("(max-width:980px)").matches)
            $("#explore-stage").scrollIntoView({ behavior: "smooth" });
        }),
    );
    $("#proj-grid").innerHTML = PORTFOLIO.map(
      ([n, c, l, live]) =>
        `<div class="proj"><span class="eyebrow">${esc(c)}</span><b>${esc(n)}</b><span class="muted" style="font-size:13px">${esc(l)}</span><div class="row">${live ? '<span class="pill ok">3D tour live</span><a class="btn sm" href="#explore" data-top="1">Open tour</a>' : '<span class="pill">Tour in production</span><a class="btn sm ghost" href="https://fatatelier.com/projects/" target="_blank" rel="noopener">See photos</a>'}</div></div>`,
    ).join("");
    $$("[data-top]").forEach((a) => (a.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" })));
    $$("#exp-stages button").forEach((b) => (b.onclick = () => Explore.setStage(b.dataset.stage)));
    $("#walk-btn").onclick = () => Explore.setWalk(!Explore.walk);
    $("#exp-reset").onclick = () => {
      if (Explore.walk) Explore.setWalk(false);
      else Explore.home();
    };
    const range = $("#ba-range");
    range.oninput = () => $("#ba").style.setProperty("--p", range.value + "%");
    $("#design-like").onclick = (e) => {
      e.preventDefault();
      const d = newDesign("kitchen", S.session);
      d.name = "Kitchen like Livingston";
      d.items.forEach((i) => {
        if (i.finish.body) i.finish.body = i.type === "island" || i.type === "stool" ? "ebony" : "walnut";
      });
      Studio.load(d, { dirty: true });
      S.working = Studio.design;
      save();
      location.hash = "studio";
    };
    $("#design-name").addEventListener("input", (e) => {
      Studio.design.name = e.target.value || "Untitled design";
      Studio.dirty = true;
      S.working = Studio.design;
      save();
      $("#save-state").textContent = "Unsaved changes";
    });
    $("#btn-save").onclick = () => saveDesign();
    $("#btn-submit").onclick = submitFlow;
    $("#btn-new").onclick = newFlow;
    $("#st-reset").onclick = () => Studio.frame();
    $("#st-top").onclick = () => Studio.frame(true);
    $("#st-grid").onclick = (e) => {
      const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
      e.currentTarget.setAttribute("aria-pressed", String(on));
      Studio.grid.visible = on;
    };
    $$(".mobile-tabs button").forEach((b) => (b.onclick = () => setStudioTab(b.dataset.tab)));
    $$("#role-seg button").forEach((b) => (b.onclick = () => setRole(b.dataset.role)));
    $("#bell-btn").onclick = (e) => {
      e.stopPropagation();
      const p = $("#bell-pop");
      p.hidden = !p.hidden;
      $("#bell-btn").setAttribute("aria-expanded", String(!p.hidden));
    };
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#bell-pop,#bell-btn")) $("#bell-pop").hidden = true;
    });
    $("#reset-demo").onclick = () =>
      openModal(
        `<h2>Reset the demo?</h2><p class="muted">Clears saved designs, submissions, projects and notifications in this browser and restores the sample data.</p><div class="actions"><button type="button" class="btn primary" id="m-reset">Reset demo</button><button type="button" class="btn ghost" data-close>Cancel</button></div>`,
        (c) => {
          $("#m-reset", c).onclick = () => {
            try {
              localStorage.removeItem(KEY);
            } catch (_) {}
            location.hash = "home";
            location.reload();
          };
        },
      );
    const themeSync = () => {
      Explore.st.setBg();
      Studio.st.setBg();
    };
    try {
      matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeSync);
    } catch (_) {}
    new MutationObserver(themeSync).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    setRole(S.role || "customer", true);
    renderBell();
    window.addEventListener("hashchange", route);
    route();
  }
  if (!window.THREE || !THREE.OrbitControls) {
    document
      .querySelector("main")
      .insertAdjacentHTML(
        "afterbegin",
        '<div class="wrap" style="padding-block:24px"><div class="card" style="padding:20px"><b>The 3D engine didn’t load.</b> <span class="muted">Check the connection and refresh. The studio and tours need WebGL.</span></div></div>',
      );
  } else boot();
})();
