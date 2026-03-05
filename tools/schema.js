// Doughnut Economics data schema
// This defines the structure for city portrait data that the research agent produces

const SOCIAL_DIMENSIONS = [
    "food", "health", "education", "income & work", "housing",
    "water & sanitation", "energy", "social equity",
    "peace & justice", "political voice", "gender equality", "networks"
];

const ECOLOGICAL_DIMENSIONS = [
    "climate change", "ocean acidification", "chemical pollution",
    "nitrogen & phosphorus loading", "freshwater withdrawals",
    "land conversion", "biodiversity loss", "air pollution",
    "ozone layer depletion"
];

// Level scale: -100 (no problem) to 150 (severe). NaN = unknown.
const LEVEL_SCALE = {
    "-100": "No problem",
    "-50": "Under control",
    "0": "On track",
    "50": "Needs attention",
    "100": "Critical",
    "150": "Severe"
};

// JSON Schema for a single dimension data point
const DIMENSION_SCHEMA = {
    type: "object",
    properties: {
        name: { type: "string", description: "Dimension name (e.g., 'food', 'climate change')" },
        level: { type: "number", description: "Severity level from -100 (no problem) to 150 (severe). Use null if unknown." },
        indicator: { type: "string", description: "What metric is being measured (e.g., 'Food insecurity rate')" },
        value: { type: "string", description: "The actual data value with units (e.g., '15.1% below poverty line')" },
        year: { type: "integer", description: "Year of the data" },
        target: { type: "string", description: "What the target/goal is (e.g., 'Below 10%')" },
        context: { type: "string", description: "2-3 sentences of context explaining the number, trends, comparisons" },
        source: { type: "string", description: "Name of the primary source document or organization" },
        sourceUrl: { type: "string", description: "URL to the source" },
        confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence in the data quality" },
        actions: {
            type: "array",
            items: { type: "string" },
            description: "3-5 concrete ways residents can get involved"
        }
    },
    required: ["name", "indicator", "value", "source", "sourceUrl", "confidence"]
};

// JSON Schema for a full jurisdiction
const JURISDICTION_SCHEMA = {
    type: "object",
    properties: {
        name: { type: "string" },
        population: { type: "string" },
        description: { type: "string" },
        ecological: { type: "array", items: DIMENSION_SCHEMA },
        social: { type: "array", items: DIMENSION_SCHEMA }
    },
    required: ["name", "population", "ecological", "social"]
};

module.exports = {
    SOCIAL_DIMENSIONS,
    ECOLOGICAL_DIMENSIONS,
    LEVEL_SCALE,
    DIMENSION_SCHEMA,
    JURISDICTION_SCHEMA
};
