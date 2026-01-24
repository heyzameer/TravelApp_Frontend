import { Property } from '@/types/property';

// Dummy properties for demonstration when real data is unavailable
export const dummyProperties: Property[] = [
    {
        _id: 'dummy-1',
        name: 'Heritage Homestay Coorg',
        description: 'Experience the charm of traditional Kodava hospitality in our 100-year-old heritage bungalow. Set amidst a sprawling coffee plantation, this stay offers a perfect blend of history, comfort, and nature. Wake up to the aroma of fresh coffee and the chirping of exotic birds. Our family has been welcoming guests for three generations, sharing authentic Coorg cuisine and stories of the region.',
        propertyType: 'homestay',
        address: {
            city: 'Madikeri',
            state: 'Karnataka',
            country: 'India',
            coordinates: {
                latitude: 12.4244,
                longitude: 75.7382
            }
        },
        basePrice: 3500,
        images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'
        ],
        coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
        amenities: ['Free Wi-Fi', 'Authentic Food', 'Parking', 'Mountain View', 'Coffee Plantation Tour', 'Bonfire'],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        rating: 4.8,
        reviewCount: 124,
        isVerified: true,
        owner: {
            name: 'Kavitha Rao',
            phone: '+91 98765 43210'
        }
    },
    {
        _id: 'dummy-2',
        name: 'Riverside Cottage Dandeli',
        description: 'Nestled on the banks of the Kali River, our eco-friendly cottage offers stunning river views and direct access to adventure activities. Perfect for nature lovers and adventure enthusiasts. The cottage features traditional Karnataka architecture with modern amenities. Enjoy morning bird watching, kayaking, and evening bonfires by the river.',
        propertyType: 'cottage',
        address: {
            city: 'Dandeli',
            state: 'Karnataka',
            country: 'India',
            coordinates: {
                latitude: 15.2667,
                longitude: 74.6167
            }
        },
        basePrice: 2800,
        images: [
            'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800'
        ],
        coverImage: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&q=80&w=1200',
        amenities: ['River View', 'Kayaking', 'Free Wi-Fi', 'Parking', 'Bonfire', 'Outdoor Seating'],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        rating: 4.6,
        reviewCount: 87,
        isVerified: true,
        owner: {
            name: 'Ranjan Kumar',
            phone: '+91 98456 78901'
        }
    },
    {
        _id: 'dummy-3',
        name: 'Beachfront Villa Gokarna',
        description: 'Wake up to breathtaking ocean views in our luxurious beachfront villa. Located on the pristine Om Beach, this villa combines modern luxury with traditional coastal charm. Features include a private beach access, infinity pool, and outdoor dining area. Perfect for families and groups seeking a peaceful beach getaway with all modern comforts.',
        propertyType: 'villa',
        address: {
            city: 'Gokarna',
            state: 'Karnataka',
            country: 'India',
            coordinates: {
                latitude: 14.5426,
                longitude: 74.3188
            }
        },
        basePrice: 5500,
        images: [
            'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800'
        ],
        coverImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=1200',
        amenities: ['Beach Access', 'Swimming Pool', 'Free Wi-Fi', 'Parking', 'AC', 'Kitchen', 'Sea View'],
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        rating: 4.9,
        reviewCount: 156,
        isVerified: true,
        owner: {
            name: 'Priya Shenoy',
            phone: '+91 98234 56789'
        }
    },
    {
        _id: 'dummy-4',
        name: 'Mountain View Farmhouse Chikmagalur',
        description: 'Escape to the hills in our charming farmhouse surrounded by coffee estates and rolling hills. Experience authentic farm life with fresh organic produce, nature walks, and stunning mountain vistas. The farmhouse features rustic decor, a vegetable garden, and opportunities to participate in coffee harvesting during season.',
        propertyType: 'farmhouse',
        address: {
            city: 'Chikmagalur',
            state: 'Karnataka',
            country: 'India',
            coordinates: {
                latitude: 13.3161,
                longitude: 75.7720
            }
        },
        basePrice: 4200,
        images: [
            'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1464146072664-f26e4d8c7ad3?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800'
        ],
        coverImage: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1200',
        amenities: ['Mountain View', 'Organic Farm', 'Free Wi-Fi', 'Parking', 'Trekking', 'Bonfire', 'Home-cooked Meals'],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        rating: 4.7,
        reviewCount: 93,
        isVerified: true,
        owner: {
            name: 'Anand Hegde',
            phone: '+91 97654 32109'
        }
    }
];

// Helper function to get a dummy property by ID
export const getDummyPropertyById = (id: string): Property | null => {
    return dummyProperties.find(prop => prop._id === id) || null;
};

// Helper function to get random dummy properties
export const getRandomDummyProperties = (count: number): Property[] => {
    const shuffled = [...dummyProperties].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, dummyProperties.length));
};
