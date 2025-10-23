
import { Sun, Wind, Video, Car, Snowflake, Thermometer, Key, ParkingCircle, Bluetooth, Usb, Tv, Speaker, Wifi, Shield, Star, Award, Gem, Gauge, LucideIcon } from 'lucide-react';

export type CarFeature = {
    id: string;
    label: string;
    icon: LucideIcon;
};

export const carFeatures: CarFeature[] = [
    { id: 'sunroof', label: 'Sunroof', icon: Sun },
    { id: 'ventilated-seats', label: 'Ventilated Seats', icon: Wind },
    { id: '360-camera', label: '360-degree Camera', icon: Video },
    { id: 'cruise-control', label: 'Cruise Control', icon: Gauge },
    { id: 'climate-control', label: 'Climate Control', icon: Thermometer },
    { id: 'keyless-entry', label: 'Keyless Entry', icon: Key },
    { id: 'parking-sensors', label: 'Parking Sensors', icon: ParkingCircle },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
    { id: 'usb-port', label: 'USB Port', icon: Usb },
    { id: 'touchscreen', label: 'Touchscreen Display', icon: Tv },
    { id: 'premium-sound', label: 'Premium Sound System', icon: Speaker },
    { id: 'wireless-charging', label: 'Wireless Charging', icon: Wifi },
    { id: 'abs', label: 'ABS', icon: Shield },
    { id: 'airbags', label: 'Airbags', icon: Shield },
    { id: 'alloy-wheels', label: 'Alloy Wheels', icon: Star },
    { id: 'leather-seats', label: 'Leather Seats', icon: Award },
    { id: 'ambient-lighting', label: 'Ambient Lighting', icon: Gem },
    { id: 'automatic-headlights', label: 'Automatic Headlights', icon: Car },
    { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
];

    