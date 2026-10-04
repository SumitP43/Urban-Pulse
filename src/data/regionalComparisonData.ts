import { RegionalComparisonCityData, UrbanEventTrendPoint } from '../types';

export interface CityOption {
  value: string;
  label: string;
  state: string;
  badge: string;
  color: string;
}

export const COMPARISON_CITIES: CityOption[] = [
  { value: 'Noida', label: 'Noida', state: 'Uttar Pradesh', badge: 'NCR Corridor', color: '#059669' },
  { value: 'Gurugram', label: 'Gurugram', state: 'Haryana', badge: 'Cyber Hub / NCR', color: '#006874' },
  { value: 'Bengaluru', label: 'Bengaluru', state: 'Karnataka', badge: 'Tech Capital', color: '#7c3aed' },
  { value: 'Mumbai', label: 'Mumbai', state: 'Maharashtra', badge: 'Financial Hub', color: '#d97706' },
  { value: 'Delhi', label: 'Delhi', state: 'NCT', badge: 'National Capital', color: '#0053db' },
];

export function getRegionalComparisonData(
  primaryCity: string,
  compareCity: string,
  category: string = 'Environment',
  primaryTimeline: UrbanEventTrendPoint[] = []
): RegionalComparisonCityData {
  const normPrimary = (primaryCity || 'Delhi').toLowerCase();
  const normCompare = (compareCity || 'Bengaluru').toLowerCase();

  // Factors and baseline offsets depending on the city
  let freqFactor = 0.55;
  let intensityFactor = 0.65;
  let keyMetricText = '';
  let summaryText = '';
  let velocityText = '';
  let compareCityContexts: string[] = [];

  if (normCompare.includes('bengaluru')) {
    freqFactor = 0.48;
    intensityFactor = 0.58;
    keyMetricText = 'Average AQI 165–245 · 48% Lower Severity than Delhi';
    velocityText = '+22% moderate seasonal variance';
    summaryText = `Bengaluru exhibits a significantly lower atmospheric inversion penalty than ${primaryCity}, with air pollution concentrated near Outer Ring Road and Whitefield freight chokepoints rather than basin-wide meteorological stagnation.`;
    compareCityContexts = [
      'BBMP sensor calibration near Bellandur lake drainage corridor shows localized PM10 dust.',
      'BMRCL metro construction diversions along Silk Board junction account for 40% of micro-particulates.',
      'State Pollution Control Board advisory issued for diesel freight movement along Outer Ring Road.',
      'Wet atmospheric scavenging mitigates ambient PM2.5 compared to northern plains inversion.',
      'KSPCB mobile anti-smog units deployed at 8 technology park entry gates.',
      'Commuter grievance escalation rates stabilized following frequency increase on Purple Line metro.'
    ];
  } else if (normCompare.includes('noida')) {
    freqFactor = 0.82;
    intensityFactor = 0.88;
    keyMetricText = 'Average AQI 360–395 · Closely Tracking Delhi NCR Trajectory';
    velocityText = '+110% sharp escalation across Yamuna floodplain';
    summaryText = `Noida exhibits high correlation with ${primaryCity}'s air quality and infrastructure stress due to contiguous meteorological boundary layer entrapment and construction along the Yamuna Expressway corridor.`;
    compareCityContexts = [
      'Noida Authority deploys 45 water sprinkler tankers across Sector 62 and Greater Noida Link Road.',
      'UPPCB invokes Stage-III GRAP directives matching Delhi CAQM emergency notifications.',
      'Stoppage orders served on 22 commercial construction sites along Noida Expressway.',
      'Ambient PM2.5 levels reach 390 µg/m³ near Sector 116 air quality monitoring station.',
      'Heavy vehicular tailback at Kalindi Kunj and DND Flyway border checkpoints under commercial vehicle checks.',
      'MCD and Noida Authority coordinate joint night sweeping on inter-state arterial links.'
    ];
  } else if (normCompare.includes('gurugram')) {
    freqFactor = 0.78;
    intensityFactor = 0.85;
    keyMetricText = 'Average AQI 340–385 · High Diesel Generator Reliance';
    velocityText = '+95% acute acceleration';
    summaryText = `Gurugram shows intense localized pollution spikes along the Delhi-Jaipur Expressway (NH-48) and Cyber City office corridors, aggravated by commercial backup diesel generator usage during peak grid curtailments.`;
    compareCityContexts = [
      'HSPCB mandates 100% ban on non-emergency diesel generator sets under GRAP Stage-III.',
      'NH-48 commuter travel times surge 45 minutes due to commercial freight diversion barriers at Sirhaul border.',
      'GMDA operationalizes mechanized sweepers along Golf Course Extension Road.',
      'Cyber City and Udyog Vihar industrial zones show sustained PM10 concentration above 420 µg/m³.',
      'Traffic Police impound 140 non-compliant commercial transport vehicles entering from Rajasthan.',
      'Ambient monitoring station at Vikas Sadan registers AQI 378 under prevailing thermal inversion.'
    ];
  } else if (normCompare.includes('mumbai')) {
    freqFactor = 0.52;
    intensityFactor = 0.60;
    keyMetricText = 'Average AQI 175–230 · Maritime Air Scavenging Active';
    velocityText = '+18% mild coastal fluctuation';
    summaryText = `Mumbai benefits from diurnal sea-breeze dispersion, confining critical civic grievances to massive infrastructure construction zones (Coastal Road, Metro Line 3) and localized dust in Chembur and Deonar.`;
    compareCityContexts = [
      'BMC air quality guidelines mandate 35-foot metal barricading around Coastal Road and civic work zones.',
      'Maritime diurnal sea-breeze prevents planetary boundary layer entrapment seen in northern cities.',
      'Deonar and Govandi monitoring stations record elevated PM10 due to municipal landfill proximity.',
      'BEST bus operational frequency increased by 110 trips along Western Express Highway.',
      'Maharashtra PCB serves show-cause notices to 15 ready-mix concrete batching plants.',
      'Bandra-Kurla Complex (BKC) records moderate AQI 182 with active mist cannon operations.'
    ];
  } else {
    // Custom or generic city
    freqFactor = 0.60;
    intensityFactor = 0.70;
    keyMetricText = `Indexed ${compareCity} civic telemetry`;
    velocityText = '+35% regional progression';
    summaryText = `Comparative telemetry highlights divergent regulatory responses and geographical dispersion patterns between ${primaryCity} and ${compareCity}.`;
    compareCityContexts = [
      `${compareCity} municipal surveillance reports localized environmental metrics.`,
      `State pollution control authorities monitor transit and emission parameters across ${compareCity}.`,
      `Inter-city arterial freight movements monitored under statutory ambient standards.`,
      `Civic grievance registrations show steady reporting trajectory across municipal wards.`,
      `Remediation protocols active in accordance with state disaster and urban management guidelines.`
    ];
  }

  // Build timeline data matching the primary timeline periods
  const timelineTrend: UrbanEventTrendPoint[] = primaryTimeline.map((pt, idx) => {
    const rawFreq = Math.round(pt.frequency * freqFactor);
    const safeFreq = Math.max(8, rawFreq + ((idx % 3) - 1) * 3);
    const safeIntensity = pt.intensity ? Math.round(pt.intensity * intensityFactor) : 220;
    const safeBaseline = pt.baseline ? Math.round(pt.baseline * intensityFactor) : 180;
    const highlight = compareCityContexts[idx % compareCityContexts.length] ||
      `${compareCity} municipal telemetry updated for ${pt.period}.`;

    return {
      period: pt.period,
      frequency: safeFreq,
      specificEventCount: safeFreq,
      intensity: safeIntensity,
      baseline: safeBaseline,
      linkedSourceIds: [`${compareCity.toLowerCase().slice(0, 3)}-src-${(idx % 2) + 1}`],
      keyEventHighlight: highlight,
    };
  });

  // Categories matching urban factors
  const frequencyByCategory = [
    {
      category: `${category} Core`,
      count: Math.round(220 * freqFactor),
      percentage: 36,
      trend: freqFactor > 0.7 ? ('up' as const) : ('stable' as const),
      linkedSourceIds: [`${compareCity.toLowerCase().slice(0, 3)}-src-1`],
      keyEventHighlight: `Primary civic and infrastructural vectors in ${compareCity}.`
    },
    {
      category: 'Transit & Fleet Congestion',
      count: Math.round(180 * freqFactor),
      percentage: 29,
      trend: 'up' as const,
      linkedSourceIds: [`${compareCity.toLowerCase().slice(0, 3)}-src-2`],
      keyEventHighlight: `Arterial chokepoints and municipal feeder fleet utilization in ${compareCity}.`
    },
    {
      category: 'Regulatory Enforcement',
      count: Math.round(140 * freqFactor),
      percentage: 21,
      trend: 'stable' as const,
      linkedSourceIds: [`${compareCity.toLowerCase().slice(0, 3)}-src-1`],
      keyEventHighlight: `Statutory compliance checks conducted by ${compareCity} municipal squads.`
    },
    {
      category: 'Civic Grievance Influx',
      count: Math.round(90 * freqFactor),
      percentage: 14,
      trend: 'down' as const,
      linkedSourceIds: [`${compareCity.toLowerCase().slice(0, 3)}-src-2`],
      keyEventHighlight: `Citizen helpline registrations across ${compareCity} municipal wards.`
    },
  ];

  // Severity Distribution
  const totalCompareCount = Math.round(200 * freqFactor);
  const severityDistribution = [
    {
      severity: 'Critical / Severe Tier',
      count: Math.round(totalCompareCount * (freqFactor > 0.7 ? 0.30 : 0.15)),
      color: '#DC2626'
    },
    {
      severity: 'Elevated Warning',
      count: Math.round(totalCompareCount * 0.35),
      color: '#EA580C'
    },
    {
      severity: 'Moderate Attention',
      count: Math.round(totalCompareCount * 0.32),
      color: '#D97706'
    },
    {
      severity: 'Routine / Normal',
      count: Math.round(totalCompareCount * (freqFactor > 0.7 ? 0.03 : 0.18)),
      color: '#059669'
    }
  ];

  return {
    city: compareCity,
    label: `${compareCity} (Comparative Jurisdiction)`,
    state: COMPARISON_CITIES.find(c => c.value === compareCity)?.state || 'State Jurisdiction',
    timelineTrend,
    frequencyByCategory,
    severityDistribution,
    summary: summaryText,
    keyMetric: keyMetricText,
    incidentVelocity: velocityText,
  };
}
