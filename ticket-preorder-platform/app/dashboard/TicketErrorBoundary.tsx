import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface State {
    hasError: boolean;
    error: Error | null;
}

class TicketErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Ошибка при загрузке карточки билета</CardTitle>
                        <CardDescription>
                            Что-то пошло не так при загрузке билета:{" "}
                            {this.state.error ? this.state.error.message : "Неизвестная ошибка"}
                        </CardDescription>
                    </CardHeader>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default TicketErrorBoundary;