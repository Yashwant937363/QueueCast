export interface GuestUser {
  guestId: string;
  username: string;
  picture: string;
}

const GUEST_USER_KEY = "queuecast_guest_user";

export function getOrInitGuestUser(): GuestUser {
  try {
    const stored = localStorage.getItem(GUEST_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.guestId && parsed.username) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error reading guest user from localStorage:", error);
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const username = `Guest #${randomNum}`;
  const picture = `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`;

  const newGuest: GuestUser = {
    guestId,
    username,
    picture,
  };

  try {
    localStorage.setItem(GUEST_USER_KEY, JSON.stringify(newGuest));
  } catch (error) {
    console.error("Error saving guest user to localStorage:", error);
  }

  return newGuest;
}

export function updateGuestUsername(newUsername: string): GuestUser {
  const currentGuest = getOrInitGuestUser();
  const updatedGuest: GuestUser = {
    ...currentGuest,
    username: newUsername.trim() || currentGuest.username,
  };

  try {
    localStorage.setItem(GUEST_USER_KEY, JSON.stringify(updatedGuest));
  } catch (error) {
    console.error("Error updating guest username in localStorage:", error);
  }

  return updatedGuest;
}

export function getStoredGuestId(): string | null {
  try {
    const stored = localStorage.getItem(GUEST_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.guestId) {
        return parsed.guestId;
      }
    }
  } catch (error) {
    console.error("Error reading guest ID from localStorage:", error);
  }
  return null;
}

export function clearGuestUser(): void {
  try {
    localStorage.removeItem(GUEST_USER_KEY);
  } catch (error) {
    console.error("Error clearing guest user from localStorage:", error);
  }
}
