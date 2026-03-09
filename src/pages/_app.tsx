import type { AppProps } from "next/app";

// Ensure i18n is initialized for the Pages Router as well.
import "../i18n";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
