import { Link } from "react-router-dom";

const TextWithHover = ({displayText, active, targetLink, onClick}) => {
    if (targetLink) {
        return (
            <Link to={targetLink}>
                <div className="flex items-center justify-start cursor-pointer">
                    <div
                        className={`${
                            active ? "text-white" : "text-gray-400"
                        } font-semibold hover:text-white transition-colors duration-200`}
                    >
                        {displayText}
                    </div>
                </div>
            </Link>
        );
    }
    
    return (
        <div 
            className="flex items-center justify-start cursor-pointer"
            onClick={onClick}
        >
            <div
                className={`${
                    active ? "text-white" : "text-gray-400"
                } font-semibold hover:text-white transition-colors duration-200`}
            >
                {displayText}
            </div>
        </div>
    );
};

export default TextWithHover;