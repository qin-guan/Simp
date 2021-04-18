import * as React from "react";
import { useRef, useState } from "react";

import {
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button, 
    PinInputField, 
    PinInput, 
    HStack,
} from "@chakra-ui/react";

import classroomsApi from "../../api/http/classrooms";

export interface JoinClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: () => void;
}

const JoinClassroomModal = (props: JoinClassroomModalProps): React.ReactElement => {
    const { isOpen, onClose, onJoin } = props;

    const [joinCode, setJoinCode] = useState("");
    const [joiningClassroom, setJoiningClassroom] = useState(false);

    const initialRef = useRef(null);

    const onClassroomJoin = async () => {
        setJoiningClassroom(true);

        try {
            await classroomsApi.join(joinCode);

            setJoinCode("");
            onJoin();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setJoiningClassroom(false);
        }
    };

    const onJoinCodeChange = (code: string) => {
        setJoinCode(code);
    };

    return (
        <Modal
            initialFocusRef={initialRef}
            isOpen={isOpen}
            onClose={onClose}
            isCentered
        >
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Join classroom</ModalHeader>
                <ModalCloseButton/>
                <ModalBody pb={6}>
                    <HStack>
                        <PinInput value={joinCode} onChange={onJoinCodeChange}>
                            <PinInputField/>
                            <PinInputField/>
                            <PinInputField/>
                            <PinInputField/>
                            <PinInputField/>
                        </PinInput>
                    </HStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        isLoading={joiningClassroom}
                        isDisabled={!joinCode}
                        colorScheme="blue"
                        mr={3}
                        onClick={onClassroomJoin}
                    >
                        Join
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default JoinClassroomModal;