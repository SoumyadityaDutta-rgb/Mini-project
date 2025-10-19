const TextInput = ({
    label,
    placeholder,
    className,
    value,
    setValue,
    labelClassName,
    type = "text"
}) => {
    return (
        <div className="flex flex-col space-y-2 w-full">
            {label && (
                <label className={`font-semibold text-white ${labelClassName}`}>
                    {label}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                className="p-3 border border-gray-700 border-solid rounded placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:border-white"
                value={value || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    if (type === "number") {
                        setValue(val === "" ? "" : Number(val));
                    } else {
                        setValue(val);
                    }
                }}
            />
        </div>
    );
};

export default TextInput;
