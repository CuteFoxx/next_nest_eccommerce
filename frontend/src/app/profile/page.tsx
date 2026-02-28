"use client";
import { useAuth } from "@/context/auth.context";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>
        Welcome, {user?.username} ({user?.email})!
      </h2>
      <p>This is your profile page.</p>
    </div>
  );
};

export default Profile;
