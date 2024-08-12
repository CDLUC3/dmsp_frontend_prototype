'use client'

import React, { useEffect, useState } from 'react';
import {
    Input,
    Label,
    TextField,
} from "react-aria-components";
import TypeAheadWithOther from '@/components/TypeAheadWithOther';
import { GET_AFFILIATIONS } from '@/lib/graphql/queries/affiliations';

const TypeAheadOther = () => {
    const [otherField, setOtherField] = useState(false);

    useEffect(() => {
    }, [otherField])
    return (
        <>
            <TypeAheadWithOther
                label="Institutions"
                graphqlQuery={GET_AFFILIATIONS}
                helpText="Search by research org, field station/lab, template description, etc"
                setOtherField={setOtherField}
            />
            <div>

                {otherField && (
                    <TextField>
                        <Label>Other field</Label>
                        <Input placeholder="Enter institution name" />
                    </TextField>
                )}
            </div>
        </>
    )
};

export default TypeAheadOther;