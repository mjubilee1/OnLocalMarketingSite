# Examples

## Example A — Plated dinner (revision with change)

**Ask:** “Gaylord banquet plate — chicken moved to guest’s right this week.”

**Demo blurb:** Crew watch Alex build the plate, then drag protein, starch, veg, sauce, and garnish into place. A miss stays in the tray until the standard is right.

**Design notes:**
- Template: `plate`
- Principles used: worked example → place check; change note names the swap
- Photos: optional house chicken / starch; built-ins fine for demo

```json
{
  "id": "banquet-plated-dinner",
  "department": "banquets",
  "title": "Plated dinner — banquet standard",
  "venue": "Gaylord Hotel",
  "status": "draft",
  "version": 2,
  "updatedAt": "2026-10-08",
  "template": "plate",
  "scene": {
    "kind": "plate",
    "items": [
      { "id": "plate", "kind": "plate", "label": "Plate", "x": 50, "y": 52, "z": 0 },
      { "id": "chicken", "kind": "chicken", "label": "Chicken", "x": 66, "y": 50, "z": 2 },
      { "id": "starch", "kind": "starch", "label": "Potato", "x": 36, "y": 42, "z": 2 },
      { "id": "veg", "kind": "veg", "label": "Vegetables", "x": 60, "y": 62, "z": 2 },
      { "id": "sauce", "kind": "sauce", "label": "Sauce", "x": 50, "y": 38, "z": 2 },
      { "id": "garnish", "kind": "garnish", "label": "Garnish", "x": 48, "y": 64, "z": 3 }
    ]
  },
  "previousScene": {
    "kind": "plate",
    "items": [
      { "id": "plate", "kind": "plate", "label": "Plate", "x": 50, "y": 52, "z": 0 },
      { "id": "chicken", "kind": "chicken", "label": "Chicken", "x": 34, "y": 50, "z": 2 },
      { "id": "starch", "kind": "starch", "label": "Potato", "x": 62, "y": 42, "z": 2 },
      { "id": "veg", "kind": "veg", "label": "Vegetables", "x": 60, "y": 62, "z": 2 },
      { "id": "sauce", "kind": "sauce", "label": "Sauce", "x": 50, "y": 38, "z": 2 },
      { "id": "garnish", "kind": "garnish", "label": "Garnish", "x": 48, "y": 64, "z": 3 }
    ]
  },
  "steps": [
    {
      "id": "s1",
      "caption": "Start with a clean dinner plate, 12 o’clock facing the guest.",
      "anim": "appear",
      "itemIds": ["plate"]
    },
    {
      "id": "s2",
      "caption": "Protein sits on the guest’s right. Chef moved chicken from the left this week.",
      "anim": "appear",
      "itemIds": ["chicken"]
    },
    {
      "id": "s3",
      "caption": "Starch sits on the guest’s left, opposite the protein.",
      "anim": "appear",
      "itemIds": ["starch"]
    },
    {
      "id": "s4",
      "caption": "Vegetables at 5 o’clock. Sauce at 12. Garnish last.",
      "anim": "appear",
      "itemIds": ["veg", "sauce", "garnish"]
    },
    {
      "id": "s5",
      "caption": "Same plate, every server, every room tonight.",
      "anim": "highlight",
      "itemIds": ["chicken", "starch", "veg"]
    }
  ],
  "checks": [
    {
      "id": "place-protein",
      "kind": "place",
      "prompt": "Build the plate. Drag each item onto the correct spot — chicken on the right.",
      "itemIds": ["chicken", "starch", "veg", "sauce", "garnish"],
      "start": {
        "chicken": { "x": 16, "y": 88 },
        "starch": { "x": 34, "y": 88 },
        "veg": { "x": 52, "y": 88 },
        "sauce": { "x": 70, "y": 88 },
        "garnish": { "x": 86, "y": 88 }
      }
    },
    {
      "id": "spot-change",
      "kind": "spot",
      "prompt": "What changed this week? Tap the piece that moved.",
      "itemIds": ["chicken", "starch", "veg", "sauce", "garnish"],
      "correctId": "chicken"
    }
  ],
  "changeNotes": [
    {
      "version": 2,
      "date": "2026-10-08",
      "summary": "Chicken moved from the left side of the plate to the right. Potato swaps to the left.",
      "itemIds": ["chicken", "starch"]
    }
  ]
}
```

## Example B — Coffee station (v1, no prior scene)

**Ask:** “Morning break station — urn, cups, milk, pastry line.”

**Demo blurb:** Crew watch the guest line build left-to-right, then place urn, cups, milk, and pastry so the flow matches the property standard.

**Design notes:**
- Template: `station`
- Principles used: dual channel + place check; no spot check until a revision ships
- Keep movable items small (4)

```json
{
  "id": "banquet-coffee-station",
  "department": "banquets",
  "title": "Coffee station — guest line",
  "venue": "Gaylord Hotel",
  "status": "draft",
  "version": 1,
  "updatedAt": "2026-10-11",
  "template": "station",
  "scene": {
    "kind": "station",
    "items": [
      { "id": "urn", "kind": "urn", "label": "Coffee urn", "x": 22, "y": 48, "z": 2 },
      { "id": "cups", "kind": "cups", "label": "Cups", "x": 40, "y": 52, "z": 2 },
      { "id": "milk", "kind": "milk", "label": "Milk", "x": 58, "y": 50, "z": 2 },
      { "id": "pastry", "kind": "pastry", "label": "Pastry", "x": 76, "y": 52, "z": 2 }
    ]
  },
  "steps": [
    {
      "id": "s1",
      "caption": "Guest line runs left to right. Start with the coffee urn.",
      "anim": "appear",
      "itemIds": ["urn"]
    },
    {
      "id": "s2",
      "caption": "Cups next — never make a guest reach past the milk for a cup.",
      "anim": "appear",
      "itemIds": ["cups"]
    },
    {
      "id": "s3",
      "caption": "Milk and pastry finish the line. Keep labels facing the guest.",
      "anim": "appear",
      "itemIds": ["milk", "pastry"]
    },
    {
      "id": "s4",
      "caption": "That’s the station standard for every break today.",
      "anim": "highlight",
      "itemIds": ["urn", "cups", "milk", "pastry"]
    }
  ],
  "checks": [
    {
      "id": "place-station",
      "kind": "place",
      "prompt": "Build the guest line. Drag each piece into place — left to right.",
      "itemIds": ["urn", "cups", "milk", "pastry"],
      "start": {
        "urn": { "x": 20, "y": 88 },
        "cups": { "x": 40, "y": 88 },
        "milk": { "x": 60, "y": 88 },
        "pastry": { "x": 80, "y": 88 }
      }
    }
  ],
  "changeNotes": []
}
```

## Example C — Weak → strong caption rewrite

| Weak | Strong |
|------|--------|
| “Please ensure all items are positioned according to banquet SOP section 4.” | “Protein on the guest’s right. Starch opposite.” |
| “Now we will discuss the importance of consistency.” | “Same plate, every server, every room tonight.” |
| “Select the incorrect option regarding napkin folds.” | *(use a place/spot check instead of a trivia quiz)* |

## Pairing with GenAI video

1. **Video** (Subash-style): welcome / bed-making / culture — watch-only buy-in  
2. **Practice** (this skill): setup board — do-first skill check  
3. Demo line: “Video for why. Practice for can-they-do-it.”
