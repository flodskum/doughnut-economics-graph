# Doughnut Economics Research Agent

AI-powered CLI tool that populates city portrait data with sourced indicators using any OpenAI-compatible LLM.

## What it does

Given a city and state/country, the research agent queries an LLM to find real, sourced data for each of the 21 Doughnut Economics dimensions (12 social foundation + 9 ecological ceiling). For each dimension it returns:

- A quantitative indicator with units
- The data source and URL
- Year of measurement
- Severity level (-100 to 150)
- Context and comparison to targets
- Suggested resident actions

## Install

```bash
cd tools
npm install
```

## Usage

```bash
# OpenAI
LLM_API_KEY=sk-... node cli.js "Portland" "Oregon"

# Anthropic (via litellm or similar proxy)
LLM_BASE_URL=http://localhost:4000/v1 LLM_MODEL=claude-sonnet-4-20250514 LLM_API_KEY=... node cli.js "Portland" "Oregon"

# Ollama (local, free)
LLM_BASE_URL=http://localhost:11434/v1 LLM_MODEL=llama3 LLM_API_KEY=ollama node cli.js "Portland" "Oregon"

# Any OpenAI-compatible API
LLM_BASE_URL=https://your-provider.com/v1 LLM_API_KEY=... node cli.js "Portland" "Oregon"
```

### Options

```
--ring <social|ecological|both>   Which ring to research (default: both)
--dimensions <dim1,dim2,...>      Specific dimensions to research
--output <file>                   Output file path (default: stdout)
--format <json|datajs>            Output format (default: json)
--population <pop>                Population string (e.g., "~65,000")
--parallel <n>                    Max concurrent API requests (default: 3)
--verbose                         Show progress messages
--model <model>                   LLM model to use (default: gpt-4o)
--base-url <url>                  API base URL
--api-key <key>                   API key (or set LLM_API_KEY env var)
```

### Output format

The `--format datajs` option outputs JavaScript that can be directly used with the doughnut visualization:

```bash
node cli.js "Amsterdam" "Netherlands" --format datajs --output data.js
```

## Model agnostic

The tool works with any provider that exposes an OpenAI-compatible chat completions endpoint. This includes:

- **OpenAI** (GPT-4o, GPT-4, etc.)
- **Anthropic** via [litellm](https://github.com/BerriAI/litellm) or similar proxy
- **Ollama** for fully local/offline research
- **Together AI**, **Groq**, **Fireworks**, **OpenRouter**, and many others

Configure via environment variables (`LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`) or CLI flags.

## Data quality

The agent is prompted to use only real, verifiable sources (government agencies, peer-reviewed studies, established nonprofits). Each data point includes a confidence rating (high/medium/low). Results should always be verified against primary sources before publication.

## Schema

See `schema.js` for the full data schema including all 21 dimensions and the JSON structure for each data point.
