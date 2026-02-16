import React from 'react';
import BookingRequests from '../components/bookings/BookingRequests';

const BookingsPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Booking Management</h1>
            <BookingRequests />
        </div>
    );
};

export default BookingsPage;
