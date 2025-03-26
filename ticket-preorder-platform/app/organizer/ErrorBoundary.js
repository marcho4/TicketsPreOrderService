import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex justify-center items-center h-full bg-white rounded-lg">
                    <p className="text-xl text-my_black text-center font-semibold">
                        Ошибка при загрузке: {this.state.error.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;