import React from 'react';
import FormInput from './FormInput';
import FormTextArea from './FormTextArea';

const LocationFields = ({ location, onChange }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <FormInput
                label="Country"
                name="location.country"
                value={location.country}
                onChange={onChange}
                required
                placeholder="e.g. India"
            />
            <FormInput
                label="State"
                name="location.state"
                value={location.state}
                onChange={onChange}
                required
                placeholder="e.g. Maharashtra"
            />
            <FormInput
                label="District"
                name="location.district"
                value={location.district}
                onChange={onChange}
                required
                placeholder="e.g. Thane"
            />
            <FormInput
                label="Locality"
                name="location.locality"
                value={location.locality}
                onChange={onChange}
                required
                placeholder="e.g. Hiranandani Estate"
            />
            <FormInput
                label="Pincode"
                name="location.pincode"
                value={location.pincode}
                onChange={onChange}
                required
                placeholder="e.g. 400607"
            />
            <FormTextArea
                label="Address"
                name="location.address"
                value={location.address}
                onChange={onChange}
                required
                placeholder="Enter complete address"
            />
        </div>
    );
};

export default LocationFields;
