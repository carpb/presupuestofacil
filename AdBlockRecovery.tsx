import Script from "next/script";

/** Google AdSense Privacy & messaging / Ad blocking recovery integration point. */
export default function AdBlockRecovery() {
  const code = process.env.NEXT_PUBLIC_ADBLOCK_RECOVERY_CODE;
  if (!code) return null;

  return <Script id="adblock-recovery" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: code }} />;
}
