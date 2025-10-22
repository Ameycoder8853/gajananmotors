
export const locationData: { [state: string]: { [city: string]: string[] } } = {
    "Maharashtra": {
        "Mumbai": ["Andheri", "Bandra", "Dadar", "Juhu", "Malad"],
        "Pune": ["Koregaon Park", "Viman Nagar", "Hinjewadi", "Kothrud", "Deccan Gymkhana"],
        "Nagpur": ["Sitabuldi", "Dharampeth", "Ramdaspeth"]
    },
    "Karnataka": {
        "Bangalore": ["Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "HSR Layout"],
        "Mysore": ["Jayalakshmipuram", "Vontikoppal", "Saraswathipuram"],
    },
    "Delhi": {
        "New Delhi": ["Connaught Place", "Karol Bagh", "Hauz Khas", "Saket", "Greater Kailash"]
    }
};

export const states = Object.keys(locationData);
