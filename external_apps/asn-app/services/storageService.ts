import { Activity, Assessment, UserProfile } from '../types';

const SKP_KEY = 'asn_jatim_activities';
const ASSESSMENT_KEY = 'asn_jatim_assessments';
const PROFILE_KEY = 'asn_jatim_profile';

// --- SKP Functions ---
export const getActivities = (): Activity[] => {
  try {
    const data = localStorage.getItem(SKP_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load activities", error);
    return [];
  }
};

export const saveActivities = (activities: Activity[]) => {
  try {
    // "Stabilizer" Logic: Always sort by date (Ascending) before saving
    const sorted = [...activities].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    localStorage.setItem(SKP_KEY, JSON.stringify(sorted));
    return sorted;
  } catch (error) {
    console.error("Failed to save activities", error);
    return activities;
  }
};

// --- Assessment Functions ---
export const getAssessments = (): Assessment[] => {
  try {
    const data = localStorage.getItem(ASSESSMENT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load assessments", error);
    return [];
  }
};

export const saveAssessments = (assessments: Assessment[]) => {
  try {
    // Sort by timestamp (Oldest to Newest) like SKP
    const sorted = [...assessments].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(sorted));
    return sorted;
  } catch (error) {
    console.error("Failed to save assessments", error);
    return assessments;
  }
};

// --- User Profile Functions ---
export const getUserProfile = (): UserProfile => {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : { nama: '', jabatan: '', unitKerja: '' };
  } catch (error) {
    return { nama: '', jabatan: '', unitKerja: '' };
  }
};

export const saveUserProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile", error);
  }
};