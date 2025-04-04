import { motion } from "framer-motion"
import healthpalLogo from "../assets/images/logo.jpeg" // Import the logo

const RotatingLogo = () => {
  return (
    <div className="relative w-32 h-32">
      <motion.div
        className="w-full h-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <div className="relative w-full h-full">
          <motion.div
            className="absolute inset-0 rounded-full "
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <img
            src={healthpalLogo || "/Client/src/assets/images/logo1.png"} // Use your imported logo
            alt="HealthPal Logo"
            className="w-full h-full rounded-full"
          />
        </div>
      </motion.div>
      <motion.div
        className="absolute -inset-2 rounded-full border-2 border-teal-500"
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
    </div>
  )
}

export default RotatingLogo

