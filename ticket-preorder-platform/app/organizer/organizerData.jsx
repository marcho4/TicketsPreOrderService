import { Button } from "../../components/ui/button";
import { Suspense, useState } from "react";
import { useAuth } from "../../providers/authProvider";
import { createResource } from "../../lib/createResource";
import ErrorBoundary from "./dataBoundary";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const fetchOrganizerData = async (id) => {
    const response = await fetch(`http://localhost:8004/get_account_info/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        console.log("Failed to fetch organizer data");
    }

    const body = await response.json();

    return {
        email: body.email,
        tin: body.tin,
        phone_number: body.phone_number,
        organization: body.organization_name,
    };
};

let organizerResource;

export default function DataSection() {
    const { user } = useAuth();
    console.log(user);
    if (!organizerResource) {
        organizerResource = createResource(() => fetchOrganizerData(user));
    }

    return (
        <ErrorBoundary>
            <Suspense fallback={<Loading />}>
                <DataDisplay resource={organizerResource} id={user}/>
            </Suspense>
        </ErrorBoundary>
    );
}

function DataDisplay({ resource }) {
    const data = resource.read();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState(null);

    const handleDialogOpen = () => {
        setFormData({
            email: data.email  || "",
            organization: data.organization  || "",
            tin: data.tin  || "",
            phone_number: data.phone_number  || ""
        });
        setIsOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:8004/update_account_info/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            setIsOpen(false);
            window.location.reload();
        }
    };

    return (
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4">
            <h1 className="text-3xl font-semibold text-gray-900 leading-tight text-left mb-8">
                My account
            </h1>
            <div className="min-w-full text-xl">
                <strong>Email:</strong> {data.email}
            </div>
            <div className="min-w-full text-xl">
                <strong>Organization:</strong> {data.organization}
            </div>
            <div className="min-w-full text-xl">
                <strong>TIN:</strong> {data.tin}
            </div>
            <div className="min-w-full text-xl">
                <strong>Phone number:</strong> {data.phone_number}
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <button 
                        onClick={handleDialogOpen}
                        className="bg-accent w-1/2 px-4 py-2 mt-4 rounded-lg text-white hover:bg-accent/90"
                    >
                        Change information
                    </button>
                </DialogTrigger>
                {formData && (
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Account Information</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Organization</label>
                                <Input
                                    value={formData.organization}
                                    onChange={(e) => setFormData(prev => ({...prev, organization: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">TIN</label>
                                <Input
                                    value={formData.tin}
                                    onChange={(e) => setFormData(prev => ({...prev, tin: e.target.value}))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData(prev => ({...prev, phone_number: e.target.value}))}
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-accent text-white rounded-lg px-4 py-2 hover:bg-accent/90"
                            >
                                Save Changes
                            </button>
                        </form>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}

function Loading() {
    return (
        <div className="flex flex-col min-w-full bg-silver rounded-lg p-4 animate-pulse ">
            <h1 className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </h1>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
            <div className="text-3xl bg-dark-grey animate-pulse w-1/2 font-semibold px-8 py-4 mb-8 rounded-2xl">
            </div>
        </div>
    );
}