"use client";
import { useState } from "react";
import { supabase } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [role, setRole] = useState<string>("student");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const router = useRouter();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Sign up the user
    if (!validateForm()) return;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }
    let profileImageURL = "";
    // Step 2: Upload profile image if provided
    if (profileImage) {
      const fileExtension = profileImage.name.split(".").pop();
      const { error: storageError } = await supabase.storage
        .from("profile-images")
        .upload(
          `public/${data.user?.id}/${data.user?.id}.${fileExtension}`,
          profileImage
        );

      if (storageError) {
        setMessageType("error");
        setMessage(storageError.message);
        return;
      }

      const { data: publicUrlData } = await supabase.storage
        .from("profile-images")
        .getPublicUrl(
          `public/${data.user?.id}/${data.user?.id}.${fileExtension}`
        );

      profileImageURL = publicUrlData?.publicUrl || "";
    }

    // Step 3: Update user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: data?.user?.id,
      first_name: firstName,
      last_name: lastName,
      role:role,
      profile_image: profileImageURL,
    });

    if (profileError) {
      setMessageType("error");
      setMessage(profileError.message);
      return;
    }

    setMessageType("success");
    setMessage('Registration successful! Check your email to confirm your account.');
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImagePreview(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-40">
      <div className="w-full max-w-md p-8  space-y-8 bg-white rounded shadow-md">
        <h2 className="text-5xl font-opunbold text-center">Register</h2>
        {message && (
          <p
            className={`toast bottom-5 right-5 rounded-md bg-${messageType} animate-bounce`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          {profileImagePreview && (
            <div className="w-full flex justify-center items-center">
              <img
                src={profileImagePreview}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full border boreder-gray-200"
              />
            </div>
          )}
          <div>
            <label className="block mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="select select-bordered w-full"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>
          <button type="submit" className="btn btn-neutral w-full">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
