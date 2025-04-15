import "@/styles/globals.css"; // Tus estilos globales
import { ThemeProvider } from "@mui/system";
import { useRouter } from "next/router";
import personalizedTheme from "@/utils/theme"; // Tema personalizado

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // (Opcional) Función de logout global, por si luego pones un botón de "Cerrar sesión"
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <>
    <ThemeProvider theme={personalizedTheme}>
      {/* Aquí podrías poner un Header o Footer global si quieres */}
      <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
