import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";
import { getProfile } from "../profile/services/profile.api";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const authData = await getMe();
                const authUser = authData?.user || null;

                setUser(authUser);

                if (authUser) {
                    const profileData = await getProfile();
                    setProfile(profileData?.data || null);
                } else {
                    setProfile(null);
                }
            } catch (error) {
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrapAuth();
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, profile, setProfile, loading, setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}
