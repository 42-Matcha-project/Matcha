import React from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  description?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  description,
  children,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="block text-lg font-medium text-gray-900"
      >
        {label}
      </label>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      <div className="mt-1">{children}</div>
    </div>
  );
};

export default FormField;
