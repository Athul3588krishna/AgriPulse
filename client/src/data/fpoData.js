// SFAC India Registered Farmer Producer Organizations (FPO) Data
// Official SFAC 2-Year & 3-Year Programmes

export const FPO_SUMMARY = {
  total: 901,
  twoYearProgramme: 260,
  threeYearProgramme: 641,
  nationalHub: "Delhi (SFAC HQ)",
};

export const FPO_STATES = [
  { id: "MP", name: "Madhya Pradesh", count: 149, lat: 22.9734, lng: 78.6569, tier: "high", code: "MP" },
  { id: "KA", name: "Karnataka", count: 126, lat: 15.3173, lng: 75.7139, tier: "high", code: "KA" },
  { id: "MH", name: "Maharashtra", count: 105, lat: 19.7515, lng: 75.7139, tier: "high", code: "MH" },
  { id: "WB", name: "West Bengal", count: 89, lat: 22.9868, lng: 87.8550, tier: "high", code: "WB" },
  { id: "UP", name: "Uttar Pradesh", count: 57, lat: 26.8467, lng: 80.9462, tier: "high", code: "UP" },
  { id: "RJ", name: "Rajasthan", count: 50, lat: 27.0238, lng: 74.2179, tier: "high", code: "RJ" },
  { id: "OD", name: "Odisha", count: 41, lat: 20.9517, lng: 85.0985, tier: "medium", code: "OD" },
  { id: "BR", name: "Bihar", count: 38, lat: 25.0961, lng: 85.3131, tier: "medium", code: "BR" },
  { id: "SK", name: "Sikkim", count: 30, lat: 27.5330, lng: 88.5122, tier: "medium", code: "SK" },
  { id: "CG", name: "Chhattisgarh", count: 26, lat: 21.2787, lng: 81.8661, tier: "medium", code: "CG" },
  { id: "TS", name: "Telangana", count: 26, lat: 18.1124, lng: 79.0193, tier: "medium", code: "TS" },
  { id: "GJ", name: "Gujarat", count: 25, lat: 22.2587, lng: 71.1924, tier: "medium", code: "GJ" },
  { id: "HR", name: "Haryana", count: 23, lat: 29.0588, lng: 76.0856, tier: "medium", code: "HR" },
  { id: "AS", name: "Assam", count: 18, lat: 26.2006, lng: 92.9376, tier: "regular", code: "AS" },
  { id: "AP", name: "Andhra Pradesh", count: 16, lat: 15.9129, lng: 79.7400, tier: "regular", code: "AP" },
  { id: "TN", name: "Tamil Nadu", count: 13, lat: 11.1271, lng: 78.6569, tier: "regular", code: "TN" },
  { id: "JH", name: "Jharkhand", count: 10, lat: 23.6102, lng: 85.2799, tier: "regular", code: "JH" },
  { id: "HP", name: "Himachal Pradesh", count: 8, lat: 31.1048, lng: 77.1734, tier: "regular", code: "HP" },
  { id: "MN", name: "Manipur", count: 8, lat: 24.6637, lng: 93.9063, tier: "regular", code: "MN" },
  { id: "PB", name: "Punjab", count: 7, lat: 31.1471, lng: 75.3412, tier: "regular", code: "PB" },
  { id: "TR", name: "Tripura", count: 7, lat: 23.9408, lng: 91.9882, tier: "regular", code: "TR" },
  { id: "UK", name: "Uttarakhand", count: 7, lat: 30.0668, lng: 79.0193, tier: "regular", code: "UK" },
  { id: "AR", name: "Arunachal Pradesh", count: 6, lat: 28.2180, lng: 94.7278, tier: "regular", code: "AR" },
  { id: "DL", name: "Delhi", count: 4, lat: 28.7041, lng: 77.1025, tier: "hub", code: "DL" },
  { id: "NL", name: "Nagaland", count: 4, lat: 26.1584, lng: 94.5624, tier: "regular", code: "NL" },
  { id: "ML", name: "Meghalaya", count: 3, lat: 25.4670, lng: 91.3662, tier: "regular", code: "ML" },
  { id: "JK", name: "Jammu & Kashmir", count: 2, lat: 33.7782, lng: 76.5762, tier: "regular", code: "JK" },
  { id: "GA", name: "Goa", count: 2, lat: 15.2993, lng: 74.1240, tier: "regular", code: "GA" },
  { id: "MZ", name: "Mizoram", count: 1, lat: 23.1645, lng: 92.9376, tier: "regular", code: "MZ" },
];

// Key inter-state agricultural corridor links (curved arcs matching Image 1)
export const FPO_CORRIDORS = [
  { from: "DL", to: "MP", label: "Central Corridor" },
  { from: "MP", to: "MH", label: "Western Hub Link" },
  { from: "MH", to: "KA", label: "Deccan Agritech Corridor" },
  { from: "KA", to: "TN", label: "Southern Belt" },
  { from: "MP", to: "WB", label: "East-West Agri Spine" },
  { from: "WB", to: "AS", label: "North-East Gateway" },
  { from: "DL", to: "RJ", label: "North-West Route" },
  { from: "DL", to: "UP", label: "Gangetic Plain Network" },
  { from: "MH", to: "GJ", label: "Coastal Agro Link" },
  { from: "KA", to: "AP", label: "Peninsular Link" }
];
