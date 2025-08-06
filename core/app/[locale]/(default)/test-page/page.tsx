"use client";
import { useState } from "react";
import { toast } from '@/vibes/soul/primitives/toaster';

export default function TestPage() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("Simulated error for testing the error boundary!");
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', marginTop: 40 }}>
      <h1>Toast Demo</h1>
      <button
        style={{
          border: '2px solid #A7F3D0', // pastel green
          background: '#ECFDF5',
          color: '#065F46',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() =>
          toast.success('Success!', {
            description: 'Everything went smoothly.',
            action: {
              label: 'Undo',
              onClick: () => alert('Undo action clicked!'),
            },
            dismissLabel: 'Close',
          })
        }
      >
        Show Success Toast
      </button>
      <button
        style={{
          border: '2px solid #FECACA', // pastel red
          background: '#FEF2F2',
          color: '#991B1B',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() =>
          toast.error('Error occurred!', {
            description: 'Something went wrong.',
            action: {
              label: 'Retry',
              onClick: () => alert('Retry action clicked!'),
            },
            dismissLabel: 'Dismiss',
          })
        }
      >
        Show Error Toast
      </button>
      <button
        style={{
          border: '2px solid #FDE68A', // pastel yellow
          background: '#FFFBEB',
          color: '#92400E',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() =>
          toast.warning('Warning!', {
            description: 'Be careful with this step.',
            action: {
              label: 'Ignore',
              onClick: () => alert('Ignore action clicked!'),
            },
            dismissLabel: 'Got it',
          })
        }
      >
        Show Warning Toast
      </button>
      <button
        style={{
          border: '2px solid #BAE6FD', // pastel blue
          background: '#F0F9FF',
          color: '#0369A1',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() =>
          toast.info('FYI', {
            description: 'Here is some information.',
            action: {
              label: 'Read more',
              onClick: () => alert('Read more clicked!'),
            },
            dismissLabel: 'Okay',
          })
        }
      >
        Show Info Toast
      </button>
      <button
        style={{
          border: '2px solid #FECACA',
          background: '#FEF2F2',
          color: '#991B1B',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() => setShouldError(true)}
      >
        Simulate Error
      </button>
    </div>
  );
}
