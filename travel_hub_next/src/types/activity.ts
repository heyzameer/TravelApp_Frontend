export interface Activity {
    _id: string;
    name: string;
    description: string;
    images: string[];
    pricePerPerson: number;
    duration: number;
    maxParticipants: number;
    category?: string;
    location?: {
        city: string;
        state: string;
    };
    availableTimeSlots?: string[];
    propertyId?: string;
}
