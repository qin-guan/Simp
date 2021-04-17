import * as React from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    Text,
    PinInputField,
    HStack,
    PinInput, 
    ModalHeader, 
    ModalFooter, 
    Button,
    useToast
} from "@chakra-ui/react";

import LessonInstance from "../../../models/Lesson";
import { useEffect, useState } from "react";

import ClassroomInstance from "../../../models/Classroom";
import Status from "../../../models/Status";
import lessonsApi from "../../../api/http/Lesson";

interface MarkAttendanceCodeModalProps {
    isOpen: boolean
    onClose: () => void
    onMarkedAttendance: () => void
    classroom: ClassroomInstance
    lesson: LessonInstance
}

const MarkAttendanceCodeModal = (props: MarkAttendanceCodeModalProps): React.ReactElement => {
    const { isOpen, onClose, onMarkedAttendance, classroom, lesson } = props;

    const [code, setCode] = useState<string>("");
    const [markingAttendance, setMarkingAttendance] = useState(false);

    const toast = useToast();

    const onMarkAttendance = async () => {
        setMarkingAttendance(true);

        const parsedCode = parseInt(code);
        if (isNaN(parsedCode)) {
            return toast({
                title: "Invalid code.",
                status: "error",
                isClosable: true,
            });
        }

        try {
            const success = await lessonsApi.createAttendance(classroom.Id, lesson.Id, parsedCode);
            if (!success) {
                return toast({
                    title: "Invalid code.",
                    description: "The code most likely expired or is invalid for this lesson.",
                    status: "error",
                    isClosable: true,
                });
            }

            setCode("");
            onMarkedAttendance();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setMarkingAttendance(false);
        }
    };

    const onCodeChange = (value: string) => setCode(value);

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Enter the 5 digit on screen code</ModalHeader>
                <ModalCloseButton/>
                <ModalBody pb={6}>
                    <HStack>
                        <PinInput value={code} onChange={onCodeChange}>
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
                        isLoading={markingAttendance}
                        isDisabled={!code}
                        colorScheme="blue"
                        mr={3}
                        onClick={onMarkAttendance}
                    >
                        Join
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MarkAttendanceCodeModal;