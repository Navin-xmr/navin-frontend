import { describe, it, expect } from "vitest";
import {
  ProtectedRoute,
  RoleGuard,
  SessionTimeoutModal,
  WalletConnectButton,
} from "./index";
import DirectProtectedRoute from "./ProtectedRoute";
import DirectRoleGuard from "./RoleGuard";
import { SessionTimeoutModal as DirectSessionTimeoutModal } from "./SessionTimeoutModal";
import { WalletConnectButton as DirectWalletConnectButton } from "./WalletConnectButton";

describe("components/auth barrel export (#1125)", () => {
  it("re-exports ProtectedRoute, RoleGuard, SessionTimeoutModal, and WalletConnectButton", () => {
    expect(ProtectedRoute).toBe(DirectProtectedRoute);
    expect(RoleGuard).toBe(DirectRoleGuard);
    expect(SessionTimeoutModal).toBe(DirectSessionTimeoutModal);
    expect(WalletConnectButton).toBe(DirectWalletConnectButton);
  });
});
