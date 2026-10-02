import { useState } from "react";
import * as yup from "yup";
import { API_BASE } from "../App";
import styles from "./AddInteractionForm.module.css";

const interactionSchema = yup.object().shape({
  type: yup.string().required("Interaction type is required"),
  notes: yup
    .string()
    .required("Notes are required.")
    .min(10, "Notes must be at least 10 characters."),
  date: yup
    .date()
    .typeError("Date is required.")
    .required("Date is required.")
    .max(new Date(), "Date cannot be in the future."),
});

const EMPTY_FORM = {
  type: "call",
  notes: "",
  date: new Date().toISOString().split("T")[0],
};

function AddInteractionForm({ customerId, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  console.log("form errors:", errors);
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    try {
      await interactionSchema.validateAt(name, { ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await interactionSchema.validate(formData, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((validationError) => {
        // notes: "notes are required"
        // date: "Date is required."
        fieldErrors[validationError.path] = validationError.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, customerId }),
      });
      if (!res.ok) throw new Error("Failed to save interaction");
      const savedInteraction = await res.json();
      setFormData(EMPTY_FORM);
      onSuccess(savedInteraction);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.heading}>Log Interaction</h3>

      <div className={styles.field}>
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="call">Phone Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={submitting}
          placeholder="What was discussed?"
        />
        {errors.notes && <p className={styles.fieldError}>{errors.notes}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={submitting}
        />
        {errors.date && <p className={styles.fieldError}>{errors.date}</p>}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submitting}
      >
        {submitting ? "Saving..." : "Log Interaction"}
      </button>
    </form>
  );
}

export default AddInteractionForm;
