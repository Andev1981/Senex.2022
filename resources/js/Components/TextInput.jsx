import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef(function TextInput(
  { type = "text", className = "", isFocused = false, ...props },
  ref
) {
  const localRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={
        "w-full rounded-2xl border-gray-100 bg-gray-100 px-5 py-4 font-bold text-sm shadow-inner transition-all duration-300 outline-none hover:bg-white hover:border-gray-200 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary " +
        className
      }
      ref={localRef}
    />
  );
});
