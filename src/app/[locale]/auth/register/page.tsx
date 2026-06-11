import { AuthForm } from "@/components/user/auth-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function RegisterPage() {
  return (
    <RouteShell
      title="注册"
      description="创建账号后即可开始上传素材并生成内容。"
    >
      <AuthForm mode="register" />
    </RouteShell>
  );
}
