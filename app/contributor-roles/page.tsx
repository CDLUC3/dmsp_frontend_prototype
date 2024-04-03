'use client'

import React, {useState} from 'react';


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
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editedRole, setEditedRole] = useState('');
    const [editedUrl, setEditedUrl] = useState('');

    const toggleForm = () => {
      setShowForm(!showForm);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const count = roles.length + 1;
        const newData = {id:count, label: role, url: url};
        setRoles(prev => {
          return [
            ...prev,
            newData
          ]
        })

        setRole('');
        setUrl('');
        setShowForm(false)
    }

    function handleEdit(id) {
      setEditingId(id);
      const roleToEdit = roles.find(role => role.id === id);
      if(roleToEdit) {
        setEditedRole(roleToEdit.label);
        setEditedUrl(roleToEdit.url);
      }
    }

    function handleDelete(id) {
      setRoles(roles.filter(role => role.id !== id))
    }

    const handleSave = () => {
      const updatedData = roles.map(role => {
        if(role.id === editingId) {
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
    return (
        <div className="wrapper">
        <h1>Contributor Roles</h1>

        <button onClick={toggleForm} className="primary">Add role</button>
        {showForm && (
        <form onSubmit={handleSubmit} className="roles-form">
            <fieldset>
              <legend className="hidden-accessibly">Add a contributor role</legend>
                <div style={{display:'flex', flexDirection: 'row'}}>
                  <div className="dmpui-field-group">
                  <label htmlFor="role" className="dmpui-field-label">Role</label>
                  <input type="text" id="role" name="role" className="dmpui-field-input-text" placeholder="role"  value={role} onChange={e => setRole(e.target.value)}/>
                  </div>
                  <div className="dmpui-field-group">
                  <label htmlFor="url" className="dmpui-field-label">Url</label>
                  <input type="text" id="url" name="url" className="dmpui-field-input-text" placeholder="url"  value={url} onChange={e => setUrl(e.target.value)}/>
                  </div>
  
                </div>
                <button type="submit" className="primary">Add</button>
            </fieldset>

    </form>
        )}


        <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col" className="table-header-name data-heading">
                      Contributor role
                    </th>
                    <th scope="col" className="table-header-name data-heading text-center no-wrap">
                      URL
                    </th>
                    <th scope="col" className="table-header-name data-heading">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {roles.map((role,index) => {
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
                              ): (role.url)}
                            
                              </td>
                            <td className="table-data-name table-data-actions">
                              {editingId === role.id ? (
                                <button className="edit-button" onClick={handleSave}>Save</button>
                              ): (<><button className="edit-button" id={`editRole-${index}`} onClick={() => handleEdit(role.id)}>Edit</button>
                              <button className="edit-button" id={`editRole-${index}`} onClick={() => handleDelete(role.id)}>Delete</button> </>)}
                                
                            </td>
                        </tr>

                    )
                  })}
                </tbody>
              </table>
        </div>
        </div>
    )
}