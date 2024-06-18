import App from '@/App.tsx';
import React from 'react';
import { Toaster } from '@/components/ui/toaster.tsx';

export default function Root() {
  return (
    <>
      <App />
      <Toaster />
    </>
  );
}
