export function optionalString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function requiredString(formData: FormData, name: string) {
  const value = optionalString(formData, name);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function optionalNumber(formData: FormData, name: string) {
  const value = optionalString(formData, name);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function optionalDate(formData: FormData, name: string) {
  const value = optionalString(formData, name);

  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`);
}
