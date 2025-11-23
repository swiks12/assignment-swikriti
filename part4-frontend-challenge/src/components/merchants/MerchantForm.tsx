import { useState } from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { createMerchant } from "../../services/merchantService";
import toast from "react-hot-toast";
import "./MerchantForm.css";

interface MerchantFormProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  onMerchantCreated?: () => void;
}

const MerchantForm = ({
  isModalOpen,
  setIsModalOpen,
  onMerchantCreated,
}: MerchantFormProps) => {
  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    email: "",
    phone: "",
    // Business Information
    businessName: "",
    category: "",
    pan: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    category: "",
    pan: "",
  });

  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing (only if form was submitted)
    if (touched) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (validateForm()) {
      try {
        setIsSubmitting(true);

        // Make API call to create merchant
        const response = await createMerchant({
          ...formData,
          status: "active",
        });

        console.log("Merchant created successfully:", response);

        // Show success message
        toast.success(response.message || "Merchant created successfully!");

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          businessName: "",
          category: "",
          pan: "",
        });
        setErrors({
          name: "",
          email: "",
          phone: "",
          businessName: "",
          category: "",
          pan: "",
        });
        setTouched(false);

        // Close modal
        setIsModalOpen(false);

        // Call callback to reload the table
        if (onMerchantCreated) {
          onMerchantCreated();
        }
      } catch (error: any) {
        console.error("Failed to create merchant:", error);

        // Show specific error message from backend
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("rchanFailed to create merchant. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form and errors when closing
    setFormData({
      name: "",
      email: "",
      phone: "",
      businessName: "",
      category: "",
      pan: "",
    });
    setErrors({
      name: "",
      email: "",
      phone: "",
      businessName: "",
      category: "",
      pan: "",
    });
    setTouched(false);
  };
  return (
    <div>
      {/* Add Merchant Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Merchant</h2>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="merchant-form">
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
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="merchant@example.com"
                    error={errors.email}
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="98XXXXXXXX"
                    error={errors.phone}
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
                  />
                  <Input
                    label="Category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Retail, Food & Beverage"
                    error={errors.category}
                  />
                  <Input
                    label="PAN"
                    name="pan"
                    type="text"
                    value={formData.pan}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    error={errors.pan}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="cancel-btn"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Merchant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantForm;
