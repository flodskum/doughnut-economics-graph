const OpenAI = require("openai");
const { SOCIAL_DIMENSIONS, ECOLOGICAL_DIMENSIONS, DIMENSION_SCHEMA } = require("./schema");

const SYSTEM_PROMPT = `You are a research agent for Doughnut Economics city portraits. Your job is to find real, sourced data for a specific dimension of a city's doughnut portrait.

The Doughnut Economics framework (Kate Raworth) maps 12 social foundation dimensions and 9 ecological ceiling dimensions. For each dimension, you need to find:
1. A specific, quantitative indicator (e.g., "% below poverty line", "PM2.5 annual average")
2. The actual measured value with units
3. The year of the data
4. A severity level from -100 (no problem) to 150 (severe)
5. The primary source (government report, academic study, official database)
6. A URL to that source
7. 2-3 sentences of context
8. A target or threshold to compare against
9. 3-5 ways residents can get involved

CRITICAL RULES:
- Only use real, verifiable data from official sources (government agencies, peer-reviewed studies, established nonprofits)
- Always include the source URL — no made-up URLs
- If you cannot find reliable data, say so honestly and set confidence to "low"
- Prefer city-level data over county or state-level when available
- Note when data is only available at a broader geographic level
- Include the year of the data — freshness matters
- Set the severity level based on comparison to national averages or established thresholds

LEVEL SCALE:
- -100: No problem (well within safe bounds)
- -50: Under control (meeting targets)
- 0: On track (at threshold, needs monitoring)
- 50: Needs attention (exceeding threshold)
- 100: Critical (significantly beyond threshold)
- 150: Severe (emergency level)
- null: Unknown (insufficient data)`;

class DoughnutResearchAgent {
    constructor(options = {}) {
        this.client = new OpenAI({
            apiKey: options.apiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY,
            baseURL: options.baseURL || process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL || "https://api.openai.com/v1",
        });
        this.model = options.model || process.env.LLM_MODEL || "gpt-4o";
        this.verbose = options.verbose || false;
    }

    log(msg) {
        if (this.verbose) console.error(`  [agent] ${msg}`);
    }

    async researchDimension(city, state, dimension, ring) {
        this.log(`Researching ${ring}/${dimension} for ${city}, ${state}...`);

        const prompt = `Research the "${dimension}" dimension for the city of ${city}, ${state}.
This is a ${ring === "social" ? "social foundation" : "ecological ceiling"} dimension.

Find the best available data and return a JSON object matching this schema:
${JSON.stringify(DIMENSION_SCHEMA, null, 2)}

The "name" field must be exactly: "${dimension}"

Search for official data from sources like:
- U.S. Census Bureau (ACS, QuickFacts)
- EPA, NOAA, state environmental agencies
- Local government reports and plans
- County health departments
- FBI UCR crime data
- State education departments
- HUD housing data
- BLS employment data

Return ONLY valid JSON. No markdown, no explanation — just the JSON object.`;

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        try {
            const data = JSON.parse(content);
            this.log(`  Got: ${data.value} (${data.confidence} confidence)`);
            return data;
        } catch (e) {
            this.log(`  Failed to parse response: ${e.message}`);
            return {
                name: dimension,
                level: null,
                indicator: "Research failed",
                value: "Could not retrieve data",
                source: "",
                sourceUrl: "",
                confidence: "low",
                error: e.message
            };
        }
    }

    async researchCity(city, state, options = {}) {
        const {
            dimensions = null,  // null = all, or array of specific names
            ring = "both",      // "social", "ecological", or "both"
            parallel = 3        // max concurrent requests
        } = options;

        const results = { social: [], ecological: [] };

        const tasks = [];

        if (ring === "both" || ring === "social") {
            const dims = dimensions
                ? SOCIAL_DIMENSIONS.filter(d => dimensions.includes(d))
                : SOCIAL_DIMENSIONS;
            for (const dim of dims) {
                tasks.push({ dim, ring: "social" });
            }
        }

        if (ring === "both" || ring === "ecological") {
            const dims = dimensions
                ? ECOLOGICAL_DIMENSIONS.filter(d => dimensions.includes(d))
                : ECOLOGICAL_DIMENSIONS;
            for (const dim of dims) {
                tasks.push({ dim, ring: "ecological" });
            }
        }

        // Process in batches to respect rate limits
        for (let i = 0; i < tasks.length; i += parallel) {
            const batch = tasks.slice(i, i + parallel);
            const batchResults = await Promise.all(
                batch.map(t => this.researchDimension(city, state, t.dim, t.ring))
            );
            for (let j = 0; j < batch.length; j++) {
                results[batch[j].ring].push(batchResults[j]);
            }
        }

        return results;
    }

    async buildPortrait(city, state, population, description) {
        this.log(`Building full portrait for ${city}, ${state}...`);

        const data = await this.researchCity(city, state);

        return {
            name: city,
            population: population || "Unknown",
            description: description || `Doughnut Economics portrait for ${city}, ${state}`,
            ecological: data.ecological,
            social: data.social
        };
    }
}

module.exports = { DoughnutResearchAgent };
