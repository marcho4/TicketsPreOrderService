import React from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";


export const MatchFormDataRow = ({ label, apiName, onChange, required = true, type = "text", formData }) => {
    return (
        <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">{label}</Label>
            <Input
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                onChange={onChange}
                name={apiName}
                type={type}
                required={required}
                value={formData[apiName]}
            />
        </div>
    );
};