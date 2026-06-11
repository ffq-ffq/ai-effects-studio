import { AuthForm } from "@/components/user/auth-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function LoginPage() {
  return (
    <RouteShell
      title="登录"
      description="继续管理你的 AI 素材、项目和额度。"
    >
      <AuthForm mode="login" />
    </RouteShell>
  );
}
