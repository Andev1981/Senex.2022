export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <label {...props} className={`enterprise-label ml-1 ` + className}>
            {value ? value : children}
        </label>
    );
}
