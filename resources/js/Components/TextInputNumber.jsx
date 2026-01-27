import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TextInputNumber = forwardRef(
  ({ className = "", isFocused = false, min = 0, ...props }, ref) => {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
      if (isFocused) {
        localRef.current?.focus();
      }
    }, [isFocused]);

    const handleInput = (e) => {
      let value = e.target.value;

      // Solo números (permitir vacío temporalmente)
      value = value.replace(/[^0-9]/g, "");

      // Evitar negativos
      if (value && parseInt(value, 10) < min) {
        value = String(min);
      }

      e.target.value = value;
      props.onChange && props.onChange(e);
    };

    return (
      <input
        {...props}
        type="number"
        min={min}
        onInput={handleInput}
        className={
          "w-full rounded-2xl border-gray-100 bg-gray-100 px-5 py-4 font-bold text-sm shadow-inner transition-all duration-300 outline-none hover:bg-white hover:border-gray-200 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary " +
          className
        }
        ref={localRef}
      />
    );
  }
);

export default TextInputNumber;
