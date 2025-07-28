export default function GuestLayout({ children }) {
    return (
        <div
            className="relative flex items-center justify-center min-h-screen p-4"
            style={{
                backgroundImage:
                    'url("https://wallpapers.com/images/featured/fondos-de-mineria-fhudc9kf01icybea.jpg")',
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className="relative z-10 w-full max-w-md p-8 space-y-8 shadow-2xl bg-white/95 backdrop-blur-md rounded-xl">
                {children}
            </div>
        </div>
    );
}
