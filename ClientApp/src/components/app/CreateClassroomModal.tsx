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

import classroomsApi from "../../api/http/classrooms";
import { useRef, useState } from "react";

export interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
}

const CreateClassroomModal = (props: CreateClassroomModalProps): React.ReactElement => {
    const { isOpen, onClose, onCreate } = props;

    const [classroomName, setClassroomName] = useState("");
    const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);

    const initialRef = useRef(null);

    const createClassroom = async () => {
        setIsCreatingClassroom(true);

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
            setIsCreatingClassroom(false);
        }
    };

    const onClassroomNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                            onChange={onClassroomNameChanged}
                        />
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button
                        isLoading={isCreatingClassroom}
                        isDisabled={!classroomName}
                        colorScheme="blue"
                        mr={3}
                        onClick={createClassroom}
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