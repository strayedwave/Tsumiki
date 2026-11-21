import "./FormField.css";
import { createUniqueId } from "solid-js";
import type { JSX } from "@solidjs/web";

export interface FormFieldControlProps {
  id: string;
  "aria-labelledby": string;
  "aria-describedby": string | undefined;
  "aria-invalid": "true" | undefined;
  required: boolean;
}

export type FieldLabelProps =
  | { label: string; field?: undefined }
  | { label?: string; field: FormFieldControlProps };

/** A labelled control. Validation and the field value belong to the caller. */
export default function FormField(props: {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: (control: FormFieldControlProps) => JSX.Element;
}) {
  const fallbackId = createUniqueId();
  const id = () => props.id ?? fallbackId;
  const labelId = () => `${id()}-label`;
  const descriptionId = () => `${id()}-description`;
  const errorId = () => `${id()}-error`;
  return (
    <div class="gui-form-field">
      <label for={id()} id={labelId()}>
        {props.label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      {props.description && <p id={descriptionId()}>{props.description}</p>}
      {props.children({
        get id() {
          return id();
        },
        get "aria-labelledby"() {
          return labelId();
        },
        get "aria-describedby"() {
          return (
            [props.description && descriptionId(), props.error && errorId()]
              .filter(Boolean)
              .join(" ") || undefined
          );
        },
        get "aria-invalid"() {
          return props.error ? "true" : undefined;
        },
        get required() {
          return props.required ?? false;
        },
      })}
      <p id={errorId()} class="gui-form-error" aria-live="polite">
        {props.error}
      </p>
    </div>
  );
}
