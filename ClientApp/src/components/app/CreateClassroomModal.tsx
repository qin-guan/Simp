import * as React from "react";
import {
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Button,
} from "@chakra-ui/react";

import classroomsApi from "../../api/http/Classroom";
import { useRef, useState } from "react";

const classroomNameRegex = /^[a-z0-9]+$/i;

export interface CreateClassroomModalProps {
    isOpen: boolean,
    onClose: () => void,
    onCreate: () => void,
}

const CreateClassroomModal = (props: CreateClassroomModalProps): React.ReactElement => {
    const { isOpen, onClose, onCreate } = props;

    const [classroomName, setClassroomName] = useState("");
    const [creatingClassroom, setCreatingClassroom] = useState(false);

    const initialRef = useRef(null);

    const onClassroomCreate = async () => {
        setCreatingClassroom(true);

        try {
            await classroomsApi.create({
                Id: "",
                Name: classroomName
            });

            setClassroomName("");
            onCreate();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setCreatingClassroom(false);
        }
    };

    const onClassroomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setClassroomName(event.currentTarget.value);
    };

    return (
        <Modal
            initialFocusRef={initialRef}
            isOpen={isOpen}
            onClose={onClose}
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create classroom</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input
                            ref={initialRef}
                            placeholder="Swift Coding Class"
                            value={classroomName}
                            onChange={onClassroomNameChange}
                        />
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button
                        isLoading={creatingClassroom}
                        isDisabled={!classroomNameRegex.test(classroomName)}
                        colorScheme="blue"
                        mr={3}
                        onClick={onClassroomCreate}
                    >
                        Create
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateClassroomModal;