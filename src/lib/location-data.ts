
export const locationData: { [key: string]: { [key: string]: string[] } } = {
  "Maharashtra": {
    "Mumbai": ["South Mumbai", "Western Suburbs", "Central Suburbs", "Navi Mumbai"],
    "Pune": ["Koregaon Park", "Deccan", "Hinjewadi", "Kothrud"],
    "Nagpur": ["Civil Lines", "Sadar", "Ramdaspeth"],
    "Sangli": ["Miraj", "Kupwad", "Vishrambag", "Sangli-Miraj Road"]
  },
  "Karnataka": {
    "Bangalore": ["Koramangala", "Indiranagar", "Jayanagar", "Whitefield"],
    "Mysore": ["Jayalakshmipuram", "Vontikoppal", "Saraswathipuram"],
  },
  "Delhi": {
    "Delhi": ["Connaught Place", "Karol Bagh", "South Extension", "Saket"]
  }
};

export const states = Object.keys(locationData);
