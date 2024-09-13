export function formatDate(date) {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInSeconds = Math.floor((now - inputDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Just In';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }

  // For dates older than yesterday, return the formatted date
  return inputDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    formatMatcher: 'best fit'
  }).replace(/(\d+)(?=(st|nd|rd|th))/, (match, day) => {
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 != 10) * day % 10];
    return `${day}${suffix}`;
  });
}