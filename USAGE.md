# Building a Doughnut Economics City Portrait

This toolkit helps you build a data-driven city portrait using Kate Raworth's Doughnut Economics framework — 12 social foundations and 9 ecological ceilings, each with sourced indicators.

## Quick Start

1. Open `example-portrait.html` in a browser to see a working portrait (Santa Cruz, CA with real data)
2. Click any segment to see data, sources, and community actions
3. Click **AI Settings** to connect an AI provider for automated research

## Files

| File | What it does |
|------|-------------|
| `example-portrait.html` | Working demo — open in browser |
| `example-data.js` | Real sourced data (Santa Cruz, CA) — replace with your city |
| `agent-ui.js` | Browser AI agent — researches any dimension on demand |
| `doughnut.js` | Canvas visualization engine |
| `doughnut-detail.js` | Click-to-view detail panel extension |
| `data-gaps.html` | See which dimensions have data and which need research |
| `outreach-template.html` | Directory template for contacting local data sources |
| `tools/` | CLI research agent (Node.js) |

## Three Ways to Build Your Portrait

### Option 1: Manual Research
1. Copy `example-data.js` and rename it
2. Replace each dimension's data with your city's indicators
3. Follow the data structure — each dimension needs: `name`, `level`, `indicator`, `value`, `year`, `source`, `sourceUrl`
4. Open `example-portrait.html` (update the `<script src>` to point to your data file)

### Option 2: AI-Assisted (Browser)
1. Open `example-portrait.html`
2. Click **AI Settings** in the header
3. Pick a provider:
   - **OpenAI** — requires an API key from [platform.openai.com](https://platform.openai.com)
   - **OpenRouter** — access Claude, Llama, Mistral & more from [openrouter.ai](https://openrouter.ai)
   - **Ollama** — free, runs locally, no API key needed ([ollama.com](https://ollama.com))
4. Click any dimension, then click **Auto-Research** to populate it with AI-found data
5. Always verify AI results against primary sources

### Option 3: AI-Assisted (CLI)
```bash
cd tools && npm install

# With OpenAI
LLM_API_KEY=sk-... node cli.js "Portland" "Oregon" --format datajs --output ../example-data.js

# With Ollama (free, local)
LLM_BASE_URL=http://localhost:11434/v1 LLM_MODEL=llama3 LLM_API_KEY=ollama \
  node cli.js "Portland" "Oregon" --format datajs --output ../example-data.js

# Research just one ring
node cli.js "Portland" "Oregon" --ring social --verbose
```

## Data Structure

Each dimension follows this schema:

```javascript
{
    name: "climate change",           // Dimension name (must match framework)
    level: 50,                        // -100 (thriving) to 150 (severe), NaN = unknown
    indicator: "Per capita GHG",      // What's being measured
    value: "4.22 MT CO2e/person",     // The actual measurement
    year: 2019,                       // Year of data
    target: "2.51 MT by 2030",        // What we're aiming for
    context: "Down from 5.53...",     // Brief explanation
    source: "City Climate Plan",      // Where the data comes from
    sourceUrl: "https://...",         // Direct link to source
    confidence: "high",               // high / medium / low
    actions: ["Action 1", "Action 2"] // Ways residents can get involved
}
```

## Level Scale

| Level | Meaning | Color |
|-------|---------|-------|
| -100 | Thriving (no problem) | Green |
| -50 | Under control | Green |
| 0 | On track | Yellow-green |
| 50 | Needs attention | Yellow |
| 100 | Critical | Red |
| 150 | Severe | Dark red |
| NaN | Unknown (data gap) | Gray |

## AI Provider Compatibility

The browser agent and CLI both use the **OpenAI chat completions format** (`/v1/chat/completions`). This works with:

- **OpenAI** (GPT-4o, etc.)
- **OpenRouter** (Claude, Llama, Mistral, Gemma, and 100+ models)
- **Ollama** (local, free, offline)
- **Together AI**, **Groq**, **Fireworks** (via CLI)
- Any API that implements the OpenAI chat completions endpoint

Note: Anthropic's native API uses a different format. Use [OpenRouter](https://openrouter.ai) to access Claude models through an OpenAI-compatible endpoint.
