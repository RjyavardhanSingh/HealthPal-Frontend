/**
 * Format time from 24h to 12h format with AM/PM
 */
export const formatTime = (timeString) => {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

/**
 * Format date to display day and month
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};