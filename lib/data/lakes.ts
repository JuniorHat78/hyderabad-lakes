export interface Lake {
  id: string
  name: string
  status: "active" | "critical" | "restored" | "lost"
  district?: string
  area?: string
  coordinates?: { lat: number; lng: number }
  waterLossPercent?: number
  lastSurvey?: string
  description?: string
  imageUrl?: string
  tags?: string[]
  timeline?: Array<{
    year: number
    event: string
    area?: string
  }>
  yearBuilt?: number
  waterQuality?: "excellent" | "good" | "moderate" | "poor"
  originalArea?: string
  depth?: number
  volume?: number
  threats?: string[]
  restorationEfforts?: string[]
}

// Import additional lakes from extracted data
import { mergeAdditionalLakes } from './additional-lakes'

const baseLakeDatabase: Lake[] = [
  // Major Lakes with detailed data
  {
    id: "hussain-sagar",
    name: "Hussain Sagar",
    status: "critical",
    district: "Central Hyderabad",
    area: "4.4 sq km",
    coordinates: { lat: 17.4239, lng: 78.4738 },
    waterLossPercent: 35,
    lastSurvey: "2024",
    description: "Built in 1563 by Ibrahim Quli Qutb Shah, this heart-shaped lake is Hyderabad's most iconic water body, now heavily polluted despite restoration efforts.",
    imageUrl: "/images/lakes/hussain-sagar.jpg",
    tags: ["heritage", "major", "urban", "polluted", "tourist-spot"],
    timeline: [
      { year: 1563, event: "Construction completed", area: "5.7 sq km" },
      { year: 1990, event: "Peak pollution levels recorded" },
      { year: 2024, event: "Current state", area: "4.4 sq km" }
    ],
    yearBuilt: 1563,
    waterQuality: "poor",
    originalArea: "5.7 sq km",
    threats: ["Industrial pollution", "Sewage discharge", "Encroachment", "Tourist pressure"],
    restorationEfforts: ["Regular cleaning drives", "Buddha statue installation", "Tourism infrastructure", "Water quality monitoring"]
  },
  {
    id: "osman-sagar",
    name: "Osman Sagar (Gandipet)",
    status: "active",
    district: "Rangareddy",
    area: "29 sq km",
    coordinates: { lat: 17.3762656, lng: 78.2988637 },
    waterLossPercent: 15,
    lastSurvey: "2024",
    description: "Created in 1920 to prevent floods, this reservoir served as Hyderabad's primary drinking water source for decades.",
    imageUrl: "/images/lakes/osman-sagar.jpg",
    tags: ["reservoir", "major", "drinking-water", "protected"],
    yearBuilt: 1920,
    waterQuality: "good"
  },
  {
    id: "himayat-sagar",
    name: "Himayat Sagar",
    status: "active",
    district: "Rangareddy",
    area: "20 sq km",
    coordinates: { lat: 17.3200, lng: 78.4081 },
    waterLossPercent: 18,
    lastSurvey: "2024",
    description: "Twin reservoir to Osman Sagar, built in 1927 on the Esi river, crucial for Hyderabad's water security.",
    imageUrl: "/images/lakes/himayat-sagar.jpg",
    tags: ["reservoir", "major", "drinking-water", "protected"],
  },
  {
    id: "shamirpet",
    name: "Shamirpet Lake",
    status: "critical",
    district: "Medchal-Malkajgiri",
    area: "256 hectares",
    coordinates: { lat: 17.5769, lng: 78.5407 },
    waterLossPercent: 47,
    lastSurvey: "2023",
    description: "Once spanning 486 hectares in 1989, this lake has lost nearly half its area to encroachments and pollution.",
    tags: ["major", "shrinking", "case-study"],
    timeline: [
      { year: 1989, event: "Peak area documented", area: "486 hectares" },
      { year: 2006, event: "Major shrinkage observed", area: "256 hectares" }
    ],
    waterQuality: "moderate"
  },
  {
    id: "ramanthapur-cheruvu",
    name: "Ramanthapur Cheruvu",
    status: "critical",
    district: "Rangareddy",
    coordinates: { lat: 17.3975, lng: 78.5295 },
    waterLossPercent: 83,
    lastSurvey: "2021",
    description: "Suffered the highest documented water loss of 83% between 1967-2021, exemplifying the city's lake crisis.",
    tags: ["urban", "severe-loss", "case-study"],
  },
  {
    id: "durgam-cheruvu",
    name: "Durgam Cheruvu (Secret Lake)",
    status: "restored",
    district: "Rangareddy",
    area: "63 acres",
    coordinates: { lat: 17.4379, lng: 78.3889 },
    waterLossPercent: 15,
    lastSurvey: "2024",
    description: "Hidden between rocks near HITEC City, successfully restored with walking track and cable bridge.",
    imageUrl: "/images/lakes/durgam-cheruvu.jpg",
    tags: ["restored", "tourist-spot", "urban", "success-story"],
    waterQuality: "excellent",
    originalArea: "75 acres",
    threats: ["Urban development pressure", "Visitor impact"],
    restorationEfforts: ["Cable bridge construction", "Walking track development", "Regular maintenance", "Eco-tourism promotion"]
  },
  
  // Lakes from Timeline Events
  {
    id: "mir-alam-tank",
    name: "Mir Alam Tank",
    status: "active",
    district: "Old City",
    coordinates: { lat: 17.3469, lng: 78.4617 },
    waterLossPercent: 23,
    lastSurvey: "2021",
    description: "Historic tank built in 1806, lost 23% of its area but remains functional.",
    tags: ["heritage", "tank", "urban"],
  },
  {
    id: "shah-hatim-talab",
    name: "Shah Hatim Talab",
    status: "critical",
    coordinates: { lat: 17.3939087, lng: 78.4133709 },
    waterLossPercent: 58,
    lastSurvey: "2021",
    description: "Lost 58% of its original area according to WRI satellite analysis.",
    tags: ["shrinking", "urban"],
  },
  {
    id: "gurram-cheruvu",
    name: "Gurram Cheruvu",
    status: "critical",
    coordinates: { lat: 17.3182377, lng: 78.4886912 },
    waterLossPercent: 55,
    lastSurvey: "2021",
    description: "Significant water body that has lost over half its area to urbanization.",
    tags: ["shrinking", "urban"],
  },
  
  // Completely Lost Lakes
  {
    id: "pedda-cheruvu-meerpet",
    name: "Pedda Cheruvu (Meerpet)",
    status: "lost",
    district: "Rangareddy",
    coordinates: { lat: 17.421389, lng: 78.554550 },
    description: "Once a major lake, now completely dried up and exists only in revenue records.",
    tags: ["lost", "dried", "urban"],
  },
  {
    id: "nalla-cheruvu-uppal",
    name: "Nalla Cheruvu (Uppal)",
    status: "lost",
    district: "Medchal-Malkajgiri",
    coordinates: { lat: 17.4036, lng: 78.5786 },
    description: "Completely lost to encroachments, contributing to flooding in the area.",
    tags: ["lost", "encroached", "flood-zone"],
  },
  {
    id: "safilguda-lake",
    name: "Safilguda Lake",
    status: "lost",
    district: "Medchal-Malkajgiri",
    coordinates: { lat: 17.46389, lng: 78.54167 },
    description: "Former lake area now completely built over with residential complexes.",
    tags: ["lost", "residential", "urban"],
  },
  {
    id: "chilakanagar-lake",
    name: "Chilakanagar Lake",
    status: "lost",
    district: "Rangareddy",
    coordinates: { lat: 17.44, lng: 78.50 },
    description: "Dried up completely, one of 30-40 lakes reported lost by PCB in 2023.",
    tags: ["lost", "dried", "pcb-report"],
  },
  
  // Additional Notable Lakes
  {
    id: "kapra-lake",
    name: "Kapra Lake",
    status: "restored",
    district: "Medchal-Malkajgiri",
    area: "40 acres",
    coordinates: { lat: 17.4952164, lng: 78.5525987 },
    description: "Successfully restored with community participation, now a biodiversity hotspot.",
    tags: ["restored", "biodiversity", "community", "success-story"],
  },
  {
    id: "saroornagar-lake",
    name: "Saroornagar Lake",
    status: "critical",
    district: "Rangareddy",
    area: "99 acres",
    coordinates: { lat: 17.3551949, lng: 78.5276096 },
    waterLossPercent: 40,
    description: "Major lake facing severe pollution and encroachment pressures.",
    tags: ["major", "polluted", "urban"],
  },
  {
    id: "noor-mohammed-kunta",
    name: "Noor Mohammed Kunta",
    status: "critical",
    district: "Medchal-Malkajgiri",
    coordinates: { lat: 17.3157625, lng: 78.4272311 },
    description: "Under severe encroachment pressure, multiple illegal structures demolished by HYDRAA.",
    tags: ["encroached", "hydraa-action", "urban"],
  },
  {
    id: "amber-cheruvu",
    name: "Amber Cheruvu",
    status: "critical",
    district: "Rangareddy",
    coordinates: { lat: 17.5107512, lng: 78.3948876 },
    description: "Facing rapid degradation due to industrial pollution and sewage inflow.",
    tags: ["polluted", "industrial", "urban"],
  },
  {
    id: "malkam-cheruvu",
    name: "Malkam Cheruvu",
    status: "restored",
    district: "Rangareddy",
    area: "15 acres",
    coordinates: { lat: 17.4138258, lng: 78.3786784 },
    description: "Restored through public-private partnership, now maintained by local community.",
    tags: ["restored", "ppp", "community"],
  },
  {
    id: "fox-sagar",
    name: "Fox Sagar Lake",
    status: "active",
    district: "Rangareddy",
    area: "1 sq km",
    coordinates: { lat: 17.3553, lng: 78.4436 },
    description: "Built in 1897, relatively well-preserved but facing encroachment threats.",
    tags: ["heritage", "major", "threatened"],
  },
  {
    id: "langar-houz",
    name: "Langar Houz Lake",
    status: "lost",
    district: "Central Hyderabad",
    coordinates: { lat: 17.38, lng: 78.41 },
    description: "Historic lake completely lost to urbanization, now a major commercial area.",
    tags: ["lost", "heritage", "commercial"],
  },
  {
    id: "banjara-lake",
    name: "Banjara Lake",
    status: "critical",
    district: "Rangareddy",
    coordinates: { lat: 17.4110567, lng: 78.4483733 },
    waterLossPercent: 65,
    description: "Once a scenic spot, now heavily polluted and reduced to less than half its original size.",
    tags: ["polluted", "shrinking", "urban"],
  },
  {
    id: "pragati-nagar-lake",
    name: "Pragati Nagar Lake",
    status: "critical",
    district: "Rangareddy",
    area: "11 acres",
    coordinates: { lat: 17.5106738, lng: 78.3986913 },
    description: "Surrounded by illegal constructions, subject of multiple court cases.",
    tags: ["encroached", "legal-dispute", "urban"],
  },
  {
    id: "patel-cheruvu",
    name: "Patel Cheruvu",
    status: "restored",
    district: "Medchal-Malkajgiri",
    area: "8 acres",
    coordinates: { lat: 17.4975134, lng: 78.3505968 },
    description: "Recently restored with walking track and children's play area.",
    tags: ["restored", "recreational", "urban"],
  },
  
  // Recently Documented
  {
    id: "khajaguda-lake",
    name: "Khajaguda Lake",
    status: "critical",
    district: "Rangareddy",
    coordinates: { lat: 17.4144962, lng: 78.3611116 },
    description: "IT corridor lake under severe pressure from real estate development.",
    tags: ["it-corridor", "threatened", "urban"],
  },
  {
    id: "madhapur-lake",
    name: "Madhapur Lake",
    status: "lost",
    district: "Rangareddy",
    coordinates: { lat: 17.4485835, lng: 78.3908035 },
    description: "Completely filled for IT development, causing frequent flooding in HITEC City.",
    tags: ["lost", "it-corridor", "flood-cause"],
  },
  {
    id: "gangaram-lake",
    name: "Gangaram Lake",
    status: "critical",
    district: "Rangareddy",
    coordinates: { lat: 17.5001197, lng: 78.3289252 },
    waterLossPercent: 70,
    description: "Lost 70% area to encroachments, remaining portion heavily polluted.",
    tags: ["severe-loss", "polluted", "urban"],
  },
  {
    id: "pedda-cheruvu-ramanthapur",
    name: "Pedda Cheruvu (Ramanthapur)",
    status: "critical",
    district: "Rangareddy",
    area: "25 acres",
    coordinates: { lat: 17.4210986, lng: 78.5554381 },
    description: "Different from Meerpet's Pedda Cheruvu, this one still exists but critically endangered.",
    tags: ["endangered", "urban", "name-duplicate"],
  },
  {
    id: "tummidikunta-lake",
    name: "Tummidikunta Lake",
    status: "critical",
    district: "Medchal-Malkajgiri",
    coordinates: { lat: 17.457154, lng: 78.381023 },
    description: "Reduced to a fraction of original size, sewage treatment plant proposed.",
    tags: ["shrinking", "sewage", "urban"],
  }
]

// Merge with additional lakes from GEE and OSM data
export const lakeDatabase = mergeAdditionalLakes(baseLakeDatabase)

// Helper functions
export function filterLakes(search: string, filter: string): Lake[] {
  let filtered = [...lakeDatabase]
  
  // Apply status/tag filters
  if (filter !== "all") {
    if (["active", "critical", "restored", "lost"].includes(filter)) {
      filtered = filtered.filter(lake => lake.status === filter)
    } else if (filter === "major") {
      filtered = filtered.filter(lake => lake.tags?.includes("major"))
    } else if (filter === "urban") {
      filtered = filtered.filter(lake => lake.tags?.includes("urban"))
    } else if (filter === "reservoir") {
      filtered = filtered.filter(lake => lake.tags?.includes("reservoir"))
    }
  }
  
  // Apply search
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(lake => 
      lake.name.toLowerCase().includes(searchLower) ||
      lake.district?.toLowerCase().includes(searchLower) ||
      lake.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      lake.description?.toLowerCase().includes(searchLower)
    )
  }
  
  return filtered
}

export function getLakeStats() {
  return {
    total: lakeDatabase.length,
    active: lakeDatabase.filter(l => l.status === "active").length,
    critical: lakeDatabase.filter(l => l.status === "critical").length,
    restored: lakeDatabase.filter(l => l.status === "restored").length,
    lost: lakeDatabase.filter(l => l.status === "lost").length,
  }
}

export function getLakeById(id: string): Lake | undefined {
  return lakeDatabase.find(lake => lake.id === id)
}
// Calculate the water loss percentage for a lake
export function calculateLossPercentage(lake: Lake): number {
  // If waterLossPercent is directly provided, use it
  if (lake.waterLossPercent !== undefined) {
    return lake.waterLossPercent
  }
  
  // For lost lakes, assume 100% loss
  if (lake.status === "lost") {
    return 100
  }
  
  // Default percentages based on status if not provided
  switch (lake.status) {
    case "active":
      return 10 // Assume minimal loss for active lakes
    case "critical":
      return 50 // Assume significant loss for critical lakes
    case "restored":
      return 20 // Assume some recovery for restored lakes
    default:
      return 0
  }
}

// Get the color associated with a lake's status
export function getStatusColor(status: Lake["status"]): string {
  switch (status) {
    case "active":
      return "#86a7c8" // Blue
    case "critical":
      return "#ef4444" // Red
    case "restored":
      return "#10b981" // Green
    case "lost":
      return "#6b7280" // Gray
    default:
      return "#86a7c8" // Default blue
  }
}

// Get water quality information for display
export function getWaterQualityInfo(quality?: Lake["waterQuality"]) {
  switch (quality) {
    case "excellent":
      return { class: "bg-[#10b981]", width: "100%" }
    case "good":
      return { class: "bg-[#86a7c8]", width: "75%" }
    case "moderate":
      return { class: "bg-[#e05d38]", width: "50%" }
    case "poor":
      return { class: "bg-[#ef4444]", width: "25%" }
    default:
      return { class: "bg-[#6b7280]", width: "0%" }
  }
}
