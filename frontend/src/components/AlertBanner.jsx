import React from "react";

export default function AlertBanner({ type = "info", title, message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {title && <strong>{title}</strong>}{title ? " " : ""}
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={onClose}
      />
    </div>
  );
}
