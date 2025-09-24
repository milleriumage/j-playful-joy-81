import { ProtectedAccessOptimized } from './ProtectedAccessOptimized';

export function ProtectedAccess({ children }: { children: React.ReactNode }) {
  return <ProtectedAccessOptimized>{children}</ProtectedAccessOptimized>;
}