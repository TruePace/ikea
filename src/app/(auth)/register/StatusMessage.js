const StatusMessage = ({ status }) => {
    if (!status) return null;

    const messageClass = status === 'success' 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : 'bg-red-100 border-red-400 text-red-700';

    return (
        <div className={`border px-4 py-3 rounded relative ${messageClass}`} role="alert">
            <strong className="font-bold">
                {status === 'success' ? 'Success! ' : 'Error! '}
            </strong>
            <span className="block sm:inline">
                {status === 'success' 
                    ? 'Registration successful. Redirecting to homepage...' 
                    : 'Registration failed. Please try again.'}
            </span>
        </div>
    );
};

export default StatusMessage;