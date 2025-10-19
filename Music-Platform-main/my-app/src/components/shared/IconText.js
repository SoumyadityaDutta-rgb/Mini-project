import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const IconText = ({
    iconName,
    displayText,
    active,
    targetLink,
    onClick
}) => {
    const className = `flex items-center justify-start px-5 py-2 ${
        active 
            ? "text-white font-bold" 
            : "text-gray-400 hover:text-white"
    } transition-colors duration-300 group`;

    const content = (
        <>
            <div className="flex items-center justify-center w-8">
                <Icon 
                    icon={iconName} 
                    className={`text-2xl ${active ? "scale-110" : "group-hover:scale-110"} transition-transform duration-300`} 
                />
            </div>
            <div className="ml-4 font-semibold">{displayText}</div>
        </>
    );

    if (onClick) {
        return (
            <button className={className} onClick={onClick}>
                {content}
            </button>
        );
    }

    if (targetLink) {
        return (
            <Link to={targetLink} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <div className={className}>
            {content}
        </div>
    );
};

export default IconText;