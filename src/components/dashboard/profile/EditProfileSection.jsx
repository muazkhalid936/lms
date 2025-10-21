"use client";

import CustomInput from "@/components/ui/CustomInput";
import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";

const EditProfileSection = () => {
  const { user, loading: fetchingProfile, updateUser } = useAuthStore();
  const userId = user?._id;
  const isInstructor = user?.userType === "Instructor";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    phoneNumber: "",
    gender: "",
    dob: "",
    bio: "",
    avatar: "",
  });
  const [education, setEducation] = useState([
    { degree: "", university: "", fromDate: "", toDate: "" }
  ]);
  const [experience, setExperience] = useState([
    { company: "", position: "", fromDate: "", toDate: "" }
  ]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      // User will be fetched automatically by the auth store
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        userName: user.userName || "",
        phoneNumber: user.phoneNumber || "",
        gender: user.gender || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "/dashboard/student/profileAvatar.png");

      // Set education and experience for instructors
      if (isInstructor) {
        if (user.education && user.education.length > 0) {
          setEducation(
            user.education.map((edu) => ({
              degree: edu.degree || "",
              university: edu.university || "",
              fromDate: edu.fromDate ? edu.fromDate.split("T")[0] : "",
              toDate: edu.toDate ? edu.toDate.split("T")[0] : "",
            }))
          );
        }

        if (user.experience && user.experience.length > 0) {
          setExperience(
            user.experience.map((exp) => ({
              company: exp.company || "",
              position: exp.position || "",
              fromDate: exp.fromDate ? exp.fromDate.split("T")[0] : "",
              toDate: exp.toDate ? exp.toDate.split("T")[0] : "",
            }))
          );
        }
      }
    }
  }, [user, isInstructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    if (successMessage) {
      setSuccessMessage("");
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);

    if (successMessage) setSuccessMessage("");
    if (generalError) setGeneralError("");
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);

    if (successMessage) setSuccessMessage("");
    if (generalError) setGeneralError("");
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", university: "", fromDate: "", toDate: "" }]);
  };

  const removeEducation = (index) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const addExperience = () => {
    setExperience([...experience, { company: "", position: "", fromDate: "", toDate: "" }]);
  };

  const removeExperience = (index) => {
    if (experience.length > 1) {
      setExperience(experience.filter((_, i) => i !== index));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, avatar: "Please select an image file" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: "Image size must be less than 5MB" });
        return;
      }

      setAvatarFile(file);
      setErrors({ ...errors, avatar: "" });

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          avatar: "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, avatar: "" });
        setAvatarPreview("/dashboard/student/profileAvatar.png");
        setAvatarFile(null);
        setSuccessMessage("Avatar deleted successfully!");
        updateUser({ avatar: "" });
      } else {
        setGeneralError(data.message || "Failed to delete avatar");
      }
    } catch (error) {
      setGeneralError("Failed to delete avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;

    setDeleteLoading(true);
    try {
      const response = await fetch("/api/profile/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetch("/api/auth/logout", {
          method: "POST",
        });

        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        window.location.href = "/auth/signup";
      } else {
        setGeneralError(data.message || "Failed to delete account");
        setShowDeleteModal(false);
      }
    } catch (error) {
      setGeneralError("Failed to delete account");
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // if (!formData.firstName.trim()) {
    //   newErrors.firstName = "First name is required";
    // }

    // if (!formData.lastName.trim()) {
    //   newErrors.lastName = "Last name is required";
    // }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
    }
    if (formData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    // if (!formData.gender) {
    //   newErrors.gender = "Gender is required";
    // }

    // if (!formData.dob) {
    //   newErrors.dob = "Date of birth is required";
    // }

    // if (!formData.bio.trim()) {
    //   newErrors.bio = "Bio is required";
    // } else 
      if (formData.bio.length > 500) {
      newErrors.bio = "Bio cannot exceed 500 characters";
    }

    // Validate education dates for instructors
    if (isInstructor) {
      education.forEach((edu, index) => {
        if (edu.fromDate && edu.toDate) {
          if (new Date(edu.fromDate) > new Date(edu.toDate)) {
            newErrors[`education_${index}`] = "From date must be before To date";
          }
        }
      });

      experience.forEach((exp, index) => {
        if (exp.fromDate && exp.toDate) {
          if (new Date(exp.fromDate) > new Date(exp.toDate)) {
            newErrors[`experience_${index}`] = "From date must be before To date";
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setGeneralError("");

    if (!validateForm()) {
      return;
    }

    if (!userId) {
      setGeneralError("User session not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = formData.avatar;

      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", avatarFile);
        formDataUpload.append("userId", userId);

        const uploadResponse = await fetch("/api/profile/upload-avatar", {
          method: "POST",
          body: formDataUpload,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          avatarUrl = uploadData.avatarUrl;
        } else {
          setGeneralError(uploadData.message || "Failed to upload avatar");
          setLoading(false);
          return;
        }
      }

      const requestBody = {
        userId: userId,
        ...formData,
        avatar: avatarUrl,
      };

      // Add education and experience for instructors
      if (isInstructor) {
        requestBody.education = education;
        requestBody.experience = experience;
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || "Profile updated successfully!");
        setFormData({ ...formData, avatar: avatarUrl });
        setAvatarFile(null);
        
        updateUser(data.user);
        
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (data.field) {
          setErrors({ [data.field]: data.message });
        } else {
          setGeneralError(data.message || "Failed to update profile");
        }
      }
    } catch (error) {
      setGeneralError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[var(--gray-600)]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-[14px]">{successMessage}</p>
        </div>
      )}

      {generalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-[14px]">{generalError}</p>
        </div>
      )}

      <div className="border border-[var(--gray-100)] rounded-[10px] p-6">
        <div className="flex items-start space-x-4 border-b border-[var(--gray-100)] pb-5">
          <img
            src={avatarPreview || "/dashboard/student/profileAvatar.png"}
            alt="Profile Avatar"
            className="w-[94px] h-[94px] rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-[16px] font-medium text-[var(--gray-900)] mb-1">
              Profile Photo
            </h3>
            <p className="text-[14px] text-[var(--gray-600)] mb-3">
              PNG or JPG no bigger than 800px width and height
            </p>
            {errors.avatar && (
              <p className="text-red-500 text-sm mb-2">{errors.avatar}</p>
            )}
            <div className="flex space-x-3">
              <label className="px-4 py-2 cursor-pointer text-[12px] bg-[var(--gray-200-50)] text-gray-700 rounded-[800px] hover:bg-gray-200 transition-colors font-medium">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <button
                onClick={handleDeleteAvatar}
                disabled={loading || !formData.avatar}
                className="px-4 py-2 cursor-pointer text-[12px] bg-[var(--rose-500)] text-white rounded-[800px] hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[20px] font-bold text-[var(--gray-900)] mt-4 mb-2">
            Personal Details
          </h2>
          <p className="text-[var(--gray-600)] text-[14px] mb-6">
            Edit your personal information
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              label="First Name"
              type="text"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              disabled={loading}
            />

            <CustomInput
              label="Last Name"
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              disabled={loading}
            />

            <CustomInput
              label="Username"
              type="text"
              placeholder="Username"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              error={errors.userName}
              disabled={loading}
            />

            <CustomInput
              label="Phone Number"
              type="text"
              placeholder="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              disabled={loading}
            />

            <div>
              <label className="block text-[14px] font-medium text-[var(--gray-900)] mb-2">
                Gender <span className="text-[var(--rose-500)]">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
                className="w-full text-[14px] px-4 py-3 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[var(--gray-900)] mb-2">
                DOB <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="dd/mm/yyyy"
                  className="w-full text-[14px] px-4 py-3 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {errors.dob && (
                <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-[14px] font-medium text-[var(--gray-900)] mb-2">
              Bio <span className="text-[var(--rose-500)]">*</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              className="w-full text-[14px] px-4 py-3 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[var(--gray-600)] text-[12px] mt-1">
              {formData.bio.length}/500 characters
            </p>
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Education Section - Only for Instructors */}
          {isInstructor && (
            <div className="mt-8">
              <h3 className="text-[18px] font-semibold text-[var(--gray-900)] mb-2">
                Education Details
              </h3>
              <p className="text-[var(--gray-600)] text-[14px] mb-4">
                Edit your Educational Information
              </p>

              {education.map((edu, index) => (
                <div key={index} className="mb-6 p-4 border border-[var(--gray-100)] rounded-[6px]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        University
                      </label>
                      <input
                        type="text"
                        placeholder="University"
                        value={edu.university}
                        onChange={(e) => handleEducationChange(index, "university", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        placeholder="From Date"
                        value={edu.fromDate}
                        onChange={(e) => handleEducationChange(index, "fromDate", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        placeholder="To Date"
                        value={edu.toDate}
                        onChange={(e) => handleEducationChange(index, "toDate", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {errors[`education_${index}`] && (
                    <p className="text-red-500 text-sm mt-2">{errors[`education_${index}`]}</p>
                  )}

                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      disabled={loading}
                      className="mt-3 text-[var(--rose-500)] text-[12px] font-medium hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addEducation}
                disabled={loading}
                className="text-[var(--rose-500)] text-[14px] font-medium hover:text-red-600 transition-colors disabled:opacity-50"
              >
                + Add New
              </button>
            </div>
          )}

          {/* Experience Section - Only for Instructors */}
          {isInstructor && (
            <div className="mt-8">
              <h3 className="text-[18px] font-semibold text-[var(--gray-900)] mb-2">
                Experience
              </h3>
              <p className="text-[var(--gray-600)] text-[14px] mb-4">
                Edit your Experience
              </p>

              {experience.map((exp, index) => (
                <div key={index} className="mb-6 p-4 border border-[var(--gray-100)] rounded-[6px]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(index, "position", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        placeholder="From Date"
                        value={exp.fromDate}
                        onChange={(e) => handleExperienceChange(index, "fromDate", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-[var(--gray-600)] mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        placeholder="To Date"
                        value={exp.toDate}
                        onChange={(e) => handleExperienceChange(index, "toDate", e.target.value)}
                        disabled={loading}
                        className="w-full text-[14px] px-3 py-2 bg-white border border-[var(--gray-100)] rounded-[6px] focus:ring-2 focus:ring-[var(--indigo-900)] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {errors[`experience_${index}`] && (
                    <p className="text-red-500 text-sm mt-2">{errors[`experience_${index}`]}</p>
                  )}

                  {experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      disabled={loading}
                      className="mt-3 text-[var(--rose-500)] text-[12px] font-medium hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                disabled={loading}
                className="text-[var(--rose-500)] text-[14px] font-medium hover:text-red-600 transition-colors disabled:opacity-50"
              >
                + Add New
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cursor-pointer mt-8 px-4 py-2 text-[14px] bg-[var(--rose-500)] text-white font-medium rounded-[800px] hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>

      <div className="border border-[var(--gray-100)] p-6 rounded-[10px]">
        <h2 className="text-[18px] font-bold text-gray-900 mb-4">
          Delete Account
        </h2>
        <div className="mb-4">
          <p className="text-[16px] font-medium text-gray-900 mb-2">
            Are you sure you want to delete your account?
          </p>
          <p className="text-[var(--gray-600)] text-[15px]">
            Refers to the action of permanently removing a user's account and
            associated data from a system, service and platform.
          </p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="cursor-pointer px-4 py-2 text-[14px] bg-[var(--rose-500)] text-white font-medium rounded-full hover:bg-red-600 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-[20px] font-bold text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-[15px] text-[var(--gray-600)] mb-6">
              This action cannot be undone. All your data including profile information,
              courses, and progress will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-[14px] bg-[var(--gray-200-50)] text-gray-700 rounded-[800px] hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-[14px] bg-[var(--rose-500)] text-white rounded-[800px] hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileSection;