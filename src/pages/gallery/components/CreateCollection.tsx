import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { createAlbum } from 'services/collectionService';
import UploadService from 'services/uploadService';
import { collectionLatestFile } from 'services/collectionService'
import { getActualKey } from 'utils/common/key';

export default function CreateCollection(props) {

    const { token, acceptedFiles, setProgressView, progressBarProps, refetchData, modalView, closeModal, closeUploadModal } = props;
    const [albumName, setAlbumName] = useState("");

    const handleChange = (event) => { setAlbumName(event.target.value); }

    useEffect(() => {
        if (acceptedFiles == null)
            return;
        let commonPathPrefix: string = (() => {
            const A: string[] = acceptedFiles.map(files => files.path);

            let a1 = A[0], a2 = A[A.length - 1], L = a1.length, i = 0;
            while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
            return a1.substring(0, i);
        })();
        if (commonPathPrefix)
            commonPathPrefix = commonPathPrefix.substr(1, commonPathPrefix.lastIndexOf('/') - 1);
        setAlbumName(commonPathPrefix);
    }, [acceptedFiles]);
    const handleSubmit = async (event) => {
        event.preventDefault();

        closeModal();
        closeUploadModal();
        const masterKey = await getActualKey();
        const collection = await createAlbum(albumName, masterKey, token);

        const collectionLatestFile: collectionLatestFile = { collection, file: null }

        progressBarProps.setPercentComplete(0);
        setProgressView(true);

        await UploadService.uploadFiles(acceptedFiles, collectionLatestFile, token, progressBarProps);
        refetchData();
        setProgressView(false);
    }
    return (
        <Modal
            show={modalView}
            onHide={closeModal}
            size='lg'
            aria-labelledby='contained-modal-title-vcenter'
            centered
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title id='contained-modal-title-vcenter'>
                    Create Collection
        </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Album Name:</Form.Label>
                        <Form.Control type="text" placeholder="Enter Album Name" value={albumName} onChange={handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                     </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}