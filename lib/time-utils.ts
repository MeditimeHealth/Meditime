// Utility functions for Bangladesh time (BDT) formatting

// Helper function to parse time string (handles "10:00 AM", "10:00", "10:00:00" formats)
const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  // Remove AM/PM and trim
  const cleanTime = timeStr.trim().toUpperCase();
  const isPM = cleanTime.includes('PM');
  const isAM = cleanTime.includes('AM');
  
  // Extract hours and minutes
  const timeMatch = cleanTime.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  
  // Convert to 24-hour format
  if (isPM && hours !== 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
};

export const formatBDTTime = (date: Date | string): string => {
  // If it's already a time string (like "10:00 AM"), format it directly
  if (typeof date === 'string' && /^\d{1,2}:\d{2}(\s*(AM|PM))?$/i.test(date.trim())) {
    try {
      const { hours, minutes } = parseTimeString(date);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      let displayHours = hours % 12;
      displayHours = displayHours ? displayHours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${displayHours}:${minutesStr} ${ampm}`;
    } catch {
      // If parsing fails, fall through to Date parsing
    }
  }
  
  // Try to parse as Date
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    // If date is invalid, try to parse as date + time string
    if (typeof date === 'string' && date.includes('T')) {
      const [datePart, timePart] = date.split('T');
      if (timePart) {
        try {
          const { hours, minutes } = parseTimeString(timePart);
          const ampm = hours >= 12 ? 'PM' : 'AM';
          let displayHours = hours % 12;
          displayHours = displayHours ? displayHours : 12;
          const minutesStr = minutes < 10 ? '0' + minutes : minutes;
          return `${displayHours}:${minutesStr} ${ampm}`;
        } catch {
          return 'Invalid time';
        }
      }
    }
    return 'Invalid time';
  }
  
  // Convert to Bangladesh time (UTC+6)
  const bdtDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  
  let hours = bdtDate.getHours();
  const minutes = bdtDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
};

export const formatBDTDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const bdtDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  
  return bdtDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dhaka'
  });
};

export const formatBDTDateTime = (date: Date | string): string => {
  return `${formatBDTDate(date)} at ${formatBDTTime(date)}`;
};

export const getBDTNow = (): Date => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
};

export const getTimeUntil = (targetDate: Date | string): { days: number; hours: number; minutes: number; seconds: number; total: number } => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  
  // Convert both to BDT
  const targetBDT = new Date(target.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  const nowBDT = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  
  const diff = targetBDT.getTime() - nowBDT.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, total: diff };
};

