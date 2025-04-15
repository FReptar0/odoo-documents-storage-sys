import "@/styles/globals.css"; // Tus estilos globales
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // (Opcional) Función de logout global, por si luego pones un botón de "Cerrar sesión"
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <>
      {/* Aquí podrías poner un Header o Footer global si quieres */}
      <Component {...pageProps} />
    </>
  );
}
