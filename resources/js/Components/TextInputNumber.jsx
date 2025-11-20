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
          "w-full rounded-md border-[0.5px] border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-200 " +
          className
        }
        ref={localRef}
      />
    );
  }
);

export default TextInputNumber;
