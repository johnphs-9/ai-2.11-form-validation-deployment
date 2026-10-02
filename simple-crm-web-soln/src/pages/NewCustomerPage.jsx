import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import * as yup from "yup";
import { CustomerContext } from "../contexts/CustomerContext";

const customerSchema = yup.object().shape({
  firstName: yup.string().required("First name is required."),
  lastName: yup.string().required("Last name is required."),
  email: yup
    .string()
    .required("Email is required.")
    .email("Please enter a valid email address."),
});

const ALL_TAGS = ["VIP", "Lead", "Referral"];

function NewCustomerPage() {
  const { addCustomer, submitting } = useContext(CustomerContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active",
    tags: [],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTagToggle = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    try {
      await customerSchema.validateAt(name, { ...form, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await customerSchema.validate(form, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((validationError) => {
        fieldErrors[validationError.path] = validationError.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const newCustomer = await addCustomer({
      ...form,
      company: "",
      notes: "",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    navigate(`/app/customers/${newCustomer.id}`);
  };

  return (
    <div>
      <Link to="/app/customers" className="back-link">
        ← Back to Customers
      </Link>
      <h1>Add New Customer</h1>

      <form onSubmit={handleSubmit} className="add-customer-form">
        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            placeholder="e.g. Sarah"
            value={form.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            // required
          />
        </div>
        {errors.firstName && <p className="field-error">{errors.firstName}</p>}
        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            placeholder="e.g. Chen"
            value={form.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            // required
          />
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. sarah.chen@email.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            // required
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            placeholder="e.g. +65 9123 4567"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label>Tags</label>
          <div className="tag-options">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`tag-toggle${form.tags.includes(tag) ? " tag-toggle-active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}

export default NewCustomerPage;
