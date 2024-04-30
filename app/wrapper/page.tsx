'use client';
import { gql } from '@apollo/client';
import React, { useEffect, useState, useRef } from 'react';
import Page from '@/components/Page';
import TextInput from '@/components/TextInput';
import { useMutation, useQuery } from "@apollo/client";

const GET_CONTRIBUTOR_ROLES = gql`
query ContributorRoles{
    contributorRoles {
        id
        label
        url
    }
}`;

const ADD_ROLE = gql`
mutation addContributorRole($url: URL!, $label: String!) {
    addContributorRole(url: $url, label: $label) {
        id
        label
        description
        url
        created
    }
}`;

const DELETE_CONTRIBUTOR = gql`
mutation RemoveContributorRole($removeContributorRoleId: String!) {
  removeContributorRole(id: $removeContributorRoleId)
}
`;

const UPDATE_CONTRIBUTOR = gql`
mutation Mutation($updateContributorRoleId: String!, $url: URL, $label: String) {
    updateContributorRole(id: $updateContributorRoleId, url: $url, label: $label) {
      id
      label
      url
    }
  }
`;

// export default function WrapperTest() {
//     const { loading, error, data } = useQuery(GET_CONTRIBUTOR_ROLES);
//     let roles = [];
//     if (data) {
//         roles = data.contributorRoles;
//     }

//     return (
//         <>
//             <h1>Roles</h1>
//             <ul>
//                 {roles && roles.map(role => {
//                     return (
//                         <li key={role.id}>{role.label}</li>
//                     )
//                 })}
//             </ul>
//         </>
//     )
// }

type RolesInterface = {
    id: string,
    label: string;
    url: string;
}
export default function WrapperTest() {
    const [roles, setRoles] = useState<RolesInterface[]>([]);
    const [role, setRole] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedRole, setEditedRole] = useState('');
    const [editedUrl, setEditedUrl] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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



    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        /*TODO: validate fields*/
        const [addRole, { data, loading, error }] = useMutation(ADD_ROLE);
        if (loading) return 'Submitting...';
        if (error) return `Submission error! ${error.message}`;
        try {
            addRole({ variables: { url, label: role } });

            const newRole: RolesInterface = {
                id: data.id,
                label: data.label,
                url: data.url,
            };

            setRoles(prev => {
                return [
                    ...prev,
                    newRole
                ]
            });
            //call form.reset()?
            setRole('');
            setUrl('');
            setShowFilterDrawer(false)
        } catch (err) {
            console.log("Something went wrong adding adding a contributor")
        }

    }

    function handleEdit(id: string) {
        if (id) {
            setEditingId(id);
            const roleToEdit = roles.find(role => role.id === id);
            if (roleToEdit) {
                setEditedRole(roleToEdit.label);
                setEditedUrl(roleToEdit.url);
            }
        }
    }

    async function handleDelete(id: string) {
        try {
            const [deleteRole, { data, loading, error }] = useMutation(DELETE_CONTRIBUTOR);
            deleteRole({ variables: { id } });
            setRoles(prevRoles => prevRoles.filter(role => role.id !== id));
        }
        catch (err) {
            console.log(`Something went wrong: ${err}`)
        }
    }


    const handleSave = async () => {
        const roleToEdit = roles.find(role => role.id === editingId);
        if (roleToEdit) {
            try {
                const [updateRole, { data, loading, error }] = useMutation(UPDATE_CONTRIBUTOR);
                updateRole({ variables: { id: roleToEdit.id, url: editedUrl, label: editedRole } });

                setRoles(prevRoles => {
                    const updatedRoles = [...prevRoles];
                    const index = updatedRoles.findIndex(role => role.id === roleToEdit.id);
                    if (index !== -1) {
                        updatedRoles[index] = { ...roleToEdit, url: editedUrl, label: editedRole };
                    }
                    return updatedRoles;
                });
                setEditingId(null)
            } catch (err) {
                console.log("Error saving edited fields");
            }
        }
    }

    useEffect(() => {
        async function getRoles() {
            try {
                const { loading, error, data } = useQuery(GET_CONTRIBUTOR_ROLES);
                //const contributorRoles = await getContributors();
                setRoles(data);

            } catch (err) {
                console.log(`Something went wrong: ${err}`)
            }

        }

        getRoles();
    }, []);

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
                                                required
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
                                            />

                                            <TextInput
                                                label="Url"
                                                type="text"
                                                name="url"
                                                id="url"
                                                placeholder="Url"
                                                inputValue={url}
                                                required
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
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
                                <th id="contributor" scope="col" className="table-header-name data-heading">
                                    Contributor role
                                </th>
                                <th id="url" scope="col" className="table-header-name data-heading no-wrap">
                                    URL
                                </th>
                                <th id="actions" scope="col" className="table-header-name data-heading">
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
                                                <input type="text" value={editedRole} onChange={e => setEditedRole(e.target.value)} aria-labelledby='contributor' autoFocus />
                                            ) : (role.label)}

                                        </td>
                                        <td className="table-data-name">
                                            {editingId === role.id ? (
                                                <input type="text" value={editedUrl} onChange={e => setEditedUrl(e.target.value)} aria-labelledby='url' />
                                            ) : (role.url)}

                                        </td>
                                        <td className="table-data-name table-data-actions">
                                            {editingId === role.id ? (
                                                <button onClick={handleSave} aria-labelledby='actions'>Save</button>
                                            ) : (<div><button id={`editRole-${role.id}`} className="edit-button" onClick={() => handleEdit(role.id)}>Edit</button>
                                                <button id={`editRole-${role.id}`} className="delete-button" onClick={() => handleDelete(role.id)} aria-labelledby='actions'>Delete</button> </div>)}
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