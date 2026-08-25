import { useTranslation } from "react-i18next";
import { ComingSoon } from "../../components/ComingSoon";

export function AdminLogin() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t("admin.loginTitle")}
      subtitle={t("admin.loginSubtitle")}
      phaseNote="Phase 2 — Authentication"
    />
  );
}
