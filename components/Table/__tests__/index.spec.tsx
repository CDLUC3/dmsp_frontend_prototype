import React, { useState } from 'react';

import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

import { DmpTable } from '@/components/Table';


expect.extend(toHaveNoViolations);


describe("DMP Table Component", () => {
  const columns = [
    {id: 'id', name: 'id', isRowHeader: false},
    {id: 'name', name: 'Name Column', isRowHeader: true},
    {id: 'email', name: 'Email Column', isRowHeader: true},
    {id: 'other', name: 'Other Column', isRowHeader: true},
  ];

  const rows = Array.from({ length: 5 }, (_, i) => {
    const count = i + 1;
    return {
      id: count,
      name: `User ${count} Name`,
      email: `User ${count} Email`,
      other: `User ${count} Other Info`,
    }
  });


  // Now the actual tests
  it("should render the component", async () => {
    render(
      <DmpTable
        columns={columns}
        rows={rows}
        label="Test Table"
      />
    );

    // Test that the 3 columns from the test data exist
    expect(screen.getByText('Name Column')).toBeInTheDocument();
    expect(screen.getByText('Email Column')).toBeInTheDocument();
    expect(screen.getByText('Other Column')).toBeInTheDocument();

    // Test that the 5 rows exist
    [1, 2, 3, 4, 5].forEach((i) => {
      expect(screen.getByText(`User ${i} Name`)).toBeInTheDocument();
      expect(screen.getByText(`User ${i} Email`)).toBeInTheDocument();
      expect(screen.getByText(`User ${i} Other Info`)).toBeInTheDocument();
    });
  });

});
