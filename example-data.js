// Example Doughnut Economics city portrait data
// This is real data for Santa Cruz, California — use it as a reference for building your own portrait.
// Generate your own with: node tools/cli.js "Your City" "Your State" --format datajs --output example-data.js
//
// Level scale: -100 = thriving, -50 = under control, 0 = on track, 50 = needs attention, 100 = critical, 150 = severe, NaN = unknown

const JURISDICTIONS = {
    "city_santa_cruz": {
        name: "City of Santa Cruz",
        population: "~65,000",
        description: "Coastal California city, home to UC Santa Cruz. 95% surface water supply. Major housing affordability challenges.",
        ecological: [
            {
                name: "climate change",
                level: 50,
                indicator: "Per capita GHG emissions",
                value: "4.22 MT CO2e/person",
                year: 2019,
                target: "2.51 MT CO2e/person by 2030",
                context: "Down from 5.53 in 2005. Transportation = 69% of emissions.",
                source: "City of Santa Cruz Climate Action Plan 2030",
                sourceUrl: "https://www.santacruzca.gov/government/city-departments/city-manager/climate-action-program/greenhouse-gas-emissions-inventories",
                confidence: "high",
                actions: [
                    "Ride the bus, bike, or walk — transportation is 69% of emissions",
                    "Switch to an electric vehicle",
                    "Electrify home heating and cooking"
                ]
            },
            {
                name: "ocean acidification",
                level: 50,
                indicator: "Coastal ocean pH",
                value: "Data monitored regionally",
                year: 2024,
                target: "Maintain pre-industrial ocean pH",
                context: "Monterey Bay is a major upwelling zone. MBARI monitors ocean chemistry.",
                source: "MBARI / Monterey Bay National Marine Sanctuary",
                sourceUrl: "https://www.mbari.org/",
                confidence: "low",
                actions: [
                    "Reduce personal carbon footprint (CO2 drives acidification)",
                    "Support Monterey Bay National Marine Sanctuary programs",
                    "Participate in coastal cleanup events"
                ]
            },
            {
                name: "chemical pollution",
                level: 0,
                indicator: "Pesticide use",
                value: "Minimal in city (county: ~1M lbs/yr)",
                year: 2022,
                target: "Reduce toxic chemical releases",
                context: "City has minimal agricultural land. County-wide: ~1M lbs pesticides/year, 67% fumigants.",
                source: "CA Dept of Pesticide Regulation, 2022 Pesticide Use Report",
                sourceUrl: "https://www.cdpr.ca.gov/docs/dept/cac_focus/santa_cruz.htm",
                confidence: "medium",
                actions: [
                    "Buy organic and locally grown produce",
                    "Support farmworker health organizations",
                    "Advocate for reduced fumigant use"
                ]
            },
            {
                name: "nitrogen & phosphorus loading",
                level: "NaN",
                indicator: "Nitrogen in groundwater",
                value: "Data not available at city level",
                year: null,
                target: "Below drinking water standard (10 mg/L NO3-N)",
                context: "City water is 95% surface water. Pajaro Valley (south county) has severe nitrate contamination.",
                source: "City of Santa Cruz Water Dept",
                sourceUrl: "https://www.santacruzca.gov/Government/City-Departments/Water-Department",
                confidence: "low",
                actions: [
                    "Conserve water — protects San Lorenzo River ecosystem",
                    "Properly dispose of household chemicals",
                    "Support watershed restoration programs"
                ]
            },
            {
                name: "freshwater withdrawals",
                level: 50,
                indicator: "Water supply reliability",
                value: "95% surface water dependent",
                year: 2024,
                target: "Sustainable water supply",
                context: "Loch Lomond reservoir holds only one year's supply. Drought vulnerability is significant.",
                source: "City of Santa Cruz Water Department",
                sourceUrl: "https://www.santacruzca.gov/Government/City-Departments/Water-Department",
                confidence: "high",
                actions: [
                    "Conserve water — every drop counts with limited reservoir",
                    "Install water-efficient fixtures and drought-tolerant landscaping",
                    "Support water supply diversification efforts"
                ]
            },
            {
                name: "land conversion",
                level: -50,
                indicator: "Protected land / open space",
                value: "~20% of city area",
                year: 2024,
                target: "Maintain and expand protected areas",
                context: "1,300+ acres open space + 696 acres across 43 parks. County: 32% protected.",
                source: "City of Santa Cruz Parks & Recreation",
                sourceUrl: "https://www.santacruzca.gov/Government/City-Departments/Parks-Recreation",
                confidence: "medium",
                actions: [
                    "Volunteer with Land Trust of Santa Cruz County",
                    "Support open space bond measures",
                    "Advocate for infill development over greenfield expansion"
                ]
            },
            {
                name: "biodiversity loss",
                level: 0,
                indicator: "Endemic species and habitat health",
                value: "Global biodiversity hotspot",
                year: 2022,
                target: "Protect all endemic species and habitats",
                context: "1,000+ native plant species, 35 endemic species. CZU fire (2020) impacted mountain habitats.",
                source: "Santa Cruz County RCIS (2022)",
                sourceUrl: "https://www.rcdsantacruz.org/regional-conservation-investment-strategy-rcis",
                confidence: "medium",
                actions: [
                    "Support habitat restoration after CZU fire",
                    "Remove invasive species in local parks",
                    "Support the Regional Conservation Investment Strategy"
                ]
            },
            {
                name: "air pollution",
                level: -50,
                indicator: "PM2.5 annual average",
                value: "6.5 \u00b5g/m\u00b3",
                year: 2019,
                target: "WHO guideline: 5 \u00b5g/m\u00b3",
                context: "Meets US EPA standard (12). Exceeds revised 2021 WHO guideline (5). Wildfire smoke is primary risk.",
                source: "DataShare SCC / American Lung Association",
                sourceUrl: "https://www.datasharescc.org/indicators/index/view?indicatorId=168&localeId=281",
                confidence: "high",
                actions: [
                    "Reduce driving — transportation is biggest local source",
                    "Support wildfire prevention in Santa Cruz Mountains",
                    "Check AQI before outdoor exercise"
                ]
            },
            {
                name: "ozone layer depletion",
                level: -100,
                indicator: "Stratospheric ozone",
                value: "Global issue — recovering",
                year: 2024,
                target: "Full recovery by ~2066",
                context: "Montreal Protocol success story. Ozone layer is recovering globally.",
                source: "NOAA / Montreal Protocol",
                sourceUrl: "https://www.epa.gov/ozone-layer-protection",
                confidence: "high",
                actions: [
                    "Properly dispose of old refrigerators and AC units",
                    "Use climate-friendly refrigerants"
                ]
            }
        ],
        social: [
            {
                name: "food",
                level: 75,
                indicator: "Food insecurity rate",
                value: "10\u201333% food insecure",
                year: 2023,
                target: "Below 10% food insecurity",
                context: "Second Harvest serves 70,000+/month. County declared food insecurity emergency.",
                source: "DataShare SCC; Second Harvest Food Bank",
                sourceUrl: "https://www.datasharescc.org/indicators/index/view?indicatorId=2107&localeId=281",
                confidence: "medium",
                actions: [
                    "Donate to Second Harvest Food Bank",
                    "Volunteer at local food distribution sites",
                    "Support CalFresh enrollment outreach"
                ]
            },
            {
                name: "health",
                level: -25,
                indicator: "Uninsured rate",
                value: "3.73% uninsured (ages 18-64)",
                year: 2023,
                target: "Universal coverage",
                context: "Well below state average. MediCruz covers undocumented residents.",
                source: "Data USA / Census ACS",
                sourceUrl: "https://datausa.io/profile/geo/santa-cruz-ca",
                confidence: "high",
                actions: [
                    "Support MediCruz specialty program",
                    "Help neighbors enroll in Covered California",
                    "Advocate against Medicaid cuts"
                ]
            },
            {
                name: "education",
                level: -25,
                indicator: "High school graduation rate",
                value: "93.45% (city average)",
                year: 2024,
                target: "100% graduation; equity across schools",
                context: "Range: Santa Cruz High 96% to Costanoa Continuation 76%. Math proficiency 49% vs 33% state avg.",
                source: "US News; CA Dept of Education",
                sourceUrl: "https://www.usnews.com/education/best-high-schools/california/rankings/santa-cruz",
                confidence: "high",
                actions: [
                    "Volunteer as a tutor or mentor",
                    "Support after-school programs",
                    "Advocate for equitable school funding"
                ]
            },
            {
                name: "income & work",
                level: 50,
                indicator: "Poverty rate",
                value: "17% below poverty line",
                year: 2020,
                target: "Below 10%",
                context: "Median household income $111K but extreme polarization between tech/university and service sector.",
                source: "U.S. Census Bureau QuickFacts",
                sourceUrl: "https://www.census.gov/quickfacts/fact/table/santacruzcitycalifornia/INC110223",
                confidence: "high",
                actions: [
                    "Support living wage campaigns",
                    "Buy from locally owned businesses",
                    "Support workforce development programs"
                ]
            },
            {
                name: "housing",
                level: 125,
                indicator: "Homelessness & housing cost burden",
                value: "1,850 unhoused; 19.5% cost-burdened",
                year: 2024,
                target: "Functional zero homelessness; <30% rent burden",
                context: "Highest per-capita homelessness rate in the nation. 60% renters. Median rent above $3,000/mo.",
                source: "City of Santa Cruz 2024 PIT Count; DataShare SCC",
                sourceUrl: "https://www.santacruzca.gov/files/assets/city/v/1/cmo/documents/homelessness/2024pitcount_executive-summary.pdf",
                confidence: "high",
                actions: [
                    "Support Housing Matters Santa Cruz",
                    "Advocate for more affordable housing development",
                    "Support tenant protection policies",
                    "Push for ADU incentives"
                ]
            },
            {
                name: "water & sanitation",
                level: -50,
                indicator: "Drinking water quality",
                value: "Meets all EPA & state standards",
                year: 2024,
                target: "Full compliance",
                context: "Santa Cruz Water Dept serves ~96,000 people. 95% surface water. $140M Pure Water Soquel project.",
                source: "City of Santa Cruz Water Department",
                sourceUrl: "https://www.santacruzca.gov/Government/City-Departments/Water-Department",
                confidence: "high",
                actions: [
                    "Conserve water to protect the San Lorenzo River",
                    "Properly dispose of household chemicals",
                    "Check your annual water quality report"
                ]
            },
            {
                name: "energy",
                level: 0,
                indicator: "Electricity cost & renewables",
                value: "33.5\u00a2/kWh; 51% renewable grid",
                year: 2025,
                target: "100% clean energy; affordable rates",
                context: "Average bill ~$321/mo. 3 Clean Energy offers 100% renewable option.",
                source: "EnergySage; PG&E; California Energy Commission",
                sourceUrl: "https://www.energysage.com/local-data/electricity-cost/ca/santa-cruz-county/santa-cruz/",
                confidence: "medium",
                actions: [
                    "Switch to 3CE Prime for 100% renewable electricity",
                    "Apply for CARE/FERA low-income rate discounts",
                    "Install solar panels"
                ]
            },
            {
                name: "social equity",
                level: 75,
                indicator: "Gini coefficient (income inequality)",
                value: "0.483",
                year: 2023,
                target: "Below 0.30",
                context: "Well above target. Racial Equity Index Inclusion Score: 54 vs target of 100.",
                source: "DataShare SCC; National Equity Atlas",
                sourceUrl: "https://www.datasharescc.org/indicators/index/view?indicatorId=288&localeId=281",
                confidence: "high",
                actions: [
                    "Support living wage initiatives",
                    "Advocate for progressive local tax policies",
                    "Support community land trusts"
                ]
            },
            {
                name: "peace & justice",
                level: 50,
                indicator: "Violent crime rate",
                value: "357 per 100K residents",
                year: 2023,
                target: "Below 300 per 100K",
                context: "Slightly below national average (~380/100K). Property crime 2x national average.",
                source: "DataShare SCC; FBI UCR",
                sourceUrl: "https://www.datasharescc.org/indicators/index/view?indicatorId=522&localeId=281",
                confidence: "high",
                actions: [
                    "Support community-based violence prevention",
                    "Advocate for restorative justice initiatives",
                    "Support Barrios Unidos community programs"
                ]
            },
            {
                name: "political voice",
                level: -50,
                indicator: "Voter participation",
                value: "75.5%",
                year: 2023,
                target: "Above 80% in general elections",
                context: "County general election turnout 81.8% in Nov 2024. Strong civic engagement tradition.",
                source: "DataShare SCC; Santa Cruz County Elections",
                sourceUrl: "https://www.datasharescc.org/indicators/index/view?indicatorId=11303&localeId=281",
                confidence: "high",
                actions: [
                    "Register to vote and encourage others",
                    "Attend City Council meetings",
                    "Join a local community board"
                ]
            },
            {
                name: "gender equality",
                level: 50,
                indicator: "Gender pay ratio",
                value: "Women earn 70% of men's median wage",
                year: 2023,
                target: "Pay equity (1:1 ratio)",
                context: "30% gap driven by occupational segregation. County adopted CEDAW resolution (Feb 2024).",
                source: "Neilsberg; National Equity Atlas",
                sourceUrl: "https://www.neilsberg.com/insights/santa-cruz-ca-income-by-gender/",
                confidence: "medium",
                actions: [
                    "Support pay transparency policies",
                    "Support women-owned businesses",
                    "Push for CEDAW implementation at city level"
                ]
            },
            {
                name: "networks",
                level: 25,
                indicator: "Broadband access & mobility",
                value: "~16,000 households lack internet; 38% drive alone",
                year: 2024,
                target: "Universal broadband; reduce single-occupancy driving",
                context: "$10M state grant for rural fiber. Equal Access SC provides $15/mo internet.",
                source: "Equal Access Santa Cruz; DataShare SCC",
                sourceUrl: "https://www.datasharescc.org/indicators/index/view?indicatorId=2367&localeId=281",
                confidence: "medium",
                actions: [
                    "Support Equal Access Santa Cruz for low-cost internet",
                    "Donate devices to community technology programs",
                    "Advocate for municipal broadband"
                ]
            }
        ]
    }
};
