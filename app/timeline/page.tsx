"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, ArrowLeft } from "lucide-react"

// Year data with verified statistics
const yearData = {
  1967: { lakes: 3000, percent: 100, lost: 0 },
  1979: { lakes: 2800, percent: 95, lost: 200 },
  1989: { lakes: 2500, percent: 85, lost: 500 },
  2001: { lakes: 2000, percent: 70, lost: 1000 },
  2006: { lakes: 1500, percent: 55, lost: 1500 },
  2013: { lakes: 1000, percent: 40, lost: 2000 },
  2014: { lakes: 900, percent: 37, lost: 2100 },
  2020: { lakes: 500, percent: 30, lost: 2500 },
  2021: { lakes: 400, percent: 27, lost: 2600 },
  2023: { lakes: 300, percent: 25, lost: 2700 },
  2024: { lakes: 250, percent: 23.3, lost: 2750 },
}

interface EventCardProps {
  category: string
  categoryClass: string
  title: string
  summary: string
  details: Array<{
    label: string
    content: string
  }>
}

function EventCard({ category, categoryClass, title, summary, details }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={`bg-[#2a3040]/80 border border-[#3d4354] rounded-xl p-8 cursor-pointer transition-all duration-300 relative overflow-hidden hover:bg-[#2a3040] hover:border-[#e05d38]/50 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${isExpanded ? "bg-[#2a3040] border-[#e05d38]" : ""}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start mb-4">
        <span
          className={`text-xs uppercase tracking-wider px-3 py-1.5 bg-[#2a303e]/60 rounded-full inline-block font-medium ${categoryClass}`}
        >
          {category}
        </span>
      </div>

      <h3 className="text-2xl font-semibold mb-2 leading-tight">{title}</h3>
      <p className="text-base opacity-80 leading-relaxed">{summary}</p>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-[#3d4354]">
          {details.map((detail, index) => (
            <div key={index} className="mb-4">
              <div className="text-sm font-semibold opacity-70 mb-1 uppercase tracking-wider">{detail.label}</div>
              <div
                className="text-sm opacity-90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: detail.content }}
              />
            </div>
          ))}
        </div>
      )}

      <ChevronDown
        className={`absolute right-6 bottom-6 w-6 h-6 opacity-30 transition-all duration-300 hover:opacity-60 ${isExpanded ? "rotate-180" : ""}`}
      />
    </div>
  )
}

interface YearSectionProps {
  year: number
  era: string
  eraLabel: string
  lakes: number
  stats: Array<{
    value: string
    label: string
    change: string
  }>
  events: EventCardProps[]
}

function YearSection({ year, era, eraLabel, lakes, stats, events }: YearSectionProps) {
  return (
    <section
      className={`min-h-screen flex items-center relative py-16 px-8 opacity-100 transition-opacity duration-700 ${era}`}
      data-year={year}
      data-lakes={lakes}
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
        <div className="lg:sticky lg:top-[20vh]">
          <div className="text-sm uppercase tracking-wider opacity-50 mb-2">{eraLabel}</div>
          <div className="text-6xl md:text-8xl font-black leading-none mb-6 font-mono">{year}</div>
          <div className="flex flex-col gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="border-l-3 border-current pl-4">
                <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-70 uppercase tracking-wider">{stat.label}</div>
                <div className="text-sm opacity-60 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HyderabadLakesStory() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentYear, setCurrentYear] = useState(1967)
  const [lakesLost, setLakesLost] = useState(0)
  const [waterPercent, setWaterPercent] = useState(100)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = scrolled / maxScroll

      setScrollProgress(scrollPercent)

      // Update water level (100% to 23.3%)
      const waterHeight = 100 - scrollPercent * 76.7
      setWaterPercent(Math.max(waterHeight, 23.3))

      // Find current year section
      const yearSections = document.querySelectorAll("[data-year]")
      let newCurrentYear = 1967
      let newLakesLost = 0

      yearSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          const year = Number.parseInt(section.getAttribute("data-year") || "1967")
          const data = yearData[year as keyof typeof yearData]
          if (data) {
            newCurrentYear = year
            newLakesLost = data.lost
          }
        }
      })

      setCurrentYear(newCurrentYear)
      setLakesLost(newLakesLost)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTimeline = () => {
    document.getElementById("timeline")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="bg-[#1c2433] text-[#e5e5e5] overflow-x-hidden">
      {/* Progress Bar */}
      <div
        className="fixed left-0 top-0 h-1 bg-gradient-to-r from-[#86a7c8] via-[#e05d38] via-[#ef4444] to-[#ef4444] z-50 transition-all duration-300"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Back to Home Button */}
      <Link
        href="/"
        className="fixed top-5 left-5 inline-flex items-center gap-3 px-4 py-2.5 text-sm bg-[#2a3040]/80 backdrop-blur-sm border border-[#3d4354] text-[#a3a3a3] hover:text-[#86a7c8] hover:border-[#86a7c8]/50 hover:bg-[#2a3040] rounded-lg transition-all duration-300 z-40 no-underline group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      {/* Fixed Stats Display */}
      <div className="fixed top-20 left-5 bg-[#2a3040]/95 p-6 rounded-xl backdrop-blur-md z-40 border border-[#3d4354]">
        <div className="mb-4">
          <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Lakes Lost</div>
          <div className="text-3xl font-bold font-mono">{lakesLost.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Year</div>
          <div className="text-3xl font-bold font-mono">{currentYear}</div>
        </div>
      </div>

      {/* Water Level Visualization */}
      <div className="fixed right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-b from-[#2a3656]/30 to-[#1c2433] z-30 overflow-hidden border-l border-[#3d4354]">
        <div className="absolute top-5 left-5 right-5 text-center z-40">
          <div className="text-2xl md:text-4xl font-black font-mono mb-2">{Math.round(waterPercent)}%</div>
          <div className="text-xs uppercase tracking-wider opacity-70">Water Capacity</div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[#86a7c8] via-[#5a7ca6] to-[#466494] transition-all duration-500 overflow-hidden"
          style={{ height: `${waterPercent}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-t from-white/20 to-transparent animate-[wave_3s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#2a3656]/40 to-[#1c2433] relative px-8">
        <h1 className="text-4xl md:text-8xl font-black mb-4 leading-none tracking-tight">
          50+ Years of Vanishing Water
        </h1>
        <p className="text-xl md:text-2xl opacity-60 mb-8 font-light max-w-4xl">
          A data-driven chronicle of Hyderabad's environmental catastrophe
        </p>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mt-12 opacity-0 animate-[fadeInUp_1s_ease_0.5s_forwards]">
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-green-500 font-mono">3,000-7,000</div>
            <div className="text-sm opacity-70 uppercase tracking-wider">Historical Water Bodies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-red-500 font-mono">61%</div>
            <div className="text-sm opacity-70 uppercase tracking-wider">Area Lost (1979-2024)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-orange-500 font-mono">70-500</div>
            <div className="text-sm opacity-70 uppercase tracking-wider">Remain Today</div>
          </div>
        </div>
        <button
          onClick={scrollToTimeline}
          className="absolute bottom-8 text-4xl opacity-50 animate-bounce cursor-pointer hover:opacity-70 transition-opacity"
        >
          ↓
        </button>
      </section>

      {/* Timeline Container */}
      <div id="timeline" className="relative w-full bg-[#1c2433]">
        <YearSection
          year={1967}
          era="era-stable text-green-500"
          eraLabel="Historical Baseline"
          lakes={3000}
          stats={[{ value: "3,000-7,000", label: "Water Bodies", change: "Corona satellite baseline" }]}
          events={[
            {
              category: "Satellite Era",
              categoryClass: "bg-cyan-500/20",
              title: "Corona Program Documents Hyderabad",
              summary:
                "Declassified U.S. reconnaissance satellite imagery provides the first comprehensive aerial view of Hyderabad's water bodies, establishing a crucial baseline for future comparisons.",
              details: [
                {
                  label: "Data Source",
                  content: "Corona Program satellite imagery, now available through NARA and USGS EROS Center",
                },
                {
                  label: "Significance",
                  content:
                    "This imagery would later be used by World Resources Institute (India) to measure lake shrinkage over 54 years",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={1979}
          era="era-stable text-green-500"
          eraLabel="Official Baseline"
          lakes={2800}
          stats={[{ value: "40.35 sq km", label: "Total Lake Area", change: "NRSC measurement baseline" }]}
          events={[
            {
              category: "Scientific Documentation",
              categoryClass: "bg-gray-500/20",
              title: "NRSC Establishes Lake Baseline",
              summary:
                "National Remote Sensing Centre (NRSC) conducts comprehensive satellite survey of Hyderabad's lakes, documenting 40.35 sq km of water bodies. This becomes the official baseline for measuring future losses.",
              details: [
                {
                  label: "Methodology",
                  content: "Using satellite imagery, NRSC mapped 56 major lakes across Hyderabad region",
                },
                {
                  label: "Future Use",
                  content:
                    "This data would be referenced 45 years later by NRSC Director Prakash Chauhan to show 61% reduction",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={1989}
          era="era-warning text-yellow-500"
          eraLabel="Early Warning"
          lakes={2500}
          stats={[
            { value: "486 hectares", label: "Shamirpet Lake", change: "Key measurement year" },
            { value: "~800", label: "Major Lakes", change: "Pre-IT boom count" },
          ]}
          events={[
            {
              category: "Lake Study",
              categoryClass: "bg-gray-500/20",
              title: "Shamirpet Lake Documented at Full Capacity",
              summary:
                "Shamirpet Lake measured at 486 hectares, serving as a reference point for future degradation studies. The city still has approximately 800 major lakes functioning.",
              details: [
                {
                  label: "Context",
                  content: "This measurement would later show 47% reduction by 2006, highlighting rapid degradation",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2001}
          era="era-critical text-orange-500"
          eraLabel="Accelerating Loss"
          lakes={2000}
          stats={[{ value: "3,245 hectares", label: "Lake Area Lost", change: "Since 1989 (12 years)" }]}
          events={[
            {
              category: "Academic Study",
              categoryClass: "bg-gray-500/20",
              title: "Research Confirms Massive Lake Loss",
              summary:
                "Academic studies document loss of 3,245 hectares of lake area between 1989-2001, a period coinciding with Hyderabad's IT boom and rapid urbanization.",
              details: [
                {
                  label: "Rate of Loss",
                  content: "270 hectares per year average, equivalent to losing one medium-sized lake every month",
                },
                {
                  label: "Primary Cause",
                  content: "Urbanization and land appropriation for IT infrastructure and housing",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2006}
          era="era-critical text-orange-500"
          eraLabel="Documented Decline"
          lakes={1500}
          stats={[{ value: "256 hectares", label: "Shamirpet Lake", change: "47% reduction from 1989" }]}
          events={[
            {
              category: "Case Study",
              categoryClass: "bg-red-500/20",
              title: "Shamirpet Lake Loses Half Its Area",
              summary:
                "From 486 hectares in 1989 to just 256 hectares - Shamirpet Lake exemplifies the citywide crisis, having lost 47% of its area in just 17 years.",
              details: [
                {
                  label: "Pattern",
                  content:
                    "Similar reductions observed across major lakes: encroachment, pollution, and disrupted inflows",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2013}
          era="era-crisis text-red-400"
          eraLabel="Belated Response"
          lakes={1000}
          stats={[{ value: "185", label: "Notified Lakes", change: "In GHMC limits" }]}
          events={[
            {
              category: "Government Action",
              categoryClass: "bg-purple-500/20",
              title: "Lake Protection Committee Survey Initiated",
              summary:
                "Government finally initiates comprehensive lake survey through Lake Protection Committee. Only 185 lakes identified for protection in GHMC limits - a fraction of historical numbers.",
              details: [
                {
                  label: "Too Little, Too Late",
                  content: "By the time protection measures begin, thousands of water bodies have already vanished",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2014}
          era="era-crisis text-red-400"
          eraLabel="New State, Old Problems"
          lakes={900}
          stats={[
            { value: "New State", label: "Telangana Formed", change: "June 2, 2014" },
            { value: "₹6,098 crores", label: "Mission Kakatiya", change: "Tank restoration program" },
          ]}
          events={[
            {
              category: "Political Change",
              categoryClass: "bg-purple-500/20",
              title: "Telangana State Formation",
              summary:
                "New state of Telangana formed with Hyderabad as capital. Lake restoration becomes a stated priority, but encroachments continue unabated.",
              details: [
                {
                  label: "New Initiatives",
                  content: "Mission Kakatiya launched for tank restoration, but urban lakes remain under pressure",
                },
              ],
            },
            {
              category: "Government Program",
              categoryClass: "bg-blue-500/20",
              title: "Mission Kakatiya Tank Restoration Program",
              summary:
                "₹6,098 crore program launched to restore 16,942 of 46,531 identified irrigation tanks across Telangana state.",
              details: [
                {
                  label: "Program Scale",
                  content: "46,531 tanks surveyed, 16,942 selected for restoration (36.4% coverage)",
                },
                {
                  label: "Budget Allocation",
                  content: "₹6,098 crores across 4 phases for rural irrigation infrastructure",
                },
                {
                  label: "Hyderabad District",
                  content: "169 tanks identified, 0 sanctions allocated",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2020}
          era="era-emergency text-red-600"
          eraLabel="Crisis Point"
          lakes={500}
          stats={[
            { value: "30cm rainfall", label: "Oct 13-14", change: "Nallagandla floods" },
            { value: "3 deaths", label: "Flood casualties", change: "Preventable tragedy" },
          ]}
          events={[
            {
              category: "Disaster",
              categoryClass: "bg-blue-500/20",
              title: "Nallagandla Flood Tragedy",
              summary:
                "October 13-14: 30cm rainfall causes devastating floods in Nallagandla area, resulting in 3 deaths. The tragedy highlights how lake encroachments have destroyed natural drainage.",
              details: [
                {
                  label: "Root Cause",
                  content:
                    "Area developed on former lake beds and water channels, leaving nowhere for excess water to flow",
                },
                {
                  label: "Expert Analysis",
                  content:
                    "Dr. Parth Sarathi Roy documents how 77% decline in lakes directly contributed to flood severity",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2021}
          era="era-emergency text-red-600"
          eraLabel="Evidence Mounts"
          lakes={400}
          stats={[
            { value: "Up to 83%", label: "Lake Shrinkage", change: "Since 1967" },
            { value: "7.75m", label: "Groundwater Depth", change: "2.58x normal level" },
          ]}
          events={[
            {
              category: "Major Study",
              categoryClass: "bg-gray-500/20",
              title: "WRI Satellite Analysis Reveals Shocking Loss",
              summary:
                "World Resources Institute (India) with The News Minute publishes satellite image analysis showing individual lakes have shrunk by up to 83% since 1967.",
              details: [
                {
                  label: "Key Findings",
                  content:
                    "• Ramanthapur Cheruvu: 83% reduction<br>• Shah Hatim Talab: 58% reduction<br>• Gurram Cheruvu: 55% reduction<br>• Mir Alam Tank: 23% reduction<br>• Durgam Cheruvu: 15% reduction",
                },
                {
                  label: "Methodology",
                  content: "Compared 1967 Corona Program imagery with 2021 Google Earth/Maxar satellite data",
                },
              ],
            },
            {
              category: "Data Collection",
              categoryClass: "bg-gray-500/20",
              title: "Systematic Groundwater Monitoring Begins",
              summary:
                "Telangana Ground Water Department begins comprehensive monitoring across 130 villages in Hyderabad metro area.",
              details: [
                {
                  label: "Data Coverage",
                  content: "3,589 measurements across 130 villages, 93 mandals in metro area",
                },
                {
                  label: "Average Depth",
                  content: "7.75m below surface (baseline: 3m)",
                },
                {
                  label: "Distribution",
                  content: "26.9% normal levels, 33.9% moderate, 29.5% severe, 9.7% critical",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2023}
          era="era-emergency text-red-600"
          eraLabel="Expert Alarms"
          lakes={300}
          stats={[
            { value: "30-40", label: "Lakes Dried Up", change: "PCB report" },
            { value: "9.10m", label: "Groundwater Depth", change: "0.98m/year worsening" },
          ]}
          events={[
            {
              category: "Expert Warning",
              categoryClass: "bg-red-500/20",
              title: "Experts Stress Urgent Rejuvenation Need",
              summary:
                "Pollution Control Board reports 30-40 of 185 notified lakes have completely dried up. Experts like Priyanka Pugaokar (CSE) warn of climate resilience crisis.",
              details: [
                {
                  label: "Dried Lakes Include",
                  content:
                    "Pedda Cheruvu (Meerpet), Nalla Cheruvu (Uppal), Safilguda Lake, Chilakanagar Lake, and many others now exist only in revenue records",
                },
                {
                  label: "Climate Impact",
                  content:
                    '"Reviving urban water bodies is crucial for building the city\'s resilience to climate change" - Priyanka Pugaokar, CSE',
                },
              ],
            },
            {
              category: "Data Update",
              categoryClass: "bg-gray-500/20",
              title: "Groundwater Depth Measurements",
              summary:
                "Latest monitoring shows 9.10m average depth across Hyderabad metro area.",
              details: [
                {
                  label: "Current Average",
                  content: "9.10m depth in 2023 vs 7.15m in 2021",
                },
                {
                  label: "Rate of Change",
                  content: "0.98m per year average change over monitoring period",
                },
              ],
            },
          ]}
        />

        <YearSection
          year={2024}
          era="era-emergency text-red-600"
          eraLabel="Present Reality"
          lakes={250}
          stats={[
            { value: "16 sq km", label: "Total Lake Area", change: "61% loss from 1979" },
            { value: "70-500", label: "Lakes Remain", change: "From 3,000-7,000" },
            { value: "16.9M", label: "Total Records", change: "Comprehensive monitoring" },
          ]}
          events={[
            {
              category: "Scientific Proof",
              categoryClass: "bg-gray-500/20",
              title: "NRSC Confirms 61% Lake Area Loss",
              summary:
                "NRSC Director Prakash Chauhan presents satellite data showing Hyderabad's lake area shrunk from 40.35 sq km (1979) to just 16 sq km (2024) - a devastating 61% reduction.",
              details: [
                {
                  label: "Study Details",
                  content:
                    "56 lakes examined using 45 years of satellite data. 40 lakes (75%) have shrunk by more than half",
                },
                {
                  label: "Economic Impact",
                  content: "Estimated annual loss of $30.44 million (₹2,494 crores) due to lake degradation",
                },
              ],
            },
            {
              category: "Enforcement",
              categoryClass: "bg-purple-500/20",
              title: "HYDRAA Established for Lake Protection",
              summary:
                "July 19: Hyderabad Disaster Response and Asset Protection Agency (HYDRAA) created with ₹200 crores budget. Commissioner Avula Venkata Ranganath leads demolition drives.",
              details: [
                {
                  label: "Actions Taken",
                  content:
                    "• 52 illegal structures demolished<br>• 119 acres reclaimed<br>• Using NRSA satellite data and virtual fencing<br>• 60-80% of ponds still occupied by illegal structures",
                },
                {
                  label: "Three-Phase Approach",
                  content:
                    "1. Stop further invasions<br>2. Deny permissions for illegal buildings<br>3. Remove silt, divert rainwater, restore water bodies",
                },
              ],
            },
            {
              category: "Environmental Monitoring",
              categoryClass: "bg-gray-500/20",
              title: "Systematic Air Quality Monitoring (2015-2025)",
              summary:
                "12.7 million air quality measurements recorded across 16 monitoring stations from 2015-2025, documenting pollution levels across Hyderabad metro area.",
              details: [
                {
                  label: "Data Scale",
                  content: "12,698,296 measurements across 11 years of monitoring",
                },
                {
                  label: "Station Coverage",
                  content: "16 monitoring locations including Central University, IDA Pashamylaram, Zoo Park",
                },
                {
                  label: "Peak Activity",
                  content: "899,229 measurements in 2024, 867,775 in 2023",
                },
                {
                  label: "Key Locations",
                  content: "Central University (1.66M measurements), IDA Pashamylaram (1.63M), Zoo Park (1.60M)",
                },
              ],
            },
            {
              category: "Water Testing",
              categoryClass: "bg-blue-500/20",
              title: "Comprehensive Water Quality Assessment (2016-2025)",
              summary:
                "14,827 water quality tests conducted across water bodies, measuring 108 parameters including pollution indicators, bacterial contamination, and chemical composition.",
              details: [
                {
                  label: "Test Scope",
                  content: "14,827 samples testing 108 water quality parameters",
                },
                {
                  label: "Key Indicators",
                  content: "pH (87.7% coverage), Turbidity (86.5%), BOD (85.4%), Fecal Coliform (84.8%)",
                },
                {
                  label: "Pollution Markers",
                  content: "Nitrate-N average 7.76 mg/L (range: -0.04 to 55.00 mg/L)",
                },
                {
                  label: "Coverage",
                  content: "Multiple districts with comprehensive chemical and biological testing",
                },
              ],
            },
            {
              category: "Emergency Response",
              categoryClass: "bg-orange-500/20",
              title: "HMWSSB Water Tanker Emergency Deployments (2022-2025)",
              summary:
                "7,270 water tanker requests recorded across 30 divisions, with peak demand in April-May indicating seasonal water scarcity crisis.",
              details: [
                {
                  label: "Request Volume",
                  content: "7,270 tanker requests across 30 administrative divisions",
                },
                {
                  label: "Peak Demand",
                  content: "April (737 requests, 21.7% above average), May (731 requests, 20.7% above average)",
                },
                {
                  label: "Geographic Distribution",
                  content: "Division 3 (570 requests), Division 5 (507), Division 9 (493)",
                },
                {
                  label: "Crisis Pattern",
                  content: "Seasonal peaks indicate systematic water supply failures during summer months",
                },
              ],
            },
            {
              category: "Climate Data",
              categoryClass: "bg-blue-500/20",
              title: "21-Year Rainfall Dataset Compilation (2004-2025)",
              summary:
                "1.78 million rainfall records collected across 21 datasets covering 2004-2025, documenting monsoon patterns across 36 districts and 725 mandals in Telangana region.",
              details: [
                {
                  label: "Data Scale",
                  content: "1,775,167 rainfall measurements across 21 years",
                },
                {
                  label: "Geographic Coverage",
                  content: "36 districts, 725 mandals, 1,637 unique locations",
                },
                {
                  label: "Seasonal Pattern",
                  content: "June-September monsoon totaling 634,693mm in 2020 sample year",
                },
                {
                  label: "Peak Activity",
                  content: "555,728 records in 2023-2025 period, 318,132 in 2018",
                },
              ],
            },
            {
              category: "Hope Through Data",
              categoryClass: "bg-green-500/20",
              title: "This Research Project",
              summary:
                '"Reviving Hyderabad\'s Lost Lakes: A Data-Driven Chronicle and Visualization Platform" - The first comprehensive attempt to document every water body and make the crisis emotionally accessible.',
              details: [
                {
                  label: "Project Goals",
                  content:
                    "• Document all water bodies (1975-2025)<br>• Create India's first lake tracking platform<br>• Combine satellite data with ground truth<br>• Make data emotionally compelling for action",
                },
                {
                  label: "Why This Matters",
                  content:
                    "Without accurate data and public awareness, we cannot protect what remains. Every lake saved means better flood protection and a chance for future generations.",
                },
              ],
            },
          ]}
        />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .border-l-3 {
          border-left-width: 3px;
        }
        .era-stable { --era-color: #86a7c8; }
        .era-warning { --era-color: #e6a08f; }
        .era-critical { --era-color: #e05d38; }
        .era-crisis { --era-color: #ef4444; }
        .era-emergency { --era-color: #ef4444; }
      `}</style>
    </div>
  )
}
