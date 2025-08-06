import { Spinner } from '@/vibes/soul/primitives/spinner';

export default function SoulSpinner() {
  return (
    <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size="lg" />
    </div>
  );
}