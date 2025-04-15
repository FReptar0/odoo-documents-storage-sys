import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import personalizedTheme from "@/utils/theme";


function MyApp({ Component, pageProps }) {

  return (
    <>
      <Head>
        <link rel="icon" href="/logos/logo.png" />
        <link
          href="/logos/logo.png"
          rel="shortcut icon"
          type="image/x-icon"
        />
        <title>Demo</title>
      </Head>

      <ThemeProvider theme={personalizedTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
