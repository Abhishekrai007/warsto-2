// // import { useEffect } from "react";

// import { loadUser } from "@/auth/authSlice";
// import api from "../utils/api";
// // import "../styles/globals.css";
// import { useEffect } from "react";
// import { store } from "@/auth/store";

// function MyApp({ Component, pageProps }) {
//   useEffect(() => {
//     const initializeAuth = async () => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//         try {
//           await store.dispatch(loadUser()).unwrap();
//         } catch (error) {
//           console.error("Error loading user:", error);
//           localStorage.removeItem("token");
//         }
//       }
//     };

//     initializeAuth();
//   }, []);

//   return (
//     <Provider store={store}>
//       <Component {...pageProps} />
//     </Provider>
//   );
// }

// export default MyApp;
