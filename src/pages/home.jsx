import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import {getFirestore, doc, updateDoc} from "firebase/firestore";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Page, List, ListInput, Button, Icon, ListItem } from 'framework7-react';
import { FileIcon } from '@drawbotics/file-icons';
import {  PickerOverlay } from 'filestack-react';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HomePage = () => {
  const searchParams = new URLSearchParams(document.location.search)
  const [pickerOpen, setPickerOpen] = useState(false)
  
  const tenantId = searchParams.get('id')
  const reference = doc(db, "tenants", tenantId);
  const [tenant, loading, error] = useDocumentData(reference);
  
  const handleChange = (e) => {
    const {name, value} = e.target
    updateDoc(reference, {[name]: value})
  }
  const handleUploadDelete = (handle) => {
    updateDoc(reference, {uploads: tenant.uploads.filter(file => file.handle !== handle)})
  }
  const handleUpload = (res) => {
    const {filesUploaded} = res
    updateDoc(reference, {uploads: [...tenant.uploads, ...filesUploaded]})
  }
  useEffect(() => {
    console.log({tenant})
  },[tenant])
  if(!tenant) return "No tenant"
  return (
    <Page name="home">
      <form id="tenantForm" className="form-store-data">
        <div className="grid grid-cols-2 grid-gap">
          <List noHairlines className='col'>
            <ListInput name="name" label="Name"  value={tenant.name}  onChange={handleChange}/>
            <ListInput name="email" label="Email"  value={tenant.email}  onChange={handleChange}/>
            <ListInput name="phone" label="Phone"  value={tenant.phone}  onChange={handleChange}/>
          </List>
          <List noHairlines className='col'>
            <ListInput name="country" label="Country" value={tenant.country}  onChange={handleChange}/>
            <ListInput
              name="idNumber"
              label="ID number"
              value={tenant.idNumber}
              onChange={handleChange}
            />
            <ListInput name="address" label="Permanent address" value={tenant.address}  onChange={handleChange}/>
          </List>
        </div>
        {tenant.uploads?.length > 0 && <List noHairlines>
          <ListItem >
            <h2 slot="header">Files</h2>
          </ListItem>
          {tenant.uploads.map(file => <ListItem key={file.id || file.handle} mediaItem>
            <a href={file.url} className='link external' target="blank" slot='title'>{file.filename}</a>
            <FileIcon file={file.filename.split('.').pop()} slot='media' style={{ width: 44 }} />
             <Button slot='content-end' onClick={() => handleUploadDelete(file.handle)}><Icon material='delete'></Icon></Button>
          </ListItem>)}
        </List>}
        <Button onClick={() => setPickerOpen(true)}>Add files</Button>
        {pickerOpen && <PickerOverlay
          apikey={import.meta.env.VITE_FILESTACK_API_KEY}
          pickerOptions={{
            onClose:() => {setPickerOpen(false)},
          }}
          onUploadDone={(res) => {
            // console.log(res);
            handleUpload(res)
            setPickerOpen(false)
          }}
        />}
        <List noHairlines>
          <ListItem >
            <h2 slot="header">Notes</h2>
          </ListItem>
          <ListInput
            name="notes"
            type="textarea"
            resizable
            placeholder="Enter notes here"
            value={tenant.notes}
            onChange={handleChange}
          >
            <Icon material="notes" slot="media" />
          </ListInput>
        </List>
      </form>
  </Page>
)};
export default HomePage;