'use client'

import React from 'react';
import {
    Input,
    Label,
    TextField,
} from "react-aria-components";
import TypeAheadInput from '@/components/TypeAheadInput';
import { GET_AFFILIATIONS } from '@/lib/graphql/queries/affiliations';

const TypeAheadTest = () => {
    return (
        <>
            <TypeAheadInput
                label="Institutions"
                graphqlQuery={GET_AFFILIATIONS}
                helpText="Search by research org, field station/lab, template description, etc"
            />
            <div>

                <TextField>
                    <Label>Test field</Label>
                    <Input placeholder="testing" />
                </TextField>

                <TextField>
                    <Label>Another field</Label>
                    <Input placeholder="Another field" />
                </TextField>
            </div>
        </>
    )
};

export default TypeAheadTest;