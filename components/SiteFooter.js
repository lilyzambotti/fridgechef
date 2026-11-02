import { APP_NAME, FOUNDER_NAME } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p><strong>{APP_NAME}</strong>, created by <strong>{FOUNDER_NAME}</strong></p>
        <p>&copy; {new Date().getFullYear()} {FOUNDER_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
