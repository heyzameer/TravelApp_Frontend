import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roomService } from '../../services/roomService';
import { toast } from 'react-hot-toast';
import type { Room, ImageFile } from '../../types';

interface RoomState {
    rooms: Room[];
    currentRoom: Room | null;
    loading: boolean;
    error: string | null;
}

const initialState: RoomState = {
    rooms: [],
    currentRoom: null,
    loading: false,
    error: null,
};

export const fetchRooms = createAsyncThunk(
    'rooms/fetchRooms',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            return await roomService.getRoomsByProperty(propertyId);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch rooms');
        }
    }
);

export const createRoom = createAsyncThunk(
    'rooms/createRoom',
    async ({ propertyId, data, images }: { propertyId: string; data: Partial<Room>; images: ImageFile[] }, { rejectWithValue }) => {
        try {
            // 1. Create Room Details
            const room = await roomService.createRoomDetails(propertyId, data);

            // 2. Upload Images if any
            if (images && images.length > 0) {
                const formData = new FormData();
                const metadata: { category: string; label: string }[] = [];

                images.forEach((img) => {
                    if (img.file) {
                        formData.append('images', img.file);
                        metadata.push({
                            category: img.category,
                            label: img.label
                        });
                    }
                });

                if (metadata.length > 0) {
                    formData.append('imageMetadata', JSON.stringify(metadata));
                    return await roomService.uploadRoomImages(room._id, formData);
                }
            }

            return room;
        } catch (error: unknown) {
            console.error('Room creation error:', error);
            const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
            };
            return rejectWithValue(err.response?.data?.message || err.message || 'Failed to create room');
        }
    }
);

export const updateRoom = createAsyncThunk(
    'rooms/updateRoom',
    async ({ roomId, data }: { roomId: string; data: Partial<Room> }, { rejectWithValue }) => {
        try {
            return await roomService.updateRoom(roomId, data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to update room');
        }
    }
);

export const uploadRoomImages = createAsyncThunk(
    'rooms/uploadRoomImages',
    async ({ roomId, images }: { roomId: string; images: ImageFile[] }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            const metadata: { category: string; label: string }[] = [];

            images.forEach((img) => {
                if (img.file) {
                    formData.append('images', img.file);
                    metadata.push({
                        category: img.category,
                        label: img.label
                    });
                }
            });

            if (metadata.length > 0) {
                formData.append('imageMetadata', JSON.stringify(metadata));
                return await roomService.uploadRoomImages(roomId, formData);
            }
            return null; // Or handle case where no images are provided
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to upload images');
        }
    }
);

export const deleteRoom = createAsyncThunk(
    'rooms/deleteRoom',
    async (roomId: string, { rejectWithValue }) => {
        try {
            await roomService.deleteRoom(roomId);
            return roomId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to delete room');
        }
    }
);

const roomSlice = createSlice({
    name: 'rooms',
    initialState,
    reducers: {
        clearRoomError: (state) => {
            state.error = null;
        },
        resetCurrentRoom: (state) => {
            state.currentRoom = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Rooms
        builder.addCase(fetchRooms.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchRooms.fulfilled, (state, action) => {
            state.loading = false;
            state.rooms = action.payload;
        });
        builder.addCase(fetchRooms.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            toast.error(action.payload as string);
        });

        // Create Room
        builder.addCase(createRoom.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createRoom.fulfilled, (state, action) => {
            state.loading = false;
            // Handle both single room and array of rooms (though roomService now returns single)
            if (Array.isArray(action.payload)) {
                state.rooms.push(...action.payload);
            } else {
                state.rooms.push(action.payload);
            }
            toast.success('Room(s) created successfully');
        });
        builder.addCase(createRoom.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            toast.error(action.payload as string);
        });

        // Update Room
        builder.addCase(updateRoom.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateRoom.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.rooms.findIndex(r => r._id === action.payload._id);
            if (index !== -1) {
                state.rooms[index] = action.payload;
            }
            toast.success('Room updated successfully');
        });
        builder.addCase(updateRoom.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            toast.error(action.payload as string);
        });

        // Delete Room
        builder.addCase(deleteRoom.fulfilled, (state, action) => {
            state.rooms = state.rooms.filter(r => r._id !== action.payload);
            toast.success('Room deleted successfully');
        });
    },
});

export const { clearRoomError, resetCurrentRoom } = roomSlice.actions;
export default roomSlice.reducer;
