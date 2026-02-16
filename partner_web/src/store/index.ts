import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import propertiesReducer from './slices/propertiesSlice';
import partnersReducer from './slices/partnersSlice';
import roomReducer from '../features/rooms/roomSlice';
import mealPlanReducer from '../features/mealPlans/mealPlanSlice';
import activityReducer from '../features/activities/activitySlice';
import packageReducer from '../features/packages/packageSlice';
import availabilityReducer from '../features/availability/availabilitySlice';
import bookingsReducer from './slices/bookingsSlice';

// Persist configuration - only persist auth state
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'], // Only persist these fields
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    users: usersReducer,
    properties: propertiesReducer,
    partners: partnersReducer,
    rooms: roomReducer,
    mealPlans: mealPlanReducer,
    activities: activityReducer,
    packages: packageReducer,
    availability: availabilityReducer,
    bookings: bookingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
