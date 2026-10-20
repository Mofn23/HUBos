'use client';

import React from 'react';
import { ProfileHistoryTab } from '../ProfileHistoryTab';

export const AppleProfileTabView: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <ProfileHistoryTab />
    </div>
  );
};
