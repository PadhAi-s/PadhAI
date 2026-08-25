import { useTranslation } from "react-i18next";
import { ComingSoon } from "../../components/ComingSoon";

export function StudentLogin() {
  const { t } = useTranslation();
  return (
    <ComingSoon
      title={t("student.loginTitle")}
      subtitle={t("student.loginSubtitle")}
      phaseNote="Phase 2 — Authentication"
    />
  );
}
