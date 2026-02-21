import { motion } from "framer-motion";

const FloatingShape = ({ color = "bg-rose-200/40", size = "w-64 h-64", top = "10%", left = "10%", delay = 0 }) => {
	return (
		<motion.div
			className={`absolute ${color} ${size} rounded-full blur-3xl`}
			style={{ top, left }}
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{
				opacity: 1,
				scale: 1,
				y: [0, -18, 0],
				x: [0, 14, 0],
			}}
			transition={{
				duration: 7,
				repeat: Infinity,
				ease: "easeInOut",
				delay,
			}}
		/>
	);
};

export default FloatingShape;
