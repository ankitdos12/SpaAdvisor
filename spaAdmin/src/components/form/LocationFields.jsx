import React, { useEffect } from 'react';
import FormInput from './FormInput';

const LocationFields = ({ location = {}, onChange }) => {
    useEffect(() => {
        console.log('Location data received:', location);
    }, [location]);

    const defaultLocation = {
        country: location.country || 'India',
        state: location.state || '',
        district: location.district || '',
        locality: location.locality || '',
        pincode: location.pincode || '',
        address: location.address || '',
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                    label="Country"
                    name="location.country"
                    value={defaultLocation.country}
                    onChange={onChange}
                    disabled
                />
                <FormInput
                    label="State"
                    name="location.state"
                    value={defaultLocation.state}
                    onChange={onChange}
                    disabled
                />
                <FormInput
                    label="District"
                    name="location.district"
                    value={defaultLocation.district}
                    onChange={onChange}
                    disabled
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                    label="Locality"
                    name="location.locality"
                    value={defaultLocation.locality}
                    onChange={onChange}
                    required
                />
                <FormInput
                    label="Pincode"
                    name="location.pincode"
                    value={defaultLocation.pincode}
                    onChange={onChange}
                    required
                />
            </div>

            <FormInput
                label="Full Address"
                name="location.address"
                value={defaultLocation.address}
                onChange={onChange}
                required
            />
        </div>
    );
};

export default LocationFields;
