import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { getMerchantById, updateMerchant } from "../services/merchantService";
import toast from "react-hot-toast";
import "./UpdateMerchant.css";

export const UpdateMerchant = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    category: "",
    pan: "",
    status: "active" as "active" | "inactive",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    category: "",
    pan: "",
    status: "active" as "active" | "inactive",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    category: "",
    pan: "",
  });

  // Fetch merchant data on mount
  useEffect(() => {
    const fetchMerchant = async () => {
      if (!id) {
        toast.error("Invalid merchant ID");
        navigate("/merchants");
        return;
      }

      try {
        setIsLoading(true);
        const merchant = await getMerchantById(id);

        const merchantData = {
          name: merchant.name,
          email: merchant.email,
          phone: merchant.phone,
          businessName: merchant.businessName,
          category: merchant.category,
          pan: merchant.pan,
          status: (merchant.status || "active") as "active" | "inactive",
        };

        setFormData(merchantData);
        setOriginalData(merchantData);
      } catch (error: any) {
        console.error("Error fetching merchant:", error);
        toast.error("Failed to load merchant details");
        navigate("/merchants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchant();
  }, [id, navigate]);

  // Check if form has changes
  useEffect(() => {
    const hasChanged = Object.keys(formData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        originalData[key as keyof typeof originalData]
    );
    setHasChanges(hasChanged);
  }, [formData, originalData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors] !== undefined) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      businessName: "",
      category: "",
      pan: "",
    };

    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Please enter name";
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Please enter email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter phone number";
      isValid = false;
    } else if (formData.phone.replace(/\D/g, "").length > 10) {
      newErrors.phone = "Phone number cannot exceed 10 digits";
      isValid = false;
    }

    // Validate business name
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Please enter business name";
      isValid = false;
    }

    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = "Please enter category";
      isValid = false;
    }

    // Validate PAN
    if (!formData.pan.trim()) {
      newErrors.pan = "Please enter PAN";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setIsEditing(false);
    setErrors({
      name: "",
      email: "",
      phone: "",
      businessName: "",
      category: "",
      pan: "",
    });
  };

  const handleUpdateClick = () => {
    if (validateForm()) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      await updateMerchant(id, formData);

      toast.success("Merchant updated successfully!");

      // Navigate back to merchants page
      navigate("/merchants");
    } catch (error: any) {
      console.error("Failed to update merchant:", error);

      // Handle specific validation errors from backend
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        // Check for specific unique constraint violations
        if (
          errorMessage.toLowerCase().includes("email") &&
          (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("unique"))
        ) {
          toast.error("This email is already registered with another merchant");
        } else if (
          errorMessage.toLowerCase().includes("phone") &&
          (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("unique"))
        ) {
          toast.error(
            "This phone number is already registered with another merchant"
          );
        } else if (
          errorMessage.toLowerCase().includes("pan") &&
          (errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("duplicate") ||
            errorMessage.toLowerCase().includes("unique"))
        ) {
          toast.error("This PAN is already registered with another merchant");
        } else {
          // Display the backend message as is
          toast.error(errorMessage);
        }
      } else if (error.response?.status === 500) {
        toast.error("Server error occurred. Please try again later.");
      } else if (error.response?.status === 400) {
        toast.error("Invalid data provided. Please check your inputs.");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update merchant. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };
  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
  };

  if (isLoading) {
    return (
      <main className="update-merchant-page">
        <div className="update-merchant-loading">
          <div className="loading-spinner"></div>
          <p>Loading merchant details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="update-merchant-page">
      <div className="update-merchant-header">
        <div>
          <h1>📝 Update Merchant</h1>
          <p className="subtitle">View and update merchant information</p>
        </div>
      </div>

      <div className="update-merchant-container">
        <form className="update-merchant-form">
          {/* Personal Details Section */}
          <div className="form-section">
            <h3 className="form-section-title">Personal Details</h3>
            <div className="form-grid">
              <Input
                label="Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                error={errors.name}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="merchant@example.com"
                error={errors.email}
                disabled={!isEditing}
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+977 98XXXXXXXX"
                error={errors.phone}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Business Information Section */}
          <div className="form-section">
            <h3 className="form-section-title">
              Business Information & Registration
            </h3>
            <div className="form-grid">
              <Input
                label="Business Name"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter business name"
                error={errors.businessName}
                disabled={!isEditing}
              />
              <Input
                label="Category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Retail, Food & Beverage"
                error={errors.category}
                disabled={!isEditing}
              />
              <Input
                label="PAN"
                name="pan"
                type="text"
                value={formData.pan}
                onChange={handleInputChange}
                placeholder="ABCDE1234F"
                error={errors.pan}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="form-section">
            <h3 className="form-section-title">Status</h3>
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label">Merchant Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <div className="status-display">
                    <span
                      className={`merchant-status-badge merchant-status-${formData.status}`}
                    >
                      {formData.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {!isEditing ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleEditClick}
                className="edit-btn"
              >
                Edit Details
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUpdateClick}
                  className="submit-btn"
                  disabled={!hasChanges}
                >
                  Update Details
                </Button>
              </>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm Update"
        message="Are you sure you want to update this merchant's details?"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
        confirmText="OK"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />
    </main>
  );
};
