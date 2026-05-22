export const CATEGORIES = {
  Recyclable:    { color: 'var(--green)',  bg: 'var(--green-bg)',  border: 'var(--green-bdr)', icon: 'Recycle', label: 'Recyclable'     },
  'General Waste':{ color: 'var(--red)',   bg: 'var(--red-bg)',    border: 'rgba(239,68,68,0.2)',  icon: 'Trash2', label: 'General Waste'  },
  Hazardous:     { color: 'var(--amber)',  bg: 'var(--amber-bg)',  border: 'rgba(245,158,11,0.2)', icon: 'AlertTriangle', label: 'Hazardous'      },
  Compostable:   { color: 'var(--lime)',   bg: 'var(--lime-bg)',   border: 'rgba(132,204,22,0.2)', icon: 'Leaf', label: 'Compostable'    },
  'E-Waste':     { color: 'var(--purple)', bg: 'var(--purple-bg)', border: 'rgba(139,92,246,0.2)', icon: 'Zap', label: 'E-Waste'        },
  Glass:         { color: 'var(--cyan)',   bg: 'var(--cyan-bg)',   border: 'rgba(6,182,212,0.2)',  icon: 'Wine', label: 'Glass'          },
}

export const CATEGORY_LIST = Object.keys(CATEGORIES)

export const DEMO_ITEMS = [
  { id:'d1', barcode:'012345678901', name:'Plastic Water Bottle', category:'Recyclable',    disposal_method:'Blue Bin',               instructions:'Rinse and remove cap before recycling. Crush to save space.', tips:'Caps are often not recyclable — check locally.',          co2_saved:0.10, verified:true },
  { id:'d2', barcode:'012345678902', name:'Newspaper',            category:'Recyclable',    disposal_method:'Blue Bin',               instructions:'Keep dry. Bundle together or place in recycling bag.',         tips:'Wet newspaper goes in compost, not recycling.',            co2_saved:0.05, verified:true },
  { id:'d3', barcode:'012345678903', name:'AA Battery',           category:'Hazardous',     disposal_method:'Hazardous Waste Facility',instructions:'Never throw in regular trash. Take to a battery drop-off.', tips:'Many electronics stores accept batteries for free.',        co2_saved:0.20, verified:true },
  { id:'d4', barcode:'012345678904', name:'Glass Bottle',         category:'Glass',         disposal_method:'Glass Bank',             instructions:'Rinse thoroughly. Remove lids and corks.',                   tips:'Labels do not need to be removed.',                        co2_saved:0.15, verified:true },
  { id:'d5', barcode:'012345678905', name:'Banana Peel',          category:'Compostable',   disposal_method:'Brown Bin / Compost',    instructions:'Place in compost bin or food waste collection.',             tips:'Great for home composting — speeds up decomposition.',     co2_saved:0.03, verified:true },
  { id:'d6', barcode:'012345678906', name:'Old Smartphone',       category:'E-Waste',       disposal_method:'E-Waste Facility',       instructions:'Take to authorized e-waste facility. Never trash it.',       tips:'Many manufacturers have take-back programs.',              co2_saved:0.50, verified:true },
  { id:'d7', barcode:'012345678907', name:'Cardboard Box',        category:'Recyclable',    disposal_method:'Blue Bin',               instructions:'Flatten before recycling. Remove all tape and staples.',     tips:'Pizza boxes with grease go in compost, not recycling.',   co2_saved:0.08, verified:true },
  { id:'d8', barcode:'012345678908', name:'Styrofoam Cup',        category:'General Waste', disposal_method:'Black Bin',              instructions:'Most styrofoam is not recyclable. Place in general waste.',  tips:'Some specialist facilities accept styrofoam — check locally.', co2_saved:0, verified:true },
  { id:'d9', barcode:'012345678909', name:'Aluminium Can',        category:'Recyclable',    disposal_method:'Blue Bin',               instructions:'Rinse clean. Crush to save space in your bin.',              tips:'Aluminium is infinitely recyclable with no quality loss.', co2_saved:0.12, verified:true },
  { id:'d10',barcode:'012345678910', name:'Used Cooking Oil',     category:'Hazardous',     disposal_method:'Oil Collection Point',   instructions:'Store in a sealed container. Take to oil recycling point.', tips:'Never pour down the drain — it blocks pipes and harms waterways.', co2_saved:0.25, verified:true },
  { id:'d11',barcode:'012345678911', name:'Egg Shells',           category:'Compostable',   disposal_method:'Brown Bin / Compost',    instructions:'Can go straight in the compost or food waste bin.',          tips:'Egg shells add calcium to compost and deter garden pests.', co2_saved:0.02, verified:true },
  { id:'d12',barcode:'012345678912', name:'Broken Mirror',        category:'General Waste', disposal_method:'Black Bin',              instructions:'Wrap in newspaper or bubble wrap before disposal.',          tips:'Glass from mirrors cannot go in the glass recycling bank.', co2_saved:0, verified:true },
  { id:'d13',barcode:'012345678913', name:'Aluminum Can',         category:'Recyclable',    disposal_method:'Blue Bin',               instructions:'Rinse clean. Crush to save space in your bin.',              tips:'Aluminum is infinitely recyclable with no quality loss.', co2_saved:0.12, verified:true },
  { id:'d14',barcode:'012345678914', name:'Food Waste',           category:'Compostable',   disposal_method:'Brown Bin / Compost',    instructions:'Place all food scraps in compost or food waste bin.',        tips:'Meat and dairy can go in municipal compost, not home compost.', co2_saved:0.04, verified:true },
  { id:'d15',barcode:'012345678915', name:'Electronics',          category:'E-Waste',       disposal_method:'E-Waste Facility',       instructions:'Take to authorized e-waste recycling facility.',             tips:'Remove batteries before recycling electronics.',           co2_saved:0.45, verified:true },
  { id:'d16',barcode:'012345678916', name:'Battery',              category:'Hazardous',     disposal_method:'Hazardous Waste Facility',instructions:'Never throw in regular trash. Take to a battery drop-off.', tips:'Many electronics stores accept batteries for free.',        co2_saved:0.20, verified:true },
  { id:'d17',barcode:'012345678917', name:'Plastic Bottle',       category:'Recyclable',    disposal_method:'Blue Bin',               instructions:'Rinse and remove cap before recycling. Crush to save space.', tips:'Caps are often not recyclable — check locally.',          co2_saved:0.10, verified:true },
]

export const DEMO_FACILITIES = [
  { id:'f1', name:'City Recycling Centre',    type:'Recycling', lat:19.0760, lng:72.8777, city:'Mumbai', address:'Andheri East, Mumbai',    accepts:['Recyclable','Glass'] },
  { id:'f2', name:'E-Waste Drop-Off Hub',     type:'E-Waste',   lat:19.1136, lng:72.8697, city:'Mumbai', address:'Borivali West, Mumbai',   accepts:['E-Waste'] },
  { id:'f3', name:'Hazardous Waste Facility', type:'Hazardous', lat:19.0390, lng:72.8619, city:'Mumbai', address:'Sion, Mumbai',            accepts:['Hazardous'] },
  { id:'f4', name:'Community Compost Unit',   type:'Compost',   lat:19.0411, lng:72.8542, city:'Mumbai', address:'Dharavi, Mumbai',         accepts:['Compostable'] },
  { id:'f5', name:'Battery Collection Point', type:'Hazardous', lat:19.0596, lng:72.8295, city:'Mumbai', address:'Bandra West, Mumbai',     accepts:['Hazardous'] },
]
