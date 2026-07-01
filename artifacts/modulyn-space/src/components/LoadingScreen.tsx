// import React from "react";
// import { motion } from "framer-motion";

// export default function LoadingScreen() {
//   return (
//     <motion.div
//       initial={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.8, ease: "easeInOut" }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
//       data-testid="loading-screen"
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//       >
//         <h1 className="font-serif text-3xl md:text-5xl tracking-widest text-foreground">
//           MODULYN SPACE
//         </h1>
//       </motion.div>
//     </motion.div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";
import logo from "@assets/Modulyn_Space_logo_tran.png"; // Adjust the path if needed
export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      data-testid="loading-screen"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <img
          src={logo}
          alt="Modulyn Space Logo"
          className="w-48 md:w-72 h-auto mb-4"
        />
        {/* Brand Name */}
        <h1 className="font-serif text-3xl md:text-5xl tracking-widest text-foreground text-center">
          MODULYN SPACE
        </h1>
      </motion.div>
    </motion.div>
  );
}
