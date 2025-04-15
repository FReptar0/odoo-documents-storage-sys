import "@/styles/globals.css"; // Tus estilos globales
import { ThemeProvider } from "@mui/system";
import { useRouter } from "next/router";
import personalizedTheme from "@/utils/theme"; // Tema personalizado
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // (Opcional) Función de logout global, por si luego pones un botón de "Cerrar sesión"
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Demo</title>
      </Head>
      <ThemeProvider theme={personalizedTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
