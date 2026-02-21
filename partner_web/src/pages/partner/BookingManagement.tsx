import React from 'react';
import BookingRequests from '../../components/bookings/BookingRequests';

interface BookingManagementProps {
    searchQuery?: string;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ searchQuery }) => {
    return (
        <div className="h-full">
            <BookingRequests externalSearch={searchQuery} />
        </div>
    );
};

export default BookingManagement;
