import * as React from "react";
import { useState } from "react";

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";

import classroomsApi from "../../../api/http/classrooms";
import Classroom from "../../../models/Classroom";

interface CreateVenueModalProps {
    classroom: Classroom;
    isOpen: boolean;
    
    onClose: () => void;
    onVenueCreated: () => void;
}

const CreateVenueModal = (props: CreateVenueModalProps): React.ReactElement => {
    const { isOpen, onClose, classroom, onVenueCreated } = props;

    const [isCreatingVenue, setIsCreatingVenue] = useState(false);
    const [name, setName] = useState("");

    const createVenue = async () => {
        setIsCreatingVenue(true);

        try {
            await classroomsApi.createVenue(classroom.Id, {
                Id: "",
                Name: name
            });

            setName("");
            onVenueCreated();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreatingVenue(false);
        }
    };
    
    const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.currentTarget.value);
    };

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Create a venue</ModalHeader>
                <ModalCloseButton/>
                <ModalBody pb={6}>
                    <Input placeholder={"Learning Oasis 1"} value={name} onChange={onNameChanged} />
                </ModalBody>
                <ModalFooter>
                    <Button
                        isLoading={isCreatingVenue}
                        isDisabled={!name}
                        colorScheme="blue"
                        mr={3}
                        onClick={createVenue}
                    >
                        Create
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateVenueModal;