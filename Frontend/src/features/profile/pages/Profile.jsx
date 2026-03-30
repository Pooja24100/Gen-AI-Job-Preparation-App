import React, { useEffect, useState } from "react";
import { createProfile, getProfile, updateProfile } from "../services/profile.api";
import { useAuth } from "../../auth/hooks/useAuth";
import "../../interview/style/home.scss";
import "../style/profile.scss";

const Profile = () => {
    const { profile, setProfile, user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        avatar: "",
        bio: "",
    });
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await getProfile();
                const nextProfile = response?.data || null;

                setHasExistingProfile(Boolean(nextProfile?.name || nextProfile?.avatar || nextProfile?.bio));
                setProfile(nextProfile);
            } catch (error) {
                console.error("Failed to load profile:", error);
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        setFormData({
            name: profile?.name || user?.fullName || user?.username || "",
            email: profile?.email || user?.email || "",
            avatar: profile?.avatar || "",
            bio: profile?.bio || "",
        });
    }, [profile, user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            const response = hasExistingProfile
                ? await updateProfile(formData)
                : await createProfile(formData);

            setProfile(response?.data || null);
            setHasExistingProfile(true);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="workspace-page">
            <section className="profile-page">
                <div className="profile-page__hero">
                    <div className="profile-avatar">
                        {formData.avatar ? <img src={formData.avatar} alt={formData.name || "Profile"} /> : <span>{(formData.name || "U").charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                        <p className="section-eyebrow">Profile settings</p>
                        <h1>Keep your personal details polished</h1>
                        <p>Use the new profile APIs to store a visible name, avatar, and short summary for the workspace.</p>
                    </div>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                    <label className="field-card">
                        <span className="field-card__label">Name</span>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
                    </label>

                    <label className="field-card">
                        <span className="field-card__label">Email</span>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
                    </label>

                    <label className="field-card">
                        <span className="field-card__label">Avatar URL</span>
                        <input type="url" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://example.com/avatar.jpg" />
                    </label>

                    <label className="field-card field-card--wide">
                        <span className="field-card__label">Bio</span>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={6} placeholder="Add a short professional summary." />
                    </label>

                    <div className="form-footer">
                        <p>{hasExistingProfile ? "Updating the existing profile record." : "Creating the first profile record for this user."}</p>
                        <button type="submit" className="primary-link primary-link--button">
                            {saving ? "Saving..." : hasExistingProfile ? "Update Profile" : "Create Profile"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default Profile;
