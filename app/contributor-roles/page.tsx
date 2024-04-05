'use client'

import React, { useEffect, useState, useRef } from 'react';
import Page from '@/components/Page';
import TextInput from '@/components/TextInput';


interface RolesInterface {
  id: number,
  label: string;
  url: string;
}

export default function ContributorRoles() {
  const [roles, setRoles] = useState<RolesInterface[]>([
    { "id": 1, "label": "Data Manager", "url": "https://credit.niso.org/contributor-roles/data-curation/" },
    { "id": 2, "label": "Principal Investigator", "url": "https://credit.niso.org/contributor-roles/investigation/" },
    { "id": 3, "label": "Project Administrator", "url": "https://credit.niso.org/contributor-roles/project-administration/" }
  ]);
  const [role, setRole] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedRole, setEditedRole] = useState('');
  const [editedUrl, setEditedUrl] = useState('');

  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  const returnFocusToButton = () => {
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }

  const focusOnInput = () => {
    setOpen(true);
  }

  function handleFilterDrawerOpen() {
    setShowFilterDrawer(true);
    focusOnInput();
    return false;
  }

  function handleFilterDrawerClose() {
    setShowFilterDrawer(false);
    setOpen(false);
    returnFocusToButton();
    return false;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const count = roles.length + 1;
    const newData = { id: count, label: role, url: url };
    setRoles(prev => {
      return [
        ...prev,
        newData
      ]
    })

    setRole('');
    setUrl('');
    setShowFilterDrawer(false)
  }

  function handleEdit(id: number) {
    if (id) {
      setEditingId(id);
      const roleToEdit = roles.find(role => role.id === id);
      if (roleToEdit) {
        setEditedRole(roleToEdit.label);
        setEditedUrl(roleToEdit.url);
      }
    }
  }

  function handleDelete(id: number) {
    setRoles(roles.filter(role => role.id !== id))
  }

  const handleSave = () => {
    const updatedData = roles.map(role => {
      if (role.id === editingId) {
        return {
          ...role,
          id: role.id, label: editedRole, url: editedUrl
        }
      }
      return role
    })
    setRoles(updatedData);
    setEditingId(null)

  }

  useEffect(() => {
    if (open) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [open])
  return (
    <Page title="Contributor roles">
      <div id="Dashboard">
        <div className="dmpui-heading with-action-button">
          <div>
            <h1>Contributor Roles</h1>
          </div>
          <div>
            <button className="button filter-button primary" aria-haspopup="dialog" ref={buttonRef} onClick={() => handleFilterDrawerOpen()}>Add role</button>
          </div>
        </div>

        <dialog id="filter-modal" aria-modal="true" role="dialog" aria-labelledby="filter-heading" className={showFilterDrawer ? "show" : ""} onClose={() => setShowFilterDrawer(false)}>
          <div id="filter-view-backdrop">
            <div id="filter-view">
              <button className="btn-close" aria-label="Close modal" onClick={() => handleFilterDrawerClose()}>x</button>
              <form onSubmit={handleSubmit} >
                <fieldset>
                  <legend className="hidden-accessibly filter-heading">Add role</legend>
                  <div className="quick-view-text-cont">
                    <h3 id="filter-heading">Filters</h3>
                    <div className="dmpui-form-col">
                      <TextInput
                        label="Role"
                        type="text"
                        name="role"
                        id="role"
                        forwardedRef={inputRef}
                        placeholder="Role"
                        inputValue={role}
                        onChange={(e) => setRole(e.target.value)}
                      />

                      <TextInput
                        label="Url"
                        type="text"
                        name="url"
                        id="url"
                        placeholder="Url"
                        inputValue={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="primary">Add</button>
                    <button type="button" onClick={() => handleFilterDrawerClose()} >Close</button>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </dialog>


        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th scope="col" className="table-header-name data-heading">
                  Contributor role
                </th>
                <th scope="col" className="table-header-name data-heading no-wrap">
                  URL
                </th>
                <th scope="col" className="table-header-name data-heading">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="table-body">
              {roles.map((role, index) => {
                return (
                  <tr key={role.id}>
                    <td className="table-data-name">
                      {editingId === role.id ? (
                        <input type="text" value={editedRole} onChange={e => setEditedRole(e.target.value)} />
                      ) : (role.label)}

                    </td>
                    <td className="table-data-name">
                      {editingId === role.id ? (
                        <input type="text" value={editedUrl} onChange={e => setEditedUrl(e.target.value)} />
                      ) : (role.url)}

                    </td>
                    <td className="table-data-name table-data-actions">
                      {editingId === role.id ? (
                        <button onClick={handleSave}>Save</button>
                      ) : (<div><button id={`editRole-${index}`} className="edit-button" onClick={() => handleEdit(role.id)}>Edit</button>
                        <button id={`editRole-${index}`} className="delete-button" onClick={() => handleDelete(role.id)}>Delete</button> </div>)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}