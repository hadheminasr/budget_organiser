import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-pink-950 via-fuchsia-950 to-rose-950 flex items-center justify-center relative overflow-hidden'>
			
			<motion.div
				className="absolute w-72 h-72 rounded-full bg-fuchsia-500/25 blur-2xl"
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
			/>
		</div>
	);
};

export default LoadingSpinner;
