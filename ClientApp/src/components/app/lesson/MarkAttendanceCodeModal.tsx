import * as React from "react";
import { useState } from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    PinInputField,
    HStack,
    PinInput,
    ModalHeader,
    ModalFooter,
    Button,
    useToast
} from "@chakra-ui/react";

import Lesson from "../../../models/Lesson";
import Classroom from "../../../models/Classroom";

import lessonsApi from "../../../api/http/lessons";

interface MarkAttendanceCodeModalProps {
    isOpen: boolean;
    classroom: Classroom;
    lesson: Lesson;

    onClose: () => void;
    onAttendanceMarked: () => void;
}

const MarkAttendanceCodeModal = (props: MarkAttendanceCodeModalProps): React.ReactElement => {
    const { isOpen, onClose, onAttendanceMarked, classroom, lesson } = props;

    const [code, setCode] = useState<string>("");
    const [markingAttendance, setMarkingAttendance] = useState(false);

    const toast = useToast();

    const markAttendance = async () => {
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
            onAttendanceMarked();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setMarkingAttendance(false);
        }
    };

    const onCodeChanged = (value: string) => setCode(value);

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Enter the 5 digit on screen code</ModalHeader>
                <ModalCloseButton/>
                <ModalBody pb={6}>
                    <HStack>
                        <PinInput value={code} onChange={onCodeChanged}>
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
                        onClick={markAttendance}
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