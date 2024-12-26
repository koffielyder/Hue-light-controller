import { fasdt } from "@awesome.me/kit-aea0077342/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Button = ({ children, loading = false, onClick = (e) => { }, icon = null }) => {
    return (
        <button onClick={onClick} disabled={loading} type="button" className="text-xs overflow-hidden text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center">
            {(loading || icon) && (<div className="icon px-2 h-6 flex-grow flex bg-blue-200 items-center border-r">
                {loading && <FontAwesomeIcon className="animate-spin" icon={fasdt.faSpinnerThird} />}
                {!loading && icon && <FontAwesomeIcon icon={icon} />}
            </div>)}
            {loading && (
                <span className="py-1 px-2"> Loading...</span>)}
            {!loading && (<span className="py-1 px-2">
                {children}
            </span>)}
        </button>
    );
};

export default Button;




