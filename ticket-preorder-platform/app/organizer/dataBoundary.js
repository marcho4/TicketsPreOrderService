import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex justify-center items-center h-full bg-white rounded-lg">
                    <p className="text-xl text-my_black text-center font-semibold">
                        Something went wrong during organizer data load: {this.state.error.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;