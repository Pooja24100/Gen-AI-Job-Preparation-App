import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import {login , register , logout} from "../services/auth.api"
import { getProfile } from "../../profile/services/profile.api";

export const useAuth = () => {
    const context  = useContext(AuthContext)
    const {user, setUser, profile, setProfile, loading, setLoading} = context;

    const handleLogin = async({email,password})=>{
        setLoading(true)
        try{
            const data = await login({email,password})
            if (!data?.user) {
                return false
            }

            setUser(data.user)

            const profileData = await getProfile()
            setProfile(profileData?.data || null)
            return true
        } catch (error) {
            console.error("Login failed:", error)
            return false
        } finally {
            setLoading(false)
        }
    }
    
    const handleRegister = async({username,email,password})=>{
        setLoading(true)
        try {
            const data = await register({username,email,password})
            if (!data?.user) {
                return false
            }

            setUser(data.user)
            setProfile(null)
            return true
        } catch (error) {
            console.error("Register failed:", error)
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async()=>{
        setLoading(true)
        try {
            await logout()
            setUser(null)
            setProfile(null)
        } catch (error) {
            console.error("Logout failed:", error)
        } finally {
            setLoading(false)
        }       
    }

    return {
        user,
        profile,
        setProfile,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
    }
}
