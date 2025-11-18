import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { clearAllAppCookies } from '@/utils/cookies';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      setUser: (userData) => {
        set({ 
          user: userData, 
          isAuthenticated: !!userData,
          error: null 
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates }
          });
        }
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Fetch user data using single combined endpoint
      fetchUser: async () => {
        set({ loading: true, error: null });
        
        try {
          // Use the new combined endpoint that handles both token verification and user fetching
          const response = await fetch("/api/auth/user", {
            method: "GET",
            credentials: 'include', // Include cookies in the request
          });

          const data = await response.json();

          if (data.success && data.user) {
            set({ 
              user: data.user, 
              isAuthenticated: true,
              loading: false,
              error: null 
            });
            return data.user;
          }

          throw new Error(data.message || "Failed to fetch user");
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      // Logout function with proper cleanup
      logout: async () => {
        set({ loading: true });
        
        try {
          // Call logout API
          await fetch("/api/auth/logout", { method: "POST" });

          // Clear all application cookies
          clearAllAppCookies();

          // Clear localStorage (keep for Zustand persist)
          if (typeof window !== 'undefined') {
            localStorage.clear();
          }

          // Reset store state
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false, 
            error: null 
          });

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      // Login method
      login: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (data.success) {
            // Store userId in localStorage for compatibility
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem("userId", data.user.userId);
            }
            
            // Set cookie for server-side access
            if (typeof document !== 'undefined') {
              document.cookie = `userId=${data.user.userId}; path=/;`;
              document.cookie = `token=${data.token}; path=/; max-age=604800; sameSite=lax;`;
            }

            // Fetch complete user profile
            await get().fetchUser();
            
            return { success: true, user: data.user };
          } else {
            set({ 
              loading: false, 
              error: data.error 
            });
            return { 
              success: false, 
              error: data.error, 
              field: data.field 
            };
          }
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message 
          });
          return { 
            success: false, 
            error: "An unexpected error occurred. Please try again." 
          };
        }
      },

      // Clear user data (for client-side logout)
      clearUser: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      // Initialize auth state (check if user is logged in)
      initializeAuth: async () => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const { user } = get();
        
        // If we already have user data, don't fetch again
        if (user) return;

        try {
          await get().fetchUser();
        } catch (error) {
          // Silently fail - user is not authenticated
          console.log('User not authenticated');
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a mock storage for server side
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;