export default function Switch({ className = "", label = "", ...props }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                {...props}
                id="switch-2"
                type="checkbox"
                className="sr-only peer"
            />

            <div
                className={
                    "peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:ring-primary" +
                    className
                }
            ></div>
        </label>
    );
}
