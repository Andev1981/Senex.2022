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
          "rounded-md border-primary/20 shadow-sm focus:border-primary-light focus:ring-primary-light/20 " +
          className
        }
        ref={localRef}
      />
    );
  }
);

export default TextInputNumber;
