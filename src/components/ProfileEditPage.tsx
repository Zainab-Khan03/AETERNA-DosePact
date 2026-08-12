import React from 'react';
import { UserSettingsPage } from './UserSettingsPage';
import { UserProfile } from '../types';

interface ProfileEditPageProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onOpenDeleteAccount?: () => void;
  onOpenAlarmCustomizer?: () => void;
  onSignOut?: () => void;
}

export const ProfileEditPage: React.FC<ProfileEditPageProps> = (props) => {
  return <UserSettingsPage {...props} />;
};

export { UserSettingsPage };
